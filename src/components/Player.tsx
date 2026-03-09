import { Button, Icon, Slider } from '@blueprintjs/core';
import { formatDuration } from '../api';
import { usePlayer } from '../context/PlayerContext';

export function Player() {
  const { nowPlaying, playing, currentTime, duration, volume, togglePlay, seek, skip, setVolume } = usePlayer();
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{ flexShrink: 0, borderTop: '1px solid #383e47', display: 'flex', alignItems: 'center', padding: '0.5rem 1.5rem', gap: '1rem' }}>
      {nowPlaying?.artworkUrl
        ? <img src={nowPlaying.artworkUrl} alt={nowPlaying.title} style={{ width: 48, height: 48, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
        : <div style={{ width: 48, height: 48, background: '#383e47', borderRadius: 4, flexShrink: 0 }} />
      }
      <div style={{ width: 160, flexShrink: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {nowPlaying?.title ?? 'No episode selected'}
        </div>
        <div style={{ color: '#abb3bf', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {nowPlaying?.podcastTitle ?? '—'}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button variant="minimal" icon="step-backward" disabled={!nowPlaying} />
          <Button variant="minimal" icon="undo" disabled={!nowPlaying} onClick={() => skip(-30)} />
          <Button icon={playing ? 'pause' : 'play'} intent="primary" style={{ borderRadius: '50%' }} disabled={!nowPlaying} onClick={togglePlay} />
          <Button variant="minimal" icon="redo" disabled={!nowPlaying} onClick={() => skip(30)} />
          <Button variant="minimal" icon="step-forward" disabled={!nowPlaying} />
        </div>
        <div style={{ width: '100%', maxWidth: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#abb3bf', fontSize: 11, width: 36, textAlign: 'right' }}>
            {duration ? formatDuration(currentTime * 1000) : '0:00'}
          </span>
          <div style={{ flex: 1 }}>
            <Slider min={0} max={100} value={progress} labelRenderer={false} onChange={seek} disabled={!nowPlaying} />
          </div>
          <span style={{ color: '#abb3bf', fontSize: 11, width: 36 }}>
            {duration ? formatDuration(duration * 1000) : '0:00'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 160 }}>
        <Icon icon="volume-up" color="#abb3bf" />
        <div style={{ width: 80 }}>
          <Slider min={0} max={100} value={volume} labelRenderer={false} onChange={setVolume} />
        </div>
      </div>
    </div>
  );
}
