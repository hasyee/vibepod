import type { Episode, Podcast } from './types';

export async function searchPodcasts(term: string): Promise<Podcast[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=podcast&limit=20`;
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

export async function searchEpisodes(term: string): Promise<Episode[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    term
  )}&media=podcast&entity=podcastEpisode&limit=20`;
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

export async function fetchPodcast(podcastId: number): Promise<Podcast | null> {
  const url = `https://itunes.apple.com/lookup?id=${podcastId}&media=podcast&entity=podcast&limit=1`;
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
    description: (result.description ?? '') as string
  };
}

export async function fetchEpisodes(podcastId: number): Promise<Episode[]> {
  const url = `https://itunes.apple.com/lookup?id=${podcastId}&media=podcast&entity=podcastEpisode&limit=50`;
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

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
