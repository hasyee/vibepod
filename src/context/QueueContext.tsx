import { createContext, useContext, useEffect, useState } from 'react';
import type { Episode } from '../types';
import { StorageKey } from '../types';
import { useLocalStorage } from './LocalStorageContext';

interface QueueContextValue {
  queue: Episode[];
  addToQueue: (episode: Episode) => void;
  removeFromQueue: (id: number) => void;
  clearQueue: () => void;
}

const QueueContext = createContext<QueueContextValue | null>(null);

export function useQueue() {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error('useQueue must be used within QueueProvider');
  return ctx;
}

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const storage = useLocalStorage();
  const [queue, setQueue] = useState<Episode[]>(() => storage.get<Episode[]>(StorageKey.Queue) ?? []);

  useEffect(() => {
    storage.set(StorageKey.Queue, queue);
  }, [queue]);

  function addToQueue(episode: Episode) {
    setQueue(prev => (prev.some(queued => queued.id === episode.id) ? prev : [...prev, episode]));
  }

  function removeFromQueue(id: number) {
    setQueue(prev => prev.filter(episode => episode.id !== id));
  }

  function clearQueue() {
    setQueue([]);
  }

  return (
    <QueueContext.Provider value={{ queue, addToQueue, removeFromQueue, clearQueue }}>{children}</QueueContext.Provider>
  );
}
