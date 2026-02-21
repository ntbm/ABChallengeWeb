import { useTranslation } from 'react-i18next'
import { useTilesStore } from '@/state/tilesStore'

export function SaveIndicator() {
  const { t } = useTranslation()
  const { saveStatus, pendingChanges } = useTilesStore()
  
  if (saveStatus === 'idle' && !pendingChanges) return null
  
  const getContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
            <span className="text-amber-600">{t('tileDetail.saving')}</span>
          </>
        )
      case 'saved':
        return (
          <>
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-600">{t('tileDetail.saved')}</span>
          </>
        )
      case 'error':
        return (
          <>
            <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-600">{t('tileDetail.saveError')}</span>
          </>
        )
      default:
        return null
    }
  }
  
  return (
    <div className="flex items-center gap-2 text-sm">
      {getContent()}
    </div>
  )
}
