import { useState, useRef, useEffect } from 'react'
import { useTilesStore } from '@/state/tilesStore'
import { DEFAULT_FILLER_TEXT } from '@/models/tile'
import { TileCard } from './TileCard'

function FillerTile() {
  const { fillerText, setFillerText } = useTilesStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const trimmed = editValue.trim()
    setFillerText(trimmed || DEFAULT_FILLER_TEXT)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setIsEditing(false)
  }

  return (
    <div
      className="col-span-2 sm:col-span-4 rounded-[14px] flex items-center justify-center cursor-pointer"
      style={{ border: '1.5px dashed rgba(255,255,255,0.06)' }}
      onClick={() => {
        if (!isEditing) {
          setEditValue(fillerText)
          setIsEditing(true)
        }
      }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          maxLength={30}
          className="bg-transparent text-center outline-none border-none text-white/40 text-[0.5rem] sm:text-[0.65rem] lg:text-xs font-bold tracking-[0.15em] uppercase w-full px-2"
        />
      ) : (
        <span
          className="text-[0.5rem] sm:text-[0.65rem] lg:text-xs font-bold tracking-[0.15em] uppercase"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.4), rgba(96,165,250,0.4), rgba(52,211,153,0.4))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {fillerText}
        </span>
      )}
    </div>
  )
}

export function TileGrid() {
  const { tiles, isLoading } = useTilesStore()

  const gridClass = "grid grid-cols-4 sm:grid-cols-6 grid-rows-7 sm:grid-rows-5 gap-1 sm:gap-1.5 h-full"

  const fillerEl = <FillerTile key="filler" />

  if (isLoading || tiles.length < 26) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-[14px] animate-pulse" style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }} />
        ))}
        <div key="sk-m" className="rounded-[14px] animate-pulse" style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }} />
        {fillerEl}
        <div key="sk-n" className="rounded-[14px] animate-pulse" style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }} />
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`sk2-${i}`} className="rounded-[14px] animate-pulse" style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }} />
        ))}
      </div>
    )
  }

  const before = tiles.slice(0, 12)  // A-L
  const tileM = tiles[12]            // M
  const tileN = tiles[13]            // N
  const after = tiles.slice(14)      // O-Z

  return (
    <div className={gridClass}>
      {before.map((tile, i) => (
        <TileCard key={tile.id} tile={tile} index={i} />
      ))}
      <TileCard key={tileM.id} tile={tileM} index={12} />
      {fillerEl}
      <TileCard key={tileN.id} tile={tileN} index={13} />
      {after.map((tile, i) => (
        <TileCard key={tile.id} tile={tile} index={14 + i} />
      ))}
    </div>
  )
}
