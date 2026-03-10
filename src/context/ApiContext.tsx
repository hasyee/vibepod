import { createContext, useContext } from 'react';
import type { Episode, Podcast } from '../types';
import { hashString, parseDuration } from '../utils';

const ITUNES_API_BASE_URL = 'https://itunes.apple.com';
const CORS_PROXY = 'https://corsproxy.io/?url=';

async function searchPodcasts(term: string): Promise<Podcast[]> {
  const url = `${ITUNES_API_BASE_URL}/search?term=${encodeURIComponent(term)}&media=podcast&limit=20`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results.map((result: Record<string, unknown>) => ({
    id: result.collectionId as number,
    title: result.collectionName as string,
    author: result.artistName as string,
    artworkUrl: (result.artworkUrl600 ?? result.artworkUrl100) as string,
    genre: (result.primaryGenreName ?? '') as string,
    trackCount: (result.trackCount ?? 0) as number
  }));
}

async function searchEpisodes(term: string): Promise<Episode[]> {
  const url = `${ITUNES_API_BASE_URL}/search?term=${encodeURIComponent(term)}&media=podcast&entity=podcastEpisode&limit=20`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results.map((result: Record<string, unknown>) => ({
    id: result.trackId as number,
    title: result.trackName as string,
    description: (result.description ?? '') as string,
    duration: (result.trackTimeMillis as number) ?? 0,
    releaseDate: result.releaseDate as string,
    artworkUrl: (result.artworkUrl160 ?? result.artworkUrl60) as string,
    podcastTitle: result.collectionName as string,
    audioUrl: (result.episodeUrl ?? result.previewUrl ?? '') as string
  }));
}

async function fetchPodcast(podcastId: number): Promise<Podcast | null> {
  const url = `${ITUNES_API_BASE_URL}/lookup?id=${podcastId}&media=podcast&entity=podcast&limit=1`;
  const response = await fetch(url);
  const data = await response.json();
  const result = data.results?.find((item: Record<string, unknown>) => item.kind === 'podcast');
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
  const response = await fetch(url);
  const data = await response.json();
  return data.results
    .filter((result: Record<string, unknown>) => result.kind === 'podcast-episode')
    .map((result: Record<string, unknown>) => ({
      id: result.trackId as number,
      title: result.trackName as string,
      description: (result.description ?? '') as string,
      duration: (result.trackTimeMillis as number) ?? 0,
      releaseDate: result.releaseDate as string,
      artworkUrl: (result.artworkUrl160 ?? result.artworkUrl60) as string,
      audioUrl: (result.episodeUrl ?? result.previewUrl ?? '') as string
    }));
}

async function fetchEpisodesFromFeed(feedUrl: string, podcastTitle?: string, podcastId?: number): Promise<Episode[]> {
  const response = await fetch(CORS_PROXY + encodeURIComponent(feedUrl));
  const text = await response.text();
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
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
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
