import { NonIdealState, Spinner } from '@blueprintjs/core';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchPodcasts } from '../api';
import { PodcastCard } from '../components/PodcastCard';
import type { Podcast } from '../types';

export function PodcastSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') ?? '';
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setPodcasts([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        setPodcasts(await searchPodcasts(q));
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [q]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <h2 style={{ margin: '0 0 1rem' }}>{q ? `Results for "${q}"` : 'Featured'}</h2>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <Spinner />
        </div>
      ) : q && podcasts.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <NonIdealState icon="search" title="No results" description={`No podcasts found for "${q}"`} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {podcasts.map(p => (
            <PodcastCard key={p.id} podcast={p} onClick={() => navigate(`/search/podcasts/${p.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
