---
title: "Building a Blog with Next.js 15 and MDX"
publishedAt: "2026-05-03"
summary: "A deep dive into setting up a personal blog with Next.js 15 App Router, MDX, Tailwind CSS, and syntax highlighting via Shiki — covering the full content pipeline from markdown to rendered page."
tags: [nextjs, mdx, tailwindcss, tutorial]
---

# Building a Blog with Next.js 15 and MDX

Next.js 15 ships with a powerful App Router, first-class MDX support, and Turbopack for fast local development. In this post I'll walk through every piece of the setup I used for this blog.

## Why Next.js for a blog?

Static generation means zero server cost and instant load times. The App Router makes it trivial to split concerns — a `[slug]` page handles rendering, `lib/posts.ts` handles data, and `mdx-components.tsx` handles custom rendering.

## The content pipeline

Every post is a `.md` or `.mdx` file in `content/posts/` with YAML frontmatter:

```yaml
---
title: "Post title"
publishedAt: "2026-05-03"
summary: "A short description for cards and OG tags."
tags: [nextjs, tutorial]
---
```

The `lib/posts.ts` module handles two distinct operations:

- **`getAllPostsMeta()`** — reads only frontmatter (fast, used for listings)
- **`getPostBySlug()`** — processes the full markdown through a `unified` pipeline to HTML

## The unified processing pipeline

```
Markdown source
  → remark-parse        (parse to mdast)
  → remark-gfm          (GitHub Flavored Markdown: tables, checkboxes, strikethrough)
  → remark-rehype       (convert to hast)
  → rehype-slug         (add IDs to headings)
  → rehype-autolink-headings  (wrap headings in anchor links)
  → rehype-pretty-code  (syntax highlighting via Shiki)
  → rehype-stringify    (serialise to HTML string)
```

The final HTML is rendered with `dangerouslySetInnerHTML` inside a `prose prose-zinc` Tailwind container for automatic typography styling.

## Static generation

`generateStaticParams()` calls `getAllPostsMeta()` at build time and returns every slug. Next.js pre-renders each post to static HTML — no runtime server needed.

```tsx
export async function generateStaticParams() {
  return getAllPostsMeta().map((post) => ({ slug: post.slug }))
}
```

## Syntax highlighting

`rehype-pretty-code` wraps Shiki and supports dual themes for light/dark mode:

```ts
rehypePrettyCode({
  theme: { dark: 'github-dark-dimmed', light: 'github-light' },
  keepBackground: false,
})
```

`keepBackground: false` lets Tailwind handle the code block background via `prose-pre` overrides.
