export interface Podcast {
  feedUrl: string;
  collectionId?: number; // iTunes collectionId, only for API calls
  title: string;
  author: string;
  artworkUrl: string;
  genre: string;
  trackCount: number;
  description?: string;
}

export interface Episode {
  feedUrl: string;
  audioUrl: string;
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  artworkUrl: string;
  podcastTitle: string;
  podcastArtworkUrl: string;
}

export interface EpisodeId {
  feedUrl: string;
  audioUrl: string;
}

export interface HistoryItem {
  episodeId: EpisodeId;
  currentTime: number;
  playedAt: string; // ISO timestamp
}

export const StorageKey = {
  Queue: 'queue',
  History: 'history',
  Subscriptions: 'subscriptions',
  PlayerState: 'player_state',
  PlaybackRate: 'playback_rate'
} as const;
