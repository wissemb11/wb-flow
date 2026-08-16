---
title: "Flags & Shortcuts"
description: "Documents the system-wide flag grammar across all /wb* commands, including the long-form and short-form equivalence contract."
---

# Flags & Shortcuts — 

> The system-wide grammar for flag handling across all `/wb*` commands. Read this once and you can predict the shortcut for any flag without looking it up.

## The contract

Every `/wb*` command that accepts flags supports two equivalent forms:

| Form | Example | Notes |
|---|---|---|
| **Long** | `/wbGit --execute --push` | Self-documenting; use in scripts and docs |
| **Short** | `/wbGit -e -p` | Use when typing fast; same behavior |

Both pass through the template's `<!-- FLAG_NORMALIZE -->` block, which substitutes short → long before the command's own logic runs. There is no behavioral difference — only character count.

## Universal flags (every command)

| Long | Short | Behavior |
|---|---|---|
| `--help` | `-h` (also `--h`) | Print the HELP_GATE block, do nothing else. |

`-h` is reserved across all 28 commands; no per-command flag may shadow it.

## The shortcut grammar

The rules that produce every shortcut. They are deterministic — once you know them, you can predict any shortcut.

1. **First letter of the long form** (lowercase). `--execute` → `-e`, `--push` → `-p`, `--scope` → `-s`.
2. **Capitalize when there's a same-letter collision** within one command. `wbAudit` has both `--scope` and `--security` → `-s` for scope (alphabetical winner), `-S` for security.
3. **Same flag → same shortcut, everywhere.** `--act` is `-a` in `/wbActOn`, `/wbAudit`, `/wbReview`, `/wbStandup`. `--dry-run` is `-d` in `/wbDeploy`, `/wbPublish`, `/wbRelease`, `/wbTest`. Cross-command consistency wins over per-command optimization.
4. **`--force*` always becomes `-F`.** Even when there's no `-f` competitor in the command. This is a safety convention: capital-F signals "destructive" the way capital-X signals "dangerous" in shell scripts.
5. **`--dashboard` always becomes `-L`** (mnemonic: **L**ink). It maps every command's hook into the `Understand-Anything` knowledge-graph plugin. Same letter everywhere; never collides because no other flag in the system claims the L slot.

The five rules cover every shortcut in the system. There are no exceptions worth memorizing.

## The full shortcut map (current snapshot)

The runtime catalog (`wb_commands_reference.json`) is the source of truth. This table is for quick visual reference; if it disagrees with the JSON, the JSON wins.

| Command | Flags |
|---|---|
| `/wbActOn` | `--act` (`-a`), `--wbPlan` (`-P`) |
| `/wbAudit` | `--profile` (`-p`), `--scope` (`-s`), `--security` (`-S`), `--act` (`-a`), `--wbPlan` (`-P`) |
| `/wbBroadcast` | `--status` (`-s`) |
| `/wbContext` | `--focus` (`-f`), `--scope` (`-s`) |
| `/wbDeploy` | `--dry-run` (`-d`), `--prod` (`-P`), `--target` (`-t`) |
| `/wbDoc` | `--focus` (`-f`) |
| `/wbGit` | `--execute` (`-e`), `--force` (`-F`), `--no-verify` (`-n`), `--push` (`-p`), `--from-plan` (`-P`), `--diff-file` (`-d`), `--scan-recent` (`-r`), `--dashboard` (`-L`), `--amend` (`-A`), `--issue` (`-i`) |
| `/wbLicense` | `--scope` (`-s`) |
| `/wbNext` | `--scope` (`-s`), `--since` (`-S`) |
| `/wbExplain` | `--id` (`-i`), `--as` (`-a`) |
| `/wbPlan` | `--resume` (`-r`), `--scope` (`-s`), `--task` (`-t`), `--id` (`-i`), `--open` (`-o`), `--def` (`-d`), `--can` (`-c`) |
| `/wbPublish` | `--all` (`-A`), `--dry-run` (`-d`), `--prerelease` (`-p`), `--restore` (`-r`) |
| `/wbRelease` | `--dry-run` (`-d`), `--prerelease` (`-p`), `--restore` (`-r`), `--tag` (`-t`) |
| `/wbReview` | `--plan` (`-p`), `--act` (`-a`), `--wbPlan` (`-P`) |
| `/wbSecure` | `--focus` (`-f`), `--force-past-security` (`-F`) |
| `/wbSetup` | `--focus` (`-f`), `--scope` (`-s`) |
| `/wbStandup` | `--act` (`-a`), `--wbPlan` (`-P`) |
| `/wbTest` | `--profile` (`-p`), `--task` (`-t`) |
| `/wbTrack` | `--finalize` (`-f`), `--scope` (`-s`) |
| `/wbTranslate` | `--new-only` (`-n`) |
| `/wbValid` | `--id` (`-i`), `--open` (`-o`), `--def` (`-d`), `--can` (`-c`) |
| `/wbWork` | `--id` (`-i`), `--open` (`-o`), `--def` (`-d`), `--can` (`-c`) |

