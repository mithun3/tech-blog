import Link from 'next/link'
import { getPageMeta } from '@/lib/wiki'

type Props = {
  slug: string[]
}

/**
 * Renders an accessible breadcrumb trail for wiki pages.
 * Each segment resolves to its page title via frontmatter.
 *
 * Example for slug ['nextjs', 'routing']:
 *   Wiki > Next.js > Routing
 */
export function WikiBreadcrumb({ slug }: Props) {
  if (slug.length === 0) return null

  // Build cumulative slug paths for each crumb segment
  const crumbs = slug.map((_, index) => {
    const crumbSlug = slug.slice(0, index + 1)
    const meta = getPageMeta(crumbSlug)
    return {
      title: meta?.title ?? titleFromSegment(slug[index]),
      href: `/pages/${crumbSlug.join('/')}`,
      isLast: index === slug.length - 1,
    }
  })

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center flex-wrap gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        <li>
          <Link
            href="/pages"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Wiki
          </Link>
        </li>

        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <span aria-hidden="true">/</span>
            {crumb.isLast ? (
              <span
                className="text-zinc-900 dark:text-zinc-100 font-medium"
                aria-current="page"
              >
                {crumb.title}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                {crumb.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function titleFromSegment(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
