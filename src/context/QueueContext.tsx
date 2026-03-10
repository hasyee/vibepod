import { createContext, useContext, useEffect, useState } from 'react';
import type { Episode } from '../types';
import { useLocalStorage } from './LocalStorageContext';

interface QueueContextValue {
  queue: Episode[];
  addToQueue: (ep: Episode) => void;
  removeFromQueue: (id: number) => void;
  clearQueue: () => void;
}

const QueueContext = createContext<QueueContextValue | null>(null);

const QUEUE_STORAGE_KEY = 'queue';

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const storage = useLocalStorage();
  const [queue, setQueue] = useState<Episode[]>(() => storage.get<Episode[]>(QUEUE_STORAGE_KEY) ?? []);

  useEffect(() => {
    storage.set(QUEUE_STORAGE_KEY, queue);
  }, [queue]);

  function addToQueue(ep: Episode) {
    setQueue(prev => prev.some(e => e.id === ep.id) ? prev : [...prev, ep]);
  }

  function removeFromQueue(id: number) {
    setQueue(prev => prev.filter(e => e.id !== id));
  }

  function clearQueue() {
    setQueue([]);
  }

  return (
    <QueueContext.Provider value={{ queue, addToQueue, removeFromQueue, clearQueue }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error('useQueue must be used within QueueProvider');
  return ctx;
}
