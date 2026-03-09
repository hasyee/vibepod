export interface Podcast {
  id: number;
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
  podcastTitle?: string;
  podcastId?: number;
  audioUrl?: string;
}
