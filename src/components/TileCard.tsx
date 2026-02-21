import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tile } from '@/models/tile'
import { useThumbnail } from '@/services/thumbCache'
import { StatusBadge } from './StatusBadge'

interface TileCardProps {
  tile: Tile
}

export const TileCard = memo(function TileCard({ tile }: TileCardProps) {
  const navigate = useNavigate()
  const { url, loading } = useThumbnail(tile.thumbFileId)
  
  const handleClick = () => {
    navigate(`/tiles/${tile.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="card aspect-square flex flex-col items-center justify-center p-4 hover:shadow-md transition-shadow relative overflow-hidden"
      aria-label={`Tile ${tile.id}`}
    >
      {/* Thumbnail or Letter */}
      {url ? (
        <img
          src={url}
          alt={`${tile.id} thumbnail`}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
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
        </div>
      ) : (
        <span className="text-5xl font-bold text-gray-300">{tile.id}</span>
      )}
      
      {/* Status Badges */}
      <div className="absolute top-2 right-2 flex gap-1">
        {tile.dateEnabled && tile.date && (
          <StatusBadge type="date" active={true} />
        )}
        {tile.note && tile.note.trim().length > 0 && (
          <StatusBadge type="note" active={true} />
        )}
      </div>
      
      {/* Overlay for readability if image exists */}
      {url && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      )}
      
      {/* Letter overlay when image exists */}
      {url && (
        <span className="absolute bottom-2 left-2 text-2xl font-bold text-white drop-shadow-lg">
          {tile.id}
        </span>
      )}
    </button>
  )
})
