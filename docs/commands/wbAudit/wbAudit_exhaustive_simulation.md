# /wbAudit — Exhaustive Simulation ()

`/wbAudit` is the critic. Its job is brutal evidence-based review: read code, name what's wrong, and cite the file/line/symbol so the finding is verifiable. It is the only command in the QA group whose output is **adversarial by design** — it actively looks for problems, and prefers a false-positive over a false-negative.

Read this if you want to know what `--profile` actually selects against, why `--act` and `--wbPlan` produce different downstream artifacts, and where audit ends and refactor begins.

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Critic — adversarial review with citations. |
| **Target** | A file, a directory, a glob, or a comma-separated list of paths. |
| **Cell scope** | None. Audit produces a *report*, not plan mutations. (Mutation happens via `--act` or `--wbPlan` chaining into other commands.) |
| **Side effects allowed** | Reading code, reading test results if present, citing line numbers. |
| **Side effects forbidden** | Editing source code, running fixes, mutating plan cells directly. |

The "evidence-based" rule is what separates `/wbAudit` from `/wbReview`. A review (`/wbReview`) compares a diff against a plan row's *intent*: did you do what the row asked? An audit compares code against *standards*: is what's there well-built, regardless of why it was built? Different jobs, different lenses.

`/wbAudit` always cites — file path + line range + symbol name. A finding without a citation is not a finding; it's an opinion. The agent will refuse to emit unsourced critique even when the code is clearly bad, because unverifiable feedback rots the audit's credibility.

---

## 2. Argument resolution matrix

| Form | Example | What `/wbAudit` does |
|---|---|---|
| Single file | `Command: /wbAudit core2/packages/wb-core/src/WBC.js` | Locks to one file. Deepest possible scrutiny. |
| Directory | `Command: /wbAudit core2/packages/wb-core/` | Walks the directory. Excludes `node_modules`, `dist*`, `.git`. |
| Glob | `Command: /wbAudit "core2/packages/*/src/**/*.js"` | Matches across packages. Expands quietly; refuses with explicit error if expansion exceeds 200 files. |
| CSV array | `Command: /wbAudit src/WBC.js,src/renderString.js` | Two specific files. Findings cross-reference where relevant. |
| Free-text scope | `Command: /wbAudit "the auth path"` | Resolves keyword across workspace. Refuses if 3+ unrelated candidates match (no fuzzy guessing on adversarial work). |

The 200-file glob ceiling is intentional. An audit's value is per-finding density; spreading across 2000 files dilutes attention and produces a list of generic warnings. If the user genuinely wants that breadth, they should run multiple narrower audits and let the findings stack. The ceiling protects the *quality* of the output, not the runtime.

---

## 3. Flag matrix

`/wbAudit` has five flags. Two of them (`--act`, `--wbPlan`) are *chaining* flags that pipe the audit output into a downstream command — they're how an audit becomes actionable.

| Flag | Shortcut | Mode | What it does |
|---|---|---|---|
| `--profile="<name>"` | `-p` | Filter | Restricts findings to one lens: `security`, `performance`, `accessibility`, `correctness`, `style`. Default: all five at low density. |
| `--scope="<level>"` | `-s` | Filter | Limits the audit to one architectural tier (single-package vs cross-package vs whole-repo). |
| `--security` | `-S` | Filter | Convenience alias for `-p="security"`. Capitalized to avoid colliding with `-s` (scope). |
| `--act` | `-a` | Chain | Routes audit output through `/wbActOn` — produces a sibling action file ranking findings by impact/effort. |
| `--wbPlan` | `-P` | Chain | Routes audit output through `/wbActOn`'s plan-generation engine — appends new rows to the active plan, one per critical finding. |

`--act` and `--wbPlan` are *composable*. `/wbAudit ... --act --wbPlan` produces the audit report **and** the action file **and** new plan rows — three artifacts in one chain. They're independent flags; combining them isn't a special mode, it's just two pipes.

### How `--profile` shapes the output

Each profile has a fixed checklist of finding types. The agent doesn't invent categories per audit — the profile is a *contract* with the reader about what was looked for.

| Profile | Looks for |
|---|---|
| `security` | XSS surfaces, eval/Function constructor use, unsafe deserialize, secrets in source, token storage in localStorage, SSRF-prone URL composition. |
| `performance` | O(n²) in hot paths, unbounded recursion, sync I/O on event loop, unmemoized expensive computes, memory leaks via uncleared timers. |
| `accessibility` | Missing alt text, unlabeled controls, color-only signals, keyboard trap, semantic-tag misuse. |
| `correctness` | Off-by-one, null-deref, type assertions without checks, dropped promise rejections, uncaught async errors. |
| `style` | Naming, dead code, duplicate logic, missing type annotations (only when the file is otherwise typed). |

