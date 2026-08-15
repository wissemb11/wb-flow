# /wbNext — Exhaustive Simulation ()

`/wbNext` is the DAG navigator. It reads the active plan, evaluates which tasks are unblocked, and returns the single highest-priority next task. The key design choice: `/wbNext` returns **one answer**, not a menu. If you want a menu, use `/wbStandup`. If you want the answer and immediate execution, use `/wbNext --act`.

Read this if you want to know how the DAG evaluation works, what `--sort` changes about the selection, and why `--act` is the most dangerous flag in the orchestration group.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The DAG Navigator & Task Allocator. Returns one task. |
| **Target** | The active `plan_*.md` file in the scoped directory. |
| **Cell scope** | None (read-only by default). With `--act`, delegates to `/wbWork` which writes to `Done`. |
| **Side effects allowed** | Reading plans. With `--act`: everything `/wbWork` is allowed to do. |
| **Side effects forbidden** | Writing to plans directly. `/wbNext` never touches the plan file itself — it delegates to `/wbWork` when `--act` is passed. |

The "one answer" principle is deliberate. When multiple tasks are unblocked, `/wbNext` picks one and commits to it. The selection algorithm is: chronological order (lowest ID first) unless `--sort` overrides. This means `/wbNext` is **deterministic** — same plan state, same flags → same answer. That determinism is what makes `--act` safe: you know what it will do before it does it.

---

## 2. Argument resolution

| Form | Example | What `/wbNext` reads |
|---|---|---|
| No argument | `Command: /wbNext` | Searches current directory for `plan_*.md`. |
| Package path | `Command: /wbNext packages/wb-core` | Reads wb-core's plan specifically. |
| Wildcard glob | `Command: /wbNext apps/*` | Reads all active plans in consumer apps. Returns one unified "next" per app. |
| Natural language | `Command: /wbNext "what should I do?"` | Treated as no-arg — NL is tolerated but resolved identically to default behavior. |

The wildcard form returns **one task per plan**, not one task across all plans. This is different from `/wbStandup apps/*` which aggregates into a single view. `/wbNext` preserves per-plan scope because a "next task" only makes sense within a single DAG.

---

## 3. Flag matrix

| Flag | Shortcut | Purpose |
|---|---|---|
| `--sort="<metric>"` | `-s` | Overrides chronological selection. Accepts `complexity`, `risk`, `priority`. |
| `--act` | `-a` | Auto-executes `/wbWork --id="<selected>"` on the returned task. No confirmation prompt. |

**`--act` is the autonomous mode.** It's the only flag in the orchestration group that triggers code changes. `/wbNext -a` is equivalent to running `/wbNext` to get the ID, then `/wbWork --id="<that ID>"` — but without the human step between. Use it in automated chains; avoid it when the plan state is uncertain.

