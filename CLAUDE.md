# Vibepod – Project Guide

## Overview
React podcast player app. TypeScript strict mode, Blueprint.js UI, React Router v7, iTunes API for discovery.

## Stack
- **React 18** + **TypeScript ~5.9** (strict, noUnusedLocals, noUnusedParameters)
- **Blueprint.js v6** – UI components (dark theme via `Classes.DARK` on `<body>`)
- **React Router v7** – client-side routing
- **Vite 7** – bundler with `vite-plugin-checker` for project-wide TS error reporting (tsconfig.app.json)
- **IndexedDB** – RSS feed content cache
- **localStorage** – queue, history, subscriptions, player state

## Project Structure
```
src/
  types.ts              – All shared types and StorageKey constants
  utils.ts              – formatDuration, parseDuration, parsePodcast, parseEpisodes
  main.tsx              – Entry: applies Blueprint dark theme, renders App
  App.tsx               – Provider tree + BrowserRouter + routes
  hooks/
    api.ts              – useApi(): searchPodcasts, searchEpisodes, fetchFeed (iTunes + CORS proxy)
    feed.ts             – useFeed(): getFeed() — cache-first (IndexedDB → network)
    feedCache.ts        – useFeedCache(): get/set/listKeys/remove (IndexedDB 'feeds' store)
    localStorage.ts     – useLocalStorage(): get<T>/set<T> (JSON serialization)
  context/
    PlayerContext.tsx   – usePlayer(): audio playback state and controls
    QueueContext.tsx    – useQueue(): queue state (EpisodeId[])
    HistoryContext.tsx  – useHistory(): playback history (HistoryItem[])
    SubscriptionContext.tsx – useSubscriptions(): subscriptions + feed cache sync
    EpisodesContext.tsx – useEpisodes(): aggregated episodes from all subscriptions
  components/
    Player.tsx          – Bottom bar player (progress, skip, speed)
    Sidebar.tsx         – Left nav (Queue, Episodes, Subscriptions, Downloads, History)
    EpisodeCard.tsx     – Episode row card (play, queue, expand description, progress bar)
    PodcastCard.tsx     – Podcast grid card
  pages/
    QueuePage.tsx
    EpisodesPage.tsx
    SubscriptionsPage.tsx
    HistoryPage.tsx
    PodcastSearchPage.tsx
    EpisodeSearchPage.tsx
    PodcastPage.tsx     – Podcast detail + subscribe + episode list
```

## Key Types (src/types.ts)
```ts
type EpisodeId = { feedUrl: string; audioUrl: string }
type Episode = EpisodeId & { title, description, duration (ms), releaseDate, artworkUrl, podcastTitle, podcastArtworkUrl }
type Podcast = { feedUrl, collectionId? (iTunes only), title, author, artworkUrl, genre, trackCount, description? }
type HistoryItem = { episodeId: EpisodeId; currentTime: number; playedAt: string }
StorageKey = { Queue, History, Subscriptions, PlayerState, PlaybackRate }
```

## Provider Tree Order (App.tsx)
```
PlayerProvider → QueueProvider → HistoryProvider → SubscriptionProvider → EpisodesProvider → BrowserRouter
```

## Architecture Notes
- **Hooks without state** (`api`, `feedCache`, `localStorage`, `feed`) are plain custom hooks — no React context, no providers.
- **Feed caching**: `SubscriptionContext` owns write/evict logic. `useFeed` is read-only (cache-first).
- **`Promise.allSettled`** used everywhere for parallel feed fetches — a failing feed never blocks others.
- Search pages debounce iTunes API calls 400ms.
- `PlayerContext` uses a `stateRef` for up-to-date state inside audio event callbacks.
- `HistoryContext` records playback every second via `setInterval` while playing.

## External APIs
- iTunes Search: `https://itunes.apple.com/search`
- CORS proxy for RSS feeds: `https://corsproxy.io/?url=`

## Routes
| Path | Page |
|------|------|
| `/` | → `/queue` |
| `/queue` | QueuePage |
| `/episodes` | EpisodesPage |
| `/subscriptions` | SubscriptionsPage |
| `/downloads` | Placeholder |
| `/history` | HistoryPage |
| `/search/podcasts` | PodcastSearchPage |
| `/search/episodes` | EpisodeSearchPage |
| `/podcast/:feedUrl` | PodcastPage |
