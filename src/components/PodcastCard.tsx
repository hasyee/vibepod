import { Card, Elevation, Tag } from '@blueprintjs/core';
import type { Podcast } from '../types';

export function PodcastCard({ podcast, onClick }: { podcast: Podcast; onClick: () => void }) {
  return (
    <Card
      elevation={Elevation.TWO}
      interactive
      onClick={onClick}
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      {podcast.artworkUrl
        ? <img src={podcast.artworkUrl} alt={podcast.title} style={{ width: '100%', aspectRatio: '1', borderRadius: 4, marginBottom: 4, objectFit: 'cover' }} />
        : <div style={{ width: '100%', aspectRatio: '1', background: '#383e47', borderRadius: 4, marginBottom: 4 }} />
      }
      <div style={{ fontWeight: 600, fontSize: 14 }}>{podcast.title}</div>
      <div style={{ color: '#abb3bf', fontSize: 12 }}>{podcast.author}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tag minimal>{podcast.genre}</Tag>
        <span style={{ color: '#abb3bf', fontSize: 11 }}>{podcast.trackCount} eps</span>
      </div>
    </Card>
  );
}
