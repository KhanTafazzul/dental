import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { TemplateConfig, PatientBillingData } from './types'
import { CANVAS_WIDTH, CANVAS_HEIGHT, PDF_WIDTH, PDF_HEIGHT } from './types'
import { precompressImageForPdf } from '@/lib/utils/imageCompressor'

/**
 * Helper to convert hex color (#1e293b, #4A5D23, etc.) to pdf-lib rgb()
 */
function hexToRgb(hex: string) {
  let cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('')
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0
  return rgb(r / 255, g / 255, b / 255)
}

/**
 * Convert base64 data string or Data URL to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const pureBase64 = base64.includes(',') ? base64.split(',')[1] : base64
  const binaryString = atob(pureBase64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * Main PDF Generation Engine using pdf-lib and @pdf-lib/fontkit
 * Includes 150 DPI image pre-compression for letterhead logos & backgrounds (slashing ~80% file size)
 */
export async function generatePrescriptionPdf(
  template: TemplateConfig,
  billingData: PatientBillingData
): Promise<{ pdfBytes: Uint8Array; blob: Blob }> {
  // 1. Initialize new PDFDocument and register fontkit
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  const page = pdfDoc.addPage([PDF_WIDTH, PDF_HEIGHT])

  // 2. Load and embed backgroundImage if present
  // CRITICAL OPTIMIZATION: Pre-compress image to 150 DPI before embedding to cut 80% weight
  if (template.backgroundImage) {
    try {
      let finalImgDataUrl = template.backgroundImage

      // Run client-side pre-compression if running in browser
      if (typeof window !== 'undefined') {
        const compressed = await precompressImageForPdf(template.backgroundImage, {
          maxWidth: 1200,
          maxHeight: 1650,
          quality: 0.78,
          keepTransparency: false,
        })
        finalImgDataUrl = compressed.dataUrl
      }

      const imgBytes = base64ToUint8Array(finalImgDataUrl)
      let embeddedImg
      if (finalImgDataUrl.startsWith('data:image/png')) {
        embeddedImg = await pdfDoc.embedPng(imgBytes)
      } else {
        // Default to JPG for image/jpeg or general data URLs
        embeddedImg = await pdfDoc.embedJpg(imgBytes)
      }
      page.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: PDF_WIDTH,
        height: PDF_HEIGHT,
      })
    } catch (err) {
      console.warn('Failed to embed prescription background image into PDF:', err)
    }
  }

  // 3. Register & cache standard & custom uploaded fonts
  const fontCache = new Map<string, PDFFont>()

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const courier = await pdfDoc.embedFont(StandardFonts.Courier)

  fontCache.set('Arial', helvetica)
  fontCache.set('Helvetica', helvetica)
  fontCache.set('Times New Roman', timesRoman)
  fontCache.set('Courier New', courier)
  fontCache.set('Georgia', timesRoman)
  fontCache.set('Verdana', helvetica)
  fontCache.set('Trebuchet MS', helvetica)
  fontCache.set('Impact', helvetica)

  // Register custom fonts via fontkit and pdfDoc.embedFont
  for (const font of template.customFonts) {
    try {
      const fontBuffer = base64ToUint8Array(font.base64Data)
      const embeddedCustomFont = await pdfDoc.embedFont(fontBuffer)
      fontCache.set(font.name, embeddedCustomFont)
    } catch (err) {
      console.warn(`Failed to embed custom font "${font.name}":`, err)
    }
  }

  // Scaling ratios (Screen DOM px -> PDF pt)
  const scaleX = PDF_WIDTH / CANVAS_WIDTH
  const scaleY = PDF_HEIGHT / CANVAS_HEIGHT

  // 4. Loop through fields array and map coordinates
  for (const field of template.fields) {
    const font = fontCache.get(field.fontFamily) || helvetica
    const fontSizePt = field.fontSize * scaleY
    const textColor = hexToRgb(field.color || '#1e293b')

    // Convert DOM coordinates to pdf-lib points (Y-axis starts from bottom left)
    const pdfX = field.x * scaleX
    const pdfFieldYTop = PDF_HEIGHT - field.y * scaleY
    const pdfFieldHeightPt = field.height * scaleY
    const pdfFieldWidthPt = field.width * scaleX
    const bottomBoundary = pdfFieldYTop - pdfFieldHeightPt

    // Baseline text placement inside top of box
    const initialTextY = pdfFieldYTop - fontSizePt * 0.85

    if (field.key === 'medicines') {
      // For the "Medicines" box, loop through the added medicines array.
      // Draw each medicine on a new line. Calculate line height using box fontSize.
      // Stop drawing or add "..." if Y-coordinate exceeds bottom boundary.
      let currentY = initialTextY
      const lineHeight = fontSizePt * 1.35
      const meds = billingData.medicines || []

      for (let i = 0; i < meds.length; i++) {
        const item = meds[i]
        const medText = typeof item === 'string'
          ? `${i + 1}. ${item}`
          : `${i + 1}. ${item.name} ${item.dosage ? `(${item.dosage})` : ''} ${item.frequency ? `- ${item.frequency}` : ''} ${item.duration ? `[${item.duration}]` : ''}`

        // Check if next line would exceed the bottom boundary
        if (currentY - fontSizePt < bottomBoundary) {
          page.drawText('...', {
            x: pdfX,
            y: currentY,
            size: fontSizePt,
            font: font,
            color: textColor,
          })
          break
        }

        page.drawText(medText, {
          x: pdfX,
          y: currentY,
          size: fontSizePt,
          font: font,
          color: textColor,
          maxWidth: pdfFieldWidthPt,
        })

        currentY -= lineHeight
      }
    } else if (field.key === 'notes') {
      // Notes multi-line rendering
      const notesText = billingData.notes || ''
      const lines = notesText.split('\n')
      let currentY = initialTextY
      const lineHeight = fontSizePt * 1.3

      for (const line of lines) {
        if (currentY - fontSizePt < bottomBoundary) {
          page.drawText('...', { x: pdfX, y: currentY, size: fontSizePt, font, color: textColor })
          break
        }
        page.drawText(line, {
          x: pdfX,
          y: currentY,
          size: fontSizePt,
          font: font,
          color: textColor,
          maxWidth: pdfFieldWidthPt,
        })
        currentY -= lineHeight
      }
    } else {
      // Standard single line field
      let val = ''
      if (field.key === 'patientName') val = billingData.patientName
      else if (field.key === 'age') val = billingData.age
      else if (field.key === 'date') val = billingData.date
      else if (field.key === 'mobile') val = billingData.mobile
      else if ((billingData as any)[field.key] !== undefined) {
        val = String((billingData as any)[field.key])
      }

      if (val) {
        page.drawText(val, {
          x: pdfX,
          y: initialTextY,
          size: fontSizePt,
          font: font,
          color: textColor,
          maxWidth: pdfFieldWidthPt,
        })
      }
    }
  }

  // 5. Save the PDF with object stream compression
  const pdfBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  })
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })

  return { pdfBytes, blob }
}

