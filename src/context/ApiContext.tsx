import { createContext, useContext } from 'react';
import type { Episode, Podcast } from '../types';
import { formatDuration } from '../utils';

const ITUNES_API_BASE_URL = 'https://itunes.apple.com';
const CORS_PROXY = 'https://corsproxy.io/?url=';

interface ApiContextValue {
  searchPodcasts: (term: string) => Promise<Podcast[]>;
  searchEpisodes: (term: string) => Promise<Episode[]>;
  fetchFeed: (feedUrl: string) => Promise<string>;
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

  async function fetchFeed(feedUrl: string): Promise<string> {
    const response = await fetch(CORS_PROXY + encodeURIComponent(feedUrl));
    return response.text();
  }

  return (
    <ApiContext.Provider value={{ searchPodcasts, searchEpisodes, fetchFeed, formatDuration }}>
      {children}
    </ApiContext.Provider>
  );
}
