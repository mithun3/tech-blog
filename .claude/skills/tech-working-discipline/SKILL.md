---
name: tech-working-discipline
description: Working rules for any code, content or config change in this Next.js wiki and blog - validate the need before editing, read the whole file first, verify every fact (frontmatter fields, component props, Next.js APIs, package versions, commands, benchmark numbers) against the source, never invent URLs, versions, numbers or env vars, surface errors instead of silencing them, show command output as evidence, ask one question with a recommended answer when unclear, keep diffs minimal and reuse existing helpers. Use when about to edit or create files under app, components, lib or content, when changing next.config.ts or CI, when debugging a build, type or lint error, when asked to "make sure it works", or when a requirement is ambiguous.
metadata:
  scope: "repo-wide working discipline; applies on top of AGENTS.md and the other project skills"
  sources: "AGENTS.md WIKI.md README.md .github/workflows/production.yml"
  adapted-from: "code/proxmox .claude/skills/working-discipline (verified 2026-11-13)"
  references: "Claude Code skills docs; VS Code agent skills docs; agentskills.io specification; arXiv 2607.09510 (failure as a process); arXiv 2603.06847 (faults in agentic AI); DAPLab 9 critical failure patterns (Jan 2026)"
  verified: "2026-11-20"
---

# Working discipline

Apply these rules to every change. Where AGENTS.md or a more specific project skill says otherwise, follow that one.

## 1. Before changing anything

- Read the whole target file, not a snippet. Read the owning doc: WIKI.md for content, README.md for routes and SEO, the matching skill for the area.
- State the reason for the change and the assumptions it relies on. Name any assumption you have not verified.
- Confirm the change is needed. If the request already holds, say so and stop.
- List every file, caller and config the change touches before editing. Missing a dependent file is the most common silent failure (a moved page has inbound links; an MDX component is registered in two places).

## 2. Scope

- Make the smallest diff that meets the request. No unrequested refactors, renames, formatting, or added features.
- Do not edit a file the user did not name unless a dependency requires it. Say which extra file you touched and why.
- Keep concerns apart: content in `content/`, data loading in `lib/`, presentation in `app/` and `components/`, configuration in `next.config.ts` and env vars. Do not mix them in one edit.
- Keep configuration out of code and secrets out of the repo. The site URL comes from `NEXT_PUBLIC_SITE_URL`; the Giscus IDs come from env. Never hard-code either.
- Separate checking, changing and reporting into distinct steps; a check must not also change the state it checks.

## 3. Verify facts

- Check frontmatter fields, component props, function signatures, package versions and CLI flags against the source (`lib/wiki.ts`, `lib/posts.ts`, `components/mdx/*`, `package.json`, `package-lock.json`) or official docs before using them.
- Never invent URLs, versions, commands, benchmark results, hardware specs or environment variables. A wiki page is published reference material: a plausible guess becomes a public error.
- Leave a placeholder such as `[XX]` in place and ask for the measured value. Never fill it with an estimate.

## 4. Reuse

- Search for an existing helper or component before writing new code (`lib/wiki.ts` resolves pages and builds the nav tree; `components/mdx/*` holds the MDX components).
- Do not copy the same logic or the same procedure into a second place. Reuse it, or link to the one canonical page.

## 5. Errors

- Never add `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, `any`, or a `try/catch` that hides a build or render error just to get green. Fix the cause, or report it.
- When something fails, report the failure, its cause and the evidence. Stop rather than returning a "successful" default.

## 6. Evidence

- Report the command you ran and its output. "Should work" and "builds fine" without output are not evidence.
- Before calling a change done, run the checks CI runs (tech-site-check skill): the content check, `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- Do not push, merge or deploy from this session unless asked: a push to `main` deploys production.

## 7. Ambiguity and retries

- When a requirement is ambiguous, ask one focused question and give a recommended answer.
- After two failed correction attempts on the same problem, stop. Restate the problem, what was tried, and the evidence, then ask.

## 8. Security

- Never print, paste or commit `.env*` values or tokens. Never put a secret in a `NEXT_PUBLIC_*` variable: those are inlined into the client bundle.
- Grant the least privilege needed. Deny by default.

## Gotchas

Each item: the failure, then the counter-rule.

- **Inventing an API, prop or frontmatter field.** Check the type in `lib/` or the component's props first.
- **Editing before reading the whole file.** Read the full file, then edit.
- **Declaring "done" without output.** Show the command and its result.
- **Scope creep during a fix.** Fix the requested item only; list other problems separately.
- **Silencing an error to make the build green.** Surface the error and stop.
- **Filling a benchmark table or a TBD with plausible numbers.** Keep the placeholder and ask.
- **Business rules implemented from a guess.** Restate the rule in one line and confirm it before coding.
- **Duplicating existing logic or a whole procedure.** Search for the helper or the canonical page first.
- **Stale version assumed correct.** Check `package.json` and `package-lock.json`.
- **Trusting a subagent's output without checking.** Re-verify its factual claims directly.
- **Reviewer invents style findings.** Ask reviews to focus on correctness and invariants, not style.
- **Repo-derivable facts pasted into docs or AGENTS.md.** Link to the source instead; keep docs short.
- **Instructions given only in chat lost after compaction.** Put standing rules in a file.
- **Bash-made changes not covered by checkpoints.** Use git to track and roll back.
- **Trusting README.md or WIKI.md over the code.** Some file tables there are stale; the code wins.

## 9. Documentation

- Update the owning doc in the same change as the code: README.md for routes, stack and SEO; WIKI.md for content rules and components.
- Keep comments to one line stating what the code cannot show by itself.
