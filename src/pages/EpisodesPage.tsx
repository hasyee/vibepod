import { Button, NonIdealState, Spinner } from '@blueprintjs/core';
import { EpisodeCard } from '../components/EpisodeCard';
import { useEpisodes } from '../context/EpisodesContext';
import { useSubscriptions } from '../context/SubscriptionContext';

export function EpisodesPage() {
  const { episodes, loading, refresh } = useEpisodes();
  const { subscriptions } = useSubscriptions();

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Episodes</h2>
        {subscriptions.length > 0 && (
          <Button variant="minimal" icon="refresh" onClick={refresh} loading={loading}>
            Refresh
          </Button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
          <Spinner />
        </div>
      ) : subscriptions.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <NonIdealState
            icon="music"
            title="No subscriptions"
            description="Subscribe to podcasts to see their episodes here"
          />
        </div>
      ) : episodes.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <NonIdealState icon="music" title="No episodes found" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {episodes.map(episode => (
            <EpisodeCard key={episode.id} episode={episode} showPodcastTitle thumbnail="podcast" />
          ))}
        </div>
      )}
    </div>
  );
}
