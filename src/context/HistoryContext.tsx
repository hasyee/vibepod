import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '../hooks/localStorage';
import type { Episode, EpisodeId, HistoryItem } from '../types';
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
  const { episodeId, playing, stateRef } = usePlayer();
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => storage.get<HistoryItem[]>(StorageKey.History) ?? []);

  useEffect(() => {
    storage.set(StorageKey.History, history);
  }, [history]);

  useEffect(() => {
    if (!episodeId) return;
    if (playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      recordPlay(episodeId, stateRef.current.currentTime);
      intervalRef.current = setInterval(() => {
        recordPlay(episodeId, stateRef.current.currentTime);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [episodeId?.audioUrl, playing]);

  function recordPlay(episodeId: EpisodeId, currentTime: number) {
    setHistory(prev => {
      const existing = prev.find(item => item.episodeId.audioUrl === episodeId.audioUrl);
      const rest = prev.filter(item => item.episodeId.audioUrl !== episodeId.audioUrl);
      return [
        {
          episodeId: { feedUrl: episodeId.feedUrl, audioUrl: episodeId.audioUrl },
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
