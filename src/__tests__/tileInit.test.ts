import { describe, it, expect } from 'vitest'
import { TILE_IDS, createEmptyTile, createInitialTiles, updateTile } from '@/models/tile'

describe('Tile Initialization', () => {
  it('should have exactly 26 tile IDs from A to Z', () => {
    expect(TILE_IDS).toHaveLength(26)
    expect(TILE_IDS[0]).toBe('A')
    expect(TILE_IDS[25]).toBe('Z')
    expect(TILE_IDS).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])
  })

  it('should create empty tile with correct structure', () => {
    const tile = createEmptyTile('A')
    
    expect(tile.id).toBe('A')
    expect(tile.note).toBe('')
    expect(tile.dateEnabled).toBe(false)
    expect(tile.date).toBeNull()
    expect(tile.thumbFileId).toBeNull()
    expect(tile.updatedAt).toBeDefined()
  })

  it('should create initial tiles A-Z', () => {
    const tiles = createInitialTiles()
    
    expect(tiles).toHaveLength(26)
    
    tiles.forEach((tile, index) => {
      expect(tile.id).toBe(TILE_IDS[index])
      expect(tile.note).toBe('')
      expect(tile.dateEnabled).toBe(false)
    })
  })
})

describe('Tile Updates', () => {
  it('should update specific tile while preserving others', () => {
    const tiles = createInitialTiles()
    const updated = updateTile(tiles, { id: 'A', note: 'Test note' })
    
    expect(updated).toHaveLength(26)
    expect(updated[0].note).toBe('Test note')
    expect(updated[1].note).toBe('') // B unchanged
    expect(updated[0].updatedAt).not.toBe(tiles[0].updatedAt)
  })

  it('should not mutate original array', () => {
    const tiles = createInitialTiles()
    const updated = updateTile(tiles, { id: 'A', note: 'Test' })
    
    expect(tiles[0].note).toBe('')
    expect(updated[0].note).toBe('Test')
    expect(tiles).not.toBe(updated)
  })
})
