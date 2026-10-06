'use client'

import { useEffect } from 'react'
import type { CustomFont } from './types'

interface FontInjectorProps {
  fonts: CustomFont[]
}

/**
 * FontInjector – Renders nothing visually.
 * Dynamically injects @font-face rules into a <style> tag in <head>
 * whenever the fonts array changes.
 */
export default function FontInjector({ fonts }: FontInjectorProps) {
  useEffect(() => {
    let styleTag = document.getElementById('dynamic-custom-fonts') as HTMLStyleElement | null

    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = 'dynamic-custom-fonts'
      document.head.appendChild(styleTag)
    }

    const css = fonts
      .map(font => {
        const formatMap: Record<string, string> = {
          ttf: 'truetype',
          otf: 'opentype',
          woff: 'woff',
        }
        const fmt = formatMap[font.format] ?? 'truetype'
        return `
@font-face {
  font-family: '${font.name}';
  src: url('${font.base64Data}') format('${fmt}');
  font-display: swap;
}`
      })
      .join('\n')

    styleTag.textContent = css

    return () => {
      // Cleanup only if component is fully unmounted (app teardown)
      // We intentionally do NOT remove the <style> tag on re-render
      // so fonts remain available for PDF generation hidden canvases.
    }
  }, [fonts])

  return null
}
