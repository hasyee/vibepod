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
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  artworkUrl: string;
  podcastTitle: string;
  feedUrl: string;
  podcastArtworkUrl: string;
  audioUrl: string;
}

export interface PlayerState {
  currentTime: number;
  duration: number;
}

export interface QueueItem {
  feedUrl: string;
  audioUrl: string;
}

export interface HistoryItem {
  feedUrl: string;
  audioUrl: string;
  playerState: PlayerState;
  playedAt: string; // ISO timestamp
}

export const StorageKey = {
  Queue: 'queue',
  History: 'history',
  Subscriptions: 'subscriptions',
  PlayerState: 'player_state',
  PlaybackRate: 'playback_rate'
} as const;
