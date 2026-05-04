import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

export type PostFrontmatter = {
  title: string
  publishedAt: string
  updatedAt?: string
  summary: string
  tags?: string[]
  image?: string
}

export type PostMeta = PostFrontmatter & {
  slug: string
  readingTime: string
}

export type Post = PostMeta & {
  htmlContent: string
}

async function markdownToHtml(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypePrettyCode, {
      theme: { dark: 'github-dark-dimmed', light: 'github-light' },
      keepBackground: false,
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)
  return String(result)
}

function getPostFiles(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs.readdirSync(POSTS_DIR).filter((f) => /\.(md|mdx)$/.test(f))
}

function parsePostFile(filename: string) {
  const slug = filename.replace(/\.(md|mdx)$/, '')
  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf-8')
  const { data, content } = matter(raw)
  const stats = readingTime(content)
  return { slug, frontmatter: data as PostFrontmatter, rawContent: content, stats }
}

/** Fast: only reads frontmatter — use for index/listing pages */
export function getAllPostsMeta(): PostMeta[] {
  return getPostFiles()
    .map((filename) => {
      const { slug, frontmatter, stats } = parsePostFile(filename)
      return { slug, readingTime: stats.text, ...frontmatter }
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

/** Full: processes markdown to HTML — use per-post page */
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const filename = getPostFiles().find((f) => f.replace(/\.(md|mdx)$/, '') === slug)
  if (!filename) return undefined
  const { frontmatter, rawContent, stats } = parsePostFile(filename)
  const htmlContent = await markdownToHtml(rawContent)
  return { slug, readingTime: stats.text, htmlContent, ...frontmatter }
}
