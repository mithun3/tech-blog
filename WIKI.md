# Wiki System — Content Guide

This site has a `/pages` section that works as a personal wiki — a structured, nested knowledge base separate from the time-ordered `/blog`. This document explains how the system works and how to add or extend content.

---

## How It Works

Content files in `content/pages/` drive everything automatically. There is no manual navigation config, no route registration, and no sitemap editing needed.

| When you add a file | The system automatically provides |
|---------------------|----------------------------------|
| A new `.mdx` file | A public route at `/pages/...` |
| A directory with `index.mdx` | A collapsible sidebar section |
| `title` frontmatter | Sidebar label, breadcrumb text, page `<title>`, OG tags |
| `order` frontmatter | Sort position within the sidebar section |
| Any page | A sitemap entry at `/sitemap.xml` |
| Any page | Pre-rendered static HTML at build time |

---

## Directory Structure

```
content/pages/
├── index.mdx                       →  /pages
├── networking/
│   ├── index.mdx                   →  /pages/networking
│   ├── basics.mdx                  →  /pages/networking/basics
│   └── homelab-architecture.mdx    →  /pages/networking/homelab-architecture
└── another-section/
    ├── index.mdx                   →  /pages/another-section
    └── sub-page.mdx                →  /pages/another-section/sub-page
```

**Rule:** URL = `/pages/` + file path, minus the extension.
**Rule:** `index.mdx` files represent the parent directory's URL, not a separate page.

---

## Creating a New Section

A section is a directory with an `index.mdx` inside it.

```bash
mkdir -p content/pages/my-section
```

**`content/pages/my-section/index.mdx`**

```md
---
title: "My Section"
description: "A short summary shown below the title and in search previews."
order: 3
publishedAt: "2026-05-03"
status: published
---

# My Section

Overview content here. Link to child pages with standard Markdown links:
[First Page](/pages/my-section/first-page)
```

The sidebar will show "My Section" as a collapsible parent node. `order: 3` places it third in the sidebar (after sections with `order: 1` and `order: 2`).

---

## Creating a Subpage

Add any `.md` or `.mdx` file alongside the section's `index.mdx`:

```bash
touch content/pages/my-section/my-page.mdx
```

**`content/pages/my-section/my-page.mdx`**

```md
---
title: "My Page"
description: "What this page covers."
order: 1
publishedAt: "2026-05-03"
status: published
---

# My Page

Full MDX content here — tables, code blocks, custom components.
```

Page is live at `/pages/my-section/my-page` with no other changes required.

The page header renders `title` as the page's H1, so the renderer drops the body's leading `# Heading`. Keep that line in the file for readability, and change `title` to change the visible heading.

---

## Frontmatter Reference

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `title` | string | ✅ | Sidebar label, page heading, breadcrumb, `<title>` tag, OG title |
| `description` | string | Recommended | Shown below the page heading and used for OG description |
| `order` | number | Recommended | Sidebar sort within a section — lower numbers appear first |
| `publishedAt` | ISO date string | Recommended | Original publication date, e.g. `"2023-01-09"` — shown in page header and preserved across later edits |
| `updatedAt` | ISO date string | No | Latest substantive revision date. Leave `publishedAt` unchanged and set this only when the content meaningfully changes; displayed as "Updated …" when different |
| `status` | `published` / `draft` / `archived` | No | Informational only — all files are rendered regardless |
| `keywords` | list or comma-separated string | No | Keywords in the page metadata and JSON-LD |
| `author` | string | No | Author name in the page metadata and JSON-LD; defaults to the site name |

Sidebar sort order: sorted by `order` ascending first, then alphabetically by `title` as a tiebreaker.

Preserve `publishedAt` as the original date even if you reorganize files, rename sections, or clean up metadata. Use `updatedAt` for real later revisions, not for moves or formatting-only changes.

---

## Both `.md` and `.mdx` Work

Both extensions are resolved automatically and both go through the MDX compiler, so components work in either and the same syntax rules apply. Use `.mdx` by default.

---

## Custom Components in MDX

These components are available in every `.mdx` page without importing:

```mdx
<Callout type="info">
  This is a highlighted callout block.
</Callout>

<Video src="/videos/demo.mp4" />

<Audio src="/audio/clip.mp3" />
```

- `Callout` types: `info` (default), `warning`, `tip`, `danger`.
- `Video` and `Audio` take an optional `title`.
- Diagrams: write a `mermaid` code fence. It renders in the browser, so check it in `npm run dev`.

## Citations And Sources

Use Markdown footnotes for external citations in wiki pages.

```md
NVIDIA documents this behavior directly.[^1]

[^1]: [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html)
```

Use citations for:

