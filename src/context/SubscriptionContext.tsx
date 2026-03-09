import { createContext, useContext, useState } from 'react';
import type { Podcast } from '../types';

interface SubscriptionContextValue {
  subscriptions: Podcast[];
  isSubscribed: (podcastId: number) => boolean;
  subscribe: (podcast: Podcast) => void;
  unsubscribe: (podcastId: number) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

const STORAGE_KEY = 'subscriptions';

function load(): Podcast[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Podcast[]>(load);

  function save(next: Podcast[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSubscriptions(next);
  }

  function isSubscribed(podcastId: number) {
    return subscriptions.some(p => p.id === podcastId);
  }

  function subscribe({ id, title, author, artworkUrl, genre, trackCount, description, feedUrl }: Podcast) {
    if (!isSubscribed(id)) save([...subscriptions, { id, title, author, artworkUrl, genre, trackCount, description, feedUrl }]);
  }

  function unsubscribe(podcastId: number) {
    save(subscriptions.filter(p => p.id !== podcastId));
  }

  return (
    <SubscriptionContext.Provider value={{ subscriptions, isSubscribed, subscribe, unsubscribe }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscriptions must be used within SubscriptionProvider');
  return ctx;
}
