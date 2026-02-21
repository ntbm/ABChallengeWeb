const MAX_SIZE = parseInt(import.meta.env.VITE_THUMB_MAX_SIZE || '512', 10)
const QUALITY = 0.75

export async function createThumbnail(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img
      
      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width)
          width = MAX_SIZE
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height)
          height = MAX_SIZE
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw image with white background (for transparent images)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      // Try WebP first, fall back to JPEG
      const tryWebP = canvas.toDataURL('image/webp', QUALITY)
      
      if (tryWebP.length > 100 && !tryWebP.includes('data:image/png')) {
        // WebP is supported
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create WebP blob'))
            }
          },
          'image/webp',
          QUALITY
        )
      } else {
        // Fall back to JPEG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create JPEG blob'))
            }
          },
          'image/jpeg',
          QUALITY
        )
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic']
  if (!validTypes.includes(file.type) && !file.name.endsWith('.heic')) {
    return { valid: false, error: 'Invalid file type. Please use JPEG, PNG, GIF, or WebP.' }
  }

  // Check file size (max 10MB for original)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' }
  }

  return { valid: true }
}
