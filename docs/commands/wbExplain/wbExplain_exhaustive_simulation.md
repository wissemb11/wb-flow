# /wbExplain — Exhaustive Simulation ()

`/wbExplain` is the teacher and the architect. Its job is the inverse of `/wbWork`: instead of *doing* something, it *describes* something — at a level of abstraction the caller picks. It's the only command in this system that accepts free-text prose as a target, the only one with a `--as=<style>` flag, and the only one that produces no side effects whatsoever. It writes prose to stdout and stops.

Read this if you want to know what the `--as` field will accept, why the same `--id="2"` gives radically different output depending on style, and where the boundary sits between "this is a job for `/wbExplain`" and "this is a job for `/wbDoc`."

---

## 1. Role & target

| Aspect | Behavior |
|---|---|
| **Role** | The Teacher / The Architect — produces explanatory prose. |
| **Target** | A plan row (`--id`), a file path, or a free-text concept. |
| **Cell scope** | None. `/wbExplain` never writes to plan cells. |
| **Side effects allowed** | Reading code, reading plans, searching the workspace by keyword. |
| **Side effects forbidden** | Editing files, mutating plan state, running commands, calling out to external services. |

The "no side effects" rule is what makes `/wbExplain` safe to invoke speculatively. You can run `/wbExplain "what does WBC.js actually do"` 50 times and the workspace is identical at the end. Compare to `/wbWork`, where one wrong invocation can mark a row `🚫 Cancelled`.

`/wbExplain` is also the *only* command in the QA group that accepts natural language as a primary target. `/wbWork` and `/wbValid` both refuse fuzzy matching by design; `/wbExplain` embraces it because the cost of a wrong explanation is "wasted prose" and the cost of a wrong code edit is "broken code."

---

## 2. Argument resolution matrix

| Form | Example | What `/wbExplain` does |
|---|---|---|
| Single ID | `Command: /wbExplain --id="2"` | Resolves row 2, reads its task description, follows referenced files, produces a focused explanation. |
| CSV array | `Command: /wbExplain --id="1,3"` | Reads both rows. Synthesizes a *single* doc that explains how they relate, not two docs concatenated. |
| Wildcard | `Command: /wbExplain --id="*"` | All rows. Produces an "epic overview" — one narrative arc covering the plan as a whole. |
| File path | `Command: /wbExplain core2/packages/wb-core/src/WBC.js` | Reads the file, parses imports/exports, produces a contract-level summary. |
| Directory path | `Command: /wbExplain core2/packages/wb-core/` | Higher abstraction: package-level role and architecture, not file-by-file. |
| Free-text concept | `Command: /wbExplain "the WBCode dev gate"` | Searches the workspace for relevant code, ranks matches, picks the most likely target. |

The wildcard form deserves a note. `/wbExplain --id="*"` is *not* "explain each row independently" — it's "synthesize one explanation of the whole plan." The output is a story, not a list. This matters because the use case is onboarding (new contributor reads it once) or pre-standup (lead skims the day's intent).

---

## 3. Flag matrix

`/wbExplain` has exactly two flags. The flag surface is small on purpose — explanations are shaped more by *intent* than by *toggles*.

| Flag | Shortcut | Purpose |
|---|---|---|
| `--id="<filter>"` | `-i` | Selects which plan rows to explain. Same filter grammar as `/wbWork` (single, CSV, wildcard, range, negation, boolean). |
| `--as="<style>"` | `-a` | Free-text style descriptor that controls tone, format, length, vocabulary, and audience assumptions. |

### How `--as` actually works

The `--as` value is **not enum-locked**. There is no canonical list of supported styles. The string is read as a complete description of the target reader and the desired register, then applied across every paragraph of output.

| `--as` value | What changes in the output |
|---|---|
| `--as="eli5"` | Analogies replace technical vocabulary. Concrete metaphors. ~200 words. |
| `--as="senior reviewer, skeptical"` | Trade-offs surface first. Questions, not statements. Terse. |
| `--as="conference talk, 5min"` | Narrative arc with a hook, three beats, and a takeaway. |
| `--as="incident postmortem"` | What happened / what should have happened / contributing factors / action items. |
| `--as="expert, fr"` | Same content, in French, with technical vocabulary preserved. No translation of code symbols. |
| `--as="rubber duck for the author"` | Second-person, repeats the question back, names blind spots. |

