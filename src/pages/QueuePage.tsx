import { Button, NonIdealState } from '@blueprintjs/core';
import { EpisodeCard } from '../components/EpisodeCard';
import { useQueue } from '../context/QueueContext';

export function QueuePage() {
  const { queue, clearQueue } = useQueue();

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Queue</h2>
        {queue.length > 0 && (
          <Button variant="minimal" icon="trash" intent="danger" onClick={clearQueue}>
            Clear
          </Button>
        )}
      </div>

      {queue.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <NonIdealState
            icon="list"
            title="Queue is empty"
            description="Add episodes to the queue from any episode list"
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {queue.map(episode => (
            <EpisodeCard key={episode.audioUrl} episode={episode} showPodcastTitle thumbnail="podcast" />
          ))}
        </div>
      )}
    </div>
  );
}
