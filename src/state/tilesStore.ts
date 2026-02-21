import { create } from 'zustand'
import { Tile, updateTile } from '@/models/tile'
import { driveStorage } from '@/services/driveStorage'
import { debounce } from '@/utils/debounce'
import { offlineQueue } from '@/services/offlineQueue'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface TilesState {
  tiles: Tile[]
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
  saveTiles: () => Promise<void>
  getTileById: (id: string) => Tile | undefined
  clearError: () => void
}

const DEBOUNCE_DELAY = 800

export const useTilesStore = create<TilesState>((set, get) => {
  // Debounced save function
  const debouncedSave = debounce(async () => {
    const { tiles } = get()
    
    set({ saveStatus: 'saving' })
    
    try {
      await driveStorage.saveTiles(tiles)
      set({ saveStatus: 'saved', offline: false, pendingChanges: false })
      offlineQueue.clear()
      
      // Reset to idle after showing "saved" for a moment
      setTimeout(() => {
        set(state => ({ saveStatus: state.saveStatus === 'saved' ? 'idle' : state.saveStatus }))
      }, 2000)
    } catch (error) {
      console.error('Failed to save tiles:', error)
      
      // Store for offline sync
      offlineQueue.enqueue(tiles)
      
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
        const tiles = await driveStorage.loadTiles()
        
        // Check for pending offline changes
        const pending = offlineQueue.getPending()
        if (pending) {
          // If we have pending changes, they might be newer than what's in Drive
          // In a real app, we'd do proper conflict resolution
          // For prototype, we keep Drive version but show pending state
          set({ 
            tiles, 
            isLoading: false, 
            isInitialized: true,
            pendingChanges: true 
          })
        } else {
          set({ tiles, isLoading: false, isInitialized: true })
        }
      } catch (error) {
        console.error('Failed to initialize tiles:', error)
        
        // Try to load from offline queue
        const pending = offlineQueue.getPending()
        if (pending) {
          set({ 
            tiles: pending, 
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
        const tiles = await driveStorage.loadTiles()
        set({ tiles, isLoading: false })
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

    saveTiles: async () => {
      const { tiles } = get()
      
      set({ saveStatus: 'saving' })
      
      try {
        await driveStorage.saveTiles(tiles)
        set({ saveStatus: 'saved', offline: false, pendingChanges: false })
        offlineQueue.clear()
      } catch (error) {
        offlineQueue.enqueue(tiles)
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