**No flags (shortcut-free):** `/wbCheck`, `/wbClean`, `/wbDebug`, `/wbHelp`, `/wbMonetize`, `/wbRefactor`, `/wbStopTrack`, `/wbToWBC`, `/wbVision`.

## State-transition flags (the `--open` / `--def` / `--can` family)

Three commands — `/wbWork`, `/wbValid`, `/wbPlan` — share a special flag triplet that **transitions a plan task's state** instead of executing it:

| Long | Short | Sets state to | Notes |
|---|---|---|---|
| `--open` | `-o` | `⬜` Open | Re-opens a task. Use after `/wbValid` rejected an output. |
| `--def` | `-d` | `⏸️ Deferred` | Postpones intentionally — `/wbStandup` won't nag about it. |
| `--can` | `-c` | `🚫 Cancelled` | Kills the task. Comes back only as a *new* row. |

When any of these flags is present alongside `--id`, the command **skips its normal logic** (no code execution, no validation) and only mutates plan cells.

**Cell scope by command:**

| Command | Cell mutated |
|---|---|
| `/wbWork` | `Done` only (worker's column) |
| `/wbValid` | `Valid` only (validator's column) |
| `/wbPlan` | BOTH cells in one shot |

**Multi-flag tie-breaking:** rightmost wins. `--open --def` lands on `⏸️ Deferred`. Same rule as standard shell flag composition.

The `-o` / `-d` / `-c` shortcuts are reserved across all three commands — `-o` will never mean anything else in `/wbWork` / `/wbValid` / `/wbPlan` (rule 3: same flag → same shortcut).

Full reference: [`plan_state_management`](plan_state_management.md).

## How the runtime resolves shortcuts

When you invoke `/wbGit -e`, the chain is:

1. **Wrapper** (`.claude/commands/wbGit.md`) reads `$ARGUMENTS = "-e"`, points the agent at the template.
2. **Help gate** at the top of `wbGit_template.md` checks for `--help`/`-h`/`--h`. None present, falls through.
3. **Flag normalize block** (right after the gate) sees `-e` and substitutes `--execute`.
4. **Rest of template** runs as if you'd typed `--execute` from the start.

This is why the rest of every template documents only the long forms — the substitution happens once, at the top, and the body never sees the short form.

the agent's edition documents the shortcuts but doesn't surface the **grammar** — it presents the map as a flat list of arbitrary mappings. The actual design is rule-driven (4 rules cover everything), and once users learn the rules they stop needing the table. Surfacing the grammar matters more than surfacing the map.

## The one mistake to avoid

Inventing a shortcut that isn't in the table. `/wbGit -p` is `--push`, not `--prerelease` — even though `/wbRelease -p` *is* `--prerelease`. The shortcuts are scoped per command, not global. If you're unsure, run `/wbHelp <command>` to see that command's exact map, or look at the template's `<!-- FLAGS_TABLE -->` block.

The corollary: when adding a new flag to an existing command, always pick the shortcut that follows the four rules. Don't invent a custom mapping because "the natural letter is taken." Use the capital, or rename the flag.

## When to reach for shortcuts vs long forms

- **Interactive use, fast iteration**: shortcuts. `/wbGit -e -p` is faster than `/wbGit --execute --push`.
- **Scripts, automation, scheduled agents**: long forms. The script reader shouldn't have to memorize 19 maps.
- **Documentation, blog posts, examples**: long forms. Shortcuts are fluency-dependent; long forms are universal.
- **Pair programming, screen sharing, code review**: long forms. The other person's mental model isn't the same as yours.
