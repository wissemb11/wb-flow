# /wbExplain — Live Demo ()

What `/wbExplain` would actually produce on `wb-labs` today (2026-05-04). Rows, files, and concepts in this matrix are real — the explanations the agent would generate are excerpted from realistic outputs.

---

<CommandLiveDemoAnimation command="wbExplain" />

## 1. Live target

| Field | Live value |
|---|---|
| Active package | `core2/packages/wb-core` |
| Active plan | `reports/20260504/plans/plan_wb-core_20260504.md` (3 rows, all `⬜`) |
| Memory available to the agent | `MEMORY.md` index plus 12 leaf files (user profile, project tech debt, feedback rules, etc.) |
| Search corpus for free-text targets | The full working tree under `/home/wissemb11/Allprojects/wb-labs/` |

`/wbExplain` is the only command in this group that *actively reads memory at runtime*. When you ask "what is the docs edition," it's the memory file `project_docs_edition.md` that tells it. The other commands in the QA group read code; `/wbExplain` reads code *and* memory.

---

## 2. What each target form would resolve to today

| Target | Live resolution |
|---|---|
| `--id="1"` | Row 1 of `plan_wb-core_20260504.md` — JWT handshake. Files referenced: `tierEnforcement.js`. |
| `--id="*"` | All 3 rows: JWT handshake, renderString escape, WBC.js decomposition. Synthesized as one narrative. |
| `core2/packages/wb-core/` | Package-level explanation: role, exports, position in the monorepo. |
| `core2/packages/wbc-ui2-cdn/` | Triggers the parked tech-debt note: "package declares main at dist/ but vite writes to dist-dev/" (per `project_pkg_dist_mismatch.md`). |
| `"the wbCode dev gate"` | Resolves to the `__WBC_DEV__` 3-mode pattern (full / dev / hidden) — visible in `feedback_wbCode_dev_only.md`. |
| `"WBDataViewer apiResponse_"` | Resolves to the cache-pattern memory note plus the actual code in `core2/packages/wb-dataviewer/`. |
| `"docs edition"` | Resolves to `project_docs_edition.md` (the structural rules for this very documentation project). |

The free-text resolutions are interesting because they pull from memory + code. A naive grep would miss them; a code-only search would miss the context the memory adds.

---

## 3. Per-flag behavior, applied live

| Flag combination | What `/wbExplain` would produce |
|---|---|
| `--id="1"` (no style) | ~400-word principle-first explanation of the JWT handshake row. |
| `--id="1" --as="eli5"` | ~200-word version with bouncer/bracelet metaphors. |
| `--id="1" --as="fr, expert"` | Same content, French, with technical vocabulary preserved (no translation of `JWT`, `tierEnforcement`). |
| `"WBDataViewer apiResponse_" --as="senior reviewer, skeptical"` | Surfaces the three open questions (key scope, naming, no invalidation) before any approval. |
| `"docs edition"` (no style) | The structural rules: 33 commands × 6 layers, no hub files, english-only docs. |

---

## 4. Pipelines

