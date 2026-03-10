import { createContext, useContext, useEffect, useState } from 'react';
import type { Podcast } from '../types';
import { StorageKey } from '../types';
import { useLocalStorage } from './LocalStorageContext';

interface SubscriptionContextValue {
  subscriptions: Podcast[];
  isSubscribed: (feedUrl: string) => boolean;
  subscribe: (podcast: Podcast) => void;
  unsubscribe: (feedUrl: string) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function useSubscriptions() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscriptions must be used within SubscriptionProvider');
  return ctx;
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const storage = useLocalStorage();
  const [subscriptions, setSubscriptions] = useState<Podcast[]>(
    () => storage.get<Podcast[]>(StorageKey.Subscriptions) ?? []
  );

  useEffect(() => {
    storage.set(StorageKey.Subscriptions, subscriptions);
  }, [subscriptions]);

  function isSubscribed(feedUrl: string) {
    return subscriptions.some(podcast => podcast.feedUrl === feedUrl);
  }

  function subscribe(podcast: Podcast) {
    if (!isSubscribed(podcast.feedUrl)) setSubscriptions(prev => [...prev, podcast]);
  }

  function unsubscribe(feedUrl: string) {
    setSubscriptions(prev => prev.filter(podcast => podcast.feedUrl !== feedUrl));
  }

  return (
    <SubscriptionContext.Provider value={{ subscriptions, isSubscribed, subscribe, unsubscribe }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