- version-sensitive commands, downloads, and package guidance
- performance numbers, sizing guidance, and hardware tradeoff claims
- product comparisons and platform-behavior claims that depend on upstream documentation
- standards or protocol behavior when the page makes a concrete factual statement

Source order matters:

- prefer official vendor docs, upstream project docs, standards bodies, and maintainer documentation first
- use community benchmarks, blog posts, or forum threads only when they add tested operational data or fill a gap the canonical docs do not cover
- if a claim cannot be supported by a strong source, rewrite or remove it instead of adding a weak citation

Keep navigation separate from citations:

- `Related Topics` is for internal wiki links and reader navigation
- do not use a trailing `Resources` or `Research References` section when those links are actually supporting claims in the page body; convert them into footnotes instead
- keep a short `Further Reading` section only for optional supplemental material that is not being used as evidence

If you materially revise a page while updating sources, keep `publishedAt` unchanged and update `updatedAt`.

---

## File Naming Conventions

- **Use `kebab-case`** for all file and directory names
- **Keep names short**: prefer `basics` over `networking-fundamentals-complete-guide`
- **Directory name = section slug**: `networking/` → `/pages/networking`
- **File name = page slug**: `router-firmware.mdx` → `/pages/networking/router-firmware`

## Content Ownership For Cross-Domain Topics

Some subjects naturally span more than one section.

Pi-hole is a networking topic, but "how do I run it in an LXC on Proxmox?" is a Proxmox topic.

GPU passthrough is tied to GPU and AI workloads, but the actual host and guest procedure is still a Proxmox guide.

The right answer in this wiki is not duplication. It is one canonical page plus deliberate cross-links.

### Use This Rule

| Reader question | Canonical home | Example |
|-----------------|----------------|---------|
| What is this? Why does it matter? | The domain section | DNS concepts in `networking/`, GPU ideas in `gpu-ai/` |
| How do I run this on Proxmox? | The Proxmox section | Pi-hole on LXC, GPU passthrough, service deployment runbooks |
| How does this work in general? | The conceptual section | VM/LXC theory in `virtualization/` |

### Practical Rules

- Keep one source of truth for a guide. Do not copy the same procedure into multiple sections.
- Use landing pages to surface related content from other sections.
- Use the opening of a how-to page to link back to the conceptual page that explains why the guide exists.
- Preserve command blocks and validated procedural content exactly when porting older notes into the wiki.

### Proxmox Section Shape

Use these subsection boundaries when adding Proxmox content:

- `proxmox/basics/` — conceptual platform sequence
- `proxmox/setup/` — host bring-up and installation
- `proxmox/operations/` — storage, backups, updates, notifications, troubleshooting
- `proxmox/workloads/` — LXC/VM deployments, passthrough, and Proxmox-specific workload guides

---

## Nesting Beyond Two Levels

The system supports unlimited depth — just add subdirectories:

```
content/pages/
└── networking/
    ├── index.mdx              →  /pages/networking
    ├── basics.mdx             →  /pages/networking/basics
    └── proxmox/
        ├── index.mdx          →  /pages/networking/proxmox
        └── containers.mdx     →  /pages/networking/proxmox/containers
```

Each level of nesting adds a child group in the sidebar and a new breadcrumb segment.

---

## What Gets Generated Automatically

When you add or update content files, the following happen **without any code changes**:

- ✅ Public route at `/pages/{path}`
- ✅ Sidebar entry in the correct section, sorted by `order`
- ✅ Breadcrumb trail showing all ancestor segments with their titles
- ✅ Static HTML pre-rendered at build time (`generateStaticParams` in `app/pages/[[...slug]]/page.tsx`)
- ✅ Sitemap entry in `/sitemap.xml` (`priority: 0.7`, `changeFrequency: monthly`)
- ✅ Page `<title>` and OpenGraph meta tags from `title` + `description` frontmatter
- ✅ Syntax-highlighted code blocks (Shiki, `github-dark-dimmed` / `github-light` themes)

---

## System Files Reference

You should not need to edit these for content work. Listed for completeness:

| File | Purpose |
|------|---------|
| `lib/wiki.ts` | All data layer logic — file resolution, nav tree builder, type definitions |
| `app/pages/layout.tsx` | Content container (max width and padding); the sidebar comes from the root layout |
| `app/pages/[[...slug]]/page.tsx` | Catch-all page renderer using `next-mdx-remote`; drops the body's leading `# Heading` |
| `components/app-sidebar.tsx` | Server Component — reads nav tree from filesystem at build time |
| `components/app-sidebar-nav.tsx` | Client Component — handles active highlighting and expand/collapse |
| `components/wiki/breadcrumb.tsx` | Server Component — resolves page titles per breadcrumb segment |