<script setup>
const wbExplainPipelines = [
  {
    "title": "Onboarding doc for the IPEIM student",
    "cmd": "/wbExplain \"frontEnd/wbc-ui/core2/packages/wb-flow/templates/\" --as=\"expert, fr, IPEIM CS senior, internship onboarding\"",
    "logs": [
      {
        "text": "[EXPLAIN] Target: frontEnd/wbc-ui/core2/packages/wb-flow/templates/ (the agentic framework root)",
        "type": "gen"
      },
      {
        "text": "[STYLE] expert FR \u2014 assume systems thinking, no agent 101 preamble.",
        "type": "gen"
      },
      {
        "text": "[CONTEXT] Memory: user is IPEIM CS instructor; the documentation docs convention applies.",
        "type": "ctx"
      },
      {
        "text": "# Le framework wb-flow \u2014 vue d'ensemble pour stagiaire",
        "type": "gen"
      },
      {
        "text": "Le syst\u00e8me repose sur trois invariants, et tout le reste d\u00e9coule d'eux.",
        "type": "gen"
      },
      {
        "text": "**Invariant 1 \u2014 le plan est l'unique source de v\u00e9rit\u00e9.** Chaque journ\u00e9e",
        "type": "sys"
      },
      {
        "text": "de travail est repr\u00e9sent\u00e9e par un fichier `plan_<package>_<date>.md`.",
        "type": "gen"
      },
      {
        "text": "Ce fichier contient un tableau dont chaque ligne d\u00e9crit une t\u00e2che, son",
        "type": "gen"
      },
      {
        "text": "impl\u00e9menteur (`Done`), son validateur (`Valid`), et ses d\u00e9pendances.",
        "type": "gen"
      },
      {
        "text": "Aucune autre forme de tracking n'est autoris\u00e9e.",
        "type": "gen"
      },
      {
        "text": "**Invariant 2 \u2014 le worker et le validateur ne sont jamais le m\u00eame",
        "type": "sys"
      },
      {
        "text": "mod\u00e8le.** `/wbWork` \u00e9crit la cellule `Done`. `/wbValid` \u00e9crit la",
        "type": "gen"
      },
      {
        "text": "cellule `Valid`. Une seule commande peut \u00e9crire une cellule donn\u00e9e.",
        "type": "gen"
      },
      {
        "text": "Cela \u00e9limine l'auto-validation et force une revue ind\u00e9pendante.",
        "type": "gen"
      },
      {
        "text": "**Invariant 3 \u2014 chaque commande mute z\u00e9ro ou une cellule.** `/wbExplain`",
        "type": "sys"
      },
      {
        "text": "mute z\u00e9ro (production de prose). `/wbWork` mute une (`Done`). `/wbPlan`",
        "type": "gen"
      },
      {
        "text": "peut muter les deux dans une transition d'\u00e9tat (rare). Toute tentative",
        "type": "gen"
      },
      {
        "text": "de muter plusieurs cellules dans une commande viole le contrat.",
        "type": "gen"
      },
      {
        "text": "\u00c0 partir de ces trois r\u00e8gles, l'arborescence `frontEnd/wbc-ui/core2/packages/wb-flow/templates/` se d\u00e9duit...",
        "type": "gen"
      }
    ],
    "note": "Wissem teaches at IPEIM (CS instructor since 2018, per memory). A senior-year student joining wb-labs for an internship needs the conceptual map of the agentic framework, in French.",
    "noteType": "info"
  },
  {
    "title": "The WBDataViewer apiResponse_ design review",
    "cmd": "/wbExplain \"WBDataViewer apiResponse_\" --as=\"senior reviewer, skeptical\"",
    "logs": [
      {
        "text": "[EXPLAIN] Resolving \"WBDataViewer apiResponse_\"...",
        "type": "gen"
      },
      {
        "text": "[MATCH] Code: core2/packages/wb-dataviewer/src/App.vue (apiResponse_ pattern usage)",
        "type": "gen"
      },
      {
        "text": "[MATCH] Memory: project_wbdataviewer_apiResponse.md",
        "type": "gen"
      },
      {
        "text": "[STYLE] skeptical \u2014 surface trade-offs first.",
        "type": "gen"
      },
      {
        "text": "The pattern: `apiResponse_` (with trailing underscore) caches the result",
        "type": "gen"
      },
      {
        "text": "of the fetch so that subsequent `project` changes don't refire the",
        "type": "gen"
      },
      {
        "text": "network call. The memory note records this as an intentional design",
        "type": "gen"
      },
      {
        "text": "decision, not an accident.",
        "type": "gen"
      },
      {
        "text": "Three questions you should ask before extending it:",
        "type": "gen"
      },
      {
        "text": "1. **Cache key scope.** The cache lives on the component instance. If",
        "type": "gen"
      },
      {
        "text": "the route remounts the component, the cache is gone. Was that",
        "type": "gen"
      },
      {
        "text": "intentional? (Memory says yes \u2014 the route remount is treated as a",
        "type": "gen"
      },
      {
        "text": "\"fresh context\" signal.) Verify with the original author before",
        "type": "gen"
      },
      {
        "text": "refactoring.",
        "type": "gen"
      },
      {
        "text": "2. **Naming convention.** The trailing underscore is a custom signal,",
        "type": "gen"
      },
      {
        "text": "not a language idiom. Is it documented anywhere a new contributor",
        "type": "gen"
      },
      {
        "text": "would find it? (Currently: only in memory and in the code itself.",
        "type": "gen"
      },
      {
        "text": "Worth a one-line comment at the declaration site.)",
        "type": "gen"
      },
      {
        "text": "3. **Invalidation.** There is no manual invalidation API. Once cached,",
        "type": "gen"
      },
      {
        "text": "the data is fixed for the component's life. If a future requirement",
        "type": "gen"
      },
      {
        "text": "adds \"refresh on user gesture,\" the pattern needs an escape hatch.",
        "type": "gen"
      },
      {
        "text": "That work is not in the current plan; flag it for a future row.",
        "type": "gen"
      },
      {
        "text": "What would *not* warrant extending: a one-off bug fix that wraps",
        "type": "gen"
      },
      {
        "text": "`apiResponse_` in another layer of caching. The pattern is already a",
        "type": "gen"
      },
      {
        "text": "cache; double-caching is a smell.",
        "type": "gen"
      }
    ],
    "note": "A reviewer comes back to the WBDataViewer code six months from now. They see `apiResponse_` (with the trailing underscore) and don't remember why. Run live:",
    "noteType": "info"
  },
  {
    "title": "The dist-folder mismatch, explained for a fresh pair of eyes",
    "cmd": "/wbExplain \"core2 dist folder mismatch\" --as=\"new contributor, debugging\"",
    "logs": [
      {
        "text": "[EXPLAIN] Resolving \"core2 dist folder mismatch\"...",
        "type": "gen"
      },
      {
        "text": "[MATCH] Memory: project_pkg_dist_mismatch.md (the parked tech debt)",
        "type": "gen"
      },
      {
        "text": "[MATCH] Code: core2/packages/*/package.json + core2/packages/*/vite.config.js",
        "type": "gen"
      },
      {
        "text": "[STYLE] new-contributor debugging \u2014 assume they're staring at a",
        "type": "gen"
      },
      {
        "text": "\"Cannot find module\" error and want to know if it's their fault.",
        "type": "gen"
      },
      {
        "text": "Short answer: it's not your setup. This is a known mismatch parked in",
        "type": "gen"
      },
      {
        "text": "the project memory and not yet resolved.",
        "type": "gen"
      },
      {
        "text": "What's happening: the package.json files in `core2/packages/*` declare",
        "type": "gen"
      },
      {
        "text": "`main: \"./dist/index.js\"`. The vite config in those same packages",
        "type": "gen"
      },
      {
        "text": "writes the build output to `dist-dev/index.js`. Consumer apps that",
        "type": "gen"
      },
      {
        "text": "import these packages resolve `main` and look in `dist/` \u2014 which is",
        "type": "gen"
      },
      {
        "text": "empty. The error you see is the symptom.",
        "type": "gen"
      },
      {
        "text": "Why it's parked instead of fixed: per the memory note, fixing it",
        "type": "gen"
      },
      {
        "text": "requires either (a) updating package.json `main` fields to point at",
        "type": "gen"
      },
      {
        "text": "`dist-dev/`, which leaks the dev convention into consumers, or",
        "type": "gen"
      },
      {
        "text": "(b) reconfiguring vite to actually write to `dist/`, which collides",
        "type": "gen"
      },
      {
        "text": "with the existing dev-mode output flow. Neither is a one-liner, and",
        "type": "gen"
      },
      {
        "text": "neither has a clear right answer yet.",
        "type": "gen"
      },
      {
        "text": "What you can do today: build manually with `pnpm build` (which",
        "type": "gen"
      },
      {
        "text": "populates `dist/` correctly via a different code path than vite's dev",
        "type": "gen"
      },
      {
        "text": "build), or pull from a tag where `dist/` was committed. Don't try to",
        "type": "gen"
      },
      {
        "text": "patch package.json \u2014 your fix will get reverted.",
        "type": "gen"
      }
    ],
    "note": "A real piece of tech debt parked in memory: the wbc-ui2 packages declare `main` at `dist/` but vite writes to `dist-dev/`. Someone new sees a \"module not found\" error and asks `/wbExplain \"core2 dist folder mismatch\"`:",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbExplain" :pipelines="wbExplainPipelines" />


### 💠 Pipeline Onboarding doc for the IPEIM student

Wissem teaches at IPEIM (CS instructor since 2018, per memory). A senior-year student joining wb-labs for an internship needs the conceptual map of the agentic framework, in French.


### 💠 Pipeline The WBDataViewer apiResponse_ design review

A reviewer comes back to the WBDataViewer code six months from now. They see `apiResponse_` (with the trailing underscore) and don't remember why. Run live:


### 💠 Pipeline The dist-folder mismatch, explained for a fresh pair of eyes

A real piece of tech debt parked in memory: the wbc-ui2 packages declare `main` at `dist/` but vite writes to `dist-dev/`. Someone new sees a "module not found" error and asks `/wbExplain "core2 dist folder mismatch"`:

---

## 5. What would refuse today

| Trigger | Live response |
|---|---|
| `/wbExplain` with no target | Halt. Provide `--id`, a path, or a concept string. |
| `/wbExplain --id="*"` right now | Produces the 3-row epic overview (rows are `⬜` but explanation doesn't require `Done`). |
| `/wbExplain --id="4"` | Halt. Plan only contains 3 rows. |
| `/wbExplain "the auth thing"` | Disambiguation prompt — could be JWT in wb-core, login in wbc-ui.com, session handling in wbc-ui2-cdn. Lists all three; asks user to pick. |
| `/wbExplain "rebuild the universe"` | Honest "no clear target found in workspace" with suggestions of nearby concepts. |
| `/wbExplain --id="1" --as="haiku"` | Honors the constraint. Produces a haiku about the JWT handshake row. The user owns the format. |

The unifying point: `/wbExplain` is the **most permissive** command in the QA group on the input side and the **most disciplined** on the output side. It accepts almost any target; it refuses to produce content that's incorrect-but-confident. When in doubt, it asks; when truly unable, it admits.
