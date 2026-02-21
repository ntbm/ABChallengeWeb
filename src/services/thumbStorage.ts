import { driveStorage } from './driveStorage'
import { useTilesStore } from '@/state/tilesStore'

export async function uploadThumbnail(
  tileId: string, 
  blob: Blob
): Promise<string> {
  const fileName = `thumb_${tileId}_${Date.now()}.webp`
  const fileId = await driveStorage.uploadThumbnail(blob, fileName)
  
  // Update tile with new thumbnail
  const { updateTile } = useTilesStore.getState()
  updateTile({ id: tileId, thumbFileId: fileId })
  
  return fileId
}

export async function removeThumbnail(tileId: string, thumbFileId: string | null): Promise<void> {
  if (thumbFileId) {
    try {
      await driveStorage.deleteThumbnail(thumbFileId)
    } catch (error) {
      console.warn('Failed to delete thumbnail file:', error)
      // Continue even if delete fails - orphaned files are acceptable in prototype
    }
  }
  
  // Update tile to remove thumbnail reference
  const { updateTile } = useTilesStore.getState()
  updateTile({ id: tileId, thumbFileId: null })
}
