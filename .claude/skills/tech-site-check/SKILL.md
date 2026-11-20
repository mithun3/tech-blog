---
name: tech-site-check
description: Pre-commit and pre-push verification for this Next.js site that matches the production CI - a bundled content lint (frontmatter fields and dates, broken internal links, sections missing index.mdx, MDX syntax that fails to compile, unregistered components), then npx tsc --noEmit, npm run lint and npm run build, reported with their output. Use when about to commit or push, after adding, moving or editing pages, after code changes in app, components or lib, or when asked to check the site builds, find broken links, or make sure nothing is broken.
metadata:
  scope: "local verification only; never pushes or deploys"
  sources: ".github/workflows/production.yml .github/workflows/preview.yml package.json lib/wiki.ts next.config.ts"
  verified: "2026-11-20"
---

# Site check

Run the checks in this order and stop at the first failing step: fix it, or report it.

## 1. Content check (seconds)

```bash
node .claude/skills/tech-site-check/scripts/check-content.mjs
```

It reads `content/` and `next.config.ts` and exits 1 on any error. It checks:

| Check | Why it matters |
|---|---|
| Wiki: `title` required; `description`, `publishedAt`, `order`, `status` expected | `lib/wiki.ts` types; every page sets them |
| Posts: `title`, `publishedAt`, `summary` required; `tags` a list | `lib/posts.ts` types, RSS and sitemap |
| Dates quoted as `"YYYY-MM-DD"`; `updatedAt` not before `publishedAt` | unquoted YAML dates become Date objects |
| Every directory in `content/pages` has an index | otherwise the section is dropped from the sidebar and 404s |
| Internal `/pages/...` and `/blog/...` links resolve | a link to a redirect source is a warning: link the destination |
| MDX syntax outside code: `<CTID>`, `<5ms`, `<!-- -->`, `<https://...>`, `<br>`, unregistered `<Component>` | each fails `@mdx-js/mdx` 3 compile |

Warnings do not fail the run. Report them, but do not fix ones the change did not cause.

## 2. Type check, lint, build (what production CI runs)

```bash
npx tsc --noEmit
npm run lint
npm run build
```

- `npm run build` statically renders every wiki page and post, so it is the step that catches MDX compile errors.
- Without `NEXT_PUBLIC_SITE_URL`, canonical and OG URLs fall back to `http://localhost:3000`. That is expected locally.
- Next.js 16 builds into `.next/` and runs dev from `.next/dev/`, so a running `npm run dev` can stay up.

## 3. Report

For each step give the command, pass or fail, and the relevant lines of output (the error, not the whole log). Keep errors this change introduced apart from ones that were already there. Give a pre-existing error's file and line and leave it unfixed unless asked.

## CI facts

- Push to `main` runs `production.yml` in one job: `npm ci`, `tsc --noEmit`, `npm run lint`, then `vercel build --prod` (which runs `next build`) and a production deploy.
- Push to any other branch runs `preview.yml`: the same checks, then `vercel build` and a preview deploy. Dependabot branches get no repository secrets, so they run `npm run build` and skip the deploy.
- CI takes the Node version from `package.json` `engines` (`22.x`) through `node-version-file`. The content check is not in CI; run it locally.

## Gotchas

- **"Builds fine" without output.** Paste the summary lines.
- **Lint passes but a mermaid diagram is broken.** Mermaid renders in the browser. Open the page in `npm run dev`.
- **Fixing every warning the script prints.** Fix only what the change caused; list the rest.
- **Content check passes, so the page is right.** It checks structure, not facts. Use tech-fact-check-page for claims.
