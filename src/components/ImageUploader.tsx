import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Tile } from '@/models/tile'
import { createThumbnail, validateImageFile, isHeicFile } from '@/utils/imageThumb'
import { uploadThumbnail, removeThumbnail } from '@/services/thumbStorage'
import { useThumbnail } from '@/services/thumbCache'

interface ImageUploaderProps {
  tile: Tile
}

export function ImageUploader({ tile }: ImageUploaderProps) {
  const { t } = useTranslation()
  const { url, loading: thumbLoading } = useThumbnail(tile.thumbFileId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const displayUrl = previewUrl || url
  const hasImage = !!tile.thumbFileId || !!previewUrl

  const processFile = useCallback(async (file: File) => {
    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size)

    if (isHeicFile(file)) {
      setError(
        'HEIC/HEIF images are not supported by web browsers. ' +
        'Please export as JPEG from Photos app: Select photo > File > Export > Export Unmodified Original'
      )
      return
    }

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const thumbnailBlob = await createThumbnail(file)
      const objectUrl = URL.createObjectURL(thumbnailBlob)
      setPreviewUrl(objectUrl)
      await uploadThumbnail(tile.id, thumbnailBlob)
      setPreviewUrl(null)
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
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
      processFile(files[0])
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
    <div className={`card p-4 space-y-4 ${hasImage ? 'card-accent-done' : ''}`}>
      <h3 className="font-semibold text-white/90">
        {t('tileDetail.imageSection')}
      </h3>

      {/* Image Preview / Dropzone */}
      {displayUrl ? (
        /* When image exists: show preview with aspect ratio */
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative aspect-video rounded-lg overflow-hidden bg-white/5"
        >
          <img
            src={displayUrl}
            alt={`${tile.id} thumbnail`}
            className="w-full h-full object-contain"
          />
          {isDragging && (
            <div className="absolute inset-0 bg-blue-500/80 flex items-center justify-center">
              <div className="text-white text-center">
                <svg className="h-10 w-10 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium">{t('tileDetail.dropHere')}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* When no image: compact inline row instead of large dropzone */
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
            isDragging
              ? 'bg-blue-500/10 border border-blue-400/50 border-dashed'
              : 'bg-white/5 border border-white/10 hover:border-white/20'
          }`}
        >
          {thumbLoading ? (
            <svg className="animate-spin h-5 w-5 text-white/40" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          <span className="text-sm text-white/40">
            {isDragging ? t('tileDetail.dropHere') : t('tileDetail.dragOrClick')}
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {/* Action Buttons — only shown when image exists */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {(tile.thumbFileId || isUploading) && (
        <div className="flex gap-3">
          <button
            onClick={handleButtonClick}
            disabled={isUploading}
            className="btn btn-secondary flex-1 disabled:opacity-50"
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
              className="btn btn-secondary text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              {t('tileDetail.removeImage')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
