# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite)
npm run build      # Type-check (tsc -b) then build
npm run lint       # ESLint
npm run preview    # Preview production build
```

There are no tests.

## Architecture

The app is a React + TypeScript SPA. All state lives in React contexts, all wrapped in `App.tsx` in this order (outermost first):

```
ApiProvider → LocalStorageProvider → PlayerProvider → QueueProvider → HistoryProvider → SubscriptionProvider → EpisodesProvider → BrowserRouter
```

**Context responsibilities:**

| Context               | What it owns                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ApiContext`          | All iTunes API calls and RSS feed fetching. Exposes methods via `useApi()`. API functions and constants (`ITUNES_API_BASE_URL`, `CORS_PROXY`) live directly in this file. |
| `LocalStorageContext` | Thin wrapper over `localStorage` with JSON parse/stringify. Exposes `get<T>(key)` and `set(key, data)` via `useLocalStorage()`.                                           |
| `PlayerContext`       | `<audio>` element ref, playback state, and controls. Persists state to localStorage on an interval while playing, and on pause/episode change.                            |
| `QueueContext`        | Episode queue array. Persists to localStorage via `useEffect([queue])`.                                                                                                   |
| `HistoryContext`      | Playback history array. Persists to localStorage via `useEffect([history])`.                                                                                              |
| `SubscriptionContext` | Subscribed podcasts array. Persists to localStorage via `useEffect([subscriptions])`.                                                                                     |
| `EpisodesContext`     | Aggregates episodes from all subscribed podcast RSS feeds. Re-fetches when subscriptions change.                                                                          |

**Key files:**

- `src/types.ts` — All shared types (`Podcast`, `Episode`, `HistoryItem`, `PlayerState`) and the `StorageKey` const object (use instead of raw strings for localStorage keys).
- `src/utils.ts` — `hashString` (used to generate episode IDs from RSS GUIDs) and `parseDuration` (parses `HH:MM:SS` strings to milliseconds).

## Code style

- **No abbreviated variable names.** Use full descriptive names: `episode` not `ep`, `podcast` not `p`, `query` not `q`, `response` not `res`, `result` not `r`, `index` not `i` (except standard `for` loop counters), `event` not `e` (for DOM/React event handlers), `value` not `v`, `hours`/`minutes`/`seconds` not `h`/`m`/`s`.
- `erasableSyntaxOnly` is enabled — do not use `enum`. Use `const ... as const` objects instead (see `StorageKey` in `types.ts`).
- Prettier is configured via `.prettierrc.json`: `printWidth: 120`, `singleQuote`, `arrowParens: 'avoid'`, no trailing commas, `tabWidth: 2`.
