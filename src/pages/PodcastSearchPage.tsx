import { NonIdealState, Spinner } from '@blueprintjs/core';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PodcastCard } from '../components/PodcastCard';
import { useApi } from '../hooks/api';
import type { Podcast } from '../types';

export function PodcastSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchPodcasts } = useApi();
  const query = searchParams.get('q') ?? '';
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setPodcasts([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        setPodcasts(await searchPodcasts(query));
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <h2 style={{ margin: '0 0 1rem' }}>{query ? `Results for "${query}"` : 'Featured'}</h2>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <Spinner />
        </div>
      ) : query && podcasts.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <NonIdealState icon="search" title="No results" description={`No podcasts found for "${query}"`} />
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
