import { Tile } from '@/models/tile'

const STORAGE_KEY = 'tileboard_pending_changes'

interface PendingSnapshot {
  tiles: Tile[]
  timestamp: string
}

class OfflineQueue {
  enqueue(tiles: Tile[]): void {
    const snapshot: PendingSnapshot = {
      tiles,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  }

  getPending(): Tile[] | null {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    try {
      const snapshot = JSON.parse(stored) as PendingSnapshot
      return snapshot.tiles
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
