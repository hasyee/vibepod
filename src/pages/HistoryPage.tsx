import { Button, NonIdealState } from '@blueprintjs/core';
import { EpisodeCard } from '../components/EpisodeCard';
import { useApi } from '../context/ApiContext';
import { useHistory } from '../context/HistoryContext';

export function HistoryPage() {
  const { history, clearHistory } = useHistory();
  const { formatDuration } = useApi();

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
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {history.map((item, i) => {
            return (
              <div key={`${item.episode.id}-${i}`}>
                <div style={{ fontSize: 12, color: '#abb3bf', marginBottom: 4, paddingLeft: 4 }}>
                  {new Date(item.playedAt).toLocaleString()}
                  {item.playerState.currentTime > 0 && (
                    <span style={{ marginLeft: 8 }}>
                      · {formatDuration(item.playerState.currentTime * 1000)} /{' '}
                      {formatDuration(item.playerState.duration * 1000)}
                    </span>
                  )}
                </div>
                <EpisodeCard ep={item.episode} showPodcastTitle currentTime={item.playerState.currentTime} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
