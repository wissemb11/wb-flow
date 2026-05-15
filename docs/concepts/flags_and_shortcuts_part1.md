# Flags & Shortcuts — Universal Flags

> This page documents the universal flags available on every `/wb*` command and the flag processing rules that govern their behavior.

---

## 1. Universal Flags

These flags work identically on every `/wb*` command:

| Flag | Short | Type | Description |
|---|---|---|---|
| `--help` | `-h` | Meta | Display the command's HELP GATE instead of executing |
| `--scope` | `-s` | Target | Override the default scope (folder path) |
| `--model` | `-m` | Config | Override the suggested model for this execution |
| `--dry-run` | `-n` | Safety | Show what would happen without modifying any files |

---

## 2. Command-Specific Flags

Some commands accept additional flags beyond the universal set:

### `/wbPlan` Flags

| Flag | Short | Description |
|---|---|---|
| `--resume` | `-r` | Carry forward open tasks from the most recent plan |
| `--open` | — | Reset specified task(s) to ⬜ Open |
| `--def` | `-d` | Set specified task(s) to ⏸️ Deferred |
| `--can` | `-c` | Set specified task(s) to 🚫 Cancelled |
| `--id` | `-i` | Target specific task number(s) |
| `--focus` | `-f` | Filter plan to a specific topic |
| `--ingest` | — | Convert an idea file into plan tasks |

### `/wbWork` Flags

| Flag | Short | Description |
|---|---|---|
| `--task` | `-t` | Specify task number to execute |
| `--idea` | — | Execute idea exploration (not plan task) |

### `/wbValid` Flags

| Flag | Short | Description |
|---|---|---|
| `--task` | `-t` | Specify task(s) to validate (`N`, `N,M`, `*`) |
| `--idea` | — | Validate an idea exploration report |

### `/wbAudit` Flags

| Flag | Short | Description |
|---|---|---|
| `--profile` | `-p` | Scan profile: `security`, `performance`, `architecture` |
| `--depth` | `-d` | Scan depth: `shallow` or `deep` |
| `--plan` | — | Auto-generate a plan from findings |

### `/wbClean` Flags

| Flag | Short | Description |
|---|---|---|
| `--force` | `-f` | Delete without confirmation prompts |
| `--dry-run` | `-n` | Show what would be deleted (already universal) |
| `--include` | — | Glob pattern for files to include |
| `--exclude` | — | Glob pattern for files to exclude |

---

## 3. Flag Processing Rules

| Rule | Description |
|---|---|
| **`--help` takes priority** | If `--help` is present, NO other flags are processed. |
| **Contradictory flags error** | `--open` + `--def` on the same invocation = error. |
| **Short flags can stack** | `-rfd` is NOT valid — each flag requires separate `-`. |
| **No positional arguments** | All values use `--flag=value` syntax, not bare positionals. |
| **Unknown flags warn** | `⚠️ Unknown flag: --foo. Ignoring.` |

---

## 4. Flag Syntax Examples

```bash
# Universal
/wbAudit packages/wb-core --help
/wbPlan packages/wb-core --model="AI"
/wbClean packages/wb-core --dry-run

# Command-specific
/wbPlan plan_*.md --id=5 --open
/wbPlan plan_*.md --id=1,2,3 --def
/wbWork plan_*.md --task=7.3
/wbValid plan_*.md --task=*
/wbAudit packages/wb-core -p security --plan
```

---

## 5. The `--help` / `-h` Intercept

The help intercept is the most important universal flag. It applies uniformly to all 27 commands:

```bash
/wbAudit packages/wb-core --help     # shows help, does NOT audit
/wbPlan packages/wb-core -h          # shows help, does NOT plan
/wbWork plan_*.md --task=5 --h       # shows help, does NOT execute
```

### Intercept Rules

| Rule | Behavior |
|---|---|
| `--help` anywhere in the command | Triggers intercept |
| `-h` anywhere in the command | Triggers intercept |
| `--h` anywhere in the command | Triggers intercept |
| `--help` combined with other flags | Other flags are ignored |
| No file reads, writes, or mutations | Guaranteed safe |

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)
