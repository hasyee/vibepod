import { createContext, useContext, useEffect, useState } from 'react';
import type { Episode, HistoryItem, PlayerState } from '../types';
import { StorageKey } from '../types';
import { useLocalStorage } from './LocalStorageContext';

interface HistoryContextValue {
  history: HistoryItem[];
  recordPlay: (episode: Episode, playerState: PlayerState) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const storage = useLocalStorage();
  const [history, setHistory] = useState<HistoryItem[]>(() => storage.get<HistoryItem[]>(StorageKey.History) ?? []);

  useEffect(() => {
    storage.set(StorageKey.History, history);
  }, [history]);

  function recordPlay(episode: Episode, playerState: PlayerState) {
    setHistory(prev => {
      const existing = prev.find(item => item.audioUrl === episode.audioUrl);
      const rest = prev.filter(item => item.audioUrl !== episode.audioUrl);
      return [
        {
          feedUrl: episode.feedUrl,
          audioUrl: episode.audioUrl,
          playerState,
          playedAt: existing?.playedAt ?? new Date().toISOString()
        },
        ...rest
      ];
    });
  }

  function clearHistory() {
    setHistory([]);
  }

  return <HistoryContext.Provider value={{ history, recordPlay, clearHistory }}>{children}</HistoryContext.Provider>;
}
