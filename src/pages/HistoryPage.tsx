import { Button, NonIdealState, Spinner } from '@blueprintjs/core';
import { useEffect, useMemo, useState } from 'react';
import { EpisodeCard } from '../components/EpisodeCard';
import { useHistory } from '../context/HistoryContext';
import { useFeed } from '../hooks/feed';
import type { Episode } from '../types';
import { formatDuration, parseEpisodes } from '../utils';

export function HistoryPage() {
  const { history, clearHistory } = useHistory();
  const { getFeed } = useFeed();
  const [fetched, setFetched] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  const feedUrlsKey = useMemo(
    () => [...new Set(history.map(item => item.episodeId.feedUrl))].sort().join('\n'),
    [history]
  );

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

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>History</h2>
        {history.length > 0 && (
          <Button variant="minimal" icon="trash" intent="danger" onClick={clearHistory}>
            Clear
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <NonIdealState icon="history" title="No history yet" description="Episodes you play will appear here" />
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
          <Spinner />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {history
            .map((item, index) => {
              const episode = fetched.find(episode => episode.audioUrl === item.episodeId.audioUrl)!;
              if (!episode) return null;
              return (
                <div key={`${item.episodeId.audioUrl}-${index}`}>
                  <div style={{ fontSize: 12, color: '#abb3bf', marginBottom: 4, paddingLeft: 4 }}>
                    {new Date(item.playedAt).toLocaleString()}
                    {item.currentTime > 0 && (
                      <span style={{ marginLeft: 8 }}>
                        · {formatDuration(item.currentTime * 1000)} / {formatDuration(episode.duration * 1000)}
                      </span>
                    )}
                  </div>
                  <EpisodeCard episode={episode} showPodcastTitle currentTime={item.currentTime} thumbnail="podcast" />
                </div>
              );
            })
            .filter(Boolean)}
        </div>
      )}
    </div>
  );
}
