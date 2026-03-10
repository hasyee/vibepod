import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { StorageKey } from '../types';
import type { Episode } from '../types';
import { useLocalStorage } from './LocalStorageContext';

interface PlayerContextValue {
  nowPlaying: Episode | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  play: (ep: Episode, currentTime?: number) => void;
  togglePlay: () => void;
  seek: (value: number) => void;
  skip: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const storage = useLocalStorage();
  const initial = storage.get<{ nowPlaying: Episode | null; currentTime: number }>(StorageKey.PlayerState) ?? { nowPlaying: null, currentTime: 0 };
  const audioRef = useRef<HTMLAudioElement>(null);
  const [nowPlaying, setNowPlaying] = useState<Episode | null>(initial.nowPlaying);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initial.currentTime);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(() => storage.get<number>(StorageKey.PlaybackRate) ?? 1);
  const restoreTimeRef = useRef(initial.currentTime);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (initial.nowPlaying?.audioUrl && audioRef.current) {
      audioRef.current.src = initial.nowPlaying.audioUrl;
      audioRef.current.playbackRate = playbackRate;
    }
  }, []);

  useEffect(() => {
    storage.set(StorageKey.PlayerState, { nowPlaying, currentTime: audioRef.current?.currentTime ?? 0 });
  }, [nowPlaying]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        storage.set(StorageKey.PlayerState, { nowPlaying, currentTime: audioRef.current?.currentTime ?? 0 });
      }, 1000);
      return () => clearInterval(intervalRef.current!);
    } else {
      clearInterval(intervalRef.current!);
      storage.set(StorageKey.PlayerState, { nowPlaying, currentTime: audioRef.current?.currentTime ?? 0 });
    }
  }, [playing]);

  function play(ep: Episode, startTime?: number) {
    if (!audioRef.current || !ep.audioUrl) return;
    audioRef.current.src = ep.audioUrl;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.play();
    setNowPlaying(ep);
    setPlaying(true);
    setCurrentTime(startTime ?? 0);
    setDuration(0);
    restoreTimeRef.current = startTime ?? 0;
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  }

  function seek(value: number) {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = (value / 100) * duration;
  }

  function skip(seconds: number) {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + seconds);
  }

  function setPlaybackRate(rate: number) {
    setPlaybackRateState(rate);
    storage.set(StorageKey.PlaybackRate, rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }

  function handleLoadedMetadata() {
    setDuration(audioRef.current?.duration ?? 0);
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
    if (restoreTimeRef.current > 0 && audioRef.current) {
      audioRef.current.currentTime = restoreTimeRef.current;
      setCurrentTime(restoreTimeRef.current);
      restoreTimeRef.current = 0;
    }
  }

  return (
    <PlayerContext.Provider value={{ nowPlaying, playing, currentTime, duration, playbackRate, play, togglePlay, seek, skip, setPlaybackRate, audioRef }}>
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration ?? 0)}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
      />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
