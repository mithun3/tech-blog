---
name: tech-site-code
description: Architecture map and rules for code changes in this Next.js 16 App Router site - the Markdown render paths (wiki and home intro MDX via next-mdx-remote, blog via unified), where an MDX component must be registered, metadata, JSON-LD and OG image conventions, site constants in lib/site.ts, server versus client components, redirects, security headers and theming. Use when editing files under app, components or lib or next.config.ts, adding an MDX component, changing SEO metadata, the sitemap, RSS or OG images, or fixing a TypeScript, lint or build error.
metadata:
  scope: "app/, components/, lib/, next.config.ts, app/globals.css"
  sources: "app/layout.tsx app/pages/[[...slug]]/page.tsx app/(main)/page.tsx app/(main)/blog/[slug]/page.tsx app/(main)/sitemap.ts app/(main)/rss.xml/route.ts app/og/route.tsx lib/wiki.ts lib/posts.ts lib/site.ts next.config.ts components/providers.tsx app/globals.css package.json"
  verified: "2026-11-20"
---

# Site code

Next.js 16.4 App Router with React 19, TypeScript strict and Tailwind v4, statically generated and deployed on Vercel. Check versions in `package.json` before relying on an API.

## Map

| Concern | File |
|---|---|
| Wiki data: resolve file, nav tree, slugs | `lib/wiki.ts` |
| Wiki page: MDX render, metadata, JSON-LD | `app/pages/[[...slug]]/page.tsx` |
| Breadcrumb | `components/wiki/breadcrumb.tsx` |
| Sidebar (every page, from the root layout) | `components/app-sidebar.tsx` (server), `components/app-sidebar-nav.tsx` (client) |
| Blog data and Markdown to HTML | `lib/posts.ts` |
| Blog routes | `app/(main)/blog/` |
| Home, topic grid, intro | `app/(main)/page.tsx`, `content/site/home-intro.mdx` read by `lib/site-content.ts` |
| OG image for every page (`?title&description&category`, Node.js runtime) | `app/og/route.tsx`; build its URL with `ogImageUrl()` |
| Site URL, name, description, "More" links, `formatDate` | `lib/site.ts` |
| Sitemap, robots, RSS | `app/(main)/sitemap.ts`, `app/robots.ts` (must stay at the app root), `app/(main)/rss.xml/route.ts` (`force-static`) |
| MDX components | `components/mdx/*` |
| Comments (Giscus, pathname mapping, env IDs) | `components/comments.tsx` |
| Global metadata, `metadataBase`, theme provider | `app/layout.tsx`, `components/providers.tsx` |
| Redirects, security headers (CSP in Report-Only) | `next.config.ts` |

## Render paths

| Content | Pipeline | Components map |
|---|---|---|
| Wiki `content/pages` | `MDXRemote` from `next-mdx-remote/rsc`, with `remarkDropTitleHeading` (drops the body's leading `# Title`), `remarkMermaid` and `remarkGfm`, then slug, autolink and pretty-code rehype plugins | `mdxComponents` in `app/pages/[[...slug]]/page.tsx` |
| Home intro `content/site/*.mdx` | `MDXRemote`, source from `getSiteSnippet()` in `lib/site-content.ts` | none: plain prose |
| Blog `content/posts` | unified: remark-parse, remark-gfm, remark-rehype, rehype plugins, then stringified HTML | none: plain HTML via `dangerouslySetInnerHTML` |

- **Adding an MDX component:** create it in `components/mdx/`. Register it in `mdxComponents` in the wiki page. Add it to `MDX_COMPONENTS` in `.claude/skills/tech-site-check/scripts/check-content.mjs`. Document it in WIKI.md "Custom Components" and the tech-content-authoring skill. Blog posts cannot use it.
- **Code highlighting config** (`rehype-pretty-code`, themes `github-dark-dimmed` and `github-light`, `keepBackground: false`) is duplicated in `lib/posts.ts` and the wiki page. Change both.
- **Changing slug resolution** in `lib/wiki.ts` changes every URL. Treat it as a move (tech-move-wiki-page skill).

## Rules

- `params` is a Promise in Next 16: `const { slug = [] } = await params` in pages and `generateMetadata`. Every dynamic route has `generateStaticParams` and `dynamicParams = false`, so any other URL 404s.
- Server components by default. Add `'use client'` only for hooks or browser APIs. Today's client components: mermaid, comments, theme-toggle, providers, app-sidebar-nav.
- `lib/wiki.ts` and `lib/posts.ts` use `fs`. Import them only from server components and route handlers, never from a client component.
- Site URL, name and description come from `lib/site.ts` (`SITE_URL` reads `NEXT_PUBLIC_SITE_URL`, falling back to `http://localhost:3000`). Import them; never hard-code the domain. Keep `lib/site.ts` free of `fs`: client components and the OG route import it.
- Metadata per page: `title`, `description`, `alternates.canonical`, `openGraph` (article, 1200x630 image from `ogImageUrl()`), and `twitter` (`summary_large_image`). Metadata merges shallowly: a page that sets `openGraph` replaces the root layout's whole `openGraph`, so set `url` and `images` too, and a page with no `alternates` inherits the root canonical `/`. JSON-LD: TechArticle and BreadcrumbList on wiki pages, BlogPosting on posts, WebSite on home. Escape any JSON-LD with `.replace(/</g, '\\u003c')`, as the existing scripts do.
- Mermaid is imported on demand inside the component's effect, so pages without a diagram do not load it. It runs with `securityLevel: 'strict'`, which keeps Mermaid's DOMPurify pass on the SVG it injects. The content uses no `click` directives; `loose` would turn that pass off.
- `NEXT_PUBLIC_*` values are inlined into the client bundle. Never put a secret there.
- Theming: next-themes with `attribute="class"`. Tailwind's `dark:` variant is class-based through `@variant dark (&:is(.dark *))` in `app/globals.css`. Use zinc tones plus `dark:` variants like the existing components.
- `next.config.ts` has no `images` config, and Markdown images render as a plain `<img>`, so put image files under `public/`. Keep `turbopack.root` as it is.
- A new third-party script, stylesheet, frame or image host must be added to the CSP in `next.config.ts`. The CSP is Report-Only for now; check the browser console for violations.

## Verify

Run the tech-site-check skill: content check, `npx tsc --noEmit`, `npm run lint`, `npm run build`. For SEO changes, also run `npm run build && npm run start`, then `curl -s localhost:3000/sitemap.xml | head` and check the page source for canonical and `og:` tags.

## Gotchas

- **Component not registered in `mdxComponents`.** Wiki pages throw "Expected component ... to be defined".
- **Moving `robots.ts` into a route group.** Next only serves it from the root of `app/`; anywhere else `/robots.txt` 404s.
- **Expecting `status: draft` to hide a page.** Nothing reads `status`. Hiding pages needs changes to `getAllPageSlugs`, `buildNavTree` and the sitemap. Ask first.
- **Adding `eslint-disable` or `any` to pass lint.** The existing six are two for untyped mdast nodes in `remarkMermaid`, three `react-hooks/set-state-in-effect` (sidebar, theme toggle) and one `react-hooks/exhaustive-deps` (comments). Fix new cases properly.
- **Pretty-code or plugin changes made in one pipeline only.** Wiki and blog drift apart; change both.
