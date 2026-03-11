export type Podcast = {
  feedUrl: string;
  collectionId?: number; // iTunes collectionId, only for API calls
  title: string;
  author: string;
  artworkUrl: string;
  genre: string;
  trackCount: number;
  description?: string;
};

export type EpisodeId = {
  feedUrl: string;
  audioUrl: string;
};

export type Episode = EpisodeId & {
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  artworkUrl: string;
  podcastTitle: string;
  podcastArtworkUrl: string;
};

export type HistoryItem = {
  episodeId: EpisodeId;
  currentTime: number;
  playedAt: string; // ISO timestamp
};

export type FeedMeta = {
  updatedAt: string; // ISO timestamp of last fetch
};

export const IndexDbStore = {
  feedContents: 'feedContents',
  feedMeta: 'feedMeta',
  audioContents: 'audioContents'
} as const;

export const StorageKey = {
  Queue: 'queue',
  History: 'history',
  Subscriptions: 'subscriptions',
  PlayerState: 'player_state',
  PlaybackRate: 'playback_rate'
} as const;
