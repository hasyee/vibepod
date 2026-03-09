import { createContext, useContext, useEffect, useState } from 'react';
import { fetchEpisodesFromFeed } from '../api';
import type { Episode } from '../types';
import { useSubscriptions } from './SubscriptionContext';

interface EpisodesContextValue {
  episodes: Episode[];
  loading: boolean;
  refresh: () => void;
}

const EpisodesContext = createContext<EpisodesContextValue | null>(null);

export function EpisodesProvider({ children }: { children: React.ReactNode }) {
  const { subscriptions } = useSubscriptions();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchAll() {
    const feeds = subscriptions.filter(p => p.feedUrl);
    if (feeds.length === 0) {
      setEpisodes([]);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        feeds.map(p => fetchEpisodesFromFeed(p.feedUrl!, p.title))
      );
      const all = results
        .flatMap(r => (r.status === 'fulfilled' ? r.value : []))
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
    <EpisodesContext.Provider value={{ episodes, loading, refresh: fetchAll }}>
      {children}
    </EpisodesContext.Provider>
  );
}

export function useEpisodes() {
  const ctx = useContext(EpisodesContext);
  if (!ctx) throw new Error('useEpisodes must be used within EpisodesProvider');
  return ctx;
}
