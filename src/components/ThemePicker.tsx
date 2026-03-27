import { useTilesStore } from '@/state/tilesStore'
import { THEMES, THEME_IDS, ThemeId } from '@/models/theme'

export function ThemePicker() {
  const { theme, setTheme } = useTilesStore()

  return (
    <div className="flex items-center gap-1.5">
      {THEME_IDS.map((id: ThemeId) => {
        const t = THEMES[id]
        const isActive = theme === id
        return (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={`w-5 h-5 rounded-full transition-all duration-200 ${
              isActive ? 'ring-2 ring-white/40 ring-offset-1 ring-offset-transparent scale-110' : 'opacity-50 hover:opacity-80'
            }`}
            style={{
              background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]})`,
            }}
            aria-label={id}
          />
        )
      })}
    </div>
  )
}
