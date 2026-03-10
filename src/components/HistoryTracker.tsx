import { useEffect, useRef } from 'react';
import { useHistory } from '../context/HistoryContext';
import { usePlayer } from '../context/PlayerContext';

export function HistoryTracker() {
  const { nowPlaying, currentTime, duration, playing } = usePlayer();
  const { recordPlay } = useHistory();

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef({ currentTime, duration });
  stateRef.current = { currentTime, duration };

  useEffect(() => {
    if (!nowPlaying) return;
    if (playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      recordPlay(nowPlaying, stateRef.current);
      intervalRef.current = setInterval(() => {
        recordPlay(nowPlaying, stateRef.current);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [nowPlaying?.id, playing]);

  return null;
}
