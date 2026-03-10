import { Button, PopoverNext, Slider } from '@blueprintjs/core';
import { useApi } from '../context/ApiContext';
import { usePlayer } from '../context/PlayerContext';

export function Player() {
  const { nowPlaying, playing, currentTime, duration, playbackRate, togglePlay, seek, skip, setPlaybackRate } =
    usePlayer();
  const { formatDuration } = useApi();
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const SPEEDS = [0.5, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.5, 1.75, 2];
  const speedIdx = SPEEDS.indexOf(playbackRate) === -1 ? SPEEDS.indexOf(1) : SPEEDS.indexOf(playbackRate);

  return (
    <div style={{ flexShrink: 0, borderTop: '1px solid #383e47', display: 'flex', flexDirection: 'column' }}>
      {/* Full-width progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.4rem 1.5rem 0' }}>
        <span style={{ color: '#abb3bf', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {duration ? formatDuration(currentTime * 1000) : '0:00'}
        </span>
        <div style={{ flex: 1 }}>
          <Slider min={0} max={100} value={progress} labelRenderer={false} onChange={seek} disabled={!nowPlaying} />
        </div>
        <span style={{ color: '#abb3bf', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {duration ? formatDuration(duration * 1000) : '0:00'}
        </span>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0.25rem 1.5rem 0.5rem', gap: '1rem' }}>
        {nowPlaying?.artworkUrl ? (
          <img
            src={nowPlaying.artworkUrl}
            alt={nowPlaying.title}
            style={{ width: 48, height: 48, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: 48, height: 48, background: '#383e47', borderRadius: 4, flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {nowPlaying?.title ?? 'No episode selected'}
          </div>
          <div
            style={{
              color: '#abb3bf',
              fontSize: 11,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {nowPlaying?.podcastTitle ?? '—'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Button variant="minimal" icon="undo" disabled={!nowPlaying} onClick={() => skip(-10)} />
            <span style={{ color: '#abb3bf', fontSize: 10 }}>-10s</span>
          </div>
          <Button
            icon={playing ? 'pause' : 'play'}
            intent="primary"
            style={{ borderRadius: '50%' }}
            disabled={!nowPlaying}
            onClick={togglePlay}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Button variant="minimal" icon="redo" disabled={!nowPlaying} onClick={() => skip(30)} />
            <span style={{ color: '#abb3bf', fontSize: 10 }}>+30s</span>
          </div>
        </div>

        <PopoverNext
          disabled={!nowPlaying}
          placement="top-end"
          content={
            <div style={{ padding: '0.75rem 1rem', width: 300 }}>
              <Slider
                min={0}
                max={SPEEDS.length - 1}
                labelValues={SPEEDS}
                value={speedIdx}
                labelRenderer={false}
                onChange={v => setPlaybackRate(SPEEDS[v])}
              />
            </div>
          }
        >
          <Button
            variant="minimal"
            disabled={!nowPlaying}
            text={`${playbackRate}x`}
            style={{ width: 52, justifyContent: 'center' }}
          />
        </PopoverNext>
      </div>
    </div>
  );
}
