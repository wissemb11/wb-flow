'use strict';
const path = require('path');

/** Package root — the fallback location for Layer-1 templates (codex lane). */
const PKG_ROOT = path.resolve(__dirname, '..');

// `match` is the loose word test (matched anywhere in a cell) — kept for the
// matrix header reader, which maps columns by their emoji+label header text.
// `tag` is the anchored role-tag test: the WHOLE Requires cell must be exactly
// one emoji-tagged label (nothing else). A bare-word match (`/worker/i`
// anywhere) is what let row-11's prose paragraph — which names all four roles
// as plain words — resolve to `planner` purely by ROLES declaration order,
// handing a non-🧠 row a 🧠 self-validation exemption. Anchoring on the emoji +
// label at the cell edge, and requiring the whole cell to be the tag, closes it
// (C68).
const ROLES = [
  { key: 'planner', label: '🧠 Planner', match: /planner/i, tag: /^🧠\s*Planner$/i },
  { key: 'validator', label: '✅ Validator', match: /validator/i, tag: /^✅\s*Validator$/i },
  { key: 'worker', label: '🔨 Worker', match: /worker/i, tag: /^🔨\s*Worker$/i },
  { key: 'mechanical', label: '📋 Mechanical', match: /mechanical/i, tag: /^📋\s*Mechanical$/i },
];

// C54 — the built-in fallback must not be a provider the plan already records
// as credit-exhausted. Every role defaulted to `opencode-go/*`, so an unroutable
// name demoted the role to a known-dead lane with no warning. Default to the
// live Zen provider instead; the roster I/O is the authoritative surface.
const DEFAULT_MODELS = {
  worker: 'opencode/deepseek-v4-pro',
  mechanical: 'opencode/deepseek-v4-pro',
  selfValidator: 'opencode/minimax-m3',
};

const INFRA_FATAL_MESSAGES = [
  'Error: Model not found',
  'Error: Insufficient credits',
  'Error: Insufficient balance',
  'Error: Insufficient funds',
  'Error: Rate limit',
  'Error: Quota',
  'Error: Authentication',
  'Error: Payment',
  'Error: {"type":"error"',
  'ERROR: {"type":"error"',
  'error: {"type":"error"',
  'Error: Your credit balance is too low',
  'Your credit balance is too low',
];

// The lines a wave's decisions are made from: the dispatch marker, the gate
// verdicts, the per-id roll-up and the session state. Everything else a cell
// prints is evidence for the log file, not for the orchestrator's context.
const GATE_LINE_PATTERN = '^▶|^  (G[0-9]|VERDICT|PER-ID|session)';

// Observed 2026-08-02: opencode returns `Error: Insufficient balance.` — the
// pattern said "credits", so a wave whose agents never ran scored G1: PASS and
// was misclassified NO-OP ("ran, produced nothing") instead of INFRA ("never
// ran"). Those demand opposite responses: NO-OP means re-dispatch is pointless,
// INFRA means fix the account and re-dispatch. Match the whole billing family.
//
// codex and some opencode-backed CLIs speak a different dialect entirely — they
// print the raw API envelope:
//   ERROR: {"type":"error","status":400,"error":{"type":"invalid_request_error",
//           "message":"The 'X' model is not supported when using Codex with a
//            ChatGPT account."}}
// Matching the STRUCTURE (`<Error>: {"type":"error"`) rather than any message text
// covers 400 entitlement refusals, 401 auth, 429 usage-limit and 5xx alike,
// without guessing at wording that OpenAI can reword at any time.
const INFRA_GREP_PATTERN = '^([Ee][Rr][Rr][Oo][Rr]: \\{"type":"error"|Error: (Model not found|Insufficient (credits|balance|funds)|Rate limit|Quota|Authentication|Payment|Your credit balance is too low\\b)|Your credit balance is too low\\b)';
const REFUSAL_GREP_PATTERN = '^(G[0-9]+: REFUSED\\b|VERDICT: REFUSED\\b|Error: .*\\b(approval|permission|permissions|sandbox|tool)\\b.*\\b(denied|refused|required|blocked|not allowed)\\b|Tool use blocked\\b|Permission denied\\b|Approval required\\b|Sandbox.*\\b(denied|refused|blocked|not allowed)\\b)';

