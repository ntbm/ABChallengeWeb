import { describe, it, expect } from 'vitest'
import { validateImageFile } from '@/utils/imageThumb'

describe('Image File Validation', () => {
  it('should accept valid image types', () => {
    const validFiles = [
      { type: 'image/jpeg', name: 'test.jpg', size: 1000000 },
      { type: 'image/png', name: 'test.png', size: 1000000 },
      { type: 'image/gif', name: 'test.gif', size: 1000000 },
      { type: 'image/webp', name: 'test.webp', size: 1000000 },
    ]

    validFiles.forEach(file => {
      const result = validateImageFile(file as File)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  it('should reject invalid file types', () => {
    const invalidFile = { type: 'application/pdf', name: 'test.pdf', size: 1000000 }
    const result = validateImageFile(invalidFile as File)
    
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Invalid file type')
  })

  it('should reject files that are too large', () => {
    const largeFile = { type: 'image/jpeg', name: 'test.jpg', size: 20 * 1024 * 1024 }
    const result = validateImageFile(largeFile as File)
    
    expect(result.valid).toBe(false)
    expect(result.error).toContain('too large')
  })

  it('should accept HEIC files by extension', () => {
    const heicFile = { type: 'image/heic', name: 'test.heic', size: 1000000 }
    const result = validateImageFile(heicFile as File)
    
    expect(result.valid).toBe(true)
  })
})
