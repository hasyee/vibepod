import { NonIdealState } from '@blueprintjs/core';
import { useNavigate } from 'react-router-dom';
import { PodcastCard } from '../components/PodcastCard';
import { useSubscriptions } from '../context/SubscriptionContext';

export function SubscriptionsPage() {
  const { subscriptions } = useSubscriptions();
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <h2 style={{ margin: '0 0 1.5rem' }}>Subscriptions</h2>
      {subscriptions.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <NonIdealState
            icon="bookmark"
            title="No subscriptions yet"
            description="Subscribe to podcasts to see them here"
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {subscriptions.map(p => (
            <PodcastCard key={p.id} podcast={p} onClick={() => navigate(`/search/podcast/${p.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
