#!/usr/bin/env node
'use strict';
//
// Generates the "Invocation matrix" block of templates/commands/model_reference_manual.md
// directly from bin/cli_registry.js, so the manual cannot drift from the code
// that actually dispatches. Run:
//
//   node bin/gen_cli_matrix.js --write     # rewrite the block in place
//   node bin/gen_cli_matrix.js --check     # exit 1 if the block is stale
//
// The block lives between the two markers below and is replaced wholesale;
// everything outside them is authored prose and is never touched.
//
const fs = require('fs');
const path = require('path');
const REG = require('./cli_registry.js');

const START = '<!-- CLI_MATRIX_START -->';
const ANNEX_START = '<!-- MODEL_CATALOG_START -->';
const ANNEX_END = '<!-- MODEL_CATALOG_END -->';
const END = '<!-- CLI_MATRIX_END -->';
const PROMPT = 'hi! who are you?';
const MANUAL = path.resolve(__dirname, '..', 'templates', 'commands', 'model_reference_manual.md');

/** One representative model per provider, for the worked examples. */
const EXAMPLE = {
  anthropic: 'anthropic/claude-opus-5',
  openai: 'openai/gpt-5.6-terra',
  antigravity: 'gemini-3.1-pro-high',
  google: 'gemini-3.1-pro',
  'github-copilot': 'github-copilot/auto',
  openrouter: 'openrouter/openai/gpt-4o',
  'opencode-go': 'opencode-go/deepseek-v4-pro',
  'opencode-zen': 'opencode/gemini-3.1-pro',
};

