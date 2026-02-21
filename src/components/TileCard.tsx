import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tile } from '@/models/tile'
import { useThumbCache } from '@/services/thumbCache'
import { StatusBadge } from './StatusBadge'

interface TileCardProps {
  tile: Tile
}

export const TileCard = memo(function TileCard({ tile }: TileCardProps) {
  const navigate = useNavigate()
  const { getThumbUrl } = useThumbCache()
  
  const thumbUrl = tile.thumbFileId ? getThumbUrl(tile.thumbFileId) : null
  
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
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={`${tile.id} thumbnail`}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
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
      {thumbUrl && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      )}
      
      {/* Letter overlay when image exists */}
      {thumbUrl && (
        <span className="absolute bottom-2 left-2 text-2xl font-bold text-white drop-shadow-lg">
          {tile.id}
        </span>
      )}
    </button>
  )
})
