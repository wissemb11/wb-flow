# /wbGit — Exhaustive Simulation ()

`/wbGit` is the scribe — and the **only** command in the entire `/wb*` system that touches git. Every other command is read-only against the working tree. This is not a polite preference; it's a hard rule encoded in user memory ("never use git commands"), and `/wbGit` is the single, deliberate exception.

Read this if you want to know exactly which 10 flags exist, what each refuses to do, why the provenance header is mandatory, and what the agent will not do even when explicitly asked.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Scribe — produces commit message text; optionally executes git operations under explicit flags. |
| **Target** | The current working tree (no argument), a specific patch file (`-d`), the active plan (`-P`), or recently modified files (`-r`). |
| **Cell scope** | None directly. `/wbGit` may *read* plan rows (to enrich commit messages with `Refs: plan_<...>.md`) but never mutates plan cells. |
| **Side effects allowed under explicit flags** | `git add`, `git commit`, `git push`, `git commit --amend`. |
| **Side effects always forbidden** | `git push --force` to a protected branch (refuses unconditionally); `git commit --no-verify` without explicit user override (warning + halt by default); modifying `.git/config`; running interactive rebases. |

The "single exception" rule has a shape: `/wbGit` *without* an execution flag (default behavior) is **read-only on git** — it runs `git status` and `git diff` (both read-only) to compose a message, then prints the message. Execution requires an explicit `-e`/`-p`/`-A` flag, and even then the agent confirms before each separate git command.

---

## 2. Argument resolution matrix

| Form | Example | What `/wbGit` does |
|---|---|---|
| No argument | `Command: /wbGit` | Reads `git status` + `git diff`. Produces a Conventional Commits message. Does not execute. |
| Free-text intent | `Command: /wbGit "commit as mixed change"` | Parses intent (forces `chore:` prefix that acknowledges the mix). Still does not execute. |
| Free-text intent + flag | `Command: /wbGit "commit and push" -e -p` | Equivalent to `/wbGit -e -p`. NL is interpreted as flag-equivalent. |
| Patch file | `Command: /wbGit -d="patch.diff"` | Reads the patch file instead of the working tree. Useful for reviewing pre-staged work. |

---

## 3. The 10 flags

Three categories: **information extraction** (where the message comes from), **architectural context** (what metadata to embed), and **execution** (what git operations to actually run).

### Information extraction

| Flag | Shortcut | Purpose |
|---|---|---|
| `--from-plan` | `-P` | Reads today's `plan_*.md` and uses `✅ Done` rows as the commit body source. |
| `--scan-recent` | `-r` | Cross-references files modified in the last 2 hours; useful when no plan exists. |
| `--diff-file="<path>"` | `-d` | Reads a specific patch file instead of the working tree. |

These three shape *content*, not behavior. They can be composed (`-P -r` cross-references both); the agent merges into one coherent message.

### Architectural context

| Flag | Shortcut | Purpose |
|---|---|---|
| `--amend` | `-A` | `git commit --amend` instead of new commit. Refuses if the previous commit was already pushed (unless `-F` is also passed and the user confirms). |

### Execution

| Flag | Shortcut | Purpose |
|---|---|---|
| `--execute` | `-e` | Runs `git add` + `git commit`. Asks for confirmation before each. |
| `--push` | `-p` | Runs `git push origin <current-branch>`. Separate confirmation gate from `-e`. |
| `--force` | `-F` | Force push. **Refuses on protected branches.** Asks twice on others. |
| `--no-verify` | `-n` | Skip pre-commit hooks. Halts with explicit override required. |

