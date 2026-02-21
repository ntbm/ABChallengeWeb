# TileBoard A–Z — Frontend-only Prototyp (Google Drive Storage)  
**Prompt + Umsetzungsplan (Tailwind, i18n de/en, Vercel Deploy Ready)**

> **Copy-Paste für einen Coding Agent** (Cursor/Copilot/Devin/etc.).  
> Anforderungen sind bewusst eng formuliert, damit möglichst wenig geraten wird.

---

## 1) Projektziel

Baue einen **Frontend-only** Web-Prototyp (SPA), **mobile-first**, der ein **Tile-Grid A–Z** zeigt. Pro Tile kann ein Nutzer:

- eine **Notiz** speichern,
- optional ein **Datum aktivieren** und setzen,
- ein **Bild als Thumbnail** hinterlegen (Upload → clientseitige Thumbnail-Erzeugung → Speicherung in Google Drive).

**Alle Daten werden ausschließlich im Google Drive des Nutzers** gespeichert (Google OAuth + Drive API).  
**Kein eigener Server. Kein Backend.**  
**Vercel Deploy Ready.**  
**i18n vollständig in `de` und `en`.**  
**Genau 3 Views**: Login, Tile-Übersicht, Detail.

---

## 2) Scope & UX (genau 3 Views)

### View 1 — Login (`/login`)
- Button: **„Mit Google anmelden“**
- Kurztext: was gespeichert wird (Tiles JSON + Thumbnails)
- Zustände: loading / error (OAuth/Drive), logged-in redirect zu `/tiles`

### View 2 — Tile-Übersicht (`/tiles`)
- Grid mit **26 Tiles**: `A` bis `Z` (fix, nicht konfigurierbar)
- Jede Kachel zeigt:
  - Label (z. B. **A**)
  - **Thumbnail**, falls vorhanden
  - optional Status-Indikator:
    - Datum aktiv + gesetzt
    - Notiz vorhanden
- Tap auf Tile → Detail View `/tiles/:id`

### View 3 — Detail (`/tiles/:id`)
Sektion **Details**
- Toggle: „Datum setzen“ (an/aus)
- Wenn an: `input[type=date]` + formatierte Anzeige
- Textarea: „Notiz“

Sektion **Bild**
- Thumbnail Preview
- Buttons: „Bild wählen“ und „Bild entfernen“

**Speichern**
- Auto-Save (debounced) + sichtbarer Status **„Speichert…“ / „Gespeichert“**
- Optional zusätzlicher Speichern-Button ist okay, aber nicht nötig.

---

## 3) Datenmodell

Ein zentrales JSON-Dokument im Drive: `tiles.json` (im App-Ordner).  
Pro Tile:

```json
{
  "id": "A",
  "note": "…",
  "dateEnabled": true,
  "date": "2026-02-17",
  "thumbFileId": "drive-file-id-or-null",
  "updatedAt": "2026-02-17T10:00:00.000Z"
}
```

**Initialzustand:** A–Z existieren immer (leere Werte), falls `tiles.json` fehlt, wird es erstellt.

---

## 4) Google Drive als Storage (Frontend-only)

### Auth
- Verwende **Google Identity Services (GIS)** clientseitig.
- Keine Secrets im Frontend (nur **Client ID**).
- Token Handling:
  - in Memory + optional `sessionStorage`
  - Token abgelaufen → sauberer Re-Login Flow

### Drive Struktur
- App-Ordner: `TileBoard/`
  - `tiles.json`
  - optional Unterordner: `thumbs/`

### Storage Flow
Nach Login:
1. App-Ordner **finden oder erstellen**
2. `tiles.json` **finden oder initial erstellen**
3. Tiles laden → App State befüllen

Speichern:
- Änderungen im State sofort, Persistenz in Drive **debounced** (z. B. 600–1000ms)
- Konfliktstrategie Prototyp: **last write wins** via `updatedAt` (simplifiziert)

**Scopes**
- So minimal wie möglich (bevorzugt `drive.file`).  
- Dokumentiere im README exakt, warum welcher Scope nötig ist.

---

## 5) Thumbnail Handling (Pflicht)

