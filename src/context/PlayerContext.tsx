import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Episode } from '../types';

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

const PLAYER_STORAGE_KEY = 'player_state';
const PLAYBACK_RATE_KEY = 'playback_rate';

function loadPlayerState(): { nowPlaying: Episode | null; currentTime: number } {
  try {
    const saved = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { nowPlaying: null, currentTime: 0 };
}

function loadPlaybackRate(): number {
  try {
    const saved = localStorage.getItem(PLAYBACK_RATE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return 1;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const initial = loadPlayerState();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [nowPlaying, setNowPlaying] = useState<Episode | null>(initial.nowPlaying);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initial.currentTime);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(loadPlaybackRate);
  const restoreTimeRef = useRef(initial.currentTime);

  useEffect(() => {
    if (initial.nowPlaying?.audioUrl && audioRef.current) {
      audioRef.current.src = initial.nowPlaying.audioUrl;
      audioRef.current.playbackRate = playbackRate;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify({ nowPlaying, currentTime }));
  }, [nowPlaying, currentTime]);

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
    localStorage.setItem(PLAYBACK_RATE_KEY, JSON.stringify(rate));
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
