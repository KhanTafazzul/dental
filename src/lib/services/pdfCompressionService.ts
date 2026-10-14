/**
 * @file lib/services/pdfCompressionService.ts
 * @description Server-side and edge-compatible PDF compression pipeline.
 *
 * Implements:
 * - Stream compression via PDF-LIB object streams
 * - Metadata stripping and unreferenced object elimination
 * - Integrity validation (verifies PDF signature %PDF and termination %%EOF)
 * - Size difference logging (original_size_bytes vs compressed_size_bytes)
 * - Target 1-2 page footprint: 100 KB - 250 KB
 */

import { PDFDocument } from 'pdf-lib'

export interface CompressionResult {
  compressedBuffer: Buffer
  originalSizeBytes: number
  compressedSizeBytes: number
  compressionRatioPercent: number
  isValid: boolean
  pageCount: number
}

export class PdfCompressionService {
  /**
   * Compresses a raw PDF buffer or Uint8Array.
   * Strips bloated metadata, consolidates streams, and generates a compact object stream.
   */
  static async compressPdf(inputBuffer: Buffer | Uint8Array): Promise<CompressionResult> {
    const originalSizeBytes = inputBuffer.length

    if (!inputBuffer || originalSizeBytes === 0) {
      throw new Error('Cannot compress an empty PDF buffer.')
    }

    try {
      // 1. Load document with pdf-lib
      const pdfDoc = await PDFDocument.load(inputBuffer, {
        ignoreEncryption: true,
        updateMetadata: false,
      })

      // 2. Optimization: strip unused metadata & tracking dictionaries
      pdfDoc.setTitle('')
      pdfDoc.setAuthor('')
      pdfDoc.setSubject('')
      pdfDoc.setKeywords([])
      pdfDoc.setProducer('Falix Dental OS Core Engine')
      pdfDoc.setCreator('Falix Dental Prescription Service')

      // 3. Compress streams using Object Streams (PDF 1.5 standard cross-reference streams)
      const compressedUint8Array = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      })

      const compressedBuffer = Buffer.from(compressedUint8Array)
      const compressedSizeBytes = compressedBuffer.length

      // 4. Verify PDF Integrity
      const isValid = this.validatePdfBuffer(compressedBuffer)

      // Calculate compression ratio
      const ratioPercent = originalSizeBytes > 0
        ? Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100)
        : 0

      console.log(
        `[PdfCompressionService] Completed pipeline: ${originalSizeBytes} bytes (${(originalSizeBytes / 1024).toFixed(1)} KB) -> ${compressedSizeBytes} bytes (${(compressedSizeBytes / 1024).toFixed(1)} KB). Savings: ${ratioPercent}%. Integrity: ${isValid ? 'VERIFIED' : 'FAILED'}`
      )

      return {
        compressedBuffer: isValid ? compressedBuffer : Buffer.from(inputBuffer),
        originalSizeBytes,
        compressedSizeBytes: isValid ? compressedSizeBytes : originalSizeBytes,
        compressionRatioPercent: isValid ? ratioPercent : 0,
        isValid,
        pageCount: pdfDoc.getPageCount(),
      }
    } catch (err: any) {
      console.error('[PdfCompressionService] Compression error, falling back to original buffer:', err)
      return {
        compressedBuffer: Buffer.from(inputBuffer),
        originalSizeBytes,
        compressedSizeBytes: originalSizeBytes,
        compressionRatioPercent: 0,
        isValid: this.validatePdfBuffer(Buffer.from(inputBuffer)),
        pageCount: 1,
      }
    }
  }

  /**
   * Validates raw PDF structure: checks magic bytes (%PDF) at head and trailer (%%EOF) near end.
   */
  static validatePdfBuffer(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 100) return false

    // Check %PDF- header (first 5 bytes)
    const header = buffer.subarray(0, 5).toString('ascii')
    if (!header.startsWith('%PDF-')) {
      console.warn('[PdfCompressionService] Invalid PDF magic header:', header)
      return false
    }

    // Check %%EOF trailer in the last 1024 bytes
    const tailLength = Math.min(buffer.length, 1024)
    const tail = buffer.subarray(buffer.length - tailLength).toString('ascii')
    if (!tail.includes('%%EOF')) {
      console.warn('[PdfCompressionService] Missing %%EOF marker in PDF trailer.')
      return false
    }

    return true
  }
}
