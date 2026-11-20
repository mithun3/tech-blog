#!/usr/bin/env node
// Content lint for content/pages, content/posts and content/site. Run from the repo root:
//   node .claude/skills/tech-site-check/scripts/check-content.mjs
// Exit 1 on any error; warnings do not fail. Uses gray-matter from the project, like lib/wiki.ts.
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const ROOT = process.cwd()
const CONTENT = path.join(ROOT, 'content')
const PAGES = path.join(CONTENT, 'pages')
const POSTS = path.join(CONTENT, 'posts')
const NEXT_CONFIG = path.join(ROOT, 'next.config.ts')

if (!fs.existsSync(PAGES)) {
  console.error('content/pages not found: run this from the repo root')
  process.exit(2)
}

// Keep in sync with the mdxComponents map in app/pages/[[...slug]]/page.tsx.
const MDX_COMPONENTS = new Set(['Callout', 'Video', 'Audio', 'Mermaid'])
const STATUSES = new Set(['published', 'draft', 'archived'])
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const errors = []
const warnings = []
const rel = (p) => path.relative(ROOT, p)
const where = (file, line) => `${rel(file)}${line ? `:${line}` : ''}`
const err = (file, line, msg) => errors.push(`ERROR ${where(file, line)}: ${msg}`)
const warn = (file, line, msg) => warnings.push(`warn  ${where(file, line)}: ${msg}`)

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return walk(p)
    return /\.mdx?$/.test(e.name) ? [p] : []
  })
}

// ─── Link targets ─────────────────────────────────────────────────────────────

// Same candidates, same order, as resolvePageFilePath in lib/wiki.ts.
function pageExists(url) {
  const slug = url.replace(/^\/pages\/?/, '').replace(/\/$/, '')
  const base = path.join(PAGES, slug)
  const candidates = slug === ''
    ? [path.join(PAGES, 'index.md'), path.join(PAGES, 'index.mdx')]
    : [`${base}.md`, `${base}.mdx`, path.join(base, 'index.md'), path.join(base, 'index.mdx')]
  return candidates.some((c) => fs.existsSync(c))
}

function postExists(url) {
  const slug = url.replace(/^\/blog\/?/, '').replace(/\/$/, '')
  return slug === '' || ['.md', '.mdx'].some((ext) => fs.existsSync(path.join(POSTS, slug + ext)))
}

