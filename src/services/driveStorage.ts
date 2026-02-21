import { Tile, createInitialTiles } from '@/models/tile'
import * as driveApi from './driveApi'

const APP_FOLDER_NAME = import.meta.env.VITE_APP_FOLDER_NAME || 'TileBoard'
const TILES_FILE_NAME = 'tiles.json'

class DriveStorage {
  private folderId: string | null = null
  private tilesFileId: string | null = null

  async initialize(): Promise<void> {
    // Find or create app folder
    const folder = await driveApi.findOrCreateFolder(APP_FOLDER_NAME)
    this.folderId = folder.id

    // Find or create tiles.json
    const tilesFile = await driveApi.findFileByName(TILES_FILE_NAME, this.folderId)
    if (tilesFile) {
      this.tilesFileId = tilesFile.id
    }
  }

  async loadTiles(): Promise<Tile[]> {
    if (!this.folderId) {
      await this.initialize()
    }

    // If no tiles file exists, create one with initial data
    if (!this.tilesFileId) {
      const initialTiles = createInitialTiles()
      await this.saveTiles(initialTiles)
      return initialTiles
    }

    try {
      const content = await driveApi.getFileContent(this.tilesFileId!)
      const tiles = JSON.parse(content) as Tile[]
      
      // Ensure all A-Z tiles exist
      const existingIds = new Set(tiles.map(t => t.id))
      const missingIds = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
        .filter(id => !existingIds.has(id))
      
      if (missingIds.length > 0) {
        const newTiles = [...tiles, ...missingIds.map(id => ({
          id,
          note: '',
          dateEnabled: false,
          date: null,
          thumbFileId: null,
          updatedAt: new Date().toISOString(),
        }))]
        await this.saveTiles(newTiles)
        return newTiles
      }
      
      return tiles
    } catch (error) {
      console.error('Failed to load tiles:', error)
      // If loading fails, return initial tiles and try to save them
      const initialTiles = createInitialTiles()
      await this.saveTiles(initialTiles)
      return initialTiles
    }
  }

  async saveTiles(tiles: Tile[]): Promise<void> {
    if (!this.folderId) {
      await this.initialize()
    }

    const content = JSON.stringify(tiles, null, 2)

    if (this.tilesFileId) {
      await driveApi.updateFile(this.tilesFileId, content)
    } else {
      const file = await driveApi.createFile(TILES_FILE_NAME, content, this.folderId!)
      this.tilesFileId = file.id
    }
  }

  async uploadThumbnail(blob: Blob, fileName: string): Promise<string> {
    if (!this.folderId) {
      await this.initialize()
    }

    const file = await driveApi.uploadBlob(fileName, blob, this.folderId!)
    return file.id
  }

  async deleteThumbnail(fileId: string): Promise<void> {
    try {
      await driveApi.deleteFile(fileId)
    } catch (error) {
      console.warn('Failed to delete thumbnail:', error)
      // Don't throw - orphaned files are acceptable in prototype
    }
  }

  getThumbnailUrl(fileId: string): string {
    return driveApi.getFileDownloadUrl(fileId)
  }
}

export const driveStorage = new DriveStorage()
