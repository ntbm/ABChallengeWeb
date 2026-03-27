import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/state/authStore'
import { LanguageToggle } from './LanguageToggle'

export function AppHeader() {
  const { t } = useTranslation()
  const { signOut } = useAuthStore()

  return (
    <header className="px-4 pt-2.5 pb-1 flex items-center justify-between">
      <h1
        className="text-lg font-black tracking-wider uppercase"
        style={{
          background: 'linear-gradient(135deg, #a78bfa, #60a5fa, #34d399)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {t('app.title')}
      </h1>

      <div className="flex items-center gap-2">
        <LanguageToggle />
        <button
          onClick={signOut}
          className="text-[0.7rem] text-white/40 hover:text-white/70 px-2 py-0.5 transition-colors"
        >
          {t('auth.logout')}
        </button>
      </div>
    </header>
  )
}
