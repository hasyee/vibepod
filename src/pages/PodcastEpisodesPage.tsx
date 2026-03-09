import { Button, NonIdealState, Spinner } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchEpisodes, fetchPodcast } from '../api';
import { EpisodeCard } from '../components/EpisodeCard';
import { useSubscriptions } from '../context/SubscriptionContext';
import type { Episode, Podcast } from '../types';

export function PodcastEpisodesPage() {
  const { podcastId } = useParams<{ podcastId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') ?? '';
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSubscribed, subscribe, unsubscribe } = useSubscriptions();
  const subscribed = podcast ? isSubscribed(podcast.id) : false;

  useEffect(() => {
    if (!podcastId) return;
    setLoading(true);
    Promise.all([fetchPodcast(Number(podcastId)), fetchEpisodes(Number(podcastId))])
      .then(([p, eps]) => {
        setPodcast(p);
        setEpisodes(eps);
      })
      .finally(() => setLoading(false));
  }, [podcastId]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Button
          variant="minimal"
          icon="arrow-left"
          onClick={() => navigate(`/search/podcast${q ? `?q=${q}` : ''}`)}
          style={{ marginBottom: '1rem' }}
        />
        {podcast && (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            {podcast.artworkUrl && (
              <img
                src={podcast.artworkUrl}
                alt={podcast.title}
                style={{ width: 160, height: 160, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <div>
              <div style={{ color: '#abb3bf', fontSize: 13, marginBottom: 4 }}>{podcast.genre}</div>
              <h1 style={{ margin: '0 0 4px' }}>{podcast.title}</h1>
              <div style={{ color: '#abb3bf', fontSize: 14, marginBottom: 12 }}>{podcast.author}</div>
              <Button
                icon={subscribed ? 'tick' : 'add'}
                intent={subscribed ? 'success' : 'primary'}
                onClick={() => subscribed ? unsubscribe(podcast.id) : subscribe(podcast)}
                style={{ marginBottom: 12 }}
              >
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </Button>
              {podcast.description && (
                <p style={{ margin: 0, fontSize: 14, color: '#abb3bf', lineHeight: 1.6, maxWidth: 600 }}>
                  {podcast.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
          <Spinner />
        </div>
      ) : episodes.length === 0 ? (
        <NonIdealState icon="music" title="No episodes" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {episodes.map(ep => (
            <EpisodeCard key={ep.id} ep={ep} />
          ))}
        </div>
      )}
    </div>
  );
}
