import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/state/authStore'
import { LanguageToggle } from './LanguageToggle'

export function AppHeader() {
  const { t } = useTranslation()
  const { signOut } = useAuthStore()

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{t('app.title')}</h1>
        
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button
            onClick={signOut}
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1"
          >
            {t('auth.logout')}
          </button>
        </div>
      </div>
    </header>
  )
}
