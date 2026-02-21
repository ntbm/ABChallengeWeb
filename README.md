# TileBoard A–Z

A frontend-only SPA for managing A-Z tiles with notes, dates, and thumbnails. All data is stored in the user's Google Drive.

## Features

- **26 Tiles (A-Z)**: Fixed grid layout, mobile-first responsive design
- **Notes & Dates**: Each tile can have a note and optional date
- **Image Thumbnails**: Upload images that are automatically resized to thumbnails (512px max)
- **Google Drive Storage**: All data stored in user's own Google Drive
- **i18n**: Full German and English support
- **Offline Support**: Local storage backup when Drive is unavailable
- **Auto-save**: Debounced saves with visual feedback

## Tech Stack

- React + TypeScript + Vite
- React Router
- Zustand (state management)
- TailwindCSS
- i18next (internationalization)
- Google Identity Services (OAuth)
- Google Drive API

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Drive API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add Authorized JavaScript origins:
   - `http://localhost:5173` (for local development)
   - `https://your-vercel-domain.vercel.app` (for production)
7. Copy the **Client ID**

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your Google Client ID:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
VITE_APP_FOLDER_NAME=TileBoard
VITE_THUMB_MAX_SIZE=512
```

### 4. Run locally

```bash
npm run dev
```

## Google Drive Structure

The app creates the following structure in your Google Drive:

```
TileBoard/                    # App folder
├── tiles.json               # Main data file (all tiles data)
└── thumbs/                  # Thumbnail images (optional subfolder)
    ├── thumb_A_123456.webp
    ├── thumb_B_789012.webp
    └── ...
```

## Required OAuth Scopes

| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/drive.file` | Create and manage files created by this app only. Cannot access other Drive files. |

The `drive.file` scope is the most restrictive and only allows the app to access files it has created, providing maximum security for users.

## Data Model

Each tile in `tiles.json`:

```json
{
  "id": "A",
  "note": "User note text...",
  "dateEnabled": true,
  "date": "2026-02-21",
  "thumbFileId": "google-drive-file-id-or-null",
  "updatedAt": "2026-02-21T10:00:00.000Z"
}
```

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variable:
   - `VITE_GOOGLE_CLIENT_ID` = your Google Client ID
4. Deploy

### 3. Update Google OAuth

Add your Vercel domain to the authorized origins in Google Cloud Console:
- `https://your-vercel-domain.vercel.app`

## Offline Behavior

When Google Drive is unavailable:
1. Changes are stored in localStorage
2. A banner shows "Offline - Changes stored locally"
3. On reconnection, the app attempts to sync pending changes
4. Conflict resolution: last-write-wins (simplified for prototype)

## Notes on Thumbnails

- Original images are **not** stored - only thumbnails (max 512px)
- Format: WebP (preferred) or JPEG fallback
- Quality: 75%
- Orphaned thumbnails may remain in Drive if tiles are deleted (known limitation)

## Development

```bash
# Run dev server
npm run dev

# Run tests
npm run test

# Lint
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Google Sign-in |
| `/tiles` | Grid overview of all tiles |
| `/tiles/:id` | Detail view for specific tile (A-Z) |

## License

MIT
