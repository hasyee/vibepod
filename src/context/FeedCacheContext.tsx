import { createContext, useContext } from 'react';

interface FeedCacheContextValue {
  get: (feedUrl: string) => Promise<string | null>;
  set: (feedUrl: string, feedContent: string) => Promise<void>;
}

const FeedCacheContext = createContext<FeedCacheContextValue | null>(null);

export function useFeedCache() {
  const ctx = useContext(FeedCacheContext);
  if (!ctx) throw new Error('useFeedCache must be used within FeedCacheProvider');
  return ctx;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('feeds', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('feeds');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function get(feedUrl: string): Promise<string | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('feeds', 'readonly');
    const request = transaction.objectStore('feeds').get(feedUrl);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function set(feedUrl: string, feedContent: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('feeds', 'readwrite');
    const request = transaction.objectStore('feeds').put(feedContent, feedUrl);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function FeedCacheProvider({ children }: { children: React.ReactNode }) {
  return <FeedCacheContext.Provider value={{ get, set }}>{children}</FeedCacheContext.Provider>;
}
