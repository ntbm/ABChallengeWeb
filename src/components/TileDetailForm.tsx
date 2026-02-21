import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Tile } from '@/models/tile'
import { useTilesStore } from '@/state/tilesStore'
import { formatDate, formatDateISO } from '@/utils/date'
import { SaveIndicator } from './SaveIndicator'

interface TileDetailFormProps {
  tile: Tile
}

export function TileDetailForm({ tile }: TileDetailFormProps) {
  const { t } = useTranslation()
  const { updateTile } = useTilesStore()
  
  const [note, setNote] = useState(tile.note)
  const [dateEnabled, setDateEnabled] = useState(tile.dateEnabled)
  const [date, setDate] = useState(tile.date || '')

  // Update local state when tile changes (e.g., from sync)
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

  const handleDateEnabledChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked
    setDateEnabled(enabled)
    updateTile({ 
      id: tile.id, 
      dateEnabled: enabled,
      date: enabled ? (date || formatDateISO(new Date())) : null
    })
  }, [tile.id, date, updateTile])

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setDate(newDate)
    updateTile({ id: tile.id, date: newDate })
  }, [tile.id, updateTile])

  const displayDate = date ? formatDate(date) : ''

  return (
    <div className="space-y-6">
      {/* Header with Save Indicator */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{tile.id}</h2>
        <SaveIndicator />
      </div>

      {/* Date Section */}
      <div className="card p-4 space-y-4">
        <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">
          {t('tileDetail.dateEnabled')}
        </h3>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={dateEnabled}
            onChange={handleDateEnabledChange}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">{t('tileDetail.dateEnabled')}</span>
        </label>
        
        {dateEnabled && (
          <div className="space-y-2">
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="input"
            />
            {displayDate && (
              <p className="text-sm text-gray-600">
                {displayDate}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Note Section */}
      <div className="card p-4 space-y-4">
        <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">
          {t('tileDetail.noteLabel')}
        </h3>
        
        <textarea
          value={note}
          onChange={handleNoteChange}
          placeholder={t('tileDetail.notePlaceholder')}
          rows={6}
          className="input resize-none"
        />
      </div>
    </div>
  )
}
