import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '../hooks/localStorage';
import type { Episode, HistoryItem } from '../types';
import { StorageKey } from '../types';
import { usePlayer } from './PlayerContext';

interface HistoryContextValue {
  history: HistoryItem[];

  recordPlay: (episode: Episode, currentTime: number) => void;
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
  const { nowPlaying, playing, stateRef } = usePlayer();
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => storage.get<HistoryItem[]>(StorageKey.History) ?? []);

  useEffect(() => {
    storage.set(StorageKey.History, history);
  }, [history]);

  useEffect(() => {
    if (!nowPlaying) return;
    if (playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      recordPlay(nowPlaying, stateRef.current.currentTime);
      intervalRef.current = setInterval(() => {
        recordPlay(nowPlaying, stateRef.current.currentTime);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [nowPlaying?.audioUrl, playing]);

  function recordPlay(episode: Episode, currentTime: number) {
    setHistory(prev => {
      const existing = prev.find(item => item.audioUrl === episode.audioUrl);
      const rest = prev.filter(item => item.audioUrl !== episode.audioUrl);
      return [
        {
          feedUrl: episode.feedUrl,
          audioUrl: episode.audioUrl,
          currentTime,
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
