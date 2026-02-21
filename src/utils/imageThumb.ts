const MAX_SIZE = parseInt(import.meta.env.VITE_THUMB_MAX_SIZE || '512', 10)
const QUALITY = 0.75

export async function createThumbnail(file: File): Promise<Blob> {
  // Check if it's a HEIC file - browsers can't handle these natively
  const isHeic = file.type === 'image/heic' || 
                 file.type === 'image/heif' || 
                 file.name.toLowerCase().endsWith('.heic') ||
                 file.name.toLowerCase().endsWith('.heif')
  
  if (isHeic) {
    throw new Error(
      'HEIC/HEIF images are not supported. ' +
      'Please convert to JPEG first or use Export > Export Unmodified Original from Photos app.'
    )
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    let objectUrl: string | null = null

    img.onload = () => {
      // Revoke object URL to free memory
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }

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
      let outputFormat: 'image/webp' | 'image/jpeg' = 'image/webp'
      
      // Test if WebP is supported
      const testCanvas = document.createElement('canvas')
      testCanvas.width = 1
      testCanvas.height = 1
      const testDataUrl = testCanvas.toDataURL('image/webp')
      
      if (testDataUrl.indexOf('data:image/webp') !== 0) {
        outputFormat = 'image/jpeg'
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error(`Failed to create ${outputFormat === 'image/webp' ? 'WebP' : 'JPEG'} blob`))
          }
        },
        outputFormat,
        QUALITY
      )
    }

    img.onerror = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
      
      // More specific error message based on file type
      if (file.type === '' || file.type === 'application/octet-stream') {
        reject(new Error(
          'Could not load image. The file may be corrupted or in an unsupported format. ' +
          'Try exporting from Photos app as JPEG.'
        ))
      } else {
        reject(new Error(`Failed to load image (type: ${file.type}). The file may be corrupted.`))
      }
    }

    objectUrl = URL.createObjectURL(file)
    img.src = objectUrl
  })
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
  
  // HEIC/HEIF warning - we accept them but will show a better error later
  const isHeic = file.type === 'image/heic' || 
                 file.type === 'image/heif' || 
                 file.name.toLowerCase().endsWith('.heic') ||
                 file.name.toLowerCase().endsWith('.heif')
  
  // Accept HEIC for now but warn later during processing
  if (!validTypes.includes(file.type) && !isHeic && !file.name.match(/\.(jpe?g|png|gif|webp|heic|heif)$/i)) {
    return { valid: false, error: 'Invalid file type. Please use JPEG, PNG, GIF, or WebP.' }
  }

  // Check file size (max 10MB for original)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' }
  }

  return { valid: true }
}

export function isHeicFile(file: File): boolean {
  return file.type === 'image/heic' || 
         file.type === 'image/heif' || 
         file.name.toLowerCase().endsWith('.heic') ||
         file.name.toLowerCase().endsWith('.heif')
}