The agent doesn't pick from a list — it parses the string as instructions. `--as="explain it like Linus Torvalds reviewing the code"` produces a real (if uncomfortable) explanation. The flag's flexibility is the feature.

### Where `--as` does *not* apply

Default style (no `--as` flag) is **practical**: ~400 words, principle-first, terse, the same voice the rest of `docs/` uses. Use `--as` when you need something *other than* the default. For onboarding/pedagogy, the eli5 / new-hire-day-2 styles work well; for design review, skeptical / postmortem work well.

---

## 4. Pipelines (the agent-native scenarios)

<script setup>
const wbExplainSimPipelines = [
  {
    "title": "The wb-core onboarding doc, generated on demand",
    "cmd": "/wbExplain --id=\"*\" --as=\"new contributor, day 2, knows JS\"",
    "logs": [
      {
        "text": "[EXPLAIN] Active plan: plan_<package>_<date>.md (3 rows).",
        "type": "gen"
      },
      {
        "text": "[STYLE] new contributor, day 2, knows JS \u2014 assume JS fluency, no codebase context.",
        "type": "gen"
      },
      {
        "text": "# What we're working on this week in wb-core",
        "type": "gen"
      },
      {
        "text": "The plan has three things, in two layers. Layer 1 is independent work",
        "type": "gen"
      },
      {
        "text": "that can happen today (rows 1 and 2). Layer 2 is the architectural",
        "type": "gen"
      },
      {
        "text": "pivot that needs both done first (row 3).",
        "type": "gen"
      },
      {
        "text": "## Row 1 \u2014 JWT handshake (tierEnforcement.js)",
        "type": "sys"
      },
      {
        "text": "You don't need crypto background for this. tierEnforcement.js is the",
        "type": "gen"
      },
      {
        "text": "gatekeeper file: every privileged action runs through it first. Row 1",
        "type": "gen"
      },
      {
        "text": "adds a check that the JWT in the call has a sane shape and isn't using",
        "type": "gen"
      },
      {
        "text": "\"alg: none\" (a known footgun). The file already had a check for token",
        "type": "gen"
      },
      {
        "text": "*presence*; this row adds a check for token *content*.",
        "type": "gen"
      },
      {
        "text": "...",
        "type": "gen"
      }
    ],
    "note": "A new contributor arrives. They have access to `wb-labs` but no time to read the codebase cold. The lead runs:",
    "noteType": "info"
  },
  {
    "title": "The `apiResponse_` mystery, explained on demand",
    "cmd": "/wbExplain \"WBDataViewer apiResponse_ cache\" --as=\"senior reviewer, skeptical\"",
    "logs": [
      {
        "text": "[EXPLAIN] Resolving \"WBDataViewer apiResponse_ cache\"...",
        "type": "gen"
      },
      {
        "text": "[MATCH] Found in core2/packages/wb-dataviewer/ (apiResponse_ pattern)",
        "type": "gen"
      },
      {
        "text": "+ memory note: project_wbdataviewer_apiResponse.md.",
        "type": "gen"
      },
      {
        "text": "[STYLE] skeptical reviewer.",
        "type": "gen"
      },
      {
        "text": "The pattern is: `apiResponse_` (with the trailing underscore) caches the",
        "type": "gen"
      },
      {
        "text": "fetched data so that downstream `project` changes don't re-fire the network",
        "type": "gen"
      },
      {
        "text": "call. Three things to question before approving:",
        "type": "gen"
      },
      {
        "text": "1. Why a trailing-underscore convention rather than a clearly-named",
        "type": "gen"
      },
      {
        "text": "ref like `cachedResponse`? (Answer: prior art elsewhere in the",
        "type": "gen"
      },
      {
        "text": "codebase \u2014 investigate whether the convention is load-bearing or",
        "type": "gen"
      },
      {
        "text": "inherited.)",
        "type": "gen"
      },
      {
        "text": "2. The cache key is implicit (component instance lifetime). Is that",
        "type": "gen"
      },
      {
        "text": "the right scope? Routing changes that re-mount the component blow",
        "type": "gen"
      },
      {
        "text": "the cache; was that intentional?",
        "type": "gen"
      },
      {
        "text": "3. There's no invalidation path. Once cached, always cached for the",
        "type": "gen"
      },
      {
        "text": "instance's life. Acceptable iff \"project changes never need",
        "type": "gen"
      },
      {
        "text": "network refresh\" \u2014 verify with the original author.",
        "type": "gen"
      }
    ],
    "note": "A real situation in this workspace: the `WBDataViewer apiResponse_` cache pattern is parked in memory (`project_wbdataviewer_apiResponse.md`). A reviewer asks \"wait, why is this caching layer here?\" \u2014 and runs:",
    "noteType": "info"
  },
  {
    "title": "Multilingual, for a real student",
    "cmd": "/wbExplain \"frontEnd/wbc-ui/core2/packages/wb-flow/templates/\" --as=\"expert, fr, IPEIM CS senior year\"",
    "logs": [
      {
        "text": "[EXPLAIN] Target: frontEnd/wbc-ui/core2/packages/wb-flow/templates/ (the agentic framework root)",
        "type": "gen"
      },
      {
        "text": "[STYLE] expert FR, audience: CS senior \u2014 assume systems thinking,",
        "type": "gen"
      },
      {
        "text": "no need for \"what is an agent\" preamble.",
        "type": "gen"
      },
      {
        "text": "# Le framework wb-flow \u2014 vue d'ensemble",
        "type": "gen"
      },
      {
        "text": "Le syst\u00e8me repose sur trois invariants : (1) le plan est la source",
        "type": "gen"
      },
      {
        "text": "unique de v\u00e9rit\u00e9 de l'\u00e9tat du travail, (2) le worker et le validator",
        "type": "gen"
      },
      {
        "text": "ne peuvent jamais \u00eatre le m\u00eame mod\u00e8le sur la m\u00eame t\u00e2che, (3) chaque",
        "type": "gen"
      },
      {
        "text": "commande `/wb*` mute exactement z\u00e9ro ou une cellule du plan.",
        "type": "gen"
      },
      {
        "text": "Ces trois r\u00e8gles g\u00e9n\u00e8rent l'essentiel de l'architecture...",
        "type": "gen"
      }
    ],
    "note": "Wissem teaches at IPEIM since 2018 (per memory). A student needs the conceptual map of the agentic framework, in French, expert-level (not eli5):",
    "noteType": "info"
  }
];
</script>