**`--sort` semantics.** The metrics aren't computed from external data — they're read from the plan row's metadata (if the plan includes complexity/risk/priority columns). If the plan doesn't have those columns, `--sort` falls back to chronological with a warning.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbNextSimPipelines = [
  {
    "title": "Autonomous execution loop",
    "cmd": "/wbNext packages/wb-core -a -e",
    "logs": [
      {
        "text": "[SYSTEM] Querying DAG for next unblocked node...",
        "type": "sys"
      },
      {
        "text": "[READ] plan_wb-core_20260504.md",
        "type": "gen"
      },
      {
        "text": "[EXPLAIN] DAG evaluation:",
        "type": "gen"
      },
      {
        "text": "Row 1: \u2705 Done, \u2705 Valid \u2014 complete, skipped.",
        "type": "gen"
      },
      {
        "text": "Row 2: \u2705 Done, \u2705 Valid \u2014 complete, skipped.",
        "type": "gen"
      },
      {
        "text": "Row 3: \u2b1c Pending, Deps [1, 2] satisfied \u2014 ELIGIBLE.",
        "type": "gen"
      },
      {
        "text": "[NEXT] Task 3: WBC.js decomposition",
        "type": "gen"
      },
      {
        "text": "[ACT] Handing off to /wbWork --id=\"3\"...",
        "type": "gen"
      },
      {
        "text": "[WORK] Row 3: WBC.js decomposition",
        "type": "gen"
      },
      {
        "text": "Editing core2/packages/wb-core/src/WBC.js...",
        "type": "gen"
      },
      {
        "text": "[VERIFY] Running row 3's verify command...",
        "type": "gen"
      },
      {
        "text": "[OK] Row 3 passed verify.",
        "type": "ok"
      },
      {
        "text": "[PLAN] Row 3.Done = \u2705",
        "type": "gen"
      }
    ],
    "note": "The fully autonomous pattern: find next, explain why, do it.",
    "noteType": "info"
  },
  {
    "title": "Multi-app triage (which app needs work first)",
    "cmd": "/wbNext apps/* -s=\"priority\"",
    "logs": [
      {
        "text": "[SYSTEM] Aggregating active plans across apps/*...",
        "type": "sys"
      },
      {
        "text": "[READ] 3 plans found.",
        "type": "gen"
      },
      {
        "text": "[NEXT per plan]",
        "type": "gen"
      },
      {
        "text": "| App | Next Task | ID | Priority | Status |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| demo.wbc-ui.com | Configure CDN fallback | 3 | P1 | Ready |",
        "type": "sys"
      },
      {
        "text": "| md.wbc-ui.com | \u2014 | \u2014 | \u2014 | Plan complete \u2705 |",
        "type": "sys"
      },
      {
        "text": "| wbc-ui.com | Resolve VuePress compat | 2 | P0 | **Blocked** (dep on auth fix) |",
        "type": "sys"
      },
      {
        "text": "[RECOMMENDATION] demo.wbc-ui.com Task 3 is the only unblocked P1.",
        "type": "gen"
      },
      {
        "text": "wbc-ui.com Task 2 is P0 but blocked \u2014 resolve auth (Task 1) first.",
        "type": "gen"
      }
    ],
    "note": "The lead wants to know the single most important unblocked task across all consumer apps:",
    "noteType": "info"
  },
  {
    "title": "Simple next-task query with no frills",
    "cmd": "/wbNext packages/wb-core",
    "logs": [
      {
        "text": "[SYSTEM] Querying DAG...",
        "type": "sys"
      },
      {
        "text": "[NEXT] Task 3: WBC.js decomposition (\u2b1c Pending, deps satisfied)",
        "type": "gen"
      },
      {
        "text": "[RECOMMENDATION] Run `/wbWork --id=\"3\"` to execute.",
        "type": "gen"
      }
    ],
    "note": "The most common use case: \"what's next?\"",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbNext" titleSuffix="Exhaustive Simulation" :pipelines="wbNextSimPipelines" />


### 💠 Pipeline Autonomous execution loop

The fully autonomous pattern: find next, explain why, do it.


### 💠 Pipeline Multi-app triage (which app needs work first)

The lead wants to know the single most important unblocked task across all consumer apps:


### 💠 Pipeline Simple next-task query with no frills

The most common use case: "what's next?"

---

## 5. Edge cases & refusals

| Trigger | What `/wbNext` does |
|---|---|
| All tasks complete | `✅ Plan complete. No remaining tasks. Recommendation: /wbRelease or /wbGit.` |
| All remaining tasks blocked | `❌ All pending tasks are DAG-blocked. No unblocked work available. Run /wbDebug to investigate.` |
| No plan file in scope | `❌ No active plan found. Run /wbPlan to generate one.` |
| `--sort="complexity"` but plan has no Complexity column | `⚠️ Plan lacks complexity metadata. Falling back to chronological order.` |
| `--act` on a task whose verify command fails | `/wbWork` handles the failure. Row stays `⬜`. `/wbNext` reports the failure in its output summary. |
| Circular dependency (row A deps row B, row B deps row A) | `❌ Circular DAG detected between rows A and B. Plan is invalid — fix plan_*.md manually.` |
| Stale statuses (Done ✅ but Valid ⬜) | `⚠️ Task N is done but not validated. Run /wbValid --id="N" before proceeding to the next task.` |

The unifying principle: **`/wbNext` returns one answer or one refusal.** It doesn't produce a menu of options (that's `/wbStandup`) or a detailed analysis (that's `/wbExplain --id`). The narrowness is the feature — in an automated chain, you want a single deterministic output, not a decision tree.
