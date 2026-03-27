import { Tile, DEFAULT_FILLER_TEXT } from '@/models/tile'

const STORAGE_KEY = 'abchallenge_pending_changes'

interface PendingSnapshot {
  tiles: Tile[]
  fillerText: string
  timestamp: string
}

class OfflineQueue {
  enqueue(tiles: Tile[], fillerText: string): void {
    const snapshot: PendingSnapshot = {
      tiles,
      fillerText,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  }

  getPending(): { tiles: Tile[]; fillerText: string } | null {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    try {
      const snapshot = JSON.parse(stored) as PendingSnapshot
      return {
        tiles: snapshot.tiles,
        fillerText: snapshot.fillerText ?? DEFAULT_FILLER_TEXT,
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