The four-stage gate (`status/diff` → `add` → `commit` → `push`) is the design center. Each gate is independently confirmable; the user can stop at any point. `-F` and `-n` are *off by default* even in execution chains — they require explicit, named override.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbGitSimPipelines = [
  {
    "title": "The \"Daily Sync\" (the EOD habit)",
    "cmd": "/wbGit -P -e -p",
    "logs": [
      {
        "text": "[SYSTEM] Reading active plan: plan_<package>_<date>.md",
        "type": "sys"
      },
      {
        "text": "[PLAN] 2 rows have Done=\u2705, Valid=\u2705: rows 1, 2.",
        "type": "gen"
      },
      {
        "text": "[GENERATE] Drafting message from plan rows...",
        "type": "gen"
      },
      {
        "text": "feat(<package>): close JWT handshake and renderString escape",
        "type": "gen"
      },
      {
        "text": "<!-- wbGit",
        "type": "gen"
      },
      {
        "text": "date: <date> <time>",
        "type": "gen"
      },
      {
        "text": "model: claude-opus-4-7",
        "type": "gen"
      },
      {
        "text": "session: claude",
        "type": "gen"
      },
      {
        "text": "plan: reports/<date>/plans/plan_<package>_<date>.md",
        "type": "gen"
      },
      {
        "text": "notes: \u2014",
        "type": "gen"
      },
      {
        "text": "-->",
        "type": "gen"
      },
      {
        "text": "- Add JWT handshake with alg denylist in tierEnforcement.js (row 1)",
        "type": "gen"
      },
      {
        "text": "- Add escape pass for <, >, & in renderString.js (row 2)",
        "type": "gen"
      },
      {
        "text": "Refs plan_<package>_<date>.md.",
        "type": "gen"
      },
      {
        "text": "[GATE 1: add] git add core2/packages/<package>/src/tierEnforcement.js",
        "type": "gen"
      },
      {
        "text": "git add core2/packages/<package>/src/renderString.js",
        "type": "gen"
      },
      {
        "text": "[y/N] > y",
        "type": "gen"
      },
      {
        "text": "[GATE 2: commit] git commit -m \"<message above>\"",
        "type": "gen"
      },
      {
        "text": "[y/N] > y",
        "type": "gen"
      },
      {
        "text": "[OK] Commit a1b2c3d created.",
        "type": "ok"
      },
      {
        "text": "[GATE 3: push] git push origin main",
        "type": "gen"
      },
      {
        "text": "[y/N] > y",
        "type": "gen"
      },
      {
        "text": "[OK] Pushed 1 commit to origin/main.",
        "type": "ok"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "The mixed-change refusal that the user can override",
    "cmd": "/wbGit",
    "logs": [
      {
        "text": "[SYSTEM] git diff analysis:",
        "type": "sys"
      },
      {
        "text": "File 1: core2/packages/wb-core/src/components/WBCodeSlot.vue (+145 -2)",
        "type": "gen"
      },
      {
        "text": "\u2192 feature: new component",
        "type": "gen"
      },
      {
        "text": "File 2: core2/packages/wb-dataviewer/src/App.vue (+3 -4)",
        "type": "gen"
      },
      {
        "text": "\u2192 bug fix: apiResponse_ cache invalidation",
        "type": "gen"
      },
      {
        "text": "File 3: frontEnd/wbc-ui/core2/packages/wb-flow/templates/.../README.md (+40 -8)",
        "type": "gen"
      },
      {
        "text": "\u2192 docs: README update",
        "type": "gen"
      },
      {
        "text": "[REFUSE] 3 unrelated changes in one working tree.",
        "type": "error"
      },
      {
        "text": "A Conventional Commit expects one logical change per commit.",
        "type": "gen"
      },
      {
        "text": "[OPTIONS]",
        "type": "gen"
      },
      {
        "text": "1. Split: I can stage each separately.",
        "type": "gen"
      },
      {
        "text": "- feat(wb-core): WBCodeSlot component",
        "type": "gen"
      },
      {
        "text": "- fix(wb-dataviewer): apiResponse_ cache invalidation",
        "type": "gen"
      },
      {
        "text": "- docs: update command reference README",
        "type": "gen"
      },
      {
        "text": "2. Override: tell me \"commit as mixed change\" and I'll write a",
        "type": "gen"
      },
      {
        "text": "`chore:` message that acknowledges the mix.",
        "type": "gen"
      },
      {
        "text": "3. Manual: tell me which files belong together.",
        "type": "gen"
      },
      {
        "text": "[NO MUTATION] Waiting for direction.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "The hooks-failed \"do not skip\" refusal",
    "cmd": "/wbGit -e",
    "logs": [
      {
        "text": "[SYSTEM] Pre-commit hooks running...",
        "type": "sys"
      },
      {
        "text": "[HOOK] eslint failed on src/components/WBCodeSlot.vue:45",
        "type": "gen"
      },
      {
        "text": "\"unused variable 'foo'\"",
        "type": "gen"
      },
      {
        "text": "[BLOCK] Commit blocked by pre-commit hook.",
        "type": "gen"
      },
      {
        "text": "[REFUSE] I will NOT skip the hook with -n. Either the hook is wrong",
        "type": "error"
      },
      {
        "text": "(fix the hook) or the code is wrong (fix the code). Skipping",
        "type": "gen"
      },
      {
        "text": "hides problems.",
        "type": "gen"
      },
      {
        "text": "[STATE]",
        "type": "gen"
      },
      {
        "text": "- No commit was created.",
        "type": "gen"
      },
      {
        "text": "- Files remain staged.",
        "type": "gen"
      },
      {
        "text": "- Edit and re-run /wbGit -e.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  },
  {
    "title": "Graph link + issue ref",
    "cmd": "/wbGit -L -i=\"WBC-42\"",
    "logs": [
      {
        "text": "[SYSTEM] git status + diff (read-only).",
        "type": "sys"
      },
      {
        "text": "[DASHBOARD] Active Understand-Anything graph detected at",
        "type": "gen"
      },
      {
        "text": "http://127.0.0.1:5173?token=abc...",
        "type": "gen"
      },
      {
        "text": "Will embed URL in provenance header notes.",
        "type": "gen"
      },
      {
        "text": "[ISSUE] Will append \"Refs: WBC-42\" to commit footer.",
        "type": "gen"
      },
      {
        "text": "refactor(wb-core): apply strategy pattern to pipeline parser",
        "type": "gen"
      },
      {
        "text": "<!-- wbGit",
        "type": "gen"
      },
      {
        "text": "date: <date> <time>",
        "type": "gen"
      },
      {
        "text": "model: claude-opus-4-7",
        "type": "gen"
      },
      {
        "text": "session: claude",
        "type": "gen"
      },
      {
        "text": "plan: \u2014",
        "type": "gen"
      },
      {
        "text": "notes: Graph: http://127.0.0.1:5173?token=abc...",
        "type": "gen"
      },
      {
        "text": "-->",
        "type": "gen"
      },
      {
        "text": "[Body]",
        "type": "gen"
      },
      {
        "text": "Refs: WBC-42",
        "type": "gen"
      },
      {
        "text": "[NO EXECUTION] Print only. Add -e to commit.",
        "type": "gen"
      }
    ],
    "note": "",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbGit" titleSuffix="Exhaustive Simulation" :pipelines="wbGitSimPipelines" />


### 💠 Pipeline The "Daily Sync" (the EOD habit)


### 💠 Pipeline The mixed-change refusal that the user can override


### 💠 Pipeline The hooks-failed "do not skip" refusal


### 💠 Pipeline Graph link + issue ref

---

## 5. Edge cases & refusals

| Trigger | What `/wbGit` does |
|---|---|
| Empty diff | Halt. `❌ No changes detected; nothing to commit.` |
| Merge conflict in `git status` | Halt. Refuses to auto-resolve. Tells the user to resolve manually. |
| `--force` on a branch with the protected-branch flag (e.g., main, master, prod) | **Unconditional refuse.** Even with override. |
| `--force` on a non-protected branch | Refuse with two confirmations. The user must say `y` twice. |
| `--no-verify` | Halt + explicit override required. Records "user invoked --no-verify" in provenance notes. |
| `--amend` after the previous commit was pushed | Refuse unless `-F` is also explicitly passed. Amending pushed commits rewrites public history. |
| Detached HEAD state | Warns; commits will not attach to a branch. Asks user to confirm. |
| `--from-plan` with no `✅ Done` rows in the plan | Honest "no done rows; nothing to commit from plan." Suggests `-r` (scan-recent) instead. |
| Commit message exceeds the 72-char subject line limit | Truncates the subject to 72 chars; preserves the full thought in the body. |
| User asks "delete the last commit" via NL | Refuse. Destructive operations require explicit git knowledge from the user, not NL inference. |

The pattern: **`/wbGit` is the single git command, with multiple gates between intent and side effect.** It refuses to do anything destructive without explicit override; refuses to bundle unrelated changes silently; refuses to amend pushed commits without `-F`; refuses to push to protected branches with force. Every gate is named, every refusal explained, every override recorded. The provenance header is the audit trail — without it, the closed-loop architecture (plan → work → validate → commit) loses its final link.
