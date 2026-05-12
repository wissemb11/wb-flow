# wbContext — ELI5 Guide

## What is this?

Packs everything an LLM agent needs to understand your project into a single prompt-ready context block. Run it at the start of a coding session, pipe the output into your agent, and it gets project identity, recent changes, architecture clues, and key documentation — without you manually copying files or writing a preamble.

The gathering strategy follows a priority ladder: always include project identity (`AGENTS.md`, `package.json`, repo info) and agent runtime rules; then add recent changes (last 10 commits, staged/unstaged diff, current branch); then append architecture clues (import aliases, routing config, TypeScript paths, test framework setup). You control the depth with `--depth` and can focus on a specific module with `--focus <path>` to get deeper context without the noise of the full project. Output formats include terminal-friendly text, JSON for programmatic ingestion, and a compressed format for context-window-limited agents.

**What It Gathers:**
- Project identity — name, description, framework detection, dependency list from `package.json`
- Agent rules — full contents of `AGENTS.md`, `.wbroles`, or any `.wb/rules.d/` files
- Working tree state — staged and unstaged git diff, current branch, recent commit messages
- Architecture signals — `tsconfig.json` paths, import alias maps, routing config files, test framework detection
- Module details — when using `--focus <path>`, includes the module's file tree, exports, test files, and related config
- Open todos — scans changed files for `TODO`, `FIXME`, `HACK`, and `XXX` comments to surface unresolved work

**When to use it:** At the start of every LLM-assisted work session. Also useful when switching between projects or re-engaging with a codebase after a break. For CI tools, `--out context.json --format json` produces a machine-readable snapshot for automated analysis.

## Why do I need it?

LLM agents are only as good as the context you give them. Without `wbContext`, you're manually pasting files, describing your project, and hoping the agent understands the architecture — every single session. This packs everything into one command, saving about 5 minutes per session and ensuring the agent sees what matters. The real efficiency gain is when you pipe it directly: `/wbContext | pbcopy` (macOS) plants everything on your clipboard in one keystroke.

**Tips:**
- Use `--focus src/auth/` when working on a specific module to get deeper context without irrelevant noise
- Pipe directly into your LLM: `/wbContext | pbcopy` on macOS, `/wbContext | xclip -selection clipboard` on Linux
- Run `--out /tmp/ctx.json --format json` in CI to create a project snapshot that downstream tools can consume

## Simple Example

**Full-context paste:** `/wbContext` — outputs a formatted context block with project summary, recent commits, working-tree diff, and key config files, ready to copy-paste into an LLM session.

**Module-focused context:** `/wbContext --focus src/auth/ --depth 3` — gathers deep context only for the `auth` module: its file tree, all exports, test coverage, imports from other modules, and related config (e.g., auth middleware, route guards). Omits unrelated parts of the codebase.

**CI snapshot:** `/wbContext --out /tmp/context.json --format json` — writes the full project context as a structured JSON file. A CI step can ingest this to run automated analysis — e.g., checking whether PR descriptions match actual changes.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Using default depth for every session.** The default context includes the full project tree and recent git activity. For a quick question about one function, use `--focus <path>` to avoid swamping your agent's context window with irrelevant files.

**Not piping the output.** Manually copying from the terminal is error-prone and slow. Set up an alias: `alias ctx="wbContext | pbcopy"` so one command puts everything on your clipboard.

**Including secrets in context dumps.** If you use `--format json` in CI, the output may include environment variable names or config values. Review the JSON output before storing it in logs or artifacts.

**Relying on it for live data.** Context is a snapshot — if files change after you run `wbContext`, the agent's context is stale. Re-run when you've made significant changes.

**Forgetting `--focus` for large projects.** On a monorepo with 500+ modules, the default context is too large. Always target the sub-package or module you're working on.
