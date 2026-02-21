import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTilesStore } from '@/state/tilesStore'
import { AppHeader } from '@/components/AppHeader'
import { OfflineBanner } from '@/components/OfflineBanner'
import { TileDetailForm } from '@/components/TileDetailForm'
import { ImageUploader } from '@/components/ImageUploader'
import { Tile } from '@/models/tile'

export default function TileDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTileById, isInitialized, initialize } = useTilesStore()
  
  const [tile, setTile] = useState<Tile | null>(null)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [isInitialized, initialize])

  useEffect(() => {
    if (id && isInitialized) {
      const foundTile = getTileById(id.toUpperCase())
      if (foundTile) {
        setTile(foundTile)
      } else {
        // Invalid tile ID, redirect to tiles page
        navigate('/tiles')
      }
    }
  }, [id, isInitialized, getTileById, navigate])

  if (!tile) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <OfflineBanner />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">{t('app.loading')}</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <OfflineBanner />
      
      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/tiles')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('app.back')}
          </button>

          {/* Detail Form */}
          <TileDetailForm tile={tile} />
          
          {/* Image Uploader */}
          <div className="mt-6">
            <ImageUploader tile={tile} />
          </div>
        </div>
      </main>
    </div>
  )
}
