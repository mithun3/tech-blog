import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import Link from 'next/link'
import { getAllPageSlugs, getPageContent, getPageMeta, titleFromSegment } from '@/lib/wiki'
import { SITE_NAME, SITE_URL, formatDate, ogImageUrl } from '@/lib/site'
import { WikiBreadcrumb } from '@/components/wiki/breadcrumb'
import Comments from '@/components/comments'
import { Video } from '@/components/mdx/video'
import { Audio } from '@/components/mdx/audio'
import { Callout } from '@/components/mdx/callout'
import { Mermaid } from '@/components/mdx/mermaid'
import { visit } from 'unist-util-visit'
// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ slug?: string[] }>
}

// ─── Static generation ────────────────────────────────────────────────────────

export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = getAllPageSlugs()
  // [[...slug]] with no segments = root /pages — include an empty-slug entry
  return [{ slug: undefined }, ...slugs.map((s) => ({ slug: s }))]
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params
  const meta = getPageMeta(slug)
  if (!meta) return {}

  const url = `${SITE_URL}${meta.href}`
  const category = slug.length > 0 ? titleFromSegment(slug[0]) : 'Wiki'
  const ogImage = ogImageUrl(meta.title, meta.description, category)

  const keywords = Array.isArray(meta.keywords)
    ? meta.keywords
    : typeof meta.keywords === 'string'
      ? meta.keywords.split(',').map((k) => k.trim())
      : undefined

  return {
    title: meta.title,
    description: meta.description,
    keywords,
    authors: [{ name: meta.author || SITE_NAME, url: SITE_URL }],
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'article',
      url,
      ...(meta.publishedAt && { publishedTime: meta.publishedAt }),
      ...(meta.updatedAt && { modifiedTime: meta.updatedAt }),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description ?? undefined,
      images: [ogImage],
    },
  }
}

// ─── MDX component overrides ──────────────────────────────────────────────────

// Plugin-generated anchors (heading links, footnotes) also pass through `a`, so keep their props.
const mdxComponents = {
  a: ({ href, ...props }: React.ComponentPropsWithoutRef<'a'>) => {
    if (href?.startsWith('/') && !href.startsWith('//')) {
      return <Link href={href} {...props} />
    }
    if (href && /^https?:\/\//.test(href)) {
      return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    }
    return <a href={href} {...props} />
  },
  Video,
  Audio,
  Callout,
  Mermaid,
}

// ─── Remark Plugin for Mermaid ────────────────────────────────────────────────

function remarkMermaid() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, 'code', (node: any, index: number | undefined, parent: any) => {
      if (node.lang === 'mermaid' && index !== undefined && parent) {
        parent.children[index] = {
          type: 'mdxJsxFlowElement',
          name: 'Mermaid',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'chart',
              value: node.value,
            },
          ],
          children: [],
        }
      }
    })
  }
}

// The page header renders the frontmatter title as the H1, so drop the body's leading `# Title`.
function remarkDropTitleHeading() {
  return (tree: { children: { type: string; depth?: number }[] }) => {
    const first = tree.children[0]
    if (first?.type === 'heading' && first.depth === 1) tree.children.shift()
  }
}

// ─── MDX processing options ───────────────────────────────────────────────────

const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkDropTitleHeading, remarkMermaid, remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        { behavior: 'wrap' as const },
      ],
      [
        rehypePrettyCode,
        {
          theme: { dark: 'github-dark-dimmed', light: 'github-light' },
          keepBackground: false,
        },
      ],
    ] as never[],
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WikiPage({ params }: Props) {
  const { slug = [] } = await params
  const page = getPageContent(slug)

  if (!page) notFound()

  const pageUrl = `${SITE_URL}${page.href}`
  const category = slug.length > 0 ? titleFromSegment(slug[0]) : 'Wiki'

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: page.title,
    description: page.description,
    url: pageUrl,
    image: ogImageUrl(page.title, page.description, category),
    ...(page.publishedAt && { datePublished: page.publishedAt }),
    ...(page.updatedAt && { dateModified: page.updatedAt }),
    author: {
      '@type': 'Person',
      name: page.author || SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    ...(page.keywords && {
      keywords: Array.isArray(page.keywords) ? page.keywords.join(', ') : page.keywords,
    }),
  }

  const breadcrumbElements = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Wiki',
      item: `${SITE_URL}/pages`,
    },
    ...slug.map((_, index) => {
      const crumbSlug = slug.slice(0, index + 1)
      const meta = getPageMeta(crumbSlug)
      return {
        '@type': 'ListItem',
        position: index + 3,
        name: meta?.title ?? titleFromSegment(slug[index]),
        item: `${SITE_URL}/pages/${crumbSlug.join('/')}`,
      }
    }),
  ]

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbElements,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <div className="max-w-[78ch] space-y-12">
        <article className="min-w-0">
          <WikiBreadcrumb slug={slug} />

        <header className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {page.title}
          </h1>
          {page.description && (
            <p className="max-w-[65ch] text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
              {page.description}
            </p>
          )}
          {page.publishedAt && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Published {formatDate(page.publishedAt)}
              {page.updatedAt && page.updatedAt !== page.publishedAt && (
                <> · Updated {formatDate(page.updatedAt)}</>
              )}
            </p>
          )}
        </header>

        <div
          className="
            prose prose-zinc dark:prose-invert max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-code:before:content-none prose-code:after:content-none
            prose-pre:p-0 prose-pre:bg-transparent prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800
            prose-img:rounded-lg
          "
        >
          <MDXRemote
            source={page.rawContent}
            components={mdxComponents}
            options={mdxOptions}
          />
        </div>
      </article>

      <Comments />
    </div>
    </>
  )
}
