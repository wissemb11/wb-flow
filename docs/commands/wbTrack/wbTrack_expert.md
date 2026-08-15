# /wbTrack: Expert Deep Dive 🎓

## The Collaborative Observer Pattern

`/wbTrack` v2 is structurally a **collaborative observer** over the `/wb*` pipeline. Multiple models share one session file per day. It doesn't modify what commands do — it observes their outputs and produces a parallel, multi-model narrative.

```
 ┌─── reports/<type>/<type>_<target>_<date>.md (always — universal daily file)
/wb* command ───┤
 └─── walkthroughs/<date>/session_<target>_<date>.md → §N (only when tracking)
 *(tagged with model name + time)*
```

### Why One File?

With per-model files (v1), 4 models working on wb-core in one day produced 4 session files + up to 24 derivative files. Each model independently analyzed the same codebase and duplicated the same §0 assessment. The human had to read 4 files to understand the day.

With a universal file (v2), there's ONE narrative. The first model writes §0, subsequent models read what came before and add their perspective. This creates a **conversational audit trail** — models can agree, disagree, or build on each other's recommendations.

### Create-or-Join Logic

```
/wbTrack packages/wb-core

Does walkthroughs/20260429/session_wb-core_20260429.md exist?
├── NO → CREATE file + write §0 (strategic vision, /wbStandup output, recommendations)
└── YES → READ existing file + APPEND contributor entry (assessment, recommendations)
```

The key insight: subsequent models **don't rewrite §0**. They add a §N contributor entry that references and responds to existing content. This eliminates redundancy and creates dialogue.

### Why Two Folders?

The `reports/` folder is a **machine contract**. Commands like `/wbStandup`, `/wbPlan`, and `/wbAudit` scan it to discover past work. If walkthrough files lived in `reports/`, these scanners would find narrative content and misinterpret it as structured data.

`walkthroughs/` is a **human contract**. The universal session file tells the story of a work day from multiple AI perspectives: what happened, why, and what each model recommends next. It's for reading, not scanning.

### Scoping: Target vs No Target

| `/wbTrack wb-core` | `/wbTrack` |
|---|---|
| §0 reads wb-core deeply | §0 reads monorepo broadly |
| Session file in wb-core's `.agents/` | Session file in core2's `.agents/` |
| Reports still go to each command's target | Reports still go to each command's target |

The target only affects where the **session file** lives and what **§0 focuses on**. It never changes where reports go.

### One Session at a Time (per model)

Each model can only track **one scope at a time** — the same constraint as v1. If you're tracking `core2` and try `/wbTrack packages/wb-core`, you'll get an error. You must `/wbStopTrack` first. However, different models can track different scopes simultaneously since they write to different files.

### Mandatory `/wbStandup` in §0

The model creating the file MUST execute `/wbStandup __TARGET__` as a literal sub-command and paste its **full output** into §0 under "Past Debt". This is not optional — it embeds the complete project state so that subsequent models joining the file have full context without needing to re-run standup themselves.

### §STOP vs §END

In v1, §END closed the file. In v2, §STOP means "this model is done recording" but the file stays open:

| Concept | v1 (§END) | v2 (§STOP) |
|---|---|---|
| File state after | Closed | Open for other models |
| Derivatives extracted | Always at end | Only with `--finalize` |
| Scope | Entire session | Per-model exit |

### §0 as Forced Context Loading

§0 isn't decorative. By requiring the model to analyze the current state before receiving commands, `/wbTrack` forces a context load that reduces hallucination:

- Model reads past reports → knows what was tried before
- Model reads source code → knows the current state
- Model proposes a sequence → reveals its understanding (or lack of it)
- Model reads existing session entries → knows what other models have done/recommended

This is a softer version of `/wbCheck` — it doesn't gate the model, but it does make it show its hand before acting. In v2, it also makes the model **respond to previous contributors' recommendations**.

### Limited Self-Correct (the `/wbX <output_file>` dual-mode pattern)

Universal `/wbX` commands with structured output (`/wbPlan`, `/wbAudit`, `/wbReview`, `/wbContext`, etc.) support a **content-detected dual mode**: if you pass a previous output file as the first arg and its first H1 matches the command's schema, the command runs in verify-and-repair instead of normal-mode production. See [`../../concepts/self_correct_mode`](../../concepts/self_correct_mode) for the universal protocol.

`/wbTrack` joins this club as of 2026-05-09 — but with one architectural carve-out: track files are **append-only multi-model narratives**, so self-correct CANNOT rewrite §N body content. If it could, one model running `/wbTrack <file>` would silently overwrite another model's §N reasoning, destroying the conversational audit trail that the universal-daily-file design exists to create.

The detection block in `wbTrack_template.md` defines the limited contract:

| Self-correct CHECKS | Self-correct REPAIRS | Self-correct REFUSES |
|---|---|---|
| §N order (no gaps) | Bare `/wbX` in `Recommended Next` tables | Rewriting any §N body content |
| Model-tag formatting | Plain-text paths in `Files read/created` | Adding or deleting §N sections |
| Footer presence | Footer link snapshot freshness | Changing §0 strategic vision |
| Link integrity (flagged only) | `🟢 ACTIVE` → `🟡 STALE` if last §N > 24h | Re-running `/wbStandup` or any sub-command |

Broken links inside §N bodies are listed in a single `## ⚠️ Self-Correct Findings` section near the bottom — never auto-edited. The original author of a §N may hand-edit their own block to fix mechanical bugs (typos, broken links — the rule protects against *other* models overwriting authored opinions, not against the author cleaning their own typos). A different model wanting to disagree appends `§N+1` instead of editing prior content.

The honest critique: this design is rigid. If three models all write §N entries with the same broken link, self-correct flags it three times in the Findings section but won't fix any of them. The architecture optimizes for audit-trail integrity over convenience — that tradeoff is correct, but it means track files require manual link maintenance more than any other `/wbX` output type. Use absolute or known-good relative paths in §N writers if you can.

What `wb-flow-docs`'s playbook gets wrong about `/wbTrack`: framing it as session logging, when the Claude edition's key innovation is the section-N append-only structure creating an immutable audit trail, and self-correct mode that flags (but does not fix) stale links. The append-only constraint makes track files trustworthy as evidence.

## One-paragraph verdict

A session-narrative command that excels at continuity (resuming where you left off after interruptions) but struggles with link maintenance. The §N append-only structure is simultaneously its strength (immutable audit trail) and weakness (stale links persist forever). The self-correct mode's "flag but don't fix" policy for broken links is the right tradeoff — fixing links would require editing historical entries, which defeats the audit purpose. Most useful for long multi-model sessions; overkill for single-shot tasks. Weakest in derivative extraction (`--finalize`), which produces large files with uneven signal-to-noise ratio.

---
