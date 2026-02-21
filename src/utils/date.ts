import i18n from '@/i18n'

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const locale = i18n.language === 'de' ? 'de-DE' : 'en-US'
  
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}
