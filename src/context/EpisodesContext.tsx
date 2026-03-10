import { createContext, useContext, useEffect, useState } from 'react';
import type { Episode } from '../types';
import { useFeed } from './FeedContext';
import { parseEpisodes } from '../utils';
import { useSubscriptions } from './SubscriptionContext';

interface EpisodesContextValue {
  episodes: Episode[];
  loading: boolean;
  refresh: () => void;
}

const EpisodesContext = createContext<EpisodesContextValue | null>(null);

export function useEpisodes() {
  const ctx = useContext(EpisodesContext);
  if (!ctx) throw new Error('useEpisodes must be used within EpisodesProvider');
  return ctx;
}

export function EpisodesProvider({ children }: { children: React.ReactNode }) {
  const { getFeed } = useFeed();
  const { subscriptions } = useSubscriptions();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchAll() {
    if (subscriptions.length === 0) {
      setEpisodes([]);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        subscriptions.map(feedUrl => getFeed(feedUrl).then(text => parseEpisodes(feedUrl, text)))
      );
      const all = results
        .flatMap(result => (result.status === 'fulfilled' ? result.value : []))
        .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
      setEpisodes(all);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, [subscriptions]);

  return (
    <EpisodesContext.Provider value={{ episodes, loading, refresh: fetchAll }}>{children}</EpisodesContext.Provider>
  );
}
