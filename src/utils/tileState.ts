export type TileState = 'done' | 'planned' | 'idea' | 'incomplete'

export function getTileState(tile: {
  thumbFileId: string | null
  dateEnabled: boolean
  date: string | null
  note: string
}): TileState {
  if (tile.thumbFileId) return 'done'
  if (tile.dateEnabled && tile.date) return 'planned'
  if (tile.note && tile.note.trim().length > 0) return 'idea'
  return 'incomplete'
}
