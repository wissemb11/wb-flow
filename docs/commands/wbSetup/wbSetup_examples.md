---
title: "wbSetup — Examples"
description: "The live demo app."
---

# /wbSetup — Examples

> This is a self-help doc. The format is: *fake-but-realistic transcript of running `/wbSetup` on a real folder in this monorepo, with margin notes explaining what the AI is actually doing and which of **your** conventions it's picking up.*
>
> Use it when you've forgotten what `/wbSetup` produces, or why it produces it.

---

## Example 1 — `/wbSetup apps/wb-dataviewer/wbdataviewer2.wbc-ui.com`

The live demo app. Vue 3 + Vuetify 3. The one currently open in your IDE.

```text
$ /wbSetup apps/wb-dataviewer/wbdataviewer2.wbc-ui.com

[AI] Reading package.json... ← always the first file
[AI] name: wbdataviewer2, type: "module", vite 5.x
[AI] deps: vue@3.4, vuetify@3, @wbc/core2, @wbc/wb-dataviewer ← workspace-linked, not published
[AI]
[AI] Scanning src/App.vue (entry)... ← reads the actual entry, not just manifest
[AI] Imports: WBDataViewer, apiResponse_ pattern detected ← sees the cache-the-fetch convention
[AI] Uses :wbCode="false" on demo instances ← picks up the collapsed-by-default rule
[AI]
[AI] Scanning vite.config.js...
[AI] outDir: "dist-dev" (dev), "dist" (prod) ← the mismatch you keep hitting
[AI]
[AI] Generating .agents/workflows/context.md...
[AI] section: Identity → "consumer of @wbc/* — not a library"
[AI] section: Runtime → "Vue 3, not Vue 2 (wb-press is the Vue-2 one)"
[AI] section: Data → "apiResponse_ caches fetched data; project
[AI] changes MUST NOT re-fetch — reuse the cache"
[AI]
[AI] Generating .agents/workflows/dev.md...
[AI] rule: "examples in this app ALWAYS pass :wbCode=\"false\"" ← folded from your feedback memory
[AI] rule: "wbCode prop is dev-only; never expose to end users;
[AI] gate with __WBC_DEV__" ← same
[AI] rule: "build output toggles dist/ vs dist-dev/; do not
[AI] rename without updating package.json main" ← guards the known footgun
[AI]
[AI] Done. 2 files written. Preview? (y/n)
```

**What's worth noticing:**

- The AI doesn't invent these rules. It reads them from two sources: (a) what's actually in the code (`apiResponse_` usage, `:wbCode="false"` on instances), and (b) your `MEMORY.md` conventions once they're referenced in the session. The `--focus` flag isn't needed here; the rules are strong enough that a normal scan picks them up.
- `dev.md` ends up longer than `context.md`. That's the point — `context.md` is *what this is*, `dev.md` is *what to never screw up*.
- The `dist/dist-dev` warning is preemptive. It's not that the AI found a broken state; it's that the AI found the *shape* of the mistake and wrote a rule against it.

---

## Example 2 — `/wbSetup packages/wb-core`

The engine. Where `extractSubObject`, `WBCode.vue`, and the WBC render pipeline live. Run this when you're about to touch any of those.

```text
$ /wbSetup packages/wb-core

[AI] Reading package.json...
[AI] name: @wbc/wb-core, main: "dist/index.js" ← declared entry
[AI] peerDeps: vue (any 3.x) ← it's a library, not an app
[AI]
[AI] Scanning dist-dev/... not present. ← the mismatch, flagged
[AI] Scanning dist/... not present either.
[AI]
[AI] ⚠ Flagging in context.md: "package.json points at dist/ but
[AI] current build artifact is whichever vite wrote this session.
[AI] Consumers resolving @wbc/wb-core will fail if dist/ is stale.
[AI] Fix: run the build, or align main: with the vite outDir in use."
[AI]
[AI] Scanning src/ for public API...
[AI] src/utils/extractSubObject.js ← array-handling decision OPEN
[AI] src/components/WBCode.vue ← 3-mode wbCode pattern (dev/prod/__WBC_DEV__)
[AI] src/WBC.js ← same 3-mode wbCode pattern
[AI]
[AI] Generating context.md...
[AI] section: Identity → "render engine; everyone depends on this"
[AI] section: API → lists extractSubObject, WBCode, WBC
[AI] section: Decisions pending → "extractSubObject array handling:
[AI] leaves vs structural (foreign-key
[AI] arrays like students:[{...}]).
[AI] Not decided. Ask before extending."
[AI]
[AI] Generating dev.md...
[AI] rule: "wbCode is dev-only. Production code paths MUST be
[AI] gated by __WBC_DEV__. Pattern is identical in WBC.js
[AI] and WBCode.vue — follow the existing shape."
[AI] rule: "Before changing extractSubObject signature, confirm
[AI] the array-handling decision with the user. Current
[AI] consumers expect leaf-arrays; structural arrays are
[AI] a design change, not a bug fix."
[AI] rule: "Do not change main: in package.json to match dist-dev/
[AI] without confirming. The intended state is dist/."
```