const NAME_TO_SLUG = new Map([
  ['deepseek v4 pro', 'opencode-go/deepseek-v4-pro'],
  ['gemini 3.1 pro', 'gemini-3.1-pro-high'],
  ['kimi k2.7 code', 'opencode-go/kimi-k2.7-code'],
  ['glm-5.2', 'opencode-go/glm-5.2'],
  ['qwen 3.7 plus', 'opencode-go/qwen3.7-plus'],
  // agy (Antigravity / Google Gemini) — dispatched via `agy --model <name>`,
  // so these map to BARE model names, not provider-prefixed slugs.
  ['gemini 3.6 flash', 'gemini-3.6-flash-high'],
  ['claude sonnet 4.6', 'claude-sonnet-4-6'],
  // grok (xAI / SuperGrok) — dispatched via `grok --model <name>`, so the
  // catalogued slug is namespaced and cli_registry strips the prefix.
  ['grok 4.6', 'xai/grok-4.6'],
  ['grok 4.5', 'xai/grok-4.5'],
  // codex (OpenAI Codex) — dispatched via `codex exec -m <name>`, so these map
  // to BARE model names, not provider-prefixed slugs, exactly like agy. codex
  // cannot enumerate itself (see model.js CODEX_CANDIDATES), so the list is
  // curated; being here means "routable", not "entitled" — --probe is for that.
  // C54: without these entries resolveDisplayName() returned undefined for the
  // one lane that answered every probe today, so `codex` could not be expressed.
  ['gpt-5.6-terra', 'gpt-5.6-terra'],
  ['gpt-5.6-luna', 'gpt-5.6-luna'],
  ['gpt-5.6-pro', 'gpt-5.6-pro'],
  ['gpt-5.6-sol', 'gpt-5.6-sol'],
  ['gpt-5.6', 'gpt-5.6'],
  ['gpt-5.5', 'gpt-5.5'],
  ['gpt-5.4', 'gpt-5.4'],
  ['gpt-5.4-mini', 'gpt-5.4-mini'],
  ['gpt-5.4-nano', 'gpt-5.4-nano'],
  ['gpt-5.3-codex', 'gpt-5.3-codex'],
  ['gpt-5.2-codex', 'gpt-5.2-codex'],
  ['gpt-5.1-codex-mini', 'gpt-5.1-codex-mini'],
]);

// C62 — namespaced slugs the project dispatches by name. The catalog
// (models.json) is the source of truth for "which models exist", but a user's
// snapshot can lag the roster (measured 2026-09-14: ~/.wb/models.json carried no
// `opencode/deepseek-v4-pro` and no `openai/gpt-5.6-sol`, while both are live in
// the shipped DEFAULT_MODELS and plan-header rosters). resolveDisplayName
// consults this set (plus the catalog, NAME_TO_SLUG values and DEFAULT_MODELS)
// so a real slug an out-of-date catalog does not yet list is still routable,
// while a fabricated vendor/model — `bogus-vendor/x`, `opencode/not-a-real-x` —
// is rejected. Being here means "a real model", not "reachable"; --probe is for
// that. Same frozen-list caveat as NAME_TO_SLUG and CODEX_CANDIDATES.
const KNOWN_SLUGS = new Set([
  'opencode/deepseek-v4-pro',
  'opencode/minimax-m3',
  'opencode/gemini-3.1-pro',
  'anthropic/claude-opus-5',
  'anthropic/claude-fable-5',
  'openai/gpt-5.6-sol',
  'openai/gpt-5.6-terra',
  'openai/gpt-5.6-luna',
]);

// Slugs that only the `agy` CLI can run. buildScript emits `opencode run` for
// every spawned cell, so a roster naming one of these resolves fine and then
// dies at G1 with `Error: Model not found`. Warn at routing time instead.
// The complete `agy models` roster, captured 2026-08-02. These are BARE names —
// an agy model never carries a provider prefix, which is exactly what
// distinguishes it from `opencode/claude-sonnet-4-6` (a different provider
// serving a same-named model).
// Slugs only `codex exec` can run. Kept as a regex rather than a Set because
// codex has no `models` subcommand to enumerate from — see model.js
// CODEX_CANDIDATES for why the list is curated and what --probe is for.
const CODEX_ONLY_RE = /^gpt-5(\.\d+)?(-(terra|luna|sol|pro|mini|nano|codex|codex-mini))?$/;

const AGY_ONLY_SLUGS = new Set([
  'gemini-3.6-flash-high', 'gemini-3.6-flash-medium', 'gemini-3.6-flash-low',
  'gemini-3.5-flash-high', 'gemini-3.5-flash-medium', 'gemini-3.5-flash-low',
  'gemini-3.1-pro-high', 'gemini-3.1-pro-low',
  'claude-sonnet-4-6', 'claude-opus-4-6-thinking',
  'gpt-oss-120b-medium',
]);
const MATRIX_HEADING = '## 🌊 Next Executable Sequence';

