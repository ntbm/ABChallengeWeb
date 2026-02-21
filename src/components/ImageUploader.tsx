import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Tile } from '@/models/tile'
import { createThumbnail, validateImageFile } from '@/utils/imageThumb'
import { uploadThumbnail, removeThumbnail } from '@/services/thumbStorage'
import { useThumbCache } from '@/services/thumbCache'

interface ImageUploaderProps {
  tile: Tile
}

export function ImageUploader({ tile }: ImageUploaderProps) {
  const { t } = useTranslation()
  const { getThumbUrl } = useThumbCache()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const thumbUrl = tile.thumbFileId ? getThumbUrl(tile.thumbFileId) : null
  const displayUrl = previewUrl || thumbUrl

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Create thumbnail
      const thumbnailBlob = await createThumbnail(file)
      
      // Show preview immediately
      const objectUrl = URL.createObjectURL(thumbnailBlob)
      setPreviewUrl(objectUrl)
      
      // Upload to Drive
      await uploadThumbnail(tile.id, thumbnailBlob)
      
      // Clear preview after successful upload
      setPreviewUrl(null)
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [tile.id])

  const handleRemove = useCallback(async () => {
    setIsUploading(true)
    setError(null)
    
    try {
      await removeThumbnail(tile.id, tile.thumbFileId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed')
    } finally {
      setIsUploading(false)
    }
  }, [tile.id, tile.thumbFileId])

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="card p-4 space-y-4">
      <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">
        {t('tileDetail.imageSection')}
      </h3>

      {/* Image Preview */}
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={`${tile.id} thumbnail`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-gray-400 text-center">
            <svg className="h-16 w-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">{t('tileDetail.noImage')}</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          onClick={handleButtonClick}
          disabled={isUploading}
          className="btn btn-primary flex-1 disabled:opacity-50"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t('app.loading')}
            </span>
          ) : (
            t('tileDetail.selectImage')
          )}
        </button>
        
        {tile.thumbFileId && (
          <button
            onClick={handleRemove}
            disabled={isUploading}
            className="btn btn-danger disabled:opacity-50"
          >
            {t('tileDetail.removeImage')}
          </button>
        )}
      </div>
    </div>
  )
}