**Nur Thumbnail speichern** (kein Original erforderlich).

### Pipeline
1. Nutzer wählt Bild
2. Browser erzeugt Thumbnail (Canvas):
   - max Kantenlänge z. B. **512px** (oder 640px, aber fix wählen)
   - Format: **WebP** wenn möglich, sonst JPEG
   - Qualität ~ **0.75**
3. Upload Thumbnail in Drive → `thumbFileId` in `tiles.json` speichern

### Entfernen
- `thumbFileId = null` in `tiles.json`
- Optional: Drive-Datei löschen (nice-to-have). Wenn nicht gelöscht: im README dokumentieren („orphaned thumbs möglich“).

### Laden
- Thumbnail laden über:
  - `GET https://www.googleapis.com/drive/v3/files/{fileId}?alt=media`
- Caching:
  - Blob URL Cache im Memory (Map), um unnötige Re-Fetches zu vermeiden
- Tile Grid: **lazy loading** (z. B. `loading="lazy"`)

---

## 6) i18n (de/en) — Pflicht

- `i18next` + `react-i18next`
- Browser-Sprache als Default (`de` oder `en`), fallback `en`
- Manueller Switch (Header)
- **Alle** Texte via i18n Keys (keine Hardcodes)
- Datum lokalisiert formatieren:
  - de: `17. Feb. 2026`
  - en: `Feb 17, 2026`

---

## 7) UI/Design Anforderungen (Tailwind)

- **TailwindCSS** (konsequent)
- Mobile-first, responsive:
  - Grid z. B. 3 Spalten klein, 4–6 bei größeren Screens
- Tap targets ≥ 44px
- Klare Zustände:
  - Loading
  - Syncing / Saved
  - Error Banner

---

## 8) Offline / Robustheit (Prototyp-Level)

- Wenn Drive nicht erreichbar:
  - App bleibt bedienbar
  - Änderungen in `localStorage` puffern (eine Snapshot-Queue reicht)
  - Bei Reconnect best-effort Sync
- Speichere „pending changes“ + zeige Banner „Offline / Ausstehende Synchronisation“.

---

## 9) Tech Stack (fix)

- React + TypeScript + Vite
- React Router:
  - `/login`
  - `/tiles`
  - `/tiles/:id`
- State: **Zustand** *oder* Context+Hooks (du darfst wählen, aber bleib konsistent)
- i18n: i18next + react-i18next
- Styling: Tailwind
- Qualität:
  - ESLint + Prettier
  - Minimaltests (Vitest empfohlen):
    - Tile Init A–Z
    - Serialize/Deserialize
    - Thumbnail resize helper
    - debounce helper

---

## 10) Vercel Deploy Ready (Pflicht)

### SPA Rewrite
Erstelle `vercel.json` im Projekt-Root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Environment Variables
`.env.example`:

```bash
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_APP_FOLDER_NAME=TileBoard
VITE_THUMB_MAX_SIZE=512
```

In Vercel: Project → Settings → Environment Variables:
- `VITE_GOOGLE_CLIENT_ID`
- optional die anderen

### Google OAuth Setup (Doku im README)
In Google Cloud Console (OAuth Client „Web application“):

**Authorized JavaScript origins**
- `http://localhost:5173`
- `https://<your-vercel-domain>.vercel.app`
- ggf. Custom Domain

**Authorized redirect URIs**
- Je nach GIS-Flow ggf. nicht klassisch nötig; falls nötig:
  - `https://<domain>/login`
  - `http://localhost:5173/login`

> Im README exakt erklären, welcher Flow genutzt wird und welche Einträge zwingend sind.

---

## 11) Deliverables

- Repo lauffähig lokal + auf Vercel
- End-to-End:
  - Login → Tiles laden → Tile bearbeiten → Save → Reload → persistiert
  - Thumbnail Upload/Remove → Grid zeigt Thumbnail
- i18n de/en vollständig + Switch
- README:
  - Setup lokal
  - Google OAuth Setup
  - Drive Datei-/Ordnerstruktur
  - Scopes & Begründung
  - Vercel Deploy

---

## 12) Akzeptanzkriterien (DoD)