<LiveDemoAnimation command="wbExplain" titleSuffix="Exhaustive Simulation" :pipelines="wbExplainSimPipelines" />


### 💠 Pipeline The wb-core onboarding doc, generated on demand

A new contributor arrives. They have access to `wb-labs` but no time to read the codebase cold. The lead runs:


### 💠 Pipeline The `apiResponse_` mystery, explained on demand

A real situation in this workspace: the `WBDataViewer apiResponse_` cache pattern is parked in memory (`project_wbdataviewer_apiResponse.md`). A reviewer asks "wait, why is this caching layer here?" — and runs:


### 💠 Pipeline Multilingual, for a real student

Wissem teaches at IPEIM since 2018 (per memory). A student needs the conceptual map of the agentic framework, in French, expert-level (not eli5):

---

## 5. Edge cases & refusals

| Trigger | What `/wbExplain` does |
|---|---|
| No target at all (`/wbExplain` alone) | Halt. `❌ Provide --id, a path, or a concept string.` |
| `--id="*"` with no active plan | Halt. `❌ No active plan found. Use a path or concept instead.` |
| Free-text target matches 5+ unrelated files | List the candidates, ask which scope. No silent guessing. |
| `--as="..."` with a 500-word style description | Truncate to ~200 words. Style descriptions are instructions, not content. |
| `--id="99"` when plan has 5 rows | Halt. Same error as `/wbWork` for consistency. |
| Concept that genuinely doesn't exist in the workspace | Honest "not found" message + a suggestion of nearby concepts that *did* match. |
| Style and ID together producing contradictory tone (e.g., `--id="*" --as="single sentence"`) | Honor the `--as` instruction; produce the requested form even when it under-serves the breadth of `*`. The user is the boss of the format. |

Two patterns worth naming. First, `/wbExplain` is the **only QA-group command that accepts natural-language targets** — and that is its design center, not an exception. Second, the `--as` flag is treated as **author intent**, not as a constraint to negotiate against. If the user asks for "a haiku about the plan," the agent produces a haiku, even though haiku is a poor format for a 5-row plan. The user's chosen format wins; the agent's job is to make it as good as possible within that frame.
