import { createContext, useContext } from 'react';
import type { Episode, Podcast } from '../types';
import { hashString, parseDuration } from '../utils';

const ITUNES_API_BASE_URL = 'https://itunes.apple.com';
const CORS_PROXY = 'https://corsproxy.io/?url=';

async function searchPodcasts(term: string): Promise<Podcast[]> {
  const url = `${ITUNES_API_BASE_URL}/search?term=${encodeURIComponent(term)}&media=podcast&limit=20`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map((r: Record<string, unknown>) => ({
    id: r.collectionId as number,
    title: r.collectionName as string,
    author: r.artistName as string,
    artworkUrl: (r.artworkUrl600 ?? r.artworkUrl100) as string,
    genre: (r.primaryGenreName ?? '') as string,
    trackCount: (r.trackCount ?? 0) as number
  }));
}

async function searchEpisodes(term: string): Promise<Episode[]> {
  const url = `${ITUNES_API_BASE_URL}/search?term=${encodeURIComponent(term)}&media=podcast&entity=podcastEpisode&limit=20`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map((r: Record<string, unknown>) => ({
    id: r.trackId as number,
    title: r.trackName as string,
    description: (r.description ?? '') as string,
    duration: (r.trackTimeMillis as number) ?? 0,
    releaseDate: r.releaseDate as string,
    artworkUrl: (r.artworkUrl160 ?? r.artworkUrl60) as string,
    podcastTitle: r.collectionName as string,
    audioUrl: (r.episodeUrl ?? r.previewUrl ?? '') as string
  }));
}

async function fetchPodcast(podcastId: number): Promise<Podcast | null> {
  const url = `${ITUNES_API_BASE_URL}/lookup?id=${podcastId}&media=podcast&entity=podcast&limit=1`;
  const res = await fetch(url);
  const data = await res.json();
  const result = data.results?.find((r: Record<string, unknown>) => r.kind === 'podcast');
  if (!result) return null;
  return {
    id: result.collectionId as number,
    title: result.collectionName as string,
    author: result.artistName as string,
    artworkUrl: (result.artworkUrl600 ?? result.artworkUrl100) as string,
    genre: (result.primaryGenreName ?? '') as string,
    trackCount: (result.trackCount ?? 0) as number,
    description: (result.description ?? '') as string,
    feedUrl: (result.feedUrl ?? '') as string
  };
}

async function fetchEpisodes(podcastId: number): Promise<Episode[]> {
  const url = `${ITUNES_API_BASE_URL}/lookup?id=${podcastId}&media=podcast&entity=podcastEpisode&limit=50`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results
    .filter((r: Record<string, unknown>) => r.kind === 'podcast-episode')
    .map((r: Record<string, unknown>) => ({
      id: r.trackId as number,
      title: r.trackName as string,
      description: (r.description ?? '') as string,
      duration: (r.trackTimeMillis as number) ?? 0,
      releaseDate: r.releaseDate as string,
      artworkUrl: (r.artworkUrl160 ?? r.artworkUrl60) as string,
      audioUrl: (r.episodeUrl ?? r.previewUrl ?? '') as string
    }));
}

async function fetchEpisodesFromFeed(feedUrl: string, podcastTitle?: string, podcastId?: number): Promise<Episode[]> {
  const res = await fetch(CORS_PROXY + encodeURIComponent(feedUrl));
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  return Array.from(doc.querySelectorAll('item')).map(item => {
    const guid =
      item.querySelector('guid')?.textContent ?? item.querySelector('title')?.textContent ?? String(Math.random());
    const enclosure = item.querySelector('enclosure');
    const itunesImage = item.getElementsByTagName('itunes:image')[0];
    const itunesDuration = item.getElementsByTagName('itunes:duration')[0];
    return {
      id: hashString(guid),
      title: item.querySelector('title')?.textContent ?? '',
      description: item.querySelector('description')?.textContent ?? '',
      duration: parseDuration(itunesDuration?.textContent ?? ''),
      releaseDate: item.querySelector('pubDate')?.textContent ?? '',
      artworkUrl: itunesImage?.getAttribute('href') ?? '',
      podcastTitle,
      podcastId,
      audioUrl: enclosure?.getAttribute('url') ?? ''
    };
  });
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

interface ApiContextValue {
  searchPodcasts: typeof searchPodcasts;
  searchEpisodes: typeof searchEpisodes;
  fetchPodcast: typeof fetchPodcast;
  fetchEpisodes: typeof fetchEpisodes;
  fetchEpisodesFromFeed: typeof fetchEpisodesFromFeed;
  formatDuration: typeof formatDuration;
}

const ApiContext = createContext<ApiContextValue | null>(null);

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used within ApiProvider');
  return ctx;
}

const value: ApiContextValue = {
  searchPodcasts,
  searchEpisodes,
  fetchPodcast,
  fetchEpisodes,
  fetchEpisodesFromFeed,
  formatDuration
};

export function ApiProvider({ children }: { children: React.ReactNode }) {
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}
