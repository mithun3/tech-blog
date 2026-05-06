import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import Image, { type ImageProps } from 'next/image'
import Link from 'next/link'
import { getAllPageSlugs, getPageContent, getPageMeta } from '@/lib/wiki'
import { WikiBreadcrumb } from '@/components/wiki/breadcrumb'
import { Video } from '@/components/mdx/video'
import { Audio } from '@/components/mdx/audio'
import { Callout } from '@/components/mdx/callout'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ slug?: string[] }>
}

// ─── Static generation ────────────────────────────────────────────────────────

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

  const href = slug.length === 0 ? '/pages' : `/pages/${slug.join('/')}`
  const url = `${process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'}${href}`

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'article',
      url,
      ...(meta.publishedAt && { publishedTime: meta.publishedAt }),
      ...(meta.updatedAt && { modifiedTime: meta.updatedAt }),
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description ?? undefined,
    },
  }
}

// ─── MDX component overrides ──────────────────────────────────────────────────

const mdxComponents = {
  img: (props: React.ComponentPropsWithoutRef<'img'>) => (
    <Image
      sizes="(max-width: 768px) 100vw, 80vw"
      style={{ width: '100%', height: 'auto' }}
      {...(props as ImageProps)}
      alt={props.alt ?? ''}
    />
  ),
  a: ({
    href = '#',
    children,
    className,
  }: React.ComponentPropsWithoutRef<'a'>) => {
    if (href.startsWith('/')) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      )
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  },
  Video,
  Audio,
  Callout,
}

// ─── MDX processing options ───────────────────────────────────────────────────

const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
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

  return (
    <article className="min-w-0">
      <WikiBreadcrumb slug={slug} />

      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {page.title}
        </h1>
        {page.description && (
          <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed">
            {page.description}
          </p>
        )}
        {page.publishedAt && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {formatDate(page.publishedAt)}
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
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
