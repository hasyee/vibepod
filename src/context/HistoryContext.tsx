import { createContext, useContext, useState } from 'react';
import type { Episode } from '../types';

export interface PlayerState {
  currentTime: number;
  duration: number;
  volume: number;
}

export interface HistoryItem {
  episode: Episode;
  playerState: PlayerState;
  playedAt: string; // ISO timestamp
}

interface HistoryContextValue {
  history: HistoryItem[];
  recordPlay: (episode: Episode, playerState: PlayerState) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

const STORAGE_KEY = 'history';

function load(): HistoryItem[] {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return history;
  } catch {
    return [];
  }
}

function save(items: HistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>(load());

  function recordPlay(episode: Episode, playerState: PlayerState) {
    setHistory(prev => {
      const existing = prev.find(item => item.episode.id === episode.id);
      const rest = prev.filter(item => item.episode.id !== episode.id);
      const next = [{ episode, playerState, playedAt: existing?.playedAt ?? new Date().toISOString() }, ...rest];
      save(next);
      return next;
    });
  }

  function clearHistory() {
    save([]);
    setHistory([]);
  }

  return <HistoryContext.Provider value={{ history, recordPlay, clearHistory }}>{children}</HistoryContext.Provider>;
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}
