# poc to prod

A personal technical wiki and blog built with Next.js — covering software engineering, infrastructure, and building things from proof-of-concept to production.

No trackers. No ads. No fluff.

---

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 16.2.4 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 + `@tailwindcss/typography` |
| **MDX (wiki)** | `next-mdx-remote` v6 with `remark-gfm`, `rehype-pretty-code` (Shiki) |
| **MDX (blog)** | `@next/mdx` via unified pipeline |
| **Themes** | `next-themes` — light/dark with system default |
| **Frontmatter** | `gray-matter` |
| **Package manager** | npm |

---

## Project Structure

```
app/
├── layout.tsx                  # Root layout — global metadata, sidebar
├── (main)/
│   ├── layout.tsx              # Main content layout
│   ├── page.tsx                # Home / landing page
│   ├── blog/
│   │   └── [slug]/
│   │       ├── page.tsx        # Blog post page
│   │       └── opengraph-image.tsx  # Dynamic OG image
│   ├── robots.ts               # robots.txt
│   ├── sitemap.ts              # sitemap.xml
│   └── rss.xml/route.ts        # RSS feed
└── pages/
    └── [[...slug]]/page.tsx    # Wiki — all /pages/* routes

components/
├── app-sidebar.tsx             # Sidebar (server component — builds nav tree)
├── app-sidebar-nav.tsx         # Sidebar (client — interactive expand/collapse)
├── theme-toggle.tsx
└── mdx/
    ├── callout.tsx
    ├── video.tsx
    └── audio.tsx

content/
├── pages/                      # Wiki content (.md / .mdx)
│   ├── index.mdx               →  /pages
│   ├── about.mdx               →  /pages/about
│   ├── contact.mdx             →  /pages/contact
│   ├── faq.mdx                 →  /pages/faq
│   ├── privacy.mdx             →  /pages/privacy
│   ├── terms.mdx               →  /pages/terms
│   └── networking/
│       ├── index.mdx           →  /pages/networking
│       ├── basics.mdx          →  /pages/networking/basics
│       ├── homelab-architecture.mdx
│       └── router-firmware.mdx

lib/
├── wiki.ts                     # Wiki data — file resolution, nav tree, metadata
└── posts.ts                    # Blog data — unified MDX pipeline
```

---

## Routes

| Route | Description |
|---|---|
| `/` | Home — hero + topics grid |
| `/blog/[slug]` | Individual blog post |
| `/pages` | Wiki index |
| `/pages/[...path]` | Any wiki page (unlimited nesting) |
| `/sitemap.xml` | Auto-generated sitemap |
| `/robots.txt` | Robots directives |
| `/rss.xml` | RSS feed (blog posts) |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # serve production build
npm run lint    # ESLint
```

---

## Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, OG tags, sitemap | `http://localhost:3000` |

Set this in Vercel project settings (or `.env.local` locally) before deploying:

```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

Without it, all canonical URLs, OG metadata, and sitemap entries will point to `localhost`.

---

## Adding Content

### Wiki page

Drop any `.mdx` (or `.md`) file into `content/pages/`. No routing, sidebar, or sitemap config needed — it's all automatic.

```md
---
title: "My Page"
description: "What this page covers."
order: 2
publishedAt: "2026-05-03"
---

# My Page

Content here.
```

See [WIKI.md](WIKI.md) for the full content guide — sections, nesting, frontmatter reference, and custom components.

### Blog post

Add a `.md` file to `content/posts/`:

```md
---
title: "Post Title"
summary: "Short description."
publishedAt: "2026-05-03"
tags: ["nextjs", "typescript"]
---

# Post Title

Content here.
```

---

## SEO

- **Metadata cascade**: global `openGraph`, `twitter`, `robots` in root `layout.tsx`; per-page `title`, `description`, and `alternates.canonical` in each `generateMetadata`
- **JSON-LD**: `BlogPosting` schema on every blog post; `WebSite` schema on the home page
- **Dynamic OG images**: `opengraph-image.tsx` co-located with the blog `[slug]` route — generates a 1200×630 dark card per post via `next/og`
- **Sitemap**: `/sitemap.xml` covers home, all blog posts (priority 0.7), and all wiki pages (priority 0.6)
- **RSS**: `/rss.xml` — valid RSS 2.0 feed for blog posts

---

## Deployment

Deployed on [Vercel](https://vercel.com). Push to `main` triggers a production deployment.

1. Set `NEXT_PUBLIC_SITE_URL` in Vercel environment variables
2. `npm run build` — verify no build errors locally before pushing
