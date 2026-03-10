import { createContext, useContext, useEffect, useState } from 'react';
import { StorageKey } from '../types';
import { useLocalStorage } from './LocalStorageContext';

interface SubscriptionContextValue {
  subscriptions: string[];
  isSubscribed: (feedUrl: string) => boolean;
  subscribe: (feedUrl: string) => void;
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
  const [subscriptions, setSubscriptions] = useState<string[]>(
    () => storage.get<string[]>(StorageKey.Subscriptions) ?? []
  );

  useEffect(() => {
    storage.set(StorageKey.Subscriptions, subscriptions);
  }, [subscriptions]);

  function isSubscribed(feedUrl: string) {
    return subscriptions.includes(feedUrl);
  }

  function subscribe(feedUrl: string) {
    if (!isSubscribed(feedUrl)) setSubscriptions(prev => [...prev, feedUrl]);
  }

  function unsubscribe(feedUrl: string) {
    setSubscriptions(prev => prev.filter(url => url !== feedUrl));
  }

  return (
    <SubscriptionContext.Provider value={{ subscriptions, isSubscribed, subscribe, unsubscribe }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
