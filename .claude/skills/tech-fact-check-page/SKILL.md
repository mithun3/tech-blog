---
name: tech-fact-check-page
description: Runbook to fact-check one wiki page or blog post against primary sources and bring its citations in line with the WIKI.md policy - extract checkable claims (commands, flags, versions, numbers, compatibility, comparisons, protocol behaviour), verify each against official docs, add footnotes, flag outdated or unsupported claims, and report a claim-by-claim verdict. Use when asked to fact-check, verify, source or cite a page, refresh a page for a new release, or review a page's accuracy before publishing.
argument-hint: "[content/pages/path.mdx]"
metadata:
  scope: "accuracy and citations of one content file; does not restructure or move pages"
  sources: "WIKI.md"
  verified: "2026-11-20"
---

# Fact-check a page

The policy is WIKI.md "Citations And Sources". This runbook applies it to one file. The page path comes from the user's request; if none is given, ask which page.

## 1. Extract claims

Read the whole file. List each checkable claim with its line number, its type, and its current source (footnote number, or none).

Check in priority order:

1. Commands, flags, config keys and file paths, especially version-sensitive ones.
2. Version numbers, release dates and support or compatibility statements.
3. Numbers: performance, sizing, limits, benchmarks.
4. Comparisons between products and claims about what a platform or protocol does.
5. Security advice.

Skip opinion and first-hand experience ("on my node this took 40 minutes"). These are the author's evidence, not claims to cite. Do not "correct" them.

## 2. Verify

- For each claim, find a primary source: vendor or upstream docs, man pages, release notes, RFCs, maintainer docs. Record the URL and the sentence that supports or contradicts the claim.
- Check a command against the docs for the version the page targets, not just the latest.
- Use community sources only for tested data the official docs lack. Say that is what they are.
- If the page has many claims, split the work by claim group. Re-check any subagent's verdict against its quoted source before using it.

Give each claim a verdict: **supported**, **outdated** (state the current fact), **unsupported** (no strong source found) or **wrong**.

## 3. Edit

- Add footnotes in order of first use: `claim.[^1]`. Put the definitions at the end of the file, after `## Related Topics`, in the form `[^1]: [Title](https://...)`. Continue the page's existing numbering.
- Fix outdated or wrong prose. Rewrite or remove unsupported claims rather than attaching a weak source.
- **Command blocks are the author's validated procedure.** Do not edit them. Flag any mismatch with the docs in the report and ask.
- Turn a trailing "Resources" or "Research References" list that supports claims into footnotes. Keep `Further Reading` only for optional material.
- If the content changed materially, set `updatedAt` to today. Never touch `publishedAt`.
- Follow the tech-content-authoring rules (MDX syntax, frontmatter), then run `node .claude/skills/tech-site-check/scripts/check-content.mjs`.

## 4. Report

| Line | Claim | Verdict | Source | Action |
|---|---|---|---|---|

Then list the edits made, the command blocks flagged for the author, and any open questions.

## Gotchas

- **Citing the first search result.** Find the primary source; a blog post that repeats the docs adds nothing.
- **Citing a page that does not contain the claim.** Quote the supporting sentence in the report.
- **Silently changing a tested command.** Flag it; the author ran it.
- **Bumping `updatedAt` for footnote-only edits.** Only a material content change counts.
