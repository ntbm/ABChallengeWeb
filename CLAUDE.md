# ABChallenge Tracker - Web

## Overview

ABC Challenge Tracker — a progressive web app for tracking progress through an alphabet challenge (A-Z). Each letter represents an activity to complete. Built as an Instagram-worthy experience where all 26 letters are visible on a single phone screen.

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom dark premium theme (Outfit font)
- **State**: Zustand stores (`authStore`, `tilesStore`)
- **Storage**: Google Drive API (tiles JSON + thumbnails)
- **i18n**: react-i18next (DE/EN)
- **Routing**: React Router v6

## Commands

- `npm run dev` — start dev server
- `npm run build` — type-check + production build (`tsc && vite build`)
- `npm run preview` — preview production build

## Architecture

```
src/
  components/   — UI components (TileGrid, TileCard, AppHeader, etc.)
  pages/        — route pages (TilesPage, TileDetailPage, LoginPage)
  state/        — Zustand stores
  services/     — Google Drive storage, thumbnail cache, offline queue
  models/       — Tile data model (26 letters A-Z)
  i18n/         — translation files
  utils/        — date formatting, image thumbs, debounce
```

## Design System

- **Theme**: Dark premium (navy/indigo gradient background, grain texture overlay)
- **Tiles**: Three visual states:
  - **Done** (date set): emerald glow border, green letter, gradient checkmark dot
  - **Idea** (note/image, no date): amber glow border, yellow letter, 💡 indicator
  - **Incomplete**: subtle glass tile, faint white letter
- **Grid Layout**: Even column counts with centered "ABC Challenge" filler in middle row
  - Mobile: 4 columns, 7 rows
  - Tablet/Desktop: 6 columns, 5 rows
  - Filler sits between M and N, symmetrically centered
- **Typography**: Outfit (700, 900) loaded via Google Fonts
- **Animations**: Staggered tile-in animation, active:scale press feedback

## Key Design Decisions

- Tiles fill the full viewport height (no scrolling) — the grid uses `grid-template-rows` with `1fr` to distribute space
- Status is conveyed through tile color/glow rather than separate badge components
- The "complete" state requires a date — notes/images alone mark a tile as "idea" (planned)
- The progress bar only counts tiles with dates set
