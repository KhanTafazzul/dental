import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { TemplateConfig, PatientBillingData, CustomFont } from './types'
import { CANVAS_WIDTH, CANVAS_HEIGHT, PDF_WIDTH, PDF_HEIGHT } from './types'

/**
 * Helper to convert hex color (#1e293b or #f00) to pdf-lib rgb()
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
 * Convert base64 data string to Uint8Array
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
 * Main PDF Generation Engine
 */
export async function generatePrescriptionPdf(
  template: TemplateConfig,
  billingData: PatientBillingData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  const page = pdfDoc.addPage([PDF_WIDTH, PDF_HEIGHT])

  // 1. Draw Background Image if present
  if (template.backgroundImage) {
    try {
      const imgBytes = base64ToUint8Array(template.backgroundImage)
      let embeddedImg
      if (template.backgroundImage.startsWith('data:image/png')) {
        embeddedImg = await pdfDoc.embedPng(imgBytes)
      } else {
        // Default to JPG for image/jpeg or data URLs without explicit png tag
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

  // 2. Load & Cache Fonts
  const fontCache = new Map<string, PDFFont>()

  // Default Standard Fonts
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

  // Embed Custom Fonts
  for (const font of template.customFonts) {
    try {
      const fontBytes = base64ToUint8Array(font.base64Data)
      const embeddedCustomFont = await pdfDoc.embedFont(fontBytes)
      fontCache.set(font.name, embeddedCustomFont)
    } catch (err) {
      console.warn(`Failed to embed custom font "${font.name}":`, err)
    }
  }

  // Scaling ratios (Screen px -> PDF pt)
  const scaleX = PDF_WIDTH / CANVAS_WIDTH
  const scaleY = PDF_HEIGHT / CANVAS_HEIGHT

  // 3. Render Each Bounding Field
  for (const field of template.fields) {
    const font = fontCache.get(field.fontFamily) || helvetica
    const fontSizePt = field.fontSize * scaleY
    const textColor = hexToRgb(field.color || '#1e293b')

    // PDF Coordinate system: Y = 0 is BOTTOM left
    const pdfX = field.x * scaleX
    const pdfFieldYTop = PDF_HEIGHT - field.y * scaleY
    const pdfFieldHeightPt = field.height * scaleY
    const pdfFieldWidthPt = field.width * scaleX

    // Baseline calculation: top of field box minus 80% of font size
    const initialTextY = pdfFieldYTop - fontSizePt * 0.85

    // Get value according to key
    if (field.key === 'medicines') {
      // Render medicines array
      let currentY = initialTextY
      const lineHeight = fontSizePt * 1.3

      billingData.medicines.forEach((med, idx) => {
        if (currentY < pdfFieldYTop - pdfFieldHeightPt) {
          // Exceeded bottom bounding box
          return
        }
        const medLine = `${idx + 1}. ${med.name} ${med.dosage ? `(${med.dosage})` : ''} - ${med.frequency} ${med.duration ? `[${med.duration}]` : ''}`
        
        page.drawText(medLine, {
          x: pdfX,
          y: currentY,
          size: fontSizePt,
          font: font,
          color: textColor,
          maxWidth: pdfFieldWidthPt,
        })

        currentY -= lineHeight
      })
    } else if (field.key === 'notes') {
      // Render Multiline Notes
      const notesText = billingData.notes || ''
      const lines = notesText.split('\n')
      let currentY = initialTextY
      const lineHeight = fontSizePt * 1.3

      for (const line of lines) {
        if (currentY < pdfFieldYTop - pdfFieldHeightPt) break
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
      // Single line standard field (patientName, age, gender, date, mobile, doctorName, etc.)
      const textVal = String((billingData as any)[field.key] ?? field.name ?? '')

      if (textVal) {
        page.drawText(textVal, {
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

  return await pdfDoc.save()
}

/**
 * Auto-print PDF using hidden iframe trick
 */
export async function printPrescriptionPdf(
  template: TemplateConfig,
  billingData: PatientBillingData
): Promise<void> {
  const pdfBytes = await generatePrescriptionPdf(template, billingData)
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
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
      // Cleanup after printing dialogue closes
      setTimeout(() => {
        document.body.removeChild(iframe)
        URL.revokeObjectURL(blobUrl)
      }, 60000)
    }, 200)
  }
}

/**
 * Trigger immediate browser file download for PDF
 */
export async function downloadPrescriptionPdf(
  template: TemplateConfig,
  billingData: PatientBillingData,
  filename = 'Prescription.pdf'
): Promise<void> {
  const pdfBytes = await generatePrescriptionPdf(template, billingData)
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const blobUrl = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}
