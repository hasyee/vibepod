# Vibepod

A podcast player web app built with React, TypeScript, and Vite.

## Features

- Search podcasts and episodes via the iTunes API
- Subscribe to podcasts and browse their episodes from RSS feeds
- Queue management — add/remove episodes, play from queue
- Playback controls — play/pause, seek, skip ±10s/30s, variable speed
- Playback history with resume support
- Persistent state across sessions via localStorage

## Tech Stack

- **React 18** with TypeScript
- **Vite** for dev server and bundling
- **Blueprint.js** for UI components
- **React Router v7** for navigation

## Project Structure

```
src/
  context/
    ApiContext.tsx        # iTunes API + RSS feed methods, exposed via useApi()
    LocalStorageContext.tsx  # localStorage get/set, exposed via useLocalStorage()
    PlayerContext.tsx     # Audio playback state and controls
    QueueContext.tsx      # Episode queue
    HistoryContext.tsx    # Playback history
    SubscriptionContext.tsx  # Podcast subscriptions
    EpisodesContext.tsx   # Aggregated episodes from subscribed feeds
  pages/
    PodcastSearchPage.tsx
    EpisodeSearchPage.tsx
    PodcastEpisodesPage.tsx
    EpisodesPage.tsx
    QueuePage.tsx
    HistoryPage.tsx
    SubscriptionsPage.tsx
  components/
    Player.tsx            # Persistent bottom player bar
    EpisodeCard.tsx
    PodcastCard.tsx
    Sidebar.tsx
    HistoryTracker.tsx
  types.ts                # Shared types and StorageKey constants
  utils.ts                # hashString (ID generation), parseDuration helpers
```

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
