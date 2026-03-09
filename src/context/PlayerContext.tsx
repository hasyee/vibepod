import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Episode } from '../types';

interface PlayerContextValue {
  nowPlaying: Episode | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  play: (ep: Episode, currentTime?: number) => void;
  togglePlay: () => void;
  seek: (value: number) => void;
  skip: (seconds: number) => void;
  setVolume: (volume: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

const PLAYER_STORAGE_KEY = 'player_state';

function loadPlayerState(): { nowPlaying: Episode | null; volume: number; currentTime: number } {
  try {
    const saved = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { nowPlaying: null, volume: 80, currentTime: 0 };
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const initial = loadPlayerState();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [nowPlaying, setNowPlaying] = useState<Episode | null>(initial.nowPlaying);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initial.currentTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(initial.volume);
  const restoreTimeRef = useRef(initial.currentTime);

  useEffect(() => {
    if (initial.nowPlaying?.audioUrl && audioRef.current) {
      audioRef.current.src = initial.nowPlaying.audioUrl;
      audioRef.current.volume = initial.volume / 100;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify({ nowPlaying, volume, currentTime }));
  }, [nowPlaying, volume, currentTime]);

  function play(ep: Episode, startTime?: number) {
    if (!audioRef.current || !ep.audioUrl) return;
    audioRef.current.src = ep.audioUrl;
    audioRef.current.volume = volume / 100;
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

  function handleVolumeChange(value: number) {
    setVolume(value);
    if (audioRef.current) audioRef.current.volume = value / 100;
  }

  function handleLoadedMetadata() {
    setDuration(audioRef.current?.duration ?? 0);
    if (restoreTimeRef.current > 0 && audioRef.current) {
      audioRef.current.currentTime = restoreTimeRef.current;
      setCurrentTime(restoreTimeRef.current);
      restoreTimeRef.current = 0;
    }
  }

  return (
    <PlayerContext.Provider value={{ nowPlaying, playing, currentTime, duration, volume, play, togglePlay, seek, skip, setVolume: handleVolumeChange, audioRef }}>
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
