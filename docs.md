# Podcastr

A podcast browsing and playback app built with React, TypeScript, Vite, and Blueprint.js. Uses the Apple iTunes Search API — no backend or API key required.

---

## Tech Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| UI library | Blueprint.js v6 (dark theme) |
| Router | React Router v6 |
| API | Apple iTunes Search API (free, no auth) |

---

## Project Structure

```
src/
├── main.tsx                      # Entry point — applies bp5-dark theme
├── App.tsx                       # Root — providers, BrowserRouter, routes, SearchBar
├── types.ts                      # Shared TypeScript interfaces
├── api.ts                        # iTunes API calls + formatDuration utility
├── index.css                     # Minimal body reset
├── context/
│   ├── PlayerContext.tsx         # Audio playback state and controls (localStorage)
│   ├── SubscriptionContext.tsx   # Subscribed podcasts (localStorage)
│   └── HistoryContext.tsx        # Playback history with player state (localStorage)
├── components/
│   ├── Sidebar.tsx               # Navigation menu with active route highlighting
│   ├── PodcastCard.tsx           # Grid card for a podcast
│   ├── EpisodeCard.tsx           # Row card for an episode (expandable, progress bar)
│   ├── Player.tsx                # Bottom playback bar
│   └── HistoryTracker.tsx        # Invisible component — writes history on interval
└── pages/
    ├── PodcastSearchPage.tsx     # /search/podcast?q=
    ├── EpisodeSearchPage.tsx     # /search/episodes?q=
    ├── PodcastEpisodesPage.tsx   # /search/podcast/:podcastId
    ├── SubscriptionsPage.tsx     # /subscriptions
    └── HistoryPage.tsx           # /history
```

---

## Routing

| Route | Component | Description |
|---|---|---|
| `/` | redirect | Redirects to `/queue` |
| `/queue` | placeholder | Queue (not yet implemented) |
| `/episodes` | placeholder | Episodes (not yet implemented) |
| `/subscriptions` | `SubscriptionsPage` | Subscribed podcasts grid |
| `/downloads` | placeholder | Downloads (not yet implemented) |
| `/history` | `HistoryPage` | Playback history list |
| `/search/podcast` | `PodcastSearchPage` | Podcast search results (`?q=`) |
| `/search/podcast/:podcastId` | `PodcastEpisodesPage` | Podcast detail + episode list |
| `/search/episodes` | `EpisodeSearchPage` | Episode search results (`?q=`) |

The `SearchBar` in the navbar reads and writes the `?q=` URL param. A `SegmentedControl` (Podcasts / Episodes) switches between `/search/podcast` and `/search/episodes` while preserving the query.

---

## Data Types

### `Podcast`
```ts
interface Podcast {
  id: number;
  title: string;
  author: string;
  artworkUrl: string;
  genre: string;
  trackCount: number;
  description?: string;   // populated by fetchPodcast (lookup API)
}
```

### `Episode`
```ts
interface Episode {
  id: number;
  title: string;
  description: string;
  duration: number;       // milliseconds
  releaseDate: string;
  artworkUrl: string;
  podcastTitle?: string;  // populated in episode search results
  audioUrl?: string;      // direct audio stream URL from iTunes
}
```

### `HistoryItem`
```ts
interface HistoryItem {
  episode: Episode;
  playerState: {
    currentTime: number;  // seconds — where the user left off
    duration: number;     // seconds — total episode length
    volume: number;       // 0–100
  };
  playedAt: string;       // ISO timestamp of first play
}
```

---

## API (`src/api.ts`)

All functions call the public iTunes Search API with no authentication.

| Function | Endpoint | Description |
|---|---|---|
| `searchPodcasts(term)` | `/search?media=podcast` | Search for podcast channels |
| `searchEpisodes(term)` | `/search?entity=podcastEpisode` | Search for individual episodes |
| `fetchPodcast(podcastId)` | `/lookup?entity=podcast` | Fetch metadata for a single podcast |
| `fetchEpisodes(podcastId)` | `/lookup?entity=podcastEpisode` | Fetch episodes for a specific podcast |
| `formatDuration(ms)` | — | Formats milliseconds to `Xh Xm` or `Xm Xs` |

Search is debounced 400ms inside each page component.

---

## State Management

State is split into three React contexts. All are persisted to `localStorage`.

### `PlayerContext` (`src/context/PlayerContext.tsx`)

Manages audio playback. The `<audio>` element lives inside the provider so it persists across navigation. State is restored from `localStorage` (`player_state`) on load — the episode src is set and the saved `currentTime` is seeked once audio metadata loads.

| Value | Type | Description |
|---|---|---|
| `nowPlaying` | `Episode \| null` | Currently loaded episode |
| `playing` | `boolean` | Whether audio is playing |
| `currentTime` | `number` | Playback position in seconds |
| `duration` | `number` | Total duration in seconds |
| `volume` | `number` | Volume 0–100 |
| `play(ep, currentTime?)` | function | Load and start playing an episode, optionally from a saved position |
| `togglePlay()` | function | Pause / resume |
| `seek(value)` | function | Seek to position (0–100 percentage) |
| `skip(seconds)` | function | Skip forward or backward by seconds |
| `setVolume(value)` | function | Set volume (0–100) |

