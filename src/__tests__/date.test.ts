import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDate, formatDateISO } from '@/utils/date'

describe('date utils', () => {
  beforeEach(() => {
    // Mock i18n language
    vi.mock('@/i18n', () => ({
      default: { language: 'de' }
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('formatDateISO should return correct ISO date string', () => {
    const date = new Date('2026-02-21')
    const result = formatDateISO(date)
    expect(result).toBe('2026-02-21')
  })

  it('formatDate should handle null/undefined', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
  })
})
