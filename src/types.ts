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
  id: number;
  collectionId: number;
  title: string;
  author: string;
  artworkUrl: string;
  genre: string;
  trackCount: number;
  description?: string;
  feedUrl?: string;
}

export interface Episode {
  id: number;
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  artworkUrl: string;
  podcastTitle: string;
  podcastId: number;
  podcastArtworkUrl: string;
  audioUrl: string;
}