**What's worth noticing:**

- The AI *refuses to silently resolve* the `extractSubObject` array-handling question. It writes the open decision into `context.md` and forbids itself from guessing. That's the correct posture for undecided architecture.
- The `dist/dist-dev` warning escalates to a `⚠` because in this package it's active, not hypothetical — no build artifact exists.
- Notice the `dev.md` rules are phrased as *actions the AI must refuse to take*, not *things to remember*. That phrasing matters: "don't rename `main:` without confirming" is enforceable; "be careful about `main:`" is not.

---

## Example 3 — `/wbSetup packages/wb-core --focus="extractSubObject"`

Same package, but you want deep context on one function because you're about to work on it.

```text
$ /wbSetup packages/wb-core --focus="extractSubObject"

[AI] Running standard wbSetup first (see Example 2)...
[AI] Standard context.md and dev.md written.
[AI]
[AI] --focus detected. Generating focused context file...
[AI]
[AI] Reading src/utils/extractSubObject.js + tests...
[AI] Function signature: extractSubObject(obj, path, opts?)
[AI] Current behavior on arrays: traverses as leaves
[AI] Test coverage: primitives ✓, nested objects ✓, arrays partial
[AI]
[AI] Scanning consumer sites...
[AI] 3 call sites in @wbc/wb-dataviewer
[AI] 1 call site in @wbc/wb-alert
[AI] 0 call sites using the undecided "structural array" shape
[AI]
[AI] Writing .agents/workflows/context_extractSubObject.md...
[AI] section: Current behavior (the tested, shipped behavior)
[AI] section: Consumers (who breaks if you change the signature)
[AI] section: The open decision (with your own framing:
[AI] arrays-as-leaves vs structural foreign-key arrays)
[AI] section: Do-not-break list
[AI] - arrays of primitives returned as arrays (not flattened)
[AI] - null/undefined paths return undefined, not throw
[AI] - opts.default still works
[AI]
[AI] ⓘ No new dev.md rules — the focused file is for reading,
[AI] not enforcement. Existing dev.md rule about confirming
[AI] before extending the signature still applies.
```

**What's worth noticing:**

- `--focus` generates a **third** file (`context_extractSubObject.md`) that supplements `context.md`. It does not replace it. A future session that reads both gets general + deep knowledge.
- The "Do-not-break list" is the genuinely useful part of a focused run. It's what a senior dev would leave on a sticky note for themselves.
- No new `dev.md` rules — the focused file is informational, not enforcement. That's a distinction the AI should preserve: *every rule in `dev.md` is a refusal the AI will actually make*.

---

## Example 4 — `/wbSetup packages/wb-press`

The VuePress docs app. This is the one where `WBDataViewer` inline-wrapping breaks tables. The `/wbSetup` must encode that pain.

```text
$ /wbSetup packages/wb-press

[AI] Reading package.json...
[AI] name: @wbc/wb-press, depends on vuepress@1.9.x, vue@2.x ← Vue 2!
[AI]
[AI] ⚠ Framework mismatch vs wbdataviewer2.wbc-ui.com (Vue 3).
[AI] Rules from that package's dev.md DO NOT transfer here.
[AI]
[AI] Scanning docs/.vuepress/config.js + sample .md pages...
[AI] Found: WBDataViewer used inline in .md pages
[AI] Found: tables rendered after WBDataViewer embed
[AI]
[AI] Generating context.md...
[AI] section: Identity → "documentation site, Vue 2, VuePress 1.9"
[AI] section: Known incompatibility →
[AI] "WBDataViewer + markdown tables break inside VuePress.
[AI] VuePress inserts an extra <div> wrapper that invalidates
[AI] the table structure. Accepted as-is: live demos go to the
[AI] demo app (wbdataviewer2.wbc-ui.com); docs describe them
[AI] statically. Do not try to 'fix' this by restructuring the
[AI] component — the wrapping is VuePress-side."
[AI]
[AI] Generating dev.md...
[AI] rule: "Vue 2 only. Composition API is unavailable here."
[AI] rule: "Do not propose a WBDataViewer live-embed in a .md page.
[AI] Link to the demo app instead."
[AI] rule: "npm scripts to preview: follow README; do not run
[AI] commands from memory." ← hard rule: no git/build shortcuts
```

**What's worth noticing:**

- The AI is told *up front* that the WBDataViewer-inside-VuePress wrapping is accepted, not a bug to fix. This single rule saves you from re-litigating the same design conclusion every time a new AI session sees a broken table.
- The Vue 2 / Vue 3 framework difference becomes a `dev.md` rule because it's the #1 way an AI will silently ruin this package: suggesting Vue 3 syntax that won't run.
- The "do not run commands from memory" line is a direct encoding of your "never use git commands" preference, generalized: if the project has specific scripts, don't improvise.

---

## Example 5 — `/wbSetup core2/ --scope=global`

