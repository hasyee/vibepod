import { Button, PopoverNext, Slider } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useFeed } from '../hooks/feed';
import type { Episode } from '../types';
import { formatDuration, parseEpisodes } from '../utils';

export function Player() {
  const { getFeed } = useFeed();
  const { episodeId, playing, currentTime, duration, playbackRate, togglePlay, seek, skip, setPlaybackRate } =
    usePlayer();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const progress = duration ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    if (!episodeId) return void setEpisode(null);
    getFeed(episodeId.feedUrl).then(content => {
      const episodes = parseEpisodes(episodeId.feedUrl, content);
      const episode = episodes.find(episode => episode.audioUrl === episodeId.audioUrl) ?? null;
      setEpisode(episode);
    });
  }, [episodeId]);

  const SPEEDS = [0.5, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.5, 1.75, 2];
  const speedIndex = SPEEDS.indexOf(playbackRate) === -1 ? SPEEDS.indexOf(1) : SPEEDS.indexOf(playbackRate);

  return (
    <div style={{ flexShrink: 0, borderTop: '1px solid #383e47', display: 'flex', flexDirection: 'column' }}>
      {/* Full-width progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.4rem 1.5rem 0' }}>
        <span style={{ color: '#abb3bf', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {duration ? formatDuration(currentTime * 1000) : '0:00'}
        </span>
        <div style={{ flex: 1 }}>
          <Slider min={0} max={100} value={progress} labelRenderer={false} onChange={seek} disabled={!episodeId} />
        </div>
        <span style={{ color: '#abb3bf', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {duration ? formatDuration(duration * 1000) : '0:00'}
        </span>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0.25rem 1.5rem 0.5rem', gap: '1rem' }}>
        {episode?.artworkUrl ? (
          <img
            src={episode.artworkUrl}
            alt={episode.title}
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
            {episode?.title ?? 'No episode selected'}
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
            {episode?.podcastTitle ?? '—'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Button variant="minimal" icon="undo" disabled={!episode} onClick={() => skip(-10)} />
            <span style={{ color: '#abb3bf', fontSize: 10 }}>-10s</span>
          </div>
          <Button
            icon={playing ? 'pause' : 'play'}
            intent="primary"
            style={{ borderRadius: '50%' }}
            disabled={!episode}
            onClick={togglePlay}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Button variant="minimal" icon="redo" disabled={!episode} onClick={() => skip(30)} />
            <span style={{ color: '#abb3bf', fontSize: 10 }}>+30s</span>
          </div>
        </div>

        <PopoverNext
          disabled={!episode}
          placement="top-end"
          content={
            <div style={{ padding: '0.75rem 1rem', width: 300 }}>
              <Slider
                min={0}
                max={SPEEDS.length - 1}
                labelValues={SPEEDS}
                value={speedIndex}
                labelRenderer={false}
                onChange={value => setPlaybackRate(SPEEDS[value])}
              />
            </div>
          }
        >
          <Button
            variant="minimal"
            disabled={!episode}
            text={`${playbackRate}x`}
            style={{ width: 52, justifyContent: 'center' }}
          />
        </PopoverNext>
      </div>
    </div>
  );
}
