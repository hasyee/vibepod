import { createContext, useContext, useEffect, useState } from 'react';
import type { Episode } from '../types';

interface QueueContextValue {
  queue: Episode[];
  addToQueue: (ep: Episode) => void;
  removeFromQueue: (id: number) => void;
  clearQueue: () => void;
}

const QueueContext = createContext<QueueContextValue | null>(null);

const QUEUE_STORAGE_KEY = 'queue';

function loadQueue(): Episode[] {
  try {
    const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Episode[]>(loadQueue);

  useEffect(() => {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
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
