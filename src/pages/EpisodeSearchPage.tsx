import { NonIdealState, Spinner } from '@blueprintjs/core';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EpisodeCard } from '../components/EpisodeCard';
import { searchEpisodes } from '../api';
import type { Episode } from '../types';

export function EpisodeSearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setEpisodes([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        setEpisodes(await searchEpisodes(q));
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [q]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <h2 style={{ margin: '0 0 1rem' }}>{q ? `Results for "${q}"` : 'Episodes'}</h2>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <Spinner />
        </div>
      ) : q && episodes.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
          <NonIdealState icon="search" title="No results" description={`No episodes found for "${q}"`} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {episodes.map(ep => <EpisodeCard key={ep.id} ep={ep} showPodcastTitle />)}
        </div>
      )}
    </div>
  );
}
