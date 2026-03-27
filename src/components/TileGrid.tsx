import { useTilesStore } from '@/state/tilesStore'
import { TileCard } from './TileCard'

export function TileGrid() {
  const { tiles, isLoading } = useTilesStore()

  // 4 cols (mobile): 7 rows × 4 = 28 cells. 26 tiles + filler(span 2) in row 4 = 28 ✓
  //   Rows: [ABCD] [EFGH] [IJKL] [M ~~filler~~ N] [OPQR] [STUV] [WXYZ]
  //   Split: 12 tiles, filler, 2 tiles(M,N) around filler, 14 tiles after
  //   Actually: first 12 (A-L), then M, filler(2), N, then 12 (O-Z)
  //
  // 6 cols (sm+): 5 rows × 6 = 30 cells. 26 tiles + filler(span 4) in row 3 = 30 ✓
  //   Rows: [ABCDEF] [GHIJKL] [M ~~filler~~ N] [OPQRST] [UVWXYZ]
  //   Split: first 12 (A-L), then M, filler(4), N, then 12 (O-Z)
  //
  // Both layouts: 12 tiles, M, filler, N, 12 tiles — same structure!

  const gridClass = "grid grid-cols-4 sm:grid-cols-6 grid-rows-7 sm:grid-rows-5 gap-1 sm:gap-1.5 h-full"

  const fillerEl = (
    <div
      key="filler"
      className="col-span-2 sm:col-span-4 rounded-[14px] flex items-center justify-center"
      style={{ border: '1.5px dashed rgba(255,255,255,0.06)' }}
    >
      <span
        className="text-[0.5rem] sm:text-[0.65rem] lg:text-xs font-bold tracking-[0.15em] uppercase"
        style={{
          background: 'linear-gradient(135deg, rgba(167,139,250,0.4), rgba(96,165,250,0.4), rgba(52,211,153,0.4))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        ABC Challenge
      </span>
    </div>
  )

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