// Redirect sources are read from the string literals in next.config.ts redirects().
const redirectSources = fs.existsSync(NEXT_CONFIG)
  ? [...fs.readFileSync(NEXT_CONFIG, 'utf8').matchAll(/source:\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
  : []

function isRedirected(url) {
  return redirectSources.some((src) => {
    if (src.endsWith('/:path*')) {
      const prefix = src.slice(0, -'/:path*'.length)
      return url === prefix || url.startsWith(`${prefix}/`)
    }
    return url === src
  })
}

function checkLink(file, line, raw) {
  const url = raw.split(/[#?]/)[0]
  const exists = url.startsWith('/pages') ? pageExists(url) : postExists(url)
  if (exists) return
  if (isRedirected(url)) warn(file, line, `link ${url} goes through a redirect; link the destination directly`)
  else err(file, line, `broken internal link ${url}`)
}

// ─── MDX hazards (each pattern verified to fail @mdx-js/mdx 3 compile) ────────

const HAZARDS = [
  [/<!--/, 'HTML comment: MDX needs {/* ... */}'],
  [/<[a-z][a-z0-9+.-]*:\/\//i, 'autolink <https://...>: use [text](url)'],
  [/<(?:br|hr|img)\b[^>]*(?<!\/)>/i, 'void tag needs a self-closing slash, e.g. <br />'],
  [/<(?![\sA-Za-z/!])/, "'<' followed by a digit or symbol (e.g. <5ms, <=, <-): write &lt; or put it in backticks"],
  [/<[A-Z][A-Z0-9_]+(?:\s[^>]*)?>/, 'placeholder like <CTID> is parsed as JSX: wrap it in backticks'],
  [/<[a-z][a-z0-9]*[-_][a-z0-9_-]*>/, 'placeholder like <your-ip> is parsed as JSX: wrap it in backticks'],
]

function checkMdxLine(file, lineNo, text) {
  for (const [re, msg] of HAZARDS) {
    if (re.test(text)) err(file, lineNo, msg)
  }
  for (const m of text.matchAll(/<([A-Z][a-z][A-Za-z0-9]*)\b/g)) {
    if (!MDX_COMPONENTS.has(m[1])) err(file, lineNo, `<${m[1]}> is not a registered MDX component`)
  }
}

// ─── Body scan: skips frontmatter, fenced code (also inside > quotes) and inline code ──

function scanBody(file, raw, { mdx }) {
  const lines = raw.split('\n')
  let i = 0
  if (lines[0]?.trim() === '---') {
    i = 1
    while (i < lines.length && lines[i].trim() !== '---') i++
    i++
  }
  let fence = null
  for (; i < lines.length; i++) {
    const lineNo = i + 1
    const stripped = lines[i].replace(/^(\s*>)*\s*/, '')
    const marker = stripped.match(/^(`{3,}|~{3,})/)
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null
      continue
    }
    if (marker) {
      fence = marker[1]
      continue
    }
    const text = lines[i].replace(/(`+)[\s\S]*?\1/g, '``')
    for (const m of text.matchAll(/\]\((\/(?:pages|blog)(?:[/?#][^)\s]*)?)[)\s]/g)) checkLink(file, lineNo, m[1])
    for (const m of text.matchAll(/href=["'](\/(?:pages|blog)(?:[/?#][^"']*)?)["']/g)) checkLink(file, lineNo, m[1])
    if (mdx) checkMdxLine(file, lineNo, text)
  }
}

// ─── Frontmatter ─────────────────────────────────────────────────────────────

function checkDate(file, fm, key, required) {
  const v = fm[key]
  if (v === undefined) {
    if (required) err(file, 0, `${key} is required`)
    return
  }
  if (v instanceof Date) err(file, 0, `${key} is an unquoted date; write it as "YYYY-MM-DD" so it stays a string`)
  else if (typeof v !== 'string' || !DATE_RE.test(v) || Number.isNaN(Date.parse(v))) err(file, 0, `${key} must be "YYYY-MM-DD", got ${JSON.stringify(v)}`)
}

function checkDateOrder(file, fm) {
  if (typeof fm.publishedAt === 'string' && typeof fm.updatedAt === 'string' && fm.updatedAt < fm.publishedAt) {
    err(file, 0, `updatedAt ${fm.updatedAt} is before publishedAt ${fm.publishedAt}`)
  }
}

function checkPage(file, fm) {
  if (typeof fm.title !== 'string' || !fm.title.trim()) err(file, 0, 'title is required')
  for (const key of ['description', 'order', 'status']) {
    if (fm[key] === undefined) warn(file, 0, `${key} is missing (every other page sets it)`)
  }
  checkDate(file, fm, 'publishedAt', false)
  if (fm.publishedAt === undefined) warn(file, 0, 'publishedAt is missing (every other page sets it)')
  checkDate(file, fm, 'updatedAt', false)
  checkDateOrder(file, fm)
  if (fm.order !== undefined && typeof fm.order !== 'number') err(file, 0, `order must be a number, got ${JSON.stringify(fm.order)}`)
  if (fm.status !== undefined && !STATUSES.has(fm.status)) err(file, 0, `status must be published, draft or archived, got ${JSON.stringify(fm.status)}`)
  if (fm.keywords !== undefined && typeof fm.keywords !== 'string' && !Array.isArray(fm.keywords)) err(file, 0, 'keywords must be a list or a comma-separated string')
}

function checkPost(file, fm) {
  if (typeof fm.title !== 'string' || !fm.title.trim()) err(file, 0, 'title is required')
  if (typeof fm.summary !== 'string' || !fm.summary.trim()) err(file, 0, 'summary is required')
  checkDate(file, fm, 'publishedAt', true)
  checkDate(file, fm, 'updatedAt', false)
  checkDateOrder(file, fm)
  if (fm.tags !== undefined && (!Array.isArray(fm.tags) || !fm.tags.every((t) => typeof t === 'string'))) err(file, 0, 'tags must be a list of strings')
}

// ─── Run ─────────────────────────────────────────────────────────────────────

// A directory without an index file is dropped from the sidebar (buildTreeFromDir) and its URL 404s.
for (const dir of fs.readdirSync(PAGES, { recursive: true, withFileTypes: true })) {
  if (!dir.isDirectory()) continue
  const full = path.join(dir.parentPath ?? dir.path, dir.name)
  if (!['index.md', 'index.mdx'].some((f) => fs.existsSync(path.join(full, f)))) {
    err(full, 0, 'section has no index.mdx: it and its pages are hidden from the sidebar and its URL 404s')
  }
}

const files = walk(CONTENT)
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8')
  let fm
  try {
    fm = matter(raw).data
  } catch (e) {
    err(file, 0, `frontmatter does not parse: ${e.message.split('\n')[0]}`)
    continue
  }
  const inPages = file.startsWith(PAGES + path.sep)
  const inPosts = file.startsWith(POSTS + path.sep)
  if (inPages) checkPage(file, fm)
  if (inPosts) checkPost(file, fm)
  // Blog posts go through remark/rehype, not MDX, so the MDX hazards do not apply there.
  scanBody(file, raw, { mdx: !inPosts })
}

for (const line of [...errors, ...warnings]) console.log(line)
console.log(`\ncontent-check: ${files.length} files, ${errors.length} errors, ${warnings.length} warnings`)
process.exit(errors.length ? 1 : 0)
