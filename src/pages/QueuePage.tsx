import { Button, NonIdealState, Spinner } from '@blueprintjs/core';
import { useEffect, useMemo, useState } from 'react';
import { EpisodeCard } from '../components/EpisodeCard';
import { useFeed } from '../hooks/feed';
import { useHistory } from '../context/HistoryContext';
import { useQueue } from '../context/QueueContext';
import type { Episode } from '../types';
import { parseEpisodes } from '../utils';

export function QueuePage() {
  const { queue, clearQueue } = useQueue();
  const { history } = useHistory();
  const { getFeed } = useFeed();
  const [fetched, setFetched] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  const feedUrlsKey = useMemo(() => [...new Set(queue.map(item => item.feedUrl))].sort().join('\n'), [queue]);

  useEffect(() => {
    const feedUrls = feedUrlsKey ? feedUrlsKey.split('\n') : [];
    if (feedUrls.length === 0) {
      setFetched([]);
      return;
    }
    setLoading(true);
    Promise.allSettled(feedUrls.map(feedUrl => getFeed(feedUrl).then(text => parseEpisodes(feedUrl, text))))
      .then(results => setFetched(results.flatMap(result => (result.status === 'fulfilled' ? result.value : []))))
      .finally(() => setLoading(false));
  }, [feedUrlsKey]);

  const episodes = useMemo(() => {
    return queue.map(item => fetched.find(episode => episode.audioUrl === item.audioUrl)!).filter(Boolean);
  }, [queue, fetched]);

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
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
          <Spinner />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {episodes.map(episode => (
            <EpisodeCard key={episode.audioUrl} episode={episode} showPodcastTitle thumbnail="podcast" currentTime={history.find(h => h.episodeId.audioUrl === episode.audioUrl)?.currentTime} />
          ))}
        </div>
      )}
    </div>
  );
}
