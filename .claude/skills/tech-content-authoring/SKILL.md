---
name: tech-content-authoring
description: Conventions for writing and editing wiki pages in content/pages and blog posts in content/posts of this Next.js site - frontmatter fields and date rules, which renderer supports MDX components and mermaid, Callout types, MDX syntax that breaks the build, footnote citations, Related Topics and section index pages, and which section owns a cross-domain topic. Use when creating, editing, splitting or reviewing any .md or .mdx file under content, porting notes into the wiki, writing a blog post, or when a page fails to render or is missing from the sidebar.
metadata:
  scope: "authoring rules for content/pages, content/posts and content/site; WIKI.md is the long-form guide"
  sources: "WIKI.md lib/wiki.ts lib/posts.ts app/pages/[[...slug]]/page.tsx components/mdx/callout.tsx components/mdx/video.tsx components/mdx/audio.tsx"
  verified: "2026-11-20"
---

# Content authoring

WIKI.md is the full guide. This skill holds the rules and the failure modes. Field types live in code: `PageFrontmatter` in `lib/wiki.ts`, `PostFrontmatter` in `lib/posts.ts`.

## Wiki page or blog post

| | Wiki page | Blog post |
|---|---|---|
| File | `content/pages/<section>/.../<slug>.mdx` | `content/posts/<slug>.mdx` |
| URL | `/pages/<path>`; `index.mdx` is its directory's URL | `/blog/<slug>` |
| Renderer | MDX via `next-mdx-remote/rsc` (`app/pages/[[...slug]]/page.tsx`) | remark, rehype, HTML (`lib/posts.ts`): Markdown and GFM only |
| Components, mermaid | yes | no: JSX does not render, a mermaid fence stays a code block |
| Sort | `order`, then `title` | `publishedAt`, newest first |
| Listed in | sidebar, breadcrumbs, sitemap | blog index, RSS, sitemap |

Wiki = evergreen reference, organised by topic. Blog = a dated story (an upgrade, an RCA). When a post needs a procedure, the procedure lives in the wiki and the post links to it.

## Frontmatter

Wiki page. Every existing page sets all five of these:

```yaml
---
title: "Page Title"
description: "One sentence on what the reader gets; used for the page header, OG and search previews."
publishedAt: "2026-11-20"
order: 3
status: published
---
```

Optional: `updatedAt`, `keywords` (list or comma string), `author`.
Blog post: `title`, `publishedAt`, `summary` required; `updatedAt`, `tags` (list), `image` optional.

- Quote dates as `"YYYY-MM-DD"`. Unquoted, YAML turns them into Date objects.
- `publishedAt` is the original date. Never change it on a move, rename, split or formatting edit.
- Set `updatedAt` to today only for a substantive content change, never earlier than `publishedAt`.
- `order` sorts within the section (missing = 999, last). Read the siblings' values before choosing one.
- `status` is informational only. A `draft` page is built, listed and indexed like any other. Keep unfinished work on a branch.

## Page shape

- The body starts with `# <title>`, like every existing page and the WIKI.md template. The renderer drops that line and prints the frontmatter `title` as the page's only H1, so change `title` to change the visible heading.
- How-to pages open by linking the conceptual page that explains why.
- End with `## Related Topics`: internal links only.
- Every directory needs an `index.mdx`. Without one, the directory and all its pages vanish from the sidebar and its URL 404s.
- A section `index.mdx` lists every child in `## In This Section`, one line each. Add new pages there.

## Components (wiki only, no import)

- `<Callout type="info">`. Types: `info` (default), `warning`, `tip`, `danger`. Leave blank lines around Markdown inside it.
- `<Video src="..." title="..." poster="..." />`. YouTube and Vimeo URLs become privacy-friendly embeds; other URLs use `<video>`.
- `<Audio src="..." title="..." />`.
- `<LabSheet sheet="physical" focus="rb5009 crs310" caption="..." />`: a detail of the lab drawing set. `sheet` is `physical`, `logical` or `services`; `focus` is `sheet` or part ids from `public/lab/parts.json`, separated by spaces. Props are plain strings only: `next-mdx-remote` drops every `prop={...}` value without a message, so a missing `focus` fails the build on purpose.
- Mermaid: write a ` ```mermaid ` fence. A syntax error does not fail the build; it renders "Failed to parse diagram syntax.", so check it in `npm run dev`.
- Images: standard Markdown image syntax with the file under `public/` (path such as `/images/x.png`). Always write alt text.
- Links: internal as absolute `/pages/...`; external links open in a new tab automatically.

Check props in `components/mdx/*.tsx` before using anything else. A new component is a code change (tech-site-code skill).

## MDX syntax that breaks the build

Outside code, MDX treats `<` and `{` as JSX. Each of these fails to compile with `@mdx-js/mdx` 3, in `.md` wiki files too:

| Written | Write instead |
|---|---|
| `<CTID>`, `<your-ip>` placeholders | wrap in backticks: `` `<CTID>` `` |
| `<5ms`, `<=`, `<-`, `<>` | `&lt;5ms`, "under 5 ms", or backticks |
| `<!-- note -->` | `{/* note */}` |
| `<https://example.com>` | `[example.com](https://example.com)` |
| `<br>` | `<br />` |
| `{name}` in prose | `\{name\}` or backticks (it compiles, then fails when rendered) |
| `<SomeComponent>` that is not registered | only Callout, Video, Audio, Mermaid, LabSheet exist |

Code fences and inline code are safe, including fences inside `>` quotes. Blog posts are not MDX: raw HTML passes through there.

## Citations

The policy is WIKI.md "Citations And Sources". In short:

- Use footnotes `[^1]` for version-sensitive commands, numbers, comparisons and protocol behaviour. Put the definitions at the end of the page.
- Official and upstream docs come first. Use community sources only for tested data the docs lack.
- A claim with no strong source gets rewritten or removed, not given a weak citation.
- `Related Topics` is navigation and `Further Reading` is optional extras. Never use a "Resources" list as evidence.
- Use the tech-fact-check-page skill for a full pass.

## Where a topic belongs

| Reader question | Home |
|---|---|
| What is it, why does it matter? | domain section: `networking/`, `gpu-ai/`, `hardware/` |
| How do I run it on Proxmox? | `proxmox/` (`basics`, `setup`, `operations`, `workloads`) |
| How does it work in general? | `virtualization/` |

Each guide has one canonical page; other sections link to it. When porting notes, keep validated command blocks verbatim.

## Naming and moves

Use short kebab-case names; the file name is the slug. Renaming or moving a published page changes its URL, so use the tech-move-wiki-page skill.

## Verify

1. Run `node .claude/skills/tech-site-check/scripts/check-content.mjs`. It checks frontmatter, internal links, missing indexes and the syntax above.
2. Preview `npm run dev` at `/pages/<path>`, including mermaid diagrams.
3. Run `npm run build` before calling it done. MDX errors surface when a page renders.

## Gotchas

- **Filling `[XX]` or TBD values with plausible numbers.** Keep the placeholder; ask for measured data.
- **Changing `publishedAt` while reorganising.** It stays the original date.
- **Adding a page but not the section's `In This Section` list.** The sidebar updates itself; the index page does not.
- **Mermaid or a Callout in a blog post.** It renders as text or a code block; move it to a wiki page.
- **Copying a procedure into a second section.** Link to the canonical page instead.
