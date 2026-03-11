import { Button, NonIdealState, Spinner } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EpisodeCard } from '../components/EpisodeCard';
import { useFeed } from '../hooks/feed';
import { useHistory } from '../context/HistoryContext';
import { useSubscriptions } from '../context/SubscriptionContext';
import type { Episode, Podcast } from '../types';
import { parseEpisodes, parsePodcast } from '../utils';

export function PodcastPage() {
  const navigate = useNavigate();
  const params = useParams<{ feedUrl: string }>();
  const feedUrl = decodeURIComponent(params.feedUrl ?? '');
  const { getFeed } = useFeed();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const { history } = useHistory();
  const { isSubscribed, subscribe, unsubscribe } = useSubscriptions();
  const subscribed = podcast ? isSubscribed(podcast.feedUrl) : false;

  useEffect(() => {
    if (!feedUrl) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getFeed(feedUrl)
      .then(text => {
        setPodcast(parsePodcast(feedUrl, text));
        setEpisodes(parseEpisodes(feedUrl, text));
      })
      .finally(() => setLoading(false));
  }, [feedUrl]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Button variant="minimal" icon="arrow-left" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }} />
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
                onClick={() => (subscribed ? unsubscribe(podcast.feedUrl) : subscribe(podcast.feedUrl))}
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
          {episodes.map(episode => (
            <EpisodeCard key={episode.audioUrl} episode={episode} currentTime={history.find(h => h.episodeId.audioUrl === episode.audioUrl)?.currentTime} />
          ))}
        </div>
      )}
    </div>
  );
}
