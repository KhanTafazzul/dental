/**
 * @file lib/utils/imageCompressor.ts
 * @description Pre-compression utility for clinic logos, doctor signatures, and dental letterheads.
 * 
 * Compressing high-resolution asset images BEFORE embedding them into the PDF cuts ~80%
 * of the total PDF document weight before the PDF stream compressor even runs.
 */

export interface ImageCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0.1 to 1.0
  format?: 'image/jpeg' | 'image/png' | 'image/webp'
  keepTransparency?: boolean
}

export interface CompressedImageResult {
  dataUrl: string
  base64Data: string
  format: string
  originalSizeBytes: number
  compressedSizeBytes: number
  compressionRatioPercent: number
  width: number
  height: number
}

/**
 * Calculates raw byte size of a Base64 string.
 */
export function getBase64ByteLength(base64String: string): number {
  const clean = base64String.includes(',') ? base64String.split(',')[1] : base64String
  const padding = (clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0)
  return Math.floor((clean.length * 3) / 4) - padding
}

/**
 * Browser-safe pre-compression for letterhead backgrounds, logos, and doctor signatures.
 * Downsamples resolution to target 150 DPI (typically max 1200px width for A4 letterheads)
 * and recompresses with adaptive JPEG/PNG encoding.
 */
export async function precompressImageForPdf(
  inputDataUrl: string,
  options: ImageCompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1600,
    quality = 0.78,
    keepTransparency = false,
  } = options

  const originalSizeBytes = getBase64ByteLength(inputDataUrl)

  // Server-side fallback if window or document is undefined
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      dataUrl: inputDataUrl,
      base64Data: inputDataUrl.includes(',') ? inputDataUrl.split(',')[1] : inputDataUrl,
      format: inputDataUrl.split(';')[0]?.replace('data:', '') || 'image/png',
      originalSizeBytes,
      compressedSizeBytes: originalSizeBytes,
      compressionRatioPercent: 0,
      width: maxWidth,
      height: maxHeight,
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      let width = img.naturalWidth || img.width
      let height = img.naturalHeight || img.height

      // Calculate constrained dimensions to avoid ultra-dense DPI bloat
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return resolve({
          dataUrl: inputDataUrl,
          base64Data: inputDataUrl.includes(',') ? inputDataUrl.split(',')[1] : inputDataUrl,
          format: 'image/jpeg',
          originalSizeBytes,
          compressedSizeBytes: originalSizeBytes,
          compressionRatioPercent: 0,
          width,
          height,
        })
      }

      // If we don't need transparency (e.g. background letterhead or photos), fill white background
      if (!keepTransparency) {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Choose format: PNG for transparent signatures, JPEG for photos/letterheads
      const targetMime = keepTransparency ? 'image/png' : 'image/jpeg'
      const compressedDataUrl = canvas.toDataURL(targetMime, quality)
      const compressedSizeBytes = getBase64ByteLength(compressedDataUrl)

      // Only use compressed if it actually reduced the footprint
      const isSmaller = compressedSizeBytes < originalSizeBytes
      const finalDataUrl = isSmaller ? compressedDataUrl : inputDataUrl
      const finalSize = isSmaller ? compressedSizeBytes : originalSizeBytes
      const ratio = Math.round(((originalSizeBytes - finalSize) / originalSizeBytes) * 100)

      console.log(
        `[Image Precompressor] Slashed: ${(originalSizeBytes / 1024).toFixed(1)} KB -> ${(finalSize / 1024).toFixed(1)} KB (-${ratio}%)`
      )

      resolve({
        dataUrl: finalDataUrl,
        base64Data: finalDataUrl.includes(',') ? finalDataUrl.split(',')[1] : finalDataUrl,
        format: targetMime,
        originalSizeBytes,
        compressedSizeBytes: finalSize,
        compressionRatioPercent: ratio,
        width,
        height,
      })
    }

    img.onerror = (err) => {
      console.warn('[Image Precompressor] Error loading image for compression, falling back to original:', err)
      resolve({
        dataUrl: inputDataUrl,
        base64Data: inputDataUrl.includes(',') ? inputDataUrl.split(',')[1] : inputDataUrl,
        format: 'image/jpeg',
        originalSizeBytes,
        compressedSizeBytes: originalSizeBytes,
        compressionRatioPercent: 0,
        width: 800,
        height: 1100,
      })
    }

    img.src = inputDataUrl
  })
}
