// No fs or Node APIs here: client components import this file.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
export const SITE_NAME = 'poc to prod'
export const SITE_DESCRIPTION =
  'Notes, guides, and deep-dives on software engineering, infrastructure, and building things.'

/** Site pages (frontmatter order 90-94) shown under "More" and left out of topic lists. */
export const MORE_LINKS = [
  { href: '/pages/about', label: 'About' },
  { href: '/pages/contact', label: 'Contact' },
  { href: '/pages/privacy', label: 'Privacy Policy' },
  { href: '/pages/terms', label: 'Terms of Service' },
  { href: '/pages/faq', label: 'FAQ' },
] as const

export const MORE_HREFS: ReadonlySet<string> = new Set(MORE_LINKS.map((link) => link.href))

/** Absolute URL of the generated 1200x630 social image (app/og/route.tsx). */
export function ogImageUrl(title: string, description: string | undefined, category: string): string {
  return `${SITE_URL}/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description || '')}&category=${encodeURIComponent(category)}`
}

export function formatDate(dateStr: string, month: 'long' | 'short' = 'long'): string {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric' })
}
