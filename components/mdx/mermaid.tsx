'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid, { MermaidConfig } from 'mermaid'
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
    },
    securityLevel: 'loose',
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
    },
    securityLevel: 'loose',
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  
  // Extract the active theme from the next-themes provider.
  // resolvedTheme guarantees we know if it's strictly 'dark' or 'light' even if set to 'system'.
  const { resolvedTheme } = useTheme()
  
  // Create a unique, stable ID for the mermaid engine to isolate DOM operations.
  const [diagramId] = useState(() => `mermaid-${Math.random().toString(36).substring(2, 11)}`)

  useEffect(() => {
    // 1. Resolve the active theme configuration
    const isDark = resolvedTheme === 'dark'
    const config = isDark ? getDarkThemeConfig() : getLightThemeConfig()
    
    // 2. Safely initialize the mermaid engine with the new theme
    mermaid.initialize({
      startOnLoad: false,
      ...config
    })

    /**
     * Asynchronously generates the SVG string from the raw chart text.
     * Implements explicit error capturing to prevent the entire page UI 
     * from crashing on mermaid syntax errors.
     */
    const renderDiagram = async () => {
      try {
        if (!chart) return
        
        // Mermaid render API returns an object containing the generated raw SVG string
        const result = await mermaid.render(diagramId, chart)
        setSvg(result.svg)
      } catch (error) {
        console.error('Failed to parse or render Mermaid chart:', error)
        setSvg(`<div class="text-red-500 p-4 border border-red-500 rounded bg-red-50 dark:bg-red-950/20 text-sm">Failed to parse diagram syntax.</div>`)
      }
    }

    renderDiagram()
  }, [chart, diagramId, resolvedTheme])

  // Return an elegant skeleton pulse while generating the SVG to prevent UI layout shift.
  if (!svg) {
    return (
      <div className="w-full h-32 my-8 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl animate-pulse flex items-center justify-center border border-zinc-200 dark:border-zinc-800/50">
        <span className="text-zinc-500 dark:text-zinc-400 text-sm">Rendering Architecture Diagram...</span>
      </div>
    )
  }

  // Inject the raw, trusted SVG into the DOM. 
  // Wrapped in a polished card container for a premium UI presentation.
  return (
    <div
      ref={containerRef}
      className="mermaid-wrapper my-8 flex justify-center w-full overflow-x-auto p-6 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm transition-colors duration-300"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
