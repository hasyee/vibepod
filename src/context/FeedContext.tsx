import { createContext, useContext } from 'react';
import { useApi } from './ApiContext';
import { useFeedCache } from './FeedCacheContext';

interface FeedContextValue {
  getFeed: (feedUrl: string) => Promise<string>;
}

const FeedContext = createContext<FeedContextValue | null>(null);

export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error('useFeed must be used within FeedProvider');
  return ctx;
}

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const api = useApi();
  const feedCache = useFeedCache();

  async function getFeed(feedUrl: string): Promise<string> {
    const cached = await feedCache.get(feedUrl);
    if (cached) return cached;
    return api.fetchFeed(feedUrl);
  }

  return <FeedContext.Provider value={{ getFeed }}>{children}</FeedContext.Provider>;
}
