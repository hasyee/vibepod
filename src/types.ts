export const StorageKey = {
  Queue: 'queue',
  History: 'history',
  Subscriptions: 'subscriptions',
  PlayerState: 'player_state',
  PlaybackRate: 'playback_rate'
} as const;

export interface PlayerState {
  currentTime: number;
  duration: number;
}

export interface HistoryItem {
  episode: Episode;
  playerState: PlayerState;
  playedAt: string; // ISO timestamp
}

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
