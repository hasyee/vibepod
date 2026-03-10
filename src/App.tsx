import {
  Button,
  InputGroup,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  NonIdealState,
  SegmentedControl
} from '@blueprintjs/core';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { HistoryTracker } from './components/HistoryTracker';
import { Player } from './components/Player';
import { Sidebar } from './components/Sidebar';
import { EpisodesProvider } from './context/EpisodesContext';
import { HistoryProvider } from './context/HistoryContext';
import { ApiProvider } from './context/ApiContext';
import { LocalStorageProvider } from './context/LocalStorageContext';
import { PlayerProvider } from './context/PlayerContext';
import { QueueProvider } from './context/QueueContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { EpisodeSearchPage } from './pages/EpisodeSearchPage';
import { EpisodesPage } from './pages/EpisodesPage';
import { HistoryPage } from './pages/HistoryPage';
import { PodcastEpisodesPage } from './pages/PodcastEpisodesPage';
import { PodcastSearchPage } from './pages/PodcastSearchPage';
import { QueuePage } from './pages/QueuePage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';

function PlaceholderPage({ title, icon }: { title: string; icon: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <NonIdealState icon={icon as any} title={title} description="Coming soon" />
    </div>
  );
}

function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const isEpisodeSearch = location.pathname === '/search/episodes';
  const isOnSearch = location.pathname.startsWith('/search');

  function handleChange(value: string) {
    const route = isEpisodeSearch ? '/search/episodes' : '/search/podcasts';
    navigate(`${route}${value ? `?q=${encodeURIComponent(value)}` : ''}`, { replace: isOnSearch });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {isOnSearch && (
        <SegmentedControl
          options={[
            { label: 'Podcasts', value: 'podcast' },
            { label: 'Episodes', value: 'episodes' }
          ]}
          value={isEpisodeSearch ? 'episodes' : 'podcast'}
          onValueChange={v => navigate(`/search/${v}${q ? `?q=${encodeURIComponent(q)}` : ''}`)}
          size="small"
        />
      )}
      <InputGroup
        leftIcon="search"
        placeholder="Search podcasts..."
        value={isOnSearch ? q : ''}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => {
          if (!isOnSearch) navigate('/search/podcasts');
        }}
        style={{ width: 260 }}
      />
    </div>
  );
}

function AppLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar>
        <NavbarGroup align="left">
          <NavbarHeading>
            <strong>Vibepod</strong>
          </NavbarHeading>
          <NavbarDivider />
        </NavbarGroup>
        <NavbarGroup align="right">
          <SearchBar />
          <Button variant="minimal" icon="notifications" style={{ marginLeft: 8 }} />
          <Button variant="minimal" icon="cog" />
          <Button variant="minimal" icon="user" />
        </NavbarGroup>
      </Navbar>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/queue" replace />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/episodes" element={<EpisodesPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/downloads" element={<PlaceholderPage title="Downloads" icon="download" />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/search/podcasts" element={<PodcastSearchPage />} />
          <Route path="/search/podcasts/:podcastId" element={<PodcastEpisodesPage />} />
          <Route path="/search/episodes" element={<EpisodeSearchPage />} />
        </Routes>
      </div>

      <HistoryTracker />
      <Player />
    </div>
  );
}

function App() {
  return (
    <ApiProvider>
      <LocalStorageProvider>
        <PlayerProvider>
        <QueueProvider>
          <HistoryProvider>
            <SubscriptionProvider>
              <EpisodesProvider>
                <BrowserRouter>
                  <AppLayout />
                </BrowserRouter>
              </EpisodesProvider>
            </SubscriptionProvider>
          </HistoryProvider>
        </QueueProvider>
      </PlayerProvider>
    </LocalStorageProvider>
    </ApiProvider>
  );
}

export default App;