The whole-monorepo pass. Don't run this often — it rewrites `core2/.agents/workflows/monorepo_rules.md`, which every package-level context file inherits from.

```text
$ /wbSetup core2/ --scope=global

[AI] Reading core2/package.json (root), lerna.json, pnpm-workspace.yaml...
[AI] Reading tools/pkg_cli/ entry points...
[AI]
[AI] Surveying packages/ (23 packages detected)
[AI] Surveying apps/ (8 apps detected, 7 dataviewer variants)
[AI]
[AI] Inferring cross-package constraints...
[AI] - Vue 3 is the default; wb-press is the Vue-2 exception
[AI] - All workspaces use workspace:* for @wbc/* imports
[AI] - dist/ vs dist-dev/ mismatch affects every package that
[AI] publishes (not just wb-core — systemic)
[AI] - apps/ consume packages via workspace:*; do not publish apps
[AI] - wbCode/__WBC_DEV__ dev-only gating is a cross-package convention
[AI]
[AI] Writing core2/.agents/workflows/monorepo_rules.md...
[AI] section: Build order (packages → apps)
[AI] section: Install rule: "always install from core2/ root;
[AI] never from inside a sub-package"
[AI] section: Systemic footguns:
[AI] - dist/ vs dist-dev/ (affects all publishable packages)
[AI] - Vue 3 assumption breaks in wb-press
[AI] - wbCode must not leak to end-users in ANY package
[AI] section: Do-not-delete list: lerna.json, pnpm-workspace.yaml,
[AI] tools/pkg_cli/, core2/.agents/
[AI]
[AI] ⓘ Package-level context.md files are unchanged.
[AI] They inherit from monorepo_rules.md automatically.
[AI] Re-run /wbSetup on individual packages only if you want
[AI] them to pick up new package-specific rules.
```

**What's worth noticing:**

- `--scope=global` does **not** update individual package `context.md` or `dev.md` files. It updates the one document they all reference. This is by design — regenerating 23 package-level files would be wasteful and risky.
- The rules written here are *systemic*: they describe patterns you noticed repeat across packages. One-off rules stay at the package level.
- The "do-not-delete list" is the global equivalent of the per-package one. It protects the root-level files that, if deleted, nuke the whole monorepo.

---

## The pattern across all five

If you re-read the transcripts side by side, the same four-step shape repeats:

1. **Read the manifest** (`package.json`, `lerna.json`, etc.).
2. **Read the entry + representative source files** to spot conventions the manifest doesn't mention.
3. **Write `context.md`** → *what this is* (facts + open decisions + known incompatibilities).
4. **Write `dev.md`** → *what the AI must refuse to do* (enforceable rules, phrased as prohibitions).

The differences between examples are only the *inputs* and the *specific rules inferred*. The mechanism is identical — which is why adding a new package to the monorepo is cheap: you just run `/wbSetup packages/<new-pkg>` and the pattern applies itself.

The thing that makes this workflow feel magical on Day 1 of a new session is that both files are already there. The AI doesn't re-derive your conventions every time; it reads them, like a returning employee reads the onboarding doc.

---

## Where this document fits

- Canonical contract for `/wbSetup` → `wbSetup_template.md` (technical, universal).
- the agent's 5-scenario version → `wbSetup_examples.md` (different examples, different voice).
- Audience tiers for explaining the command to someone else → `presentation/wbSetup_{eli5,practical,expert}.md`.
- **This file** → the one you re-read when *you* forget what `/wbSetup` produces.

---

---

## Basic Usage

```bash
# Standard command execution
/wbSetup frontEnd/wbc-ui3/packages/

# Execution with explicit target ID filter
/wbSetup deployement/apps/wb-jobs/ --id=1,2,3
```

## Model Fallback Chain (`.wb/bin/wbRun`)

When executing CLI dispatches, `/wbSetup` wraps binary calls in `.wb/bin/wbRun` to ensure output-error guarding:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbSetup target/" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "/wbSetup target/" || .wb/bin/wbRun opencode run -m opencode-go/deepseek-v4-pro "/wbSetup target/"
```

---

## Role Model Overrides (`--planner`, `--worker`, `--validator`, `--mechanical`)

You can override default models per role directly from the command line:

```bash
# Override Worker and Validator models
/wbSetup packages/ --wave=A --worker="DeepSeek V4 Pro,Kimi K3" --validator="Gemini 3.5 Pro"

# Override all 4 roles simultaneously
/wbSetup apps/wb-jobs/ --wave=all --planner="Claude Opus 5" --worker="DeepSeek V4 Pro" --validator="Claude Sonnet 4.7" --mechanical="Gemini 3 Flash"
```

## Autonomous Non-Interactive Execution (`-y` / `--yes`)

Run `/wbSetup` in zero-touch print mode without stopping for manual decision prompts:

```bash
.wb/bin/wbRun claude -p --permission-mode auto "/wbSetup frontEnd/wbc-ui3/packages/ --wave --as='expert,steps' -y"
```
