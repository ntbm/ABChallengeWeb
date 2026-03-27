import { create } from 'zustand'
import { Tile, DEFAULT_FILLER_TEXT, updateTile } from '@/models/tile'
import { driveStorage } from '@/services/driveStorage'
import { debounce } from '@/utils/debounce'
import { offlineQueue } from '@/services/offlineQueue'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface TilesState {
  tiles: Tile[]
  fillerText: string
  isLoading: boolean
  isInitialized: boolean
  saveStatus: SaveStatus
  offline: boolean
  pendingChanges: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  loadTiles: () => Promise<void>
  updateTile: (tileUpdate: Partial<Tile> & { id: string }) => void
  setFillerText: (text: string) => void
  saveTiles: () => Promise<void>
  getTileById: (id: string) => Tile | undefined
  clearError: () => void
}

const DEBOUNCE_DELAY = 800

export const useTilesStore = create<TilesState>((set, get) => {
  // Debounced save function
  const debouncedSave = debounce(async () => {
    const { tiles, fillerText } = get()

    set({ saveStatus: 'saving' })

    try {
      await driveStorage.saveData({ version: 2, tiles, fillerText })
      set({ saveStatus: 'saved', offline: false, pendingChanges: false })
      offlineQueue.clear()

      // Reset to idle after showing "saved" for a moment
      setTimeout(() => {
        set(state => ({ saveStatus: state.saveStatus === 'saved' ? 'idle' : state.saveStatus }))
      }, 2000)
    } catch (error) {
      console.error('Failed to save tiles:', error)

      // Store for offline sync
      offlineQueue.enqueue(tiles, fillerText)

      set({
        saveStatus: 'error',
        offline: true,
        pendingChanges: true,
        error: error instanceof Error ? error.message : 'Failed to save'
      })
    }
  }, DEBOUNCE_DELAY)

  return {
    tiles: [],
    fillerText: DEFAULT_FILLER_TEXT,
    isLoading: false,
    isInitialized: false,
    saveStatus: 'idle',
    offline: false,
    pendingChanges: false,
    error: null,

    initialize: async () => {
      set({ isLoading: true, error: null })

      try {
        await driveStorage.initialize()
        const data = await driveStorage.loadData()

        // Check for pending offline changes
        const pending = offlineQueue.getPending()
        if (pending) {
          set({
            tiles: data.tiles,
            fillerText: data.fillerText,
            isLoading: false,
            isInitialized: true,
            pendingChanges: true
          })
        } else {
          set({ tiles: data.tiles, fillerText: data.fillerText, isLoading: false, isInitialized: true })
        }
      } catch (error) {
        console.error('Failed to initialize tiles:', error)

        // Try to load from offline queue
        const pending = offlineQueue.getPending()
        if (pending) {
          set({
            tiles: pending.tiles,
            fillerText: pending.fillerText,
            isLoading: false,
            isInitialized: true,
            offline: true,
            pendingChanges: true
          })
        } else {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load tiles'
          })
        }
      }
    },

    loadTiles: async () => {
      set({ isLoading: true, error: null })

      try {
        const data = await driveStorage.loadData()
        set({ tiles: data.tiles, fillerText: data.fillerText, isLoading: false })
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load tiles'
        })
      }
    },

    updateTile: (tileUpdate) => {
      const { tiles } = get()
      const updatedTiles = updateTile(tiles, tileUpdate)

      set({ tiles: updatedTiles, saveStatus: 'saving' })

      // Trigger debounced save
      debouncedSave()
    },

    setFillerText: (text: string) => {
      set({ fillerText: text, saveStatus: 'saving' })
      debouncedSave()
    },

    saveTiles: async () => {
      const { tiles, fillerText } = get()

      set({ saveStatus: 'saving' })

      try {
        await driveStorage.saveData({ version: 2, tiles, fillerText })
        set({ saveStatus: 'saved', offline: false, pendingChanges: false })
        offlineQueue.clear()
      } catch (error) {
        offlineQueue.enqueue(tiles, fillerText)
        set({
          saveStatus: 'error',
          offline: true,
          pendingChanges: true,
          error: error instanceof Error ? error.message : 'Failed to save'
        })
      }
    },

    getTileById: (id) => {
      return get().tiles.find(tile => tile.id === id)
    },

    clearError: () => set({ error: null }),
  }
})
