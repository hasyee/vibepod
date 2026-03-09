import { useEffect, useRef } from 'react';
import { useHistory } from '../context/HistoryContext';
import { usePlayer } from '../context/PlayerContext';

export function HistoryTracker() {
  const { nowPlaying, currentTime, duration, volume } = usePlayer();
  const { recordPlay } = useHistory();

  const stateRef = useRef({ currentTime, duration, volume });
  stateRef.current = { currentTime, duration, volume };

  useEffect(() => {
    if (!nowPlaying) return;
    recordPlay(nowPlaying, stateRef.current);
    const id = setInterval(() => {
      recordPlay(nowPlaying, stateRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, [nowPlaying?.id]);

  return null;
}
