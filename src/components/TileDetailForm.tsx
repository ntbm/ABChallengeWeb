import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Tile } from '@/models/tile'
import { useTilesStore } from '@/state/tilesStore'
import { formatDate, formatDateISO } from '@/utils/date'

interface TileDetailFormProps {
  tile: Tile
}

export function TileDetailForm({ tile }: TileDetailFormProps) {
  const { t } = useTranslation()
  const { updateTile } = useTilesStore()

  const [note, setNote] = useState(tile.note)
  const [dateEnabled, setDateEnabled] = useState(tile.dateEnabled)
  const [date, setDate] = useState(tile.date || '')

  useEffect(() => {
    setNote(tile.note)
    setDateEnabled(tile.dateEnabled)
    setDate(tile.date || '')
  }, [tile.id, tile.note, tile.dateEnabled, tile.date])

  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value
    setNote(newNote)
    updateTile({ id: tile.id, note: newNote })
  }, [tile.id, updateTile])

  const handleEnableDate = useCallback(() => {
    const today = formatDateISO(new Date())
    setDateEnabled(true)
    setDate(today)
    updateTile({ id: tile.id, dateEnabled: true, date: today })
  }, [tile.id, updateTile])

  const handleClearDate = useCallback(() => {
    setDateEnabled(false)
    setDate('')
    updateTile({ id: tile.id, dateEnabled: false, date: null })
  }, [tile.id, updateTile])

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setDate(newDate)
    updateTile({ id: tile.id, date: newDate })
  }, [tile.id, updateTile])

  const displayDate = date ? formatDate(date) : ''
  const hasNote = note.trim().length > 0

  return (
    <div className="space-y-4">
      {/* Date Section */}
      <div className={`card p-4 ${dateEnabled && date ? 'card-accent-planned' : ''}`}>
        <h3 className="font-semibold text-white/90 mb-3">
          {t('tileDetail.dateEnabled')}
        </h3>

        {dateEnabled ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="input flex-1"
              />
              <button
                onClick={handleClearDate}
                className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors"
                title={t('tileDetail.clearDate')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {displayDate && (
              <p className="text-sm text-white/50">{displayDate}</p>
            )}
          </div>
        ) : (
          <button
            onClick={handleEnableDate}
            className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">{t('tileDetail.setDate')}</span>
          </button>
        )}
      </div>

      {/* Note Section */}
      <div className={`card p-4 ${hasNote ? 'card-accent-idea' : ''}`}>
        <h3 className="font-semibold text-white/90 mb-3">
          {t('tileDetail.noteLabel')}
        </h3>

        <textarea
          value={note}
          onChange={handleNoteChange}
          placeholder={t('tileDetail.notePlaceholder')}
          rows={4}
          className="input resize-none"
        />
      </div>
    </div>
  )
}
