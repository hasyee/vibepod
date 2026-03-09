import { Button, Card, Elevation } from '@blueprintjs/core';
import { useState } from 'react';
import { formatDuration } from '../api';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../context/QueueContext';
import type { Episode } from '../types';

export function EpisodeCard({
  ep,
  showPodcastTitle = false,
  currentTime
}: {
  ep: Episode;
  showPodcastTitle?: boolean;
  currentTime?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { play } = usePlayer();
  const { queue, addToQueue, removeFromQueue } = useQueue();
  const inQueue = queue.some(e => e.id === ep.id);

  return (
    <Card
      elevation={Elevation.ONE}
      onClick={() => setExpanded(e => !e)}
      style={{ padding: '0.75rem 1rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {ep.artworkUrl ? (
          <img
            src={ep.artworkUrl}
            alt={ep.title}
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
            {ep.title}
          </div>
          <div style={{ color: '#abb3bf', fontSize: 12, marginTop: 2 }}>
            {showPodcastTitle && ep.podcastTitle && <>{ep.podcastTitle} · </>}
            {new Date(ep.releaseDate).toLocaleDateString()} · {ep.duration ? formatDuration(ep.duration) : '—'}
          </div>
        </div>
        {currentTime != null && ep.duration > 0 && (
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
                width: `${Math.min((currentTime / (ep.duration / 1000)) * 100, 100)}%`,
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
          onClick={e => {
            e.stopPropagation();
            inQueue ? removeFromQueue(ep.id) : addToQueue(ep);
          }}
        />
        <Button
          variant="minimal"
          icon="play"
          onClick={e => {
            e.stopPropagation();
            play(ep, currentTime);
          }}
        />
      </div>
      {expanded && ep.description && (
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
          {ep.description}
        </div>
      )}
    </Card>
  );
}
