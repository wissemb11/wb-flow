# `/wbPlan` Flags — Complete Reference

The `/wbPlan` command accepts two families of flags: **Universal (Super) Flags** that apply to all 30 commands, and **Column Filter & State Override Flags** specific to `/wbPlan`'s table-driven workflow.

## 1. Universal (Super) Flags

| Long | Short | Behavior |
|---|---|---|
| `--help` | `-h` | Print usage block and stop |
| `--stat` | `-st` | Display raw token count for the turn |
| `--stat-p` | `-sp` | Display token usage as % of context window |
| `--fresh` | `-cl` | Clear previous session history |
| `--no-ki` | `-nk` | Ignore global Knowledge Items |
| `--mem-sync` | `-ms` | Sync result to permanent Knowledge Base |
| `--budget <N>` | `-bt` | Hard-stop if `<N>` tokens exceeded |
| `--budget-p <N>` | `-bp` | Hard-stop if `<N>%` of window exceeded |

These are identical across all commands. See [flags_and_shortcuts_part1.md](flags_and_shortcuts_part1.md) for the full cross-command map.

## 2. Plan-Specific Flags

### Column Filter Flags

These filter rows in the plan's task table by matching against column values. Combine freely with `&&` and `||`.

| Long | Short | Target Column | Example |
|---|---|---|---|
| `--id` | `-i` | `#` (Task Number) | `--id=1,2,3` or `--id>=5` |
| `--p` | _(none)_ | `P` (Priority) | `--p=P1` or `--p<=P2` |
| `--est` | _(none)_ | `Est. Time (mins)` | `--est<=30` or `--est>60` |
| `--dep` | _(none)_ | `Dep` (Dependencies) | `--dep!=—` (only blocked tasks) |
| `--worker` | _(none)_ | `Worker (Suggested)` | `--worker=Gemini*` |
| `--validator` | _(none)_ | `Validator (Suggested)` | `--validator=*Pro` |
| `--done` | _(none)_ | `☐ Done` | `--done=false` (open tasks) or `--done=✅*` |
| `--valid` | _(none)_ | `☐ Valid` | `--valid=true` (validated tasks) or `--valid=⬜` |

### State Override Flags

When combined with a filter, these override the matched task's **`☐ Done`** AND **`☐ Valid`** columns simultaneously (unlike `/wbWork` which only touches `☐ Done`, and `/wbValid` which only touches `☐ Valid`).

| Long | Short | Target State | Sets Columns To |
|---|---|---|---|
| `--open` | `-o` | Reopen | `⬜` (both `☐ Done` and `☐ Valid`) |
| `--def` | `-d` | Defer | `⏸️ Deferred` (both) |
| `--can` | `-c` | Cancel | `🚫 Cancelled` (both) |

### Resume / Scope Flags

| Long | Short | Purpose |
|---|---|---|
| `--resume` | `-r` | Resume work from an existing plan file instead of generating a fresh one |
| `--scope` | `-s` | Limit the plan's generation scope to a specific sub-folder or file |
| `--task` | `-t` | Seed the plan with a specific task description string |

## 3. Usage Patterns

### Filter by Priority

```bash
/wbPlan plan_core2_20260503.md --p=P1           # All P1 tasks
/wbPlan plan_core2_20260503.md --p=P1&&P2        # P1 and P2 tasks
```

### Filter by Estimated Time

```bash
/wbPlan plan_core2_20260503.md --est<=30         # Quick wins (≤30 min)
/wbPlan plan_core2_20260503.md --est>60           # Large tasks only
```

### Combined Filters

```bash
/wbPlan plan_core2_20260503.md --p=P1 --est<=30   # High-priority quick wins
/wbPlan plan_core2_20260503.md --done=false --p=P1 # Open P1 tasks
```

### State Manipulation

```bash
/wbPlan plan_core2_20260503.md --id=3 --def       # Defer task 3
/wbPlan plan_core2_20260503.md --id=1 --open      # Reopen completed task 1
/wbPlan plan_core2_20260503.md --id>=5 --can       # Cancel tasks 5 and above
```

### Recursive Task Expansion

When `--id` targets a parent recursive task, `/wbPlan` automatically expands it into numbered sub-tasks (5.1, 5.2, 5.3, etc.) and appends a `## 🔄 Sub-plan for Task #N` section to the plan file.

```bash
/wbPlan plan_core2_20260503.md --id=5             # Expand task 5 into sub-tasks
```

## 4. Resolution Chain

1. **Help Gate:** Check for `--help`/`-h`/`--h` — if present, print and stop.
2. **Flag Normalization:** Short forms (`-i`, `-o`, `-d`, `-c`, `-r`, `-s`, `-t`) → long forms.
3. **State Overrides First:** If `--open`/`--def`/`--can` present, apply state changes and stop (no execution).
4. **Column Filters:** Match rows against filter criteria.
5. **Plan Generation / Execution:** Generate the plan (or resume from existing), then expand/execute matching tasks.

## 5. Difference from `/wbWork` and `/wbValid`

| Command | Column Scope | Default Mode | State Override Behavior |
|---|---|---|---|
| `/wbPlan` | ALL columns (generates + filters + executes + state) | Generate new plan OR filter existing | Modifies **both** `☐ Done` and `☐ Valid` |
| `/wbWork` | ALL columns (filters + executes only) | Execute tasks matching filter | Modifies **only** `☐ Done` |
| `/wbValid` | ALL columns (filters + validates only) | Validate tasks matching filter | Modifies **only** `☐ Valid` |

> **Rule of thumb:** Use `/wbPlan` to create/expand/state-manage plans. Use `/wbWork` to execute. Use `/wbValid` to peer-review. State overrides via `/wbWork` and `/wbValid` are scoped to their respective columns.

---


## 🔗 Sister Edition

> The [Claude edition (`flow.wbc-ui.com`)](../../flow.wbc-ui.com/src/concepts/) <!-- [CROSS-EDITION] Phase=A --> covers the same concept in a self-help, opinionated register.

---

← [Concepts Hub](README.md) · [Home](../README.md)
