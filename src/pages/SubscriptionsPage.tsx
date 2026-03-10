import { NonIdealState, Spinner } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PodcastCard } from '../components/PodcastCard';
import { useFeed } from '../context/FeedContext';
import { useSubscriptions } from '../context/SubscriptionContext';
import type { Podcast } from '../types';
import { parsePodcast } from '../utils';

export function SubscriptionsPage() {
  const { subscriptions } = useSubscriptions();
  const { getFeed } = useFeed();
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subscriptions.length === 0) {
      setPodcasts([]);
      return;
    }
    setLoading(true);
    Promise.allSettled(subscriptions.map(feedUrl => getFeed(feedUrl).then(text => parsePodcast(feedUrl, text))))
      .then(results => {
        setPodcasts(results.flatMap(result => (result.status === 'fulfilled' && result.value ? [result.value] : [])));
      })
      .finally(() => setLoading(false));
  }, [subscriptions]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <h2 style={{ margin: '0 0 1.5rem' }}>Subscriptions</h2>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <Spinner />
        </div>
      ) : subscriptions.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <NonIdealState
            icon="bookmark"
            title="No subscriptions yet"
            description="Subscribe to podcasts to see them here"
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {podcasts.map(podcast => (
            <PodcastCard
              key={podcast.feedUrl}
              podcast={podcast}
              onClick={() => navigate(`/podcast/${encodeURIComponent(podcast.feedUrl)}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