**localStorage key:** `player_state` — stores `{ nowPlaying, volume, currentTime }`

**Consumed by:** `Player`, `EpisodeCard`, `HistoryTracker`

---

### `SubscriptionContext` (`src/context/SubscriptionContext.tsx`)

Stores the list of subscribed podcasts. Only podcast metadata fields are written — no episode data.

| Value | Type | Description |
|---|---|---|
| `subscriptions` | `Podcast[]` | All subscribed podcasts |
| `isSubscribed(id)` | function | Check if a podcast is subscribed |
| `subscribe(podcast)` | function | Add to subscriptions |
| `unsubscribe(id)` | function | Remove from subscriptions |

**localStorage key:** `subscriptions` — stores `Podcast[]`

**Consumed by:** `PodcastEpisodesPage`, `SubscriptionsPage`

---

### `HistoryContext` (`src/context/HistoryContext.tsx`)

Tracks episode playback history. No duplicates — replaying an episode moves it to the top and updates its `playerState`. The original `playedAt` timestamp is preserved on re-plays.

| Value | Type | Description |
|---|---|---|
| `history` | `HistoryItem[]` | Most-recently-played first |
| `recordPlay(episode, playerState)` | function | Upsert an entry (moves to top if exists) |
| `clearHistory()` | function | Wipe all history |

**localStorage key:** `history` — stores `HistoryItem[]`

**Consumed by:** `HistoryPage`, `HistoryTracker`

---

## Components

### `AppLayout`
Renders the top `Navbar` (with `SearchBar`), `Sidebar`, the route outlet, `HistoryTracker`, and `Player`.

### `SearchBar`
Reads the current route and `?q=` param. On input change, navigates to `/search/podcast?q=` or `/search/episodes?q=` (preserving mode). A `SegmentedControl` switches mode while keeping the query. Focusing the input when not on a search route navigates to `/search/podcast`.

### `Sidebar`
Navigation menu using Blueprint `Menu` / `MenuItem`. Uses `useMatch` to highlight the active route item.

### `PodcastCard`
Interactive Blueprint `Card` showing podcast artwork, title, author, genre tag, and episode count.

### `EpisodeCard`
Row card for a single episode. Clicking toggles an expanded description. The play button calls `play(ep, currentTime?)` — passing `currentTime` resumes from a saved position. When `currentTime` is provided, a blue progress bar is rendered at the bottom of the card.

Props: `ep`, `showPodcastTitle?`, `currentTime?`

### `Player`
Fixed bottom bar. Shows current episode artwork, title, and podcast name. Controls: rewind 30s, play/pause, fast-forward 30s, seek slider, volume slider.

### `HistoryTracker`
Renders nothing. Bridges `PlayerContext` → `HistoryContext`. On episode change, calls `recordPlay` immediately and then on a 1-second interval to keep `currentTime` up to date. Clears the interval when the episode changes.

---

## Pages

### `PodcastSearchPage` (`/search/podcast?q=`)
Reads `?q=` from URL, debounces 400ms, fetches podcasts via `searchPodcasts`. Clicking a card navigates to `/search/podcast/:id`.

### `EpisodeSearchPage` (`/search/episodes?q=`)
Reads `?q=` from URL, debounces 400ms, fetches episodes via `searchEpisodes`.

### `PodcastEpisodesPage` (`/search/podcast/:podcastId`)
Fetches podcast metadata (`fetchPodcast`) and episodes (`fetchEpisodes`) in parallel. Shows a large header with artwork, title, author, genre, Subscribe button, and description. The Subscribe button toggles the subscription via `SubscriptionContext`. Back button returns to `/search/podcast?q=` (preserving the query).

### `SubscriptionsPage` (`/subscriptions`)
Reads `subscriptions` from `SubscriptionContext`. Displays a grid of `PodcastCard`s. Clicking navigates to `/search/podcast/:id`.

### `HistoryPage` (`/history`)
Reads `history` from `HistoryContext`. Displays `EpisodeCard`s with `currentTime` passed in, showing a progress bar for each. Metadata line shows date and `currentTime / duration`. Clear button wipes all history.

---

## localStorage Keys

| Key | Contents | Managed by |
|---|---|---|
| `player_state` | `{ nowPlaying, volume, currentTime }` | `PlayerContext` |
| `subscriptions` | `Podcast[]` | `SubscriptionContext` |
| `history` | `HistoryItem[]` | `HistoryContext` |

---

## Layout

```
┌─────────────────────────────────────────────┐
│  Navbar (SearchBar, action buttons)          │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │  <Route content>                 │
│          │                                  │
├──────────┴──────────────────────────────────┤
│  Player (audio controls + progress bar)      │
└─────────────────────────────────────────────┘
```

---

## Dark Theme

Blueprint's dark theme is applied globally by adding `Classes.DARK` (`bp5-dark`) to `document.body` in `main.tsx`. The page background (`#1c2127`) matches Blueprint's `$dark-gray1` token and is set in `index.css`.
