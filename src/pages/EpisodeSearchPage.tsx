import { NonIdealState, Spinner } from '@blueprintjs/core';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EpisodeCard } from '../components/EpisodeCard';
import { useHistory } from '../context/HistoryContext';
import { useApi } from '../hooks/api';
import type { Episode } from '../types';

export function EpisodeSearchPage() {
  const [searchParams] = useSearchParams();
  const { searchEpisodes } = useApi();
  const { history } = useHistory();
  const query = searchParams.get('q') ?? '';
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setEpisodes([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        setEpisodes(await searchEpisodes(query));
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <h2 style={{ margin: '0 0 1rem' }}>{query ? `Results for "${query}"` : 'Episodes'}</h2>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <Spinner />
        </div>
      ) : query && episodes.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <NonIdealState icon="search" title="No results" description={`No episodes found for "${query}"`} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {episodes.map(episode => (
            <EpisodeCard key={episode.audioUrl} episode={episode} showPodcastTitle currentTime={history.find(h => h.episodeId.audioUrl === episode.audioUrl)?.currentTime} />
          ))}
        </div>
      )}
    </div>
  );
}