- A–Z Tiles sichtbar, klickbar, responsive
- Notiz + Datum (toggle + picker) werden gespeichert und nach Reload wieder geladen
- Thumbnail Upload/Remove funktioniert; Thumbnail erscheint im Grid
- de/en vollständig, Umschalter funktioniert
- Direktaufruf von `/tiles/A` funktioniert auf Vercel (kein 404)
- Keine Backend-Komponente

---

# 2) Umsetzungsplan (Milestones + konkrete Files)

## Milestone 0 — Projekt-Skeleton (Vercel-ready)
**Tasks**
- Vite React TS Setup
- Tailwind Setup
- React Router Setup
- `vercel.json` SPA rewrite
- `.env.example`

**Files**
- `vercel.json`
- `.env.example`
- `src/main.tsx`, `src/App.tsx`

---

## Milestone 1 — i18n komplett (de/en)
**Tasks**
- `i18next` init + language detection + fallback
- Language Toggle im Header
- Date formatting helper

**Files**
- `src/i18n/index.ts`
- `src/i18n/locales/de.json`
- `src/i18n/locales/en.json`
- `src/components/LanguageToggle.tsx`
- `src/utils/date.ts`

---

## Milestone 2 — Google Auth (GIS) + Token Handling
**Tasks**
- Implement `signIn`, `signOut`
- Token in Store
- Re-Login bei Fehler/Expiry

**Files**
- `src/services/googleAuth.ts`
- `src/state/authStore.ts`
- `src/pages/LoginPage.tsx`

---

## Milestone 3 — Drive Storage (Ordner + tiles.json)
**Tasks**
- Drive REST wrapper
- App folder find/create
- tiles.json find/create
- load/save tiles (debounced)
- Init A–Z

**Files**
- `src/services/driveApi.ts`
- `src/services/driveStorage.ts`
- `src/models/tile.ts`
- `src/state/tilesStore.ts`
- `src/utils/debounce.ts`

---

## Milestone 4 — Tile-Übersicht UI (A–Z Grid)
**Tasks**
- Render 26 Tiles A–Z
- Thumbnail display + status badges
- Loading + Error banner

**Files**
- `src/pages/TilesPage.tsx`
- `src/components/TileGrid.tsx`
- `src/components/TileCard.tsx`
- `src/components/StatusBadge.tsx`
- `src/components/AppHeader.tsx`

---

## Milestone 5 — Detail View (Datum/Notiz/Autosave)
**Tasks**
- Toggle, date input, textarea
- Autosave indicator

**Files**
- `src/pages/TileDetailPage.tsx`
- `src/components/TileDetailForm.tsx`
- `src/components/SaveIndicator.tsx`

---

## Milestone 6 — Thumbnail Pipeline + Drive Upload
**Tasks**
- Canvas resize + encode WebP/JPEG
- Upload to Drive, store `thumbFileId`
- Remove thumbnail (optional Drive delete)
- Blob URL cache

**Files**
- `src/utils/imageThumb.ts`
- `src/services/thumbStorage.ts`
- `src/services/thumbCache.ts`
- Update: `TileCard.tsx`

---

## Milestone 7 — Offline Puffer (localStorage)
**Tasks**
- Save failure → store snapshot to localStorage
- On startup/reconnect → attempt sync
- Banner „Offline / Pending“

**Files**
- `src/services/offlineQueue.ts`
- Update: `tilesStore.ts`

---

## Milestone 8 — Tests + Polishing
**Tasks**
- Minimaltests (Vitest)
- a11y labels, focus states
- Perf: memoize tile cards, avoid grid rerender storms

**Files**
- `src/__tests__/tileInit.test.ts`
- `src/__tests__/thumb.test.ts`
- `vitest.config.ts` (falls nötig)

---

## 3) Hinweise für Implementation (Pragmatik)

- Für Date Picker: native `input[type=date]` ist für Mobile am stabilsten.
- Für Drive Upload: nutze multipart upload (Metadaten + Blob).  
- Für Thumbnail Fetch: `alt=media` und Blob URL caching.
- Für Konflikte: Prototyp darf `last write wins` machen, aber speichere `updatedAt` sauber.

---
