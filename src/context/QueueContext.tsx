import { createContext, useContext, useState } from 'react';
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

function saveQueue(queue: Episode[]) {
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Episode[]>(loadQueue);

  function addToQueue(ep: Episode) {
    setQueue(prev => {
      if (prev.some(e => e.id === ep.id)) return prev;
      const next = [...prev, ep];
      saveQueue(next);
      return next;
    });
  }

  function removeFromQueue(id: number) {
    setQueue(prev => {
      const next = prev.filter(e => e.id !== id);
      saveQueue(next);
      return next;
    });
  }

  function clearQueue() {
    setQueue([]);
    saveQueue([]);
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
