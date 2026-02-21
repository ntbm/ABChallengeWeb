import { useRef, useCallback } from 'react'
import { driveStorage } from './driveStorage'

class ThumbCache {
  private cache = new Map<string, string>()

  getUrl(fileId: string): string | null {
    if (this.cache.has(fileId)) {
      return this.cache.get(fileId)!
    }

    // Create blob URL on demand
    const url = driveStorage.getThumbnailUrl(fileId)
    
    // We don't actually cache the blob URL here to avoid memory issues
    // Instead, we return the direct download URL
    return url
  }

  clear(): void {
    this.cache.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
    this.cache.clear()
  }
}

const globalThumbCache = new ThumbCache()

export function useThumbCache() {
  const cacheRef = useRef(globalThumbCache)

  const getThumbUrl = useCallback((fileId: string): string | null => {
    return cacheRef.current.getUrl(fileId)
  }, [])

  return { getThumbUrl }
}
