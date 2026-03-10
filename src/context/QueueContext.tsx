import { createContext, useContext, useEffect, useState } from 'react';
import type { Episode, QueueItem } from '../types';
import { StorageKey } from '../types';
import { useLocalStorage } from '../hooks/localStorage';

interface QueueContextValue {
  queue: QueueItem[];
  addToQueue: (episode: Episode) => void;
  removeFromQueue: (audioUrl: string) => void;
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
  const [queue, setQueue] = useState<QueueItem[]>(() => storage.get<QueueItem[]>(StorageKey.Queue) ?? []);

  useEffect(() => {
    storage.set(StorageKey.Queue, queue);
  }, [queue]);

  function addToQueue(episode: Episode) {
    setQueue(prev =>
      prev.some(item => item.audioUrl === episode.audioUrl)
        ? prev
        : [...prev, { feedUrl: episode.feedUrl, audioUrl: episode.audioUrl }]
    );
  }

  function removeFromQueue(audioUrl: string) {
    setQueue(prev => prev.filter(item => item.audioUrl !== audioUrl));
  }

  function clearQueue() {
    setQueue([]);
  }

  return (
    <QueueContext.Provider value={{ queue, addToQueue, removeFromQueue, clearQueue }}>{children}</QueueContext.Provider>
  );
}
