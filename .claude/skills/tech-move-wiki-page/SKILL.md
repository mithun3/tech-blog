---
name: tech-move-wiki-page
description: Runbook for moving, renaming, splitting or merging wiki pages under content/pages without breaking published URLs - git mv, a permanent redirect in next.config.ts, updating every internal link and section index, keeping publishedAt, and checking that no link is left broken. Use when reorganising a wiki section, renaming a page or directory, changing a slug, splitting one page into several, merging pages, or deleting a published page.
argument-hint: "[old path] [new path]"
metadata:
  scope: "URL-changing edits to content/pages; next.config.ts redirects"
  sources: "next.config.ts lib/wiki.ts components/comments.tsx WIKI.md"
  verified: "2026-11-20"
---

# Move, rename, split or merge a wiki page

A wiki URL is `/pages/` plus the file path minus the extension. Any change to the path changes a published URL. External links, search results and the page's comment thread all point at the old one.

## 1. Plan

1. Write the mapping: each old URL goes to its new URL. For a split, pick the one page the old URL redirects to. For a merge or delete, pick the page that best replaces it.
2. Find every inbound link (internal links are absolute, so a plain grep finds them):
   ```bash
   grep -rn "/pages/<old-path>" content app components lib README.md WIKI.md
   ```
   Include child URLs when moving a directory.
3. Read the `redirects()` list in `next.config.ts` for entries whose `destination` is an old URL. These must be repointed so no redirect chains through another.
4. Show the mapping and the list of files to touch before editing.

## 2. Move

1. Use `git mv` for each file, so history follows. Move a directory's `index.mdx` with it.
2. Keep `publishedAt` unchanged. Do not set `updatedAt` for a pure move. For a split, every new page keeps the original `publishedAt`. For a merge, keep the earliest.
3. Check `order` against the new siblings.

## 3. Redirect

Add a permanent redirect for every old URL in `redirects()` in `next.config.ts`, following the existing entries:

```ts
{
  source: '/pages/old/path',
  destination: '/pages/new/path',
  permanent: true,
},
```

- For a whole directory, also add the `:path*` form, like the existing `/pages/virtualization/proxmox/:path*` entry.
- Repoint older redirects that targeted an old URL straight at the final URL.
- `permanent: true` sends a 308, which tells search engines to move the page's ranking to the new URL.

## 4. Update links and indexes

1. Change every inbound link from step 1.2 to the new URL. Do not rely on the redirect for internal links.
2. Update `## In This Section` in both the old and the new section's `index.mdx`, and `## Related Topics` lists that named the page.
3. A directory left without an `index.mdx` disappears from the sidebar. Delete the empty directory or give it an index.

## 5. Comments

`components/comments.tsx` maps Giscus threads by `pathname`, so a moved page starts with an empty thread. If the old page had comments, tell the user to rename that GitHub Discussion to match the new path. This is a manual step on GitHub; do not do it from here.

## 6. Verify

```bash
node .claude/skills/tech-site-check/scripts/check-content.mjs   # 0 broken links
npm run build
```

Then, with `npm run dev` running, each old URL must answer 308 with the new location:

```bash
curl -sI http://localhost:3000/pages/old/path | grep -iE '^(HTTP|location)'
```

Show the output for each mapped URL.

## Gotchas

- **Moving pages without redirects.** This is how the old `llamacpp-*` slugs became broken links across the wiki until redirects were added. Every old URL gets a redirect.
- **Fixing links but not redirects, or the reverse.** Do both: links for readers on the site, redirects for everyone else.
- **Redirect chains** (A to B, then B to C). Point every source straight at the final URL.
- **Resetting `publishedAt` on the moved file.** It is the original date.
- **Deleting a page with no replacement.** Ask first. Redirect it to the nearest parent section rather than letting it 404.
