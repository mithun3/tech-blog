import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const PAGES_DIR = path.join(process.cwd(), 'content', 'pages')

// ─── Types ────────────────────────────────────────────────────────────────────

export type PageFrontmatter = {
  title: string
  description?: string
  publishedAt?: string
  updatedAt?: string
  /** Numeric hint for sidebar ordering within a section */
  order?: number
  status?: 'published' | 'draft' | 'archived'
}

export type PageMeta = PageFrontmatter & {
  /** Path segments, e.g. ['nextjs', 'routing'] */
  slug: string[]
  href: string
}

export type PageContent = PageMeta & {
  rawContent: string
}

export type NavNode = {
  title: string
  href: string
  slug: string[]
  order: number
  description?: string
  /** Present when the node is a section with child pages */
  children: NavNode[]
}

// ─── File Resolution ──────────────────────────────────────────────────────────

/**
 * Given a slug array, find the file path on disk.
 * Resolution order for slug ['nextjs', 'routing']:
 *   1. content/pages/nextjs/routing.md
 *   2. content/pages/nextjs/routing.mdx
 *   3. content/pages/nextjs/routing/index.md
 *   4. content/pages/nextjs/routing/index.mdx
 *
 * For an empty slug (root /pages):
 *   1. content/pages/index.md
 *   2. content/pages/index.mdx
 */
export function resolvePageFilePath(slug: string[]): string | null {
  const base = path.join(PAGES_DIR, ...slug)

  const candidates =
    slug.length === 0
      ? [path.join(PAGES_DIR, 'index.md'), path.join(PAGES_DIR, 'index.mdx')]
      : [
          `${base}.md`,
          `${base}.mdx`,
          path.join(base, 'index.md'),
          path.join(base, 'index.mdx'),
        ]

  return candidates.find((p) => fs.existsSync(p)) ?? null
}

// ─── Content Loading ──────────────────────────────────────────────────────────

/**
 * Reads frontmatter only — cheap, suitable for navigation and listing.
 * Returns null if the page cannot be found on disk.
 */
export function getPageMeta(slug: string[]): PageMeta | null {
  const filePath = resolvePageFilePath(slug)
  if (!filePath) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(raw)
  const frontmatter = data as PageFrontmatter
  const href = slug.length === 0 ? '/pages' : `/pages/${slug.join('/')}`

  return { slug, href, ...frontmatter }
}

/**
 * Reads full file including raw content for MDX rendering.
 * Returns null if the page cannot be found on disk.
 */
export function getPageContent(slug: string[]): PageContent | null {
  const filePath = resolvePageFilePath(slug)
  if (!filePath) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const frontmatter = data as PageFrontmatter
  const href = slug.length === 0 ? '/pages' : `/pages/${slug.join('/')}`

  return { slug, href, rawContent: content, ...frontmatter }
}

// ─── Static Params ────────────────────────────────────────────────────────────

/**
 * Recursively discovers all page files under content/pages/ and returns their
 * slug arrays.  Index files are returned as the parent directory's slug (e.g.
 * content/pages/nextjs/index.mdx → ['nextjs']).
 *
 * The root index (content/pages/index.mdx) → [] is excluded from the list
 * because [[...slug]] covers it via the undefined/empty segment automatically.
 */
export function getAllPageSlugs(): string[][] {
  if (!fs.existsSync(PAGES_DIR)) return []
  return collectSlugs(PAGES_DIR, [])
}

function collectSlugs(dir: string, parentSegments: string[]): string[][] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const slugs: string[][] = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // The directory itself is represented by its index file slug
      const dirSlug = [...parentSegments, entry.name]
      slugs.push(dirSlug)
      // Recurse into subdirectory to find non-index children
      const nested = collectSlugs(path.join(dir, entry.name), dirSlug)
      slugs.push(...nested)
    } else if (isContentFile(entry.name)) {
      const stem = stripExtension(entry.name)
      if (stem === 'index') {
        // Index files are represented by their parent directory's slug.
        // The root index (parentSegments === []) maps to [] which is the /pages
        // root — Next.js handles this via [[...slug]] with undefined params.
        if (parentSegments.length > 0) {
          // Already added by the directory entry above — skip to avoid duplicates
        }
      } else {
        slugs.push([...parentSegments, stem])
      }
    }
  }

  return slugs
}

// ─── Navigation Tree ─────────────────────────────────────────────────────────

/**
 * Builds a sorted navigation tree from the content/pages directory.
 * Directories become parent nodes; files become leaf nodes.
 * Sort order: `order` frontmatter field (ascending), then `title` alphabetically.
 */
export function buildNavTree(): NavNode[] {
  if (!fs.existsSync(PAGES_DIR)) return []
  return buildTreeFromDir(PAGES_DIR, [])
}

function buildTreeFromDir(dir: string, parentSegments: string[]): NavNode[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const nodes: NavNode[] = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const slug = [...parentSegments, entry.name]
      const meta = getPageMeta(slug) // reads index file of this dir
      if (!meta) continue

      const children = buildTreeFromDir(path.join(dir, entry.name), slug)
      nodes.push({
        title: meta.title ?? titleFromSegment(entry.name),
        href: meta.href,
        slug,
        order: meta.order ?? 999,
        description: meta.description,
        children,
      })
    } else if (isContentFile(entry.name)) {
      const stem = stripExtension(entry.name)
      if (stem === 'index') continue // sections are handled via their dir entry

      const slug = [...parentSegments, stem]
      const meta = getPageMeta(slug)
      if (!meta) continue

      nodes.push({
        title: meta.title ?? titleFromSegment(stem),
        href: meta.href,
        slug,
        order: meta.order ?? 999,
        description: meta.description,
        children: [],
      })
    }
  }

  return nodes.sort(compareNodes)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isContentFile(filename: string): boolean {
  return /\.(md|mdx)$/.test(filename)
}

function stripExtension(filename: string): string {
  return filename.replace(/\.(md|mdx)$/, '')
}

function titleFromSegment(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function compareNodes(a: NavNode, b: NavNode): number {
  if (a.order !== b.order) return a.order - b.order
  return a.title.localeCompare(b.title)
}
