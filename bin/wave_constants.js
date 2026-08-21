'use strict';
const path = require('path');

/** Package root — the fallback location for Layer-1 templates (codex lane). */
const PKG_ROOT = path.resolve(__dirname, '..');

const ROLES = [
  { key: 'planner', label: '🧠 Planner', match: /planner/i },
  { key: 'validator', label: '✅ Validator', match: /validator/i },
  { key: 'worker', label: '🔨 Worker', match: /worker/i },
  { key: 'mechanical', label: '📋 Mechanical', match: /mechanical/i },
];

const DEFAULT_MODELS = {
  worker: 'opencode-go/deepseek-v4-pro',
  mechanical: 'opencode-go/qwen3.7-plus',
  selfValidator: 'opencode-go/kimi-k2.7-code',
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
// codex speaks a different dialect entirely — it prints the raw API envelope:
//   ERROR: {"type":"error","status":400,"error":{"type":"invalid_request_error",
//           "message":"The 'X' model is not supported when using Codex with a
//            ChatGPT account."}}
// Matching the STRUCTURE (`ERROR: {"type":"error"`) rather than any message text
// covers 400 entitlement refusals, 401 auth, 429 usage-limit and 5xx alike,
// without guessing at wording that OpenAI can reword at any time.
const INFRA_GREP_PATTERN = '^(Error: (Model not found|Insufficient (credits|balance|funds)|Rate limit|Quota|Authentication|Payment)|ERROR: \\{"type":"error")';

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
      --model=<m>, -M=<m>  Delegate THIS run to one model. Highest priority:
                           outranks role routing AND the executor!=validator
                           rule. Use when you are choosing the agent yourself.
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
  GATE_LINE_PATTERN, INFRA_GREP_PATTERN, NAME_TO_SLUG,
  CODEX_ONLY_RE, AGY_ONLY_SLUGS, MATRIX_HEADING, HELP, ROLE_EMOJI_MAP
};
