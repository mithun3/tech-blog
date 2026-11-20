# poc to prod: Next.js wiki and blog

Personal technical wiki (`content/pages`, served at `/pages/*`) and blog (`content/posts`, served at `/blog/*`). Built with Next.js 16 App Router, TypeScript, Tailwind v4 and MDX, statically generated and deployed on Vercel. The content guide is [WIKI.md](WIKI.md). Routes, SEO and stack are in [README.md](README.md). Where those docs and the code disagree, the code wins.

## Commands

- `npm run dev`: local server on port 3000.
- `node .claude/skills/tech-site-check/scripts/check-content.mjs`: content lint (frontmatter, internal links, section indexes, MDX syntax).
- `npx tsc --noEmit`, `npm run lint`, `npm run build`: the production CI checks, in that order.

## Invariants

1. A push to `main` deploys production; other branches deploy a preview. Do not push, merge or deploy unless asked.
2. A published URL never silently breaks. A moved or renamed page gets a permanent redirect in `next.config.ts`, and every internal link to it is updated.
3. `publishedAt` is the original date and never changes. `updatedAt` marks a substantive revision only.
4. Wiki pages are MDX (components, mermaid). Blog posts are plain Markdown and GFM only.
5. Each topic has one canonical page. Cross-link; do not copy procedures between sections.
6. Never invent commands, versions, URLs or benchmark numbers. Cite primary sources as footnotes (WIKI.md "Citations And Sources").
7. `.env*` is gitignored. Never print or commit it, and never put a secret in a `NEXT_PUBLIC_*` variable.

## Skills

Project skills live in `.claude/skills/`. Claude Code and GitHub Copilot both load them by description, or you can run one with `/name`.

| Need | Skill |
|---|---|
| Any change: read first, verify facts, minimal diff, show evidence | `tech-working-discipline` |
| Write or edit a wiki page or blog post | `tech-content-authoring` |
| Move, rename, split, merge or delete pages | `tech-move-wiki-page` |
| Fact-check a page and add citations | `tech-fact-check-page` |
| Code in `app/`, `components/`, `lib/`, config | `tech-site-code` |
| Verify before commit or push | `tech-site-check` |
