'use client'

import React, { useEffect, useState } from 'react'
import type { MermaidConfig } from 'mermaid'
import { useTheme } from 'next-themes'

/**
 * Returns the premium dark theme configuration for Mermaid diagrams.
 * Specifically tuned for high contrast against a dark `#09090b` background.
 *
 * @returns {MermaidConfig} The customized dark theme configuration.
 */
function getDarkThemeConfig(): MermaidConfig {
  return {
    theme: 'base',
    themeVariables: {
      background: 'transparent',
      primaryColor: '#1e1e24',       // Sleek dark node background
      primaryBorderColor: '#3b82f6', // Electric blue accents for borders
      primaryTextColor: '#f8fafc',   // Crisp white text
      lineColor: '#64748b',          // Subdued slate for connectors
      fontFamily: 'inherit',
      edgeLabelBackground: '#0f172a',// Dark blue-gray for label cards
      secondaryColor: '#1e293b',
      tertiaryColor: '#0f172a',
      // Mermaid's base theme hard-codes sequence note text as #333, which vanishes on a
      // dark page once a note uses a see-through fill. Set it per theme, with a tinted note.
      noteTextColor: '#f8fafc',
      noteBkgColor: '#eab30833',
      noteBorderColor: '#ca8a04',
    },
  }
}

/**
 * Returns the premium light theme configuration for Mermaid diagrams.
 * Tuned for a clean, minimalist aesthetic with crisp definitions.
 *
 * @returns {MermaidConfig} The customized light theme configuration.
 */
function getLightThemeConfig(): MermaidConfig {
  return {
    theme: 'base',
    themeVariables: {
      background: 'transparent',
      primaryColor: '#ffffff',       // Pure white node background
      primaryBorderColor: '#94a3b8', // Elegant slate borders
      primaryTextColor: '#0f172a',   // Dark slate text
      lineColor: '#64748b',          // Subdued slate for connectors
      fontFamily: 'inherit',
      edgeLabelBackground: '#f1f5f9',// Very light gray for label cards
      secondaryColor: '#f8fafc',
      tertiaryColor: '#f1f5f9',
      noteTextColor: '#0f172a',      // Matches primaryTextColor (see the dark config)
    },
  }
}

/**
 * Properties for the Mermaid component.
 *
 * @typedef {Object} MermaidProps
 * @property {string} chart - The raw Mermaid syntax string to render.
 */
interface MermaidProps {
  chart: string
}

/**
 * Renders an interactive Mermaid.js diagram dynamically in the browser.
 * It listens to the Next.js `useTheme` hook and seamlessly transitions
 * between a premium Dark and Light mode color palette without reloading the page.
 *
 * @param {MermaidProps} props - The component properties.
 * @returns {JSX.Element} The rendered SVG diagram within a framed container, or a loading skeleton.
 */
export function Mermaid({ chart }: MermaidProps): React.ReactElement | null {
  const [svg, setSvg] = useState<string>('')
  
  // Extract the active theme from the next-themes provider.
  // resolvedTheme guarantees we know if it's strictly 'dark' or 'light' even if set to 'system'.
  const { resolvedTheme } = useTheme()
  
  // Create a unique, stable ID for the mermaid engine to isolate DOM operations.
  const [diagramId] = useState(() => `mermaid-${Math.random().toString(36).substring(2, 11)}`)

  useEffect(() => {
    let cancelled = false
    const isDark = resolvedTheme === 'dark'
    const config = isDark ? getDarkThemeConfig() : getLightThemeConfig()

    /**
     * Asynchronously generates the SVG string from the raw chart text.
     * Implements explicit error capturing to prevent the entire page UI 
     * from crashing on mermaid syntax errors.
     */
    const renderDiagram = async () => {
      try {
        if (!chart) return

        // Loaded on demand so pages without a diagram do not ship Mermaid.
        const { default: mermaid } = await import('mermaid')
        // 'strict' keeps Mermaid's DOMPurify pass on the SVG that is injected below.
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', ...config })

        const result = await mermaid.render(diagramId, chart)
        if (!cancelled) setSvg(result.svg)
      } catch (error) {
        console.error('Failed to parse or render Mermaid chart:', error)
        if (!cancelled) setSvg(`<div class="text-red-500 p-4 border border-red-500 rounded bg-red-50 dark:bg-red-950/20 text-sm">Failed to parse diagram syntax.</div>`)
      }
    }

    renderDiagram()
    return () => {
      cancelled = true
    }
  }, [chart, diagramId, resolvedTheme])

  // Return an elegant skeleton pulse while generating the SVG to prevent UI layout shift.
  if (!svg) {
    return (
      <div className="w-full h-32 my-8 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl animate-pulse flex items-center justify-center border border-zinc-200 dark:border-zinc-800/50">
        <span className="text-zinc-500 dark:text-zinc-400 text-sm">Rendering Architecture Diagram...</span>
      </div>
    )
  }

  // Inject the SVG that Mermaid sanitized under securityLevel 'strict'.
  return (
    <div
      className="mermaid-wrapper my-8 flex justify-center w-full overflow-x-auto p-6 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm transition-colors duration-300"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