const sh = (s) => (/^[\w.\-\/=:]+$/.test(s) ? s : '"' + s.replace(/"/g, '\\"') + '"');
const q = (s) => "'" + String(s).replace(/'/g, "\\'") + "'";

function build() {
  const L = [];
  L.push(START);
  L.push('');
  L.push('## 🔌 Invocation matrix — every provider, every language');
  L.push('');
  L.push('> **Generated** from [`bin/cli_registry.js`](../../bin/cli_registry.js) by `node bin/gen_cli_matrix.js --write`.');
  L.push('> Do not hand-edit between the markers — `npm test` fails if this block drifts from the code.');
  L.push('> Default prompt throughout: `' + PROMPT + '`');
  L.push('');

  // ── provider → CLI table ──────────────────────────────────────────────────
  L.push('### Which CLI serves which provider');
  L.push('');
  L.push('The `provider` field in `.wb/models.json` decides this — **not** the model name.');
  L.push('`claude-opus-4-6-thinking` is Anthropic-branded but Antigravity-served, and');
  L.push('`gpt-oss-120b-medium` carries a `gpt` prefix while belonging to Google\'s pool.');
  L.push('');
  L.push('| `provider` in models.json | CLI | Model argument | Example slug |');
  L.push('|---|---|---|---|');
  for (const [prov, cli] of Object.entries(REG.PROVIDER_CLI)) {
    const bare = REG.BARE_MODEL_CLIS.has(cli);
    const slug = EXAMPLE[prov];
    const arg = slug ? REG.resolveCli(slug, new Map([[slug, { provider: prov, pool: prov }]])).modelArg : null;
    L.push('| `' + prov + '` | `' + cli + '` | ' + (bare ? '**bare**' : 'namespaced') +
      ' — `' + (arg || '(none)') + '` | `' + (slug || '—') + '` |');
  }
  L.push('');
  L.push('> A provider absent from this table falls back to `opencode`, which is the only');
  L.push('> CLI that accepts an arbitrary `provider/model` slug.');
  L.push('');

  // ── per-CLI, three languages ──────────────────────────────────────────────
  for (const [cli, spec] of Object.entries(REG.CLI_SPEC)) {
    const prov = Object.keys(REG.PROVIDER_CLI).find((p) => REG.PROVIDER_CLI[p] === cli);
    const slug = EXAMPLE[prov] || '';
    const route = REG.resolveCli(slug, new Map([[slug, { provider: prov, pool: prov }]]));
    const model = route.modelArg;
    const argv = spec.argv(model, PROMPT);

    L.push('### `' + cli + '`' + (prov ? ' — serves `' + prov + '`' : ''));
    L.push('');
    const notes = [];
    if (spec.stdinNull) notes.push('**stdin must be closed** (`< /dev/null`) — it reads stdin even with a prompt argument, so inside a script it hangs.');
    if (spec.inlineTemplate) notes.push('**expands no slash-command** — the prompt must name the template file itself.');
    if (cli === 'agy') notes.push('**`-p` must be the last flag before the prompt** — Go\'s `flag` package treats it as `--print` and eats the next argv entry.');
    if (!spec.slashCommands && !spec.inlineTemplate && cli !== 'agy') notes.push('does not expand `/wb*` slash-commands.');
    if (notes.length) { for (const n of notes) L.push('- ' + n); L.push(''); }

    L.push('```bash');
    L.push(spec.bin + ' ' + argv.map(sh).join(' ') + (spec.stdinNull ? ' < /dev/null' : ''));
    L.push('```');
    L.push('');
    L.push('```python');
    L.push('import subprocess');
    L.push('r = subprocess.run(');
    L.push('    [' + [spec.bin].concat(argv).map(q).join(', ') + '],');
    L.push('    capture_output=True, text=True' + (spec.stdinNull ? ', stdin=subprocess.DEVNULL' : '') + ',');
    L.push(')');
    L.push('print(r.stdout)');
    L.push('```');
    L.push('');
    L.push('```javascript');
    L.push("const { spawnSync } = require('child_process');");
    L.push('const r = spawnSync(' + q(spec.bin) + ', [' + argv.map(q).join(', ') + '], {');
    L.push("  encoding: 'utf8'," + (spec.stdinNull ? " stdio: ['ignore', 'pipe', 'pipe']," : ''));
    L.push('});');
    L.push('console.log(r.stdout);');
    L.push('```');
    L.push('');
  }

  L.push('### Full fallback chain');
  L.push('');
  L.push('A role\'s chain is tried left to right with bash `||`; each link is whichever');
  L.push('CLI the table above assigns, so one chain routinely spans several CLIs:');
  L.push('');
  L.push('```bash');
  const chain = ['anthropic/claude-opus-5', 'openai/gpt-5.6-terra', 'opencode-go/deepseek-v4-pro'];
  L.push(chain.map((s) => {
    const p = Object.keys(EXAMPLE).find((k) => EXAMPLE[k] === s);
    const r = REG.resolveCli(s, new Map([[s, { provider: p, pool: p }]]));
    const sp = REG.CLI_SPEC[r.cli];
    return '.wb/bin/wbRun ' + sp.bin + ' ' + sp.argv(r.modelArg, PROMPT).map(sh).join(' ') + (sp.stdinNull ? ' < /dev/null' : '');
  }).join(' \\\n  || '));
  L.push('```');
  L.push('');
  L.push(END);
  return L.join('\n');
}


/** Annex H — every model in models.json, in bash / python / node, from the registry. */
function buildCatalogAnnex(catalogPath) {
  // Same search order the runtime uses: explicit → env → walk up from cwd
  // (the catalog usually lives at the REPO root, not inside the package) → home.
  let file = catalogPath || process.env.WB_MODELS_FILE || null;
  if (!file) {
    const cands = [];
    let dir = process.cwd();
    for (let i = 0; i < 8; i++) {
      cands.push(path.join(dir, '.wb', 'models.json'));
      const up = path.dirname(dir);
      if (up === dir) break;
      dir = up;
    }
    cands.push(path.join(require('os').homedir(), '.wb', 'models.json'));
    cands.push(path.join(require('os').homedir(), '.config', 'wb-flow', 'models.json'));
    file = cands.find(function (f) { return fs.existsSync(f); }) || null;
  }
  if (!file || !fs.existsSync(file)) return null;
  const groups = JSON.parse(fs.readFileSync(file, 'utf8')).providers;
  if (!Array.isArray(groups)) return null;
  const idx = REG.catalogIndex(groups);

  const L = [];
  L.push(ANNEX_START);
  L.push('');
  L.push('## 📚 Annex H — Complete Model Catalog API Examples');
  L.push('');
  L.push('> **Generated** from `models.json` + [`bin/cli_registry.js`](../../bin/cli_registry.js)');
  L.push('> by `node bin/gen_cli_matrix.js --write`. Do not hand-edit between the markers.');
  L.push('>');
  L.push('> Every command below routes through the model\'s **catalogued provider**, not its name.');
  L.push('> The hand-written version of this annex sent all `anthropic/*` and `openai/*` models to');
  L.push('> `opencode run`, which cannot bill them — the command that produced the phantom');
  L.push('> *"Insufficient balance"*. Ten of thirty-three examples were wrong that way.');
  L.push('');
  let total = 0;
  for (const g of groups) {
    if (!g || !Array.isArray(g.models)) continue;
    L.push('### Provider: `' + g.provider + '` (Pool: `' + (g.pool || 'unknown') + '`)');
    L.push('');
    for (const raw of g.models) {
      const slug = typeof raw === 'string' ? raw : (raw && (raw.name || raw.model));
      if (!slug) continue;
      total++;
      const r = REG.resolveCli(slug, idx);
      L.push('#### `' + slug + '`');
      L.push('');
      if (r.cli === 'in-session') {
        L.push('*Sentinel — the orchestrator itself. Nothing is spawned; there is no command to run.*');
        L.push('');
        continue;
      }
      const spec = REG.CLI_SPEC[r.cli];
      const argv = spec.argv(r.modelArg, PROMPT);
      const tail = spec.stdinNull ? ' < /dev/null' : '';
      L.push('`' + r.provider + '` → **`' + r.cli + '`**' +
        (r.modelArg ? ' · model arg `' + r.modelArg + '`' : ' · no `--model` (provider default)'));
      L.push('');
      L.push('**Bash**');
      L.push('```bash');
      L.push(spec.bin + ' ' + argv.map(sh).join(' ') + tail);
      L.push('```');
      L.push('');
      L.push('**Python**');
      L.push('```python');
      L.push('import subprocess');
      L.push('subprocess.run([' + [spec.bin].concat(argv).map(q).join(', ') + '],');
      L.push('               capture_output=True, text=True, timeout=60' +
        (spec.stdinNull ? ', stdin=subprocess.DEVNULL' : '') + ')');
      L.push('```');
      L.push('');
      L.push('**Node.js**');
      L.push('```javascript');
      L.push("const { spawnSync } = require('child_process');");
      L.push('spawnSync(' + q(spec.bin) + ', [' + argv.map(q).join(', ') + '], { encoding: ' +
        q('utf8') + ', timeout: 60000' + (spec.stdinNull ? ", stdio: ['ignore','pipe','pipe']" : '') + ' });');
      L.push('```');
      L.push('');
    }
  }
  L.push('> **' + total + ' models** documented, every one in bash, python and node.');
  L.push('');
  L.push(ANNEX_END);
  return L.join('\n');
}

function main(argv) {
  const block = build();
  const annex = buildCatalogAnnex();
  let text = fs.readFileSync(MANUAL, 'utf8');
  const i = text.indexOf(START);
  const j = text.indexOf(END);
  const current = i !== -1 && j !== -1 ? text.slice(i, j + END.length) : null;
  const ai = text.indexOf(ANNEX_START);
  const aj = text.indexOf(ANNEX_END);
  const curAnnex = ai !== -1 && aj !== -1 ? text.slice(ai, aj + ANNEX_END.length) : null;

  if (argv.indexOf('--check') !== -1) {
    if (current !== block) {
      console.error('✗ CLI matrix is stale — run: node bin/gen_cli_matrix.js --write');
      return 1;
    }
    // The annex depends on the machine's models.json, which is not in the repo,
    // so it is only checked when a catalog is actually present.
    if (annex && curAnnex !== null && curAnnex !== annex) {
      console.error('✗ Model catalog annex is stale — run: node bin/gen_cli_matrix.js --write');
      return 1;
    }
    console.log('✓ CLI matrix in sync with bin/cli_registry.js');
    return 0;
  }
  if (annex) {
    if (curAnnex !== null) text = text.slice(0, ai) + annex + text.slice(aj + ANNEX_END.length);
    else {
      const h = text.indexOf('## 📚 Annex H');
      text = (h !== -1 ? text.slice(0, h) : text.replace(/\s*$/, '\n\n')) + annex + '\n';
    }
    fs.writeFileSync(MANUAL, text);
  }
  if (current === null) {
    text = text.replace(/\n## 📎 Annex A/, '\n' + block + '\n\n## 📎 Annex A');
    if (text.indexOf(START) === -1) text += '\n\n' + block + '\n';
  } else {
    text = text.slice(0, i) + block + text.slice(j + END.length);
  }
  fs.writeFileSync(MANUAL, text);
  console.log('✓ CLI matrix written to ' + path.relative(process.cwd(), MANUAL));
  return 0;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));
module.exports = { build, buildCatalogAnnex, START, END, ANNEX_START, ANNEX_END, PROMPT };
