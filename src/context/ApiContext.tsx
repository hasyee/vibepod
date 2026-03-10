import { createContext, useContext } from 'react';
import type { Episode, Podcast } from '../types';
import { parseDuration, formatDuration } from '../utils';

const ITUNES_API_BASE_URL = 'https://itunes.apple.com';
const CORS_PROXY = 'https://corsproxy.io/?url=';

interface ApiContextValue {
  searchPodcasts: (term: string) => Promise<Podcast[]>;
  searchEpisodes: (term: string) => Promise<Episode[]>;
  fetchPodcastFromFeed: (feedUrl: string) => Promise<Podcast | null>;
  fetchEpisodesFromFeed: (feedUrl: string) => Promise<Episode[]>;
  formatDuration: (ms: number) => string;
}

const ApiContext = createContext<ApiContextValue | null>(null);

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used within ApiProvider');
  return ctx;
}

export function ApiProvider({ children }: { children: React.ReactNode }) {
  async function searchPodcasts(term: string): Promise<Podcast[]> {
    const url = `${ITUNES_API_BASE_URL}/search?term=${encodeURIComponent(term)}&media=podcast&limit=20`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results.map((result: Record<string, unknown>): Podcast => {
      return {
        feedUrl: (result.feedUrl ?? '') as string,
        collectionId: result.collectionId as number,
        title: result.collectionName as string,
        author: result.artistName as string,
        artworkUrl: (result.artworkUrl600 ?? result.artworkUrl100) as string,
        genre: (result.primaryGenreName ?? '') as string,
        trackCount: (result.trackCount ?? 0) as number
      };
    });
  }

  async function searchEpisodes(term: string): Promise<Episode[]> {
    const url = `${ITUNES_API_BASE_URL}/search?term=${encodeURIComponent(term)}&media=podcast&entity=podcastEpisode&limit=20`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results.map((result: Record<string, unknown>): Episode => {
      console.log(result);
      const audioUrl = (result.episodeUrl ?? result.previewUrl ?? '') as string;
      return {
        title: result.trackName as string,
        description: (result.description ?? '') as string,
        duration: (result.trackTimeMillis as number) ?? 0,
        releaseDate: result.releaseDate as string,
        artworkUrl: (result.artworkUrl160 ?? result.artworkUrl60) as string,
        podcastTitle: result.collectionName as string,
        feedUrl: (result.feedUrl ?? '') as string,
        podcastArtworkUrl: (result.artworkUrl600 ?? result.artworkUrl100) as string,
        audioUrl
      };
    });
  }

  async function fetchPodcastFromFeed(feedUrl: string): Promise<Podcast | null> {
    const response = await fetch(CORS_PROXY + encodeURIComponent(feedUrl));
    const text = await response.text();
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    const channel = doc.querySelector('channel');
    if (!channel) return null;
    const channelImage = channel.getElementsByTagName('itunes:image')[0];
    const itunesAuthor = channel.getElementsByTagName('itunes:author')[0];
    const itunesCategory = channel.getElementsByTagName('itunes:category')[0];
    return {
      feedUrl,
      title: channel.querySelector('title')?.textContent ?? '',
      author: itunesAuthor?.textContent ?? channel.querySelector('managingEditor')?.textContent ?? '',
      artworkUrl: channelImage?.getAttribute('href') ?? '',
      genre: itunesCategory?.getAttribute('text') ?? '',
      trackCount: channel.querySelectorAll('item').length,
      description: channel.querySelector('description')?.textContent ?? ''
    };
  }

  async function fetchEpisodesFromFeed(feedUrl: string): Promise<Episode[]> {
    const response = await fetch(CORS_PROXY + encodeURIComponent(feedUrl));
    const text = await response.text();
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    const channel = doc.querySelector('channel');
    const podcastTitle = channel?.querySelector('title')?.textContent ?? '';
    const channelImage = channel?.getElementsByTagName('itunes:image')[0];
    const podcastArtworkUrl = channelImage?.getAttribute('href') ?? '';
    return Array.from(doc.querySelectorAll('item')).map((item): Episode => {
      const enclosure = item.querySelector('enclosure');
      const itunesImage = item.getElementsByTagName('itunes:image')[0];
      const itunesDuration = item.getElementsByTagName('itunes:duration')[0];
      const audioUrl = enclosure?.getAttribute('url') ?? '';
      return {
        title: item.querySelector('title')?.textContent ?? '',
        description: item.querySelector('description')?.textContent ?? '',
        duration: parseDuration(itunesDuration?.textContent ?? ''),
        releaseDate: item.querySelector('pubDate')?.textContent ?? '',
        artworkUrl: itunesImage?.getAttribute('href') ?? '',
        podcastTitle,
        feedUrl: feedUrl,
        podcastArtworkUrl,
        audioUrl
      };
    });
  }

  return (
    <ApiContext.Provider value={{ searchPodcasts, searchEpisodes, fetchPodcastFromFeed, fetchEpisodesFromFeed, formatDuration }}>
      {children}
    </ApiContext.Provider>
  );
}
