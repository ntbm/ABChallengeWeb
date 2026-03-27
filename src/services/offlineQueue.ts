import { Tile, DEFAULT_FILLER_TEXT } from '@/models/tile'
import { DEFAULT_THEME } from '@/models/theme'

const STORAGE_KEY = 'abchallenge_pending_changes'

interface PendingSnapshot {
  tiles: Tile[]
  fillerText: string
  theme: string
  timestamp: string
}

class OfflineQueue {
  enqueue(tiles: Tile[], fillerText: string, theme: string): void {
    const snapshot: PendingSnapshot = {
      tiles,
      fillerText,
      theme,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  }

  getPending(): { tiles: Tile[]; fillerText: string; theme: string } | null {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    try {
      const snapshot = JSON.parse(stored) as PendingSnapshot
      return {
        tiles: snapshot.tiles,
        fillerText: snapshot.fillerText ?? DEFAULT_FILLER_TEXT,
        theme: snapshot.theme ?? DEFAULT_THEME,
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  hasPending(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null
  }
}

export const offlineQueue = new OfflineQueue()
