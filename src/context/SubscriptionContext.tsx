import { createContext, useContext, useEffect, useState } from 'react';
import { StorageKey } from '../types';
import type { Podcast } from '../types';
import { useLocalStorage } from './LocalStorageContext';

interface SubscriptionContextValue {
  subscriptions: Podcast[];
  isSubscribed: (podcastId: number) => boolean;
  subscribe: (podcast: Podcast) => void;
  unsubscribe: (podcastId: number) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const storage = useLocalStorage();
  const [subscriptions, setSubscriptions] = useState<Podcast[]>(() => storage.get<Podcast[]>(StorageKey.Subscriptions) ?? []);

  useEffect(() => {
    storage.set(StorageKey.Subscriptions, subscriptions);
  }, [subscriptions]);

  function isSubscribed(podcastId: number) {
    return subscriptions.some(p => p.id === podcastId);
  }

  function subscribe({ id, title, author, artworkUrl, genre, trackCount, description, feedUrl }: Podcast) {
    if (!isSubscribed(id)) setSubscriptions(prev => [...prev, { id, title, author, artworkUrl, genre, trackCount, description, feedUrl }]);
  }

  function unsubscribe(podcastId: number) {
    setSubscriptions(prev => prev.filter(p => p.id !== podcastId));
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