If a finding doesn't fit any profile, it's reported under `correctness` with a note that it's a soft category. This keeps the contract honest.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbAuditSimPipelines = [
  {
    "title": "The wbc-ui2-cdn package config audit",
    "cmd": "/wbAudit core2/packages/wbc-ui2-cdn/ --profile=\"correctness\"",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/wbc-ui2-cdn/",
        "type": "sys"
      },
      {
        "text": "[PROFILE] correctness \u2014 looking for off-by-ones, null-derefs, dropped",
        "type": "gen"
      },
      {
        "text": "promises, build-config drift.",
        "type": "gen"
      },
      {
        "text": "[SCAN] 14 files inspected.",
        "type": "gen"
      },
      {
        "text": "## Finding 1 \u2014 main field points at non-existent dist/",
        "type": "sys"
      },
      {
        "text": "**Severity:** P1",
        "type": "sys"
      },
      {
        "text": "**File:** core2/packages/wbc-ui2-cdn/package.json:6",
        "type": "sys"
      },
      {
        "text": "**Symbol:** \"main\"",
        "type": "sys"
      },
      {
        "text": "**Citation:**",
        "type": "sys"
      },
      {
        "text": "\"main\": \"./dist/index.js\"",
        "type": "gen"
      },
      {
        "text": "**Evidence:**",
        "type": "sys"
      },
      {
        "text": "- vite.config.js:18 sets build.outDir = \"dist-dev\"",
        "type": "gen"
      },
      {
        "text": "- ls dist/ \u2192 no such directory",
        "type": "gen"
      },
      {
        "text": "- ls dist-dev/index.js \u2192 exists",
        "type": "gen"
      },
      {
        "text": "**Why it matters:** Consumers resolving `main` get module-not-found.",
        "type": "sys"
      },
      {
        "text": "**Why it's still here:** Memory note `project_pkg_dist_mismatch.md`",
        "type": "sys"
      },
      {
        "text": "records this as parked tech debt \u2014 fixing it without choosing",
        "type": "gen"
      },
      {
        "text": "\"dev convention leaks to consumers\" or \"vite reconfig\" is unsolved.",
        "type": "gen"
      },
      {
        "text": "**Recommendation:** Not a one-line fix; do not patch. Document or fix",
        "type": "sys"
      },
      {
        "text": "both ends in a coordinated change.",
        "type": "gen"
      },
      {
        "text": "## Finding 2 \u2014 ...",
        "type": "sys"
      }
    ],
    "note": "A real situation: the `core2/` packages have a parked `dist-folder mismatch` (per `project_pkg_dist_mismatch.md`). The audit doesn't *fix* it \u2014 but it can confirm the symptom is still present and surface it as a citation.",
    "noteType": "info"
  },
  {
    "title": "The chained \"audit \u2192 plan rows\" workflow",
    "cmd": "/wbAudit core2/packages/wb-core/ --profile=\"security\" --wbPlan",
    "logs": [
      {
        "text": "[SYSTEM] Target: core2/packages/wb-core/",
        "type": "sys"
      },
      {
        "text": "[PROFILE] security",
        "type": "gen"
      },
      {
        "text": "[SCAN] 22 files. 3 findings (1 P0, 2 P1).",
        "type": "gen"
      },
      {
        "text": "[CHAIN] --wbPlan: routing through /wbActOn plan engine.",
        "type": "gen"
      },
      {
        "text": "## Findings (audit report, summary)",
        "type": "sys"
      },
      {
        "text": "1. P0 \u2014 tierEnforcement.js:42 \u2014 accepts `alg: \"none\"` JWT (deny algorithm not in checklist).",
        "type": "gen"
      },
      {
        "text": "2. P1 \u2014 fetcher.js:87 \u2014 token written to localStorage (XSS-readable).",
        "type": "gen"
      },
      {
        "text": "3. P1 \u2014 sanitize.js:14 \u2014 innerHTML used without escape pass.",
        "type": "gen"
      },
      {
        "text": "## Plan rows added to plan_wb-core_<date>.md",
        "type": "sys"
      },
      {
        "text": "| # | Task | Verify | Dep |",
        "type": "sys"
      },
      {
        "text": "|---|---|---|---|",
        "type": "sys"
      },
      {
        "text": "| 4 | Add `alg` denylist to JWT verify in tierEnforcement.js | unit test asserts `alg:\"none\"` rejected | \u2014 |",
        "type": "sys"
      },
      {
        "text": "| 5 | Move token from localStorage to httpOnly cookie in fetcher.js | manual: localStorage shows no token after login | 4 |",
        "type": "sys"
      },
      {
        "text": "| 6 | Replace innerHTML with textContent + structured insert in sanitize.js | XSS payload test rejected | \u2014 |",
        "type": "sys"
      },
      {
        "text": "[OK] Audit report saved to reports/<date>/audits/audit_wb-core_security_<date>.md",
        "type": "ok"
      },
      {
        "text": "[OK] 3 plan rows added. Run /wbWork --id=\"4,6\" to start unblocked work.",
        "type": "ok"
      }
    ],
    "note": "The use case for `--wbPlan`: an audit surfaces real work, and the user wants those findings to become plan rows that `/wbWork` can pick up. Run live:",
    "noteType": "info"
  },
  {
    "title": "Surgical security check before a release",
    "cmd": "/wbAudit \"core2/packages/wb-core/src/auth/**\" --security --act",
    "logs": [
      {
        "text": "[SYSTEM] Glob expanded to 4 files.",
        "type": "sys"
      },
      {
        "text": "[PROFILE] security (alias for -p=\"security\").",
        "type": "gen"
      },
      {
        "text": "[SCAN] 0 P0 findings. 1 P2 (style: unused import in auth/utils.js).",
        "type": "gen"
      },
      {
        "text": "[CHAIN] --act: producing action file.",
        "type": "gen"
      },
      {
        "text": "## Action file: reports/<date>/actions/action_wb-core_auth_security_<date>.md",
        "type": "sys"
      },
      {
        "text": "1 finding ranked. P2 \u2014 low priority, no release blocker.",
        "type": "gen"
      },
      {
        "text": "[OK] Release-clear from a security standpoint. No plan rows added",
        "type": "ok"
      },
      {
        "text": "(use --wbPlan if you want to track the P2).",
        "type": "gen"
      }
    ],
    "note": "A real pattern at release time: scan only the security-relevant files in a single package, fail loudly if anything P0 surfaces, otherwise stay quiet. `--act` (no `--wbPlan`) gives you the ranked action file without polluting the plan:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbAudit" titleSuffix="Exhaustive Simulation" :pipelines="wbAuditSimPipelines" />


### 💠 Pipeline The wbc-ui2-cdn package config audit

A real situation: the `core2/` packages have a parked `dist-folder mismatch` (per `project_pkg_dist_mismatch.md`). The audit doesn't *fix* it — but it can confirm the symptom is still present and surface it as a citation.


### 💠 Pipeline The chained "audit → plan rows" workflow

The use case for `--wbPlan`: an audit surfaces real work, and the user wants those findings to become plan rows that `/wbWork` can pick up. Run live:


### 💠 Pipeline Surgical security check before a release

A real pattern at release time: scan only the security-relevant files in a single package, fail loudly if anything P0 surfaces, otherwise stay quiet. `--act` (no `--wbPlan`) gives you the ranked action file without polluting the plan:

---

## 5. Edge cases & refusals

| Trigger | What `/wbAudit` does |
|---|---|
| No target at all | Halt. `❌ Provide a path, glob, CSV, or scope keyword.` |
| Glob expanding to >200 files | Halt. `❌ Glob too broad. Run multiple narrower audits and let findings stack.` |
| `--profile="magic"` (unrecognized) | Halt. `❌ Unknown profile. Choose: security \| performance \| accessibility \| correctness \| style.` (No silent fallback to "general" — the contract with the reader matters.) |
| `--act --wbPlan` together | Both fire. Audit + action file + plan rows produced. |
| Free-text target matches 3+ unrelated areas | Halt with disambiguation. `/wbAudit` is adversarial; fuzzy guessing on adversarial work amplifies bias. |
| Target file genuinely has zero findings | `[OK] No findings at the requested profile depth.` Quiet exit, no false-positive padding. |
| Audit triggers on auto-generated files (`.d.ts`, vendored deps) | Skip with one-line notice. Auto-gen findings are noise; the audit is for hand-written code. |
| `--security` and `--profile="performance"` both passed | Halt. Conflicting profiles. The user must pick one. |

The unifying rule: `/wbAudit` is **opinionated and citable**. It refuses to invent findings without sources, refuses to dilute attention across thousands of files, refuses to silently fall back when the user asks for something unrecognized. The output is a contract — every finding can be checked against the cited line.
