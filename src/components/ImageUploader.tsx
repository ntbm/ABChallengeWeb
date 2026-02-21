import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Tile } from '@/models/tile'
import { createThumbnail, validateImageFile, isHeicFile } from '@/utils/imageThumb'
import { uploadThumbnail, removeThumbnail } from '@/services/thumbStorage'
import { useThumbCache } from '@/services/thumbCache'

interface ImageUploaderProps {
  tile: Tile
}

export function ImageUploader({ tile }: ImageUploaderProps) {
  const { t } = useTranslation()
  const { getThumbUrl } = useThumbCache()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const thumbUrl = tile.thumbFileId ? getThumbUrl(tile.thumbFileId) : null
  const displayUrl = previewUrl || thumbUrl

  const processFile = useCallback(async (file: File) => {
    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size)
    
    // Check for HEIC files early with better error message
    if (isHeicFile(file)) {
      setError(
        'HEIC/HEIF images are not supported by web browsers. ' +
        'Please export as JPEG from Photos app: Select photo > File > Export > Export Unmodified Original'
      )
      return
    }

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
      console.error('Upload error:', err)
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

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }, [processFile])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set isDragging to false if we're leaving the dropzone (not entering a child)
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      processFile(file)
    }
  }, [processFile])

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

      {/* Image Preview / Dropzone */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative aspect-video rounded-lg overflow-hidden flex items-center justify-center transition-colors ${
          isDragging
            ? 'bg-blue-100 border-2 border-blue-400 border-dashed'
            : displayUrl
            ? 'bg-gray-100'
            : 'bg-gray-100 border-2 border-gray-300 border-dashed hover:border-gray-400'
        }`}
      >
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt={`${tile.id} thumbnail`}
              className="w-full h-full object-contain"
            />
            {/* Drag overlay when image exists */}
            {isDragging && (
              <div className="absolute inset-0 bg-blue-500/80 flex items-center justify-center">
                <div className="text-white text-center">
                  <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="font-medium">{t('tileDetail.dropHere')}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-400 text-center p-6">
            {isDragging ? (
              <div className="text-blue-500">
                <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="font-medium">{t('tileDetail.dropHere')}</p>
              </div>
            ) : (
              <>
                <svg className="h-12 w-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm mb-1">{t('tileDetail.noImage')}</p>
                <p className="text-xs text-gray-400">{t('tileDetail.dragOrClick')}</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
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
