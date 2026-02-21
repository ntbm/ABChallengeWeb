import { useRef, useCallback, useState, useEffect } from 'react'
import { getFileBlob } from './driveApi'

class ThumbCache {
  private cache = new Map<string, string>()

  async getUrl(fileId: string): Promise<string | null> {
    // Check memory cache
    if (this.cache.has(fileId)) {
      return this.cache.get(fileId)!
    }

    try {
      // Fetch the image with proper auth
      const blob = await getFileBlob(fileId)
      const url = URL.createObjectURL(blob)
      this.cache.set(fileId, url)
      return url
    } catch (error) {
      console.error('Failed to load thumbnail:', error)
      return null
    }
  }

  clear(): void {
    this.cache.forEach(url => {
      URL.revokeObjectURL(url)
    })
    this.cache.clear()
  }
}

const globalThumbCache = new ThumbCache()

export function useThumbCache() {
  const cacheRef = useRef(globalThumbCache)

  const getThumbUrl = useCallback(async (fileId: string): Promise<string | null> => {
    return cacheRef.current.getUrl(fileId)
  }, [])

  return { getThumbUrl }
}

// Hook for async loading of thumbnails
export function useThumbnail(fileId: string | null): { url: string | null; loading: boolean; error: Error | null } {
  const [state, setState] = useState<{ url: string | null; loading: boolean; error: Error | null }>({
    url: null,
    loading: !!fileId,
    error: null,
  })

  useEffect(() => {
    if (!fileId) {
      setState({ url: null, loading: false, error: null })
      return
    }

    let cancelled = false

    async function load() {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))
        const url = fileId ? await globalThumbCache.getUrl(fileId) : null
        if (!cancelled) {
          setState({ url, loading: false, error: null })
        }
      } catch (error) {
        if (!cancelled) {
          setState({ url: null, loading: false, error: error as Error })
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [fileId])

  return state
}