const HELP = `
  wb-flow wave — run one wave of a plan's 🌊 Next Executable Sequence

  Usage: wb-flow wave <plan.md> --wave=<A|B|C> [options]

  Reads the plan's matrix, takes the requested sub-row (work by default,
  validate with --validate), and emits a bash script that launches every cell
  in parallel — each routed to a CLI by its role. A dispatch cell runs its
  \`/wbExplain\` blueprint first, in the same lane, before the work.

  Options:
    --wave=<label>       Which wave to run (A, B, C…). Required.
    --validate           Run the wave's \`✅ validate\` sub-row instead of its
                         \`🔨 work\` sub-row. Run it only after the work lands.
    --out=<path>         Where to write the script
                         (default: <plan dir>/waves/wave_<label>_<scope>.sh)
    --print              Print the script to stdout instead of writing it
    --jobs=<n>           Max parallel jobs (default: 4; use 0 for unlimited)
    --summary            Stream only the decision lines (dispatch marker, gate
                         verdicts, PER-ID roll-up) to the terminal. Each cell's
                         full output still goes to its log file. A 10-cell wave
                         costs ~63k tokens of orchestrator context streamed vs
                         ~600 summarised — and the suppressed part is shell
                         output and ANSI codes, not decisions.
    --sessions           Reuse one opencode session per (scope, model) so cells
                         skip the cold re-read of the template and scope files.
                         A saved session is resumed AND forked, so parallel
                         cells branch instead of interleaving. Ids live in
                         <plan>/.wb/workflows/reports/waves/sessions/. Opt-in:
                         a resumed session replays its whole history, which is
                         not automatically cheaper — measure with
                         'opencode stats --days 1' before trusting it.
      --wave=<L>[:<R>]     Wave label, optionally narrowed to ONE cell by role:
                             P = Planner   V = Validator
                             W = Worker    M = Mechanical
                           e.g. --wave=A    -> the whole A row
                                --wave=A:W  -> only A's Worker cell
    --wave=all           Run all waves sequentially (aliases: auto, *).
                         Prints ordered loop guidance rather than emitting a
                         script. Cannot be combined with a :<R> role suffix
                         or --kind.
    --model=<m>, -M=<m>  Delegate THIS run to one model. Highest priority:
                           outranks role routing AND the executor!=validator
                           rule. Use when you are choosing the agent yourself.
    --sandbox            Emit dispatches without permission/sandbox bypass
                           flags. Refusals are reported as REFUSED, not PASS.
  Model overrides (canonical — match the role keys in the 🌊 matrix):
    --planner=<m>        Override the 🧠 Planner model
    --worker=<m>         Override the 🔨 Worker model    (default ${DEFAULT_MODELS.worker})
    --validator=<m>      Override the ✅ Validator model  (default ${DEFAULT_MODELS.selfValidator})
    --mechanical=<m>     Override the 📋 Mechanical model (default ${DEFAULT_MODELS.mechanical})

  Legacy aliases (accepted but not canonical):
    --worker-model=<m>   = --worker=<m>
    --mech-model=<m>     = --mechanical=<m>
    --validator-model=<m>= --validator=<m>
    -p=<m>  -v=<m>       = --planner=<m>   --validator=<m>
    -w=<m>  -m=<m>       = --worker=<m>    --mechanical=<m>
    -W=<L>[:<R>]         = --wave=<L>[:<R>]   (NOTE: -w is --worker, not --wave)

  Other options:
    --list               Show the parsed cells and their routing, then exit
    --help, -h           Show this message

  The script never touches the plan file: sub-agents run with
  --no-plan-update and write only their task reports. Checking the Done
  boxes and recomputing the matrix is the orchestrator's job, once, after.
`;
const ROLE_EMOJI_MAP = {
  '\u{1F9E0}': 'planner',
  '\u2705': 'validator',
  '\u{1F528}': 'worker',
  '\u{1F4CB}': 'mechanical',
};

module.exports = {
  PKG_ROOT, ROLES, DEFAULT_MODELS, INFRA_FATAL_MESSAGES,
  GATE_LINE_PATTERN, INFRA_GREP_PATTERN, REFUSAL_GREP_PATTERN, NAME_TO_SLUG,
  CODEX_ONLY_RE, AGY_ONLY_SLUGS, KNOWN_SLUGS, MATRIX_HEADING, HELP, ROLE_EMOJI_MAP
};
