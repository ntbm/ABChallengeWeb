import { useTilesStore } from '@/state/tilesStore'
import { TileCard } from './TileCard'

export function TileGrid() {
  const { tiles, isLoading } = useTilesStore()
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {Array.from({ length: 26 }).map((_, i) => (
          <div 
            key={i}
            className="card aspect-square animate-pulse bg-gray-200"
          />
        ))}
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {tiles.map(tile => (
        <TileCard key={tile.id} tile={tile} />
      ))}
    </div>
  )
}
