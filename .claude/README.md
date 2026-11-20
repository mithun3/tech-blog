# Project skills for Claude Code and GitHub Copilot

Six skills for the wiki and blog. They follow the [Agent Skills](https://agentskills.io/specification) format, so the same `.claude/skills/` folder serves both tools. Always-on rules and the skill index are in the root `AGENTS.md`. `CLAUDE.md` imports it with `@AGENTS.md`, so there is one source.

## Layout

| Layer | Where | Loaded |
|---|---|---|
| Invariants and skill index | `AGENTS.md` (via `CLAUDE.md` for Claude Code) | every session |
| Skills | `.claude/skills/<name>/SKILL.md` | the description always; the body when relevant or on `/name` |
| Bundled script | `.claude/skills/tech-site-check/scripts/check-content.mjs` | when run |
| Evals | `.claude/skills/<name>/evals/evals.json` | only by the skill-creator eval runner |

## Check that skills load

- **Claude Code:** run `/skills`. All six should be listed. Skills hot-reload when edited; if a new one does not appear, run `/reload-skills` or start a new session.
- **Copilot (VS Code):** open a new chat, type `/` and look for the skills, or run **Chat: Open Customizations** and select **Skills**. GitHub's docs list `.claude/skills` as a supported project location. VS Code's table names `.github/skills` for the Copilot harness. If skills are missing there, report it rather than copying them: VS Code lists a skill twice when the same name exists in two locations.

## Portability rules (both tools)

- Name every skill `tech-<topic>`, with the folder named the same, so they group together when you type `/tech` in either tool.
- Use only these frontmatter fields: `name` (equal to the folder; lowercase, digits and hyphens; 64 characters max), `description` (1024 characters max; key use case first; includes "Use when"; no angle brackets), `argument-hint`, and `metadata` (string values only). Copilot ignores Claude-only fields such as `allowed-tools`, `context`, `paths` and `when_to_use`, so do not use them for anything a skill depends on.
- No Claude-only substitutions (`$ARGUMENTS`, `${CLAUDE_SKILL_DIR}`, or `` !`cmd` `` injection). Refer to files by repo-relative path and run scripts from the repo root.
- Keep each `SKILL.md` well under 500 lines. Link supporting files one level deep from `SKILL.md`.
- `metadata.sources` lists the repo files a skill was written from, and `metadata.verified` is the date it was last checked. When a source changes, re-read it, update the skill and bump `verified`.

## Test prompts

| Skill | Try |
|---|---|
| `tech-working-discipline` | npm run lint fails on mermaid.tsx, just disable the rule |
| `tech-content-authoring` | add a wiki page about Uptime Kuma in an LXC |
| `tech-move-wiki-page` | `/tech-move-wiki-page proxmox/workloads/searxng-lxc proxmox/workloads/search/searxng` |
| `tech-fact-check-page` | `/tech-fact-check-page content/pages/proxmox/operations/upgrades/pve-9-2-upgrade.mdx` |
| `tech-site-code` | add a Tabs MDX component |
| `tech-site-check` | make sure nothing is broken before I push |

Each `evals.json` holds three or more should-trigger cases plus one near-miss that should not trigger. Run them with the `skill-creator` plugin against a no-skill baseline. Tighten a description if a near-miss triggers or a real case does not.