/**
 * Converts a Blob to a Base64 string
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Generates prescription PDF, compresses it, uploads directly to Backblaze B2,
 * logs repeat-visit database record, and triggers WAHA + Email notifications.
 */
export async function uploadPrescriptionToCloud(params: {
  template: TemplateConfig
  billingData: PatientBillingData
  patientId: string
  doctorId?: string
  appointmentId?: string
  channels?: { whatsapp: boolean; email: boolean }
}) {
  const { template, billingData, patientId, doctorId, appointmentId, channels } = params

  // 1. Generate local pre-compressed PDF
  const { blob } = await generatePrescriptionPdf(template, billingData)
  const pdfBase64 = await blobToBase64(blob)

  // 2. Dispatch to backend API pipeline
  const response = await fetch('/api/prescriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pdfBase64,
      patientId,
      patientName: billingData.patientName,
      patientPhone: billingData.mobile,
      patientEmail: billingData.email,
      doctorId,
      doctorName: billingData.doctorName,
      appointmentId,
      visitDate: billingData.date,
      diagnosisSummary: {
        notes: billingData.notes,
        medicines: billingData.medicines,
      },
      medicines: billingData.medicines,
      channels: channels || { whatsapp: true, email: true },
    }),
  })

  const result = await response.json()
  return result
}

/**
 * Requirement 4: Silent Print Trick
 * Creates a hidden <iframe>, sets its src to the PDF Blob URL using URL.createObjectURL(blob),
 * and calls iframe.contentWindow.print() after it loads to trigger the browser print dialog immediately.
 * Returns the Blob object so it can be attached to a FormData object for backend uploading.
 */
export async function printPrescriptionPdf(
  template: TemplateConfig,
  billingData: PatientBillingData
): Promise<Blob> {
  const { blob } = await generatePrescriptionPdf(template, billingData)
  const blobUrl = URL.createObjectURL(blob)

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.src = blobUrl

  document.body.appendChild(iframe)

  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      // Cleanup after print dialogue triggers
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
        URL.revokeObjectURL(blobUrl)
      }, 60000)
    }, 250)
  }

  return blob
}

/**
 * Browser file download helper
 */
export async function downloadPrescriptionPdf(
  template: TemplateConfig,
  billingData: PatientBillingData,
  filename = 'Prescription.pdf'
): Promise<Blob> {
  const { blob } = await generatePrescriptionPdf(template, billingData)
  const blobUrl = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)

  return blob
}

