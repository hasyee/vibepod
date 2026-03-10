import { Button, Card, Elevation } from '@blueprintjs/core';
import { useState } from 'react';
import { useApi } from '../hooks/api';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import type { Episode } from '../types';

export function EpisodeCard({
  episode,
  showPodcastTitle = false,
  currentTime,
  thumbnail = 'episode'
}: {
  episode: Episode;
  showPodcastTitle?: boolean;
  currentTime?: number;
  thumbnail?: 'episode' | 'podcast';
}) {
  const [expanded, setExpanded] = useState(false);
  const { play } = usePlayer();
  const { queue, addToQueue, removeFromQueue } = useQueue();
  const { formatDuration } = useApi();
  const inQueue = queue.some(queued => queued.audioUrl === episode.audioUrl);
  const thumbUrl = thumbnail === 'podcast' ? episode.podcastArtworkUrl : episode.artworkUrl;

  return (
    <Card
      elevation={Elevation.ONE}
      onClick={() => setExpanded(prev => !prev)}
      style={{ padding: '0.75rem 1rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {thumbUrl ? (
          <img
            src={thumbUrl}
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
              fontSize: 14,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {episode.title}
          </div>
          <div style={{ color: '#abb3bf', fontSize: 12, marginTop: 2 }}>
            {showPodcastTitle && episode.podcastTitle && <>{episode.podcastTitle} · </>}
            {new Date(episode.releaseDate).toLocaleDateString()} ·{' '}
            {episode.duration ? formatDuration(episode.duration) : '—'}
          </div>
        </div>
        {currentTime != null && episode.duration > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              background: '#383e47',
              borderRadius: '0 0 2px 2px'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min((currentTime / (episode.duration / 1000)) * 100, 100)}%`,
                background: '#4c90f0',
                borderRadius: 'inherit'
              }}
            />
          </div>
        )}
        <Button
          variant="minimal"
          icon={inQueue ? 'remove' : 'add-to-artifact'}
          title={inQueue ? 'Remove from queue' : 'Add to queue'}
          onClick={event => {
            event.stopPropagation();
            inQueue ? removeFromQueue(episode.audioUrl) : addToQueue(episode);
          }}
        />
        <Button
          variant="minimal"
          icon="play"
          onClick={event => {
            event.stopPropagation();
            play(episode, currentTime);
          }}
        />
      </div>
      {expanded && episode.description && (
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #383e47',
            fontSize: 13,
            color: '#abb3bf',
            lineHeight: 1.6
          }}
        >
          {episode.description}
        </div>
      )}
    </Card>
  );
}
