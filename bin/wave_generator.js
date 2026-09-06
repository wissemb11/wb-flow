'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { splitCommand, parseTaskText, extractVerifyCommand } = require('./wave_parser');
const { route, cliFor } = require('./wave_router');
const { PKG_ROOT, GATE_LINE_PATTERN, INFRA_GREP_PATTERN, REFUSAL_GREP_PATTERN, ROLES } = require('./wave_constants');

/** The `-s <id> --fork` / `--title <key>` preamble, as one shell line. */
function sessionArgsShell(key) {
  const f = keyFileOf(key);
  return '_g9_sid=""; [ -f ' + f + ' ] && _g9_sid=$(cat ' + f + ' 2>/dev/null); '
       + 'if [ -n "$_g9_sid" ]; then _g9_sargs=(-s "$_g9_sid" --fork); '
       + 'else _g9_sargs=(--title ' + shq(key) + '); fi';
}
function shq(s) {
  return "'" + String(s).replace(/'/g, "'\\''") + "'";
}
/**
 * Absolute path to a command's Layer-1 template, or '' if it cannot be found.
 *
 * Same candidate ladder as parseModelRecommendations: a real install first, the
 * package's own templates last. Only codex needs this — claude and opencode
 * register the command and agy reaches it through its skill dispatcher.
 */
function templatePathFor(name, repoRoot) {
  const homeWb = path.join(os.homedir(), '.wb-flow', 'commands');
  const candidates = [
    repoRoot && path.join(repoRoot, '.wb', 'commands', name, name + '_template.md'),
    repoRoot && path.join(repoRoot, 'commands', name, name + '_template.md'),
    path.join(homeWb, name, name + '_template.md'),
    path.join(PKG_ROOT, 'templates', 'commands', name, name + '_template.md'),
  ].filter(Boolean);
  return candidates.filter(function (p) { return fs.existsSync(p); })[0] || '';
}
/**
 * The prompt text for any CLI that cannot expand a slash-command —
 * i.e. every `cliFor()` result with `slashCommands: false`.
 *
 * codex expands no slash-command (verified 2026-08-03), so sending `/wbWork …`
 * gives it a literal string it will try to interpret — in the probe it went
 * hunting the filesystem for "flow entrypoints". The wrapper files that claude
 * and opencode read are themselves just "Read <template> and execute it", so
 * codex gets the same sentence directly.
 *
 * **agy is in the same class and was not treated as such until 2026-08-10.**
 * It was handed a bare `/wbWork <plan> --id=3 …` and replied *"I am currently
 * running on the Gemini 3.1 Pro model. How can I assist you with your coding
 * tasks today?"* — a conversational answer to what it read as chat. It touched
 * nothing, and Gate 1 scored it PASS. Any `slashCommands: false` CLI gets this
 * prompt now; the name is no longer codex-specific.
 *
 * If the template cannot be located, fall back to the slash form rather than
 * emitting a prompt that references a nonexistent path: a cell that fails
 * honestly beats one that sends the agent chasing a bad filename.
 */
function inlineTemplatePrompt(name, args, repoRoot) {
  const tpl = templatePathFor(name, repoRoot);
  if (!tpl) return '/' + name + ' ' + args;
  return 'Read ' + tpl + ' and execute the procedure described there.\n'
    + 'Arguments / target: ' + args + '\n'
    + 'Write outputs under the scope\'s .wb/workflows/reports/ as the template specifies.';
}
/**
 * Session key for warm dispatches — one per (scope, model).
 *
 * A cold `opencode run` re-reads the command template and the scope's context
 * before it does anything. Resuming a session skips that re-read. The key is
 * per-model because a session is one conversation: two models sharing it would
 * each inherit the other's reasoning.
 */
/**
 * Key for a reusable warm session.
 *
 * MUST include the plan. A key of only (scope, model) makes every plan in a scope
 * share one conversation, and a resumed session's history outranks the command
 * line it was handed: on 2026-08-03 two cells dispatched against
 * plan_wb-flow-next_20260803.md executed the *previous* plan's tasks instead, and
 * a third overwrote a validated task report. `--fork` does not help — the fork
 * inherits the history.
 *
 * planPath is optional so existing callers keep working; when absent the key
 * degrades to the old (scope, model) form rather than throwing.
 */
function sessionKeyFor(scope, model, planPath) {
  const safe = function (s) { return String(s || '').replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, ''); };
  const base = 'wbflow:' + safe(scope) + ':' + safe(model);
  if (!planPath) return base;
  return base + ':' + safe(path.basename(String(planPath), '.md'));
}
/** The id file for a session key, quoted for the generated shell. */
function keyFileOf(sessionKey) {
  return '"$SESSION_DIR"/' + shq(sessionKey.replace(/:/g, '_') + '.id');
}
function emitDispatchGates(L, cmdInfo) {
  var parsed = cmdInfo.parsed;
  var model = cmdInfo.model;
  var wbRunPath = cmdInfo.wbRunPath;
  var planDirRel = cmdInfo.planDirRel;
  var verifyColumn = cmdInfo.verifyColumn;
  var isPrelude = cmdInfo.isPrelude;
  var repoRoot = cmdInfo.repoRoot;
  var ids = (parsed.ids || []).slice();
  var isWbWork = parsed.name.toLowerCase() === 'wbwork';
  var isWbExplain = parsed.name.toLowerCase() === 'wbexplain';
  var isWbValid = parsed.name.toLowerCase() === 'wbvalid';
  // The dispatched payload MUST be rebuilt from `parsed.ids`, never taken from the
  // raw `parsed.rest`. The batching merge (see "Batch spawned cells…" below) appends
  // to `parsed.ids` and rewrites `cell.command`, but leaves `rest` at its parsed
  // value — so a merged cell `--id=2,3,8` dispatched `--id=2,3`: the third row was
  // gated, est-summed, _meta-labelled and reported on, yet never actually worked.
  // It also broke liveness: watch.js pgreps `--id=2,3,8 ` (from the log filename)
  // and found no such process, reporting a healthy cell as ENDED/crashed.
  var restNorm = parsed.rest || '';
  if (ids.length) {
    restNorm = /--id=/.test(restNorm)
      ? restNorm.replace(/--id=\S+/, '--id=' + ids.join(','))
      : ('--id=' + ids.join(',') + ' ' + restNorm).trim();
  }
  var args = (parsed.target + ' ' + restNorm).trim() + ' --no-plan-update';
  var cmdLabel = parsed.name + ' ' + ids.join(',');
  if (isPrelude) cmdLabel = cmdLabel + ' (prelude)';

  // ── the dispatch chain ──────────────────────────────────────────────────
  // Try each model in turn, advancing ONLY on a G1/INFRA failure — the agent
  // never ran, so a different one is worth trying. A G2 or G3 failure is the
  // TASK failing, and a second model meets the same wall at double the spend
  // (wbWork_template §"Model fallback fires on Gate 1 only").
  //
  // Before this, the generator emitted one dispatch from the chain's first
  // entry and silently discarded the rest — the roster and the template both
  // promised left-to-right fallback and nothing implemented it.
  const chain = (cmdInfo.chain && cmdInfo.chain.length ? cmdInfo.chain : [model])
    .filter(function (m) { return m; });

  L.push('  _g9_out=$(mktemp)');
  L.push('  _g9_ran=0; _g9_model=""; _g9_rc=1');
  // Snapshot file CONTENT, rather than VCS metadata. `git diff` cannot see the
  // contents of a pre-existing untracked or ignored file, so it can report a
  // false NO-OP.
  //
  // SCOPED, not workspace-wide — deliberately. Walking $REPO (the monorepo root)
  // covered 814 153 files, 614 550 of them node_modules, at ~936 s per snapshot
  // and two snapshots per cell: it hung every dispatch before the agent spawned
  // (measured 2026-09-04). The contract is therefore "no content changed inside
  // the plan's own scope, excluding build output", which is checkable in ~4.5 s.
  // A change made outside the scope is out of contract and will NOT be detected;
  // that limit is stated rather than silently hoped away. The task_<i>/ report folder is deliberately excluded because
  // every wbWork agent must write its report there; otherwise the report itself
  // would make every dispatch look productive. Runner logs and metadata are
  // excluded for the same reason. The `task_\\d+\\/` spelling is retained in
  // this comment as the contract's human-readable exclusion pattern.
  // Resolve the scope AT GENERATION TIME, not at runtime. `$PLAN` exists only as a
  // line inside each cell's `_meta` heredoc — it is never a shell variable — so a
  // runtime `dirname "$PLAN"` dies under `set -u` with `PLAN: unbound variable`
  // (measured 2026-09-04). The scope is the directory owning the `.wb/` tree.
  var _g9scope = (function () {
    var p = String(cmdInfo.planPath || '');
    var k = p.indexOf('/.wb/');
    if (k > 0) return p.slice(0, k);
    return cmdInfo.repoRoot;
  })();
  L.push('  _g9_scope=' + shq(_g9scope));
  L.push('  _g9_snapshot_workspace() {');
  L.push('    local _g9_snapshot="$1" _g9_file _g9_rel _g9_hash');
  L.push('    find "$_g9_scope" \\');
  L.push('      \\( -name node_modules -o -name .git -o -name dist -o -name dist-pro \\');
  L.push('         -o -name dist-free -o -name coverage -o -name build -o -name .next \\');
  L.push('         -o -name .cache -o -name .vitepress \\) -prune -o \\');
  L.push('      -type f \\');
  L.push('      ! -path "$RUN_DIR/*" \\');
  L.push('      ! -path \'*/tasks/task_[0-9]*/*\' \\');
  L.push('      -print0 | sort -z | while IFS= read -r -d "" _g9_file; do');
  L.push('        _g9_rel=${_g9_file#"$_g9_scope"/}');
  L.push('        _g9_hash=$(sha256sum -- "$_g9_file" | awk \'{print $1}\') || exit 1');
  L.push('        printf "%s\\t%s\\n" "$_g9_hash" "$_g9_rel"');
  L.push('      done > "$_g9_snapshot"');
  L.push('  }');
  L.push('  _g9_snapshot_workspace "$_g9_out.wbefore"');

  chain.forEach(function (m, idx) {
    const cli = cliFor(m, { sandbox: cmdInfo.sandbox });
    L.push('');
    L.push('  # attempt ' + (idx + 1) + '/' + chain.length + ': ' + m);
    L.push('  if [ "$_g9_ran" -eq 0 ]; then');
    L.push('    echo "▶ ' + cmdLabel + ' [' + m + ']"' + (idx ? '   # fallback' : ''));
    // Only opencode has resumable sessions here: agy has none, and codex's
    // `resume` keys off its own session ids, not a title we can set.
    if (cmdInfo.sessionKey && cli.bin !== 'agy' && cli.bin !== 'codex') L.push('    ' + sessionArgsShell(cmdInfo.sessionKey));
    // The dispatch is emitted FROM `cli.argv` — never re-derived here. Until
    // 2026-08-10 this block hardcoded a flag list per `cli.bin` and ignored the
    // argv cliFor had just computed, so the `(auto)` branches (which return NO
    // model flag on purpose) got one injected anyway, carrying the *display
    // name* as a model id. Measured that day on Wave A: `codex exec -m 'Codex
    // (auto)'` → 400 "model is not supported", and `agy --model 'Antigravity
    // (auto)'` answered a greeting and did nothing while Gate 1 scored it PASS.
    // 0 of 4 ids produced anything. cliFor is the single source of truth.
    const tail = ' 2>&1 | tee "$_g9_out"; _g9_rc=${PIPESTATUS[0]}';
    const argv = cli.argv.slice();
    // A leading bare word is a subcommand (`codex exec`, `opencode run`), not a
    // flag — keep it on the bin's line so the generated shell reads naturally.
    const sub = (argv.length && argv[0].charAt(0) !== '-') ? ' ' + argv.shift() : '';
    L.push('    ' + (wbRunPath ? '$WB_RUN ' : '') + cli.bin + sub + ' \\');
    const q = function (a) { return /^[A-Za-z0-9_.:=/-]+$/.test(a) ? a : shq(a); };
    for (let i = 0; i < argv.length; i++) {
      // Keep a flag and its value on one line (`--model gemini-3.1-pro-high`).
      // Splitting them is functionally identical but unreadable in a script a
      // human is told to read before running.
      const takesValue = argv[i].charAt(0) === '-'
        && i + 1 < argv.length && argv[i + 1].charAt(0) !== '-';
      L.push('      ' + q(argv[i]) + (takesValue ? ' ' + q(argv[++i]) : '') + ' \\');
    }
    // Working directory: the flag differs per CLI and is not part of argv.
    if (cli.bin === 'codex') L.push('      -C "$REPO" \\');
    else if (cli.bin === 'opencode') L.push('      --dir "$REPO" \\');
    if (cmdInfo.sessionKey && cli.bin === 'opencode') L.push('      "${_g9_sargs[@]}" \\');
    if (cli.slashCommands) {
      if (cli.bin === 'opencode') {
        L.push('      --command ' + shq(parsed.name) + ' \\');
        L.push('      ' + shq(args) + tail);
      } else {
        L.push('      ' + shq('/' + parsed.name + ' ' + args) + tail);
      }
    } else {
      // A CLI that cannot expand `/wbWork …` must be handed the template
      // inline, exactly as the wrapper files do. codex AND agy are both in this
      // class; only codex was, and agy read its slash string as conversation.
      L.push('      ' + shq(inlineTemplatePrompt(parsed.name, args, repoRoot))
             + (cli.stdinNull ? ' < /dev/null' : '') + tail);
    }
    if (cmdInfo.sandbox) {
      L.push('    if grep -qiE ' + shq(REFUSAL_GREP_PATTERN) + ' "$_g9_out" || [ ! -s "$_g9_out" ]; then');
      L.push('      echo "  G1: REFUSED — sandboxed dispatch could not proceed without permission bypass on ' + m + '"');
      L.push('      _g9_ran=3; _g9_model=' + shq(m));
      L.push('    elif [ "$_g9_rc" -ne 0 ] || grep -qE ' + shq(INFRA_GREP_PATTERN)
             + ' <(sed ' + shq('s/\\x1b\\[[0-9;]*m//g') + ' "$_g9_out"); then');
    } else {
      L.push('    if [ "$_g9_rc" -ne 0 ] || grep -qE ' + shq(INFRA_GREP_PATTERN)
             + ' <(sed ' + shq('s/\\x1b\\[[0-9;]*m//g') + ' "$_g9_out"); then');
    }
    L.push('      if grep -qi "timeout" "$_g9_out"; then');
    L.push('        echo "  G1: ATTEMPTED (timeout) on ' + m + '"');
    L.push('        _g9_ran=2; _g9_model=' + shq(m) + '');
    L.push('      else');
    L.push('        echo "  G1: INFRA on ' + m + '"'
           + (idx + 1 < chain.length ? ' && echo "      → falling back to ' + chain[idx + 1] + '"' : ''));
    L.push('      fi');
    L.push('    else');
    L.push('      _g9_ran=1; _g9_model=' + shq(m));
    L.push('    fi');
    L.push('  fi');
  });

  L.push('  _g9_snapshot_workspace "$_g9_out.wafter"');
  L.push('  _g9_tree_changed=1');
  L.push('  if cmp -s "$_g9_out.wbefore" "$_g9_out.wafter" >/dev/null 2>&1; then');
  L.push('    _g9_tree_changed=0');
  L.push('  fi');
  L.push('');
  L.push('  if [ "$_g9_ran" -eq 0 ]; then');
  L.push('    echo "  VERDICT: INFRA — every model in the chain failed to run"');
  if (!isPrelude) L.push('    echo "__EXIT__=1"');
  L.push('    rm -f "$_g9_out"; exit 1');
  L.push('  fi');
  L.push('  if [ "$_g9_ran" -eq 2 ]; then');
  L.push('    echo "  VERDICT: ATTEMPTED — agent timed out"');
  if (!isPrelude) L.push('    echo "__EXIT__=1"');
  L.push('    rm -f "$_g9_out"; exit 1');
  L.push('  fi');
  L.push('  if [ "$_g9_ran" -eq 3 ]; then');
  L.push('    echo "  VERDICT: REFUSED — sandboxed dispatch requires operator-approved permissions"');
  if (!isPrelude) L.push('    echo "__EXIT__=1"');
  L.push('    rm -f "$_g9_out"; exit 1');
  L.push('  fi');
  L.push('  echo "  G1: PASS  (ran on $_g9_model)"');

  // A cold run just created the session — record its id so the next wave is
  // warm. Resolved BY TITLE, not by "most recent": under parallelism the newest
  // session is not reliably this cell's.
  if (cmdInfo.sessionKey) {
    const kf = keyFileOf(cmdInfo.sessionKey);
    L.push('  if [ -z "${_g9_sid:-}" ]; then');
    L.push('    mkdir -p "$SESSION_DIR"');
    L.push('    opencode session list --format json 2>/dev/null \\');
    L.push('      | jq -r --arg t ' + shq(cmdInfo.sessionKey)
           + ' \'[.[]|select(.title==$t)]|sort_by(.created)|.[-1].id // empty\' \\');
    L.push('      > ' + kf + '.tmp 2>/dev/null');
    L.push('    if [ -s ' + kf + '.tmp ]; then');
    L.push('      mv ' + kf + '.tmp ' + kf);
    L.push('      echo "  session: saved $(cat ' + kf + ') for reuse"');
    L.push('    else');
    L.push('      rm -f ' + kf + '.tmp');
    L.push('      echo "  session: could not resolve an id by title — next run stays cold"');
    L.push('    fi');
    L.push('  fi');
  }


  // ── G2 + G3 are PER ID, never per dispatch ────────────────────────────────
  // One dispatch may name several rows (`--id=3,8`): merging same-target,
  // same-model, same-role tasks pays the agent's start-up context once instead
  // of once per task. Gating only `ids[0]` made that merge silently unverified
  // — every id after the first landed DONE with its report unchecked and its
  // oracle never run. The cell's verdict is now the WORST id's verdict, and
  // every id prints its own line so the orchestrator can set Done boxes
  // individually from one log.
  var gated = (isWbWork || isWbExplain || isWbValid) && ids.length > 0;
  if (!gated) {
    L.push('  echo "  VERDICT: DONE"');
    if (!isPrelude) L.push('  echo "__EXIT__=0"');
    L.push('  rm -f "$_g9_out"');
    return;
  }

  var fileType = isWbValid ? 'validation artifact' : (isWbWork ? 'task report' : 'blueprint');
  var artifactInfix = (isWbWork || isWbValid) ? '_report_' : '_details_';

  L.push('');
  L.push("  _g9_noop=''; _g9_att=''; _g9_unv=''; _g9_ok=''");

  ids.forEach(function (id) {
    // The `*` MUST stay outside the quotes: `ls 'a_*.md'` asks for a file
    // literally named `a_*.md` and can never match, which turned every gated
    // dispatch into a NO-OP. Quote the fixed parts, glob the variable one.
    var globPrefix = path.join(planDirRel, 'tasks', 'task_' + id, 'task_' + id + artifactInfix);
    var globText = globPrefix + '*.md';

    L.push('');
    L.push('  # ── id ' + id + ' ──');
    L.push('  _g9_v=DONE');

    if (isWbValid) {
      // G2 for wbValid: task report exists AND gained a Validation section.
      // Mere file existence is not enough — a validator that no-ops must land
      // NO-OP, never DONE (bug 3).
      var wvGlob = path.join(planDirRel, 'tasks', 'task_' + id, 'task_' + id + '_report_*.md');
      L.push('  # G2: Artifact (' + fileType + ' in task report)');
      L.push('  _g9_rpt=$(ls ' + shq(path.join(planDirRel, 'tasks', 'task_' + id, 'task_' + id)) + '_report_*.md 2>/dev/null | head -1)');
      L.push('  if [ -n "$_g9_rpt" ] && grep -q ' + shq('## 🔍 Validation') + ' "$_g9_rpt"; then');
      L.push('    echo "  G2 [' + id + ']: PASS"');
      L.push('  else');
      L.push('    echo "  G2 [' + id + ']: NO-OP — no Validation section in task report"');
      L.push('    _g9_v=NO-OP');
      L.push('  fi');
    } else {
      L.push('  # G2: Artifact (' + fileType + ' exists)');
      L.push('  if ls ' + shq(globPrefix) + '*' + shq('.md') + ' >/dev/null 2>&1; then');
      L.push('    if [ "$_g9_tree_changed" -eq 0 ]; then');
      L.push('      echo "  G2 [' + id + ']: NO-OP — no workspace content changed (excluding task_' + id + '/ report folder)"');
      L.push('      _g9_v=NO-OP');
      L.push('    else');
      L.push('      echo "  G2 [' + id + ']: PASS"');
      L.push('    fi');
      L.push('  else');
      L.push('    echo "  G2 [' + id + ']: NO-OP — no ' + fileType + ' at ' + globText + '"');
      L.push('    _g9_v=NO-OP');
      L.push('  fi');
    }

    // G3 applies to EVERY /wbWork dispatch, prelude included. `isPrelude` was a
    // leftover from before G9 made gating per-dispatch: it silently gave the
    // earlier commands of a multi-command lane a DONE with no oracle at all.
    if (isWbWork) {
      var verifyCell = (verifyColumn && verifyColumn[id]) || '';
      var verifyCmd = extractVerifyCommand(verifyCell);
      L.push('  # G3: Oracle (this row\'s Verify cell)');
      L.push('  if [ "$_g9_v" = DONE ]; then');
      if (verifyCmd) {
        // Run the oracle from the plan's own directory so plan-relative paths
        // (e.g. `node ../../../../../core/test/wave_gates.js`) resolve.  The
        // generated script `cd "$REPO"` first, and without this every oracle
        // runs from the repo root — bug 2 (false negative).
        if (planDirRel) {
          L.push('    if (cd ' + shq(planDirRel) + ' && bash -c ' + shq(verifyCmd) + ') >/dev/null 2>&1; then');
        } else {
          L.push('    if bash -c ' + shq(verifyCmd) + ' >/dev/null 2>&1; then');
        }
        L.push('      echo "  G3 [' + id + ']: PASS"');
        L.push('    else');
        L.push('      echo "  G3 [' + id + ']: ATTEMPTED — oracle failed"');
        L.push('      _g9_v=ATTEMPTED');
        L.push('    fi');
      } else {
        // No runnable oracle. Say so out loud and refuse a bare DONE — silence
        // here is how a row lands ✅ having verified nothing. A `human:` cell is
        // a legitimate state; pretending it was machine-checked is not.
        var why = /^\s*human:/i.test(verifyCell) ? 'human-verified row'
                : (verifyCell.trim() ? 'Verify cell is not a runnable command'
                                     : 'no Verify cell in the plan row');
        L.push('    echo "  G3 [' + id + ']: SKIPPED — ' + why + '"');
        L.push('    _g9_v=UNVERIFIED');
      }
      L.push('  fi');
    }

    // G3 for wbValid: the plan's ☐ Valid column must be non-⬜.
    // A validator that no-ops must land NO-OP, never DONE (bug 3).
    if (isWbValid) {
      var planFile = cmdInfo.planPath || '';
      L.push('  # G3: Valid column (plan\'s ☐ Valid is non-⬜)');
      L.push('  if [ "$_g9_v" = DONE ]; then');
      L.push('    _g9_plan_row=$(grep "\\[' + id + '\\]" ' + shq(planFile) + ' 2>/dev/null | head -1)');
      L.push('    if [ -n "$_g9_plan_row" ]; then');
      L.push('      _g9_valid_cell=$(echo "$_g9_plan_row" | awk -F\'|\' \'{gsub(/^[ \\t]+|[ \\t]+$/, "", $(NF-1)); print $(NF-1)}\')');
      L.push('      if [ "$_g9_valid_cell" != "⬜" ] && [ -n "$_g9_valid_cell" ]; then');
      L.push('        echo "  G3 [' + id + ']: PASS"');
      L.push('      else');
      L.push('        echo "  G3 [' + id + ']: ATTEMPTED — Valid column is ⬜ (not validated)"');
      L.push('        _g9_v=ATTEMPTED');
      L.push('      fi');
      L.push('    else');
      L.push('      echo "  G3 [' + id + ']: ATTEMPTED — cannot find row for ' + id + ' in plan"');
      L.push('      _g9_v=ATTEMPTED');
      L.push('    fi');
      L.push('  fi');
    }

    L.push('  echo "  VERDICT [' + id + ']: $_g9_v"');
    L.push('  case "$_g9_v" in');
    L.push('    NO-OP) _g9_noop="$_g9_noop ' + id + '" ;;');
    L.push('    ATTEMPTED) _g9_att="$_g9_att ' + id + '" ;;');
    L.push('    UNVERIFIED) _g9_unv="$_g9_unv ' + id + '" ;;');
    L.push('    *) _g9_ok="$_g9_ok ' + id + '" ;;');
    L.push('  esac');
  });

  L.push('');
  L.push('  # ── cell verdict = worst id (NO-OP > ATTEMPTED > UNVERIFIED > DONE) ──');
  L.push('  echo "  PER-ID: DONE=[${_g9_ok# }] UNVERIFIED=[${_g9_unv# }]' +
         ' ATTEMPTED=[${_g9_att# }] NO-OP=[${_g9_noop# }]"');
  L.push('  if [ -n "$_g9_noop" ]; then');
  L.push('    echo "  VERDICT: NO-OP —$_g9_noop"');
  if (!isPrelude) L.push('    echo "__EXIT__=1"');
  L.push('    rm -f "$_g9_out"; exit 1');
  L.push('  fi');
  L.push('  if [ -n "$_g9_att" ]; then');
  L.push('    echo "  VERDICT: ATTEMPTED —$_g9_att"');
  if (!isPrelude) L.push('    echo "__EXIT__=1"');
  L.push('    rm -f "$_g9_out"; exit 1');
  L.push('  fi');
  L.push('  if [ -n "$_g9_unv" ]; then');
  L.push('    echo "  VERDICT: UNVERIFIED (G1+G2 only — no oracle ran) —$_g9_unv"');
  if (!isPrelude) L.push('    echo "__EXIT__=0"');
  L.push('    rm -f "$_g9_out"; exit 0');
  L.push('  fi');
  L.push('  echo "  VERDICT: DONE"');
  if (!isPrelude) L.push('  echo "__EXIT__=0"');
  L.push('  rm -f "$_g9_out"');
}
function buildScript(ctx) {
  const { planPath, wave, cells, dispatchIndex, models, jobs, repoRoot } = ctx;
  const sandbox = !!ctx.sandbox;
  const verifyColumn = ctx.verifyColumn || {};
  const estTime = ctx.estTime || {};
  const planDirRel = ctx.planDirRel || path.relative(repoRoot, path.dirname(planPath));
  const wbRunPath = resolveWbRun(repoRoot);
  const rawSpawned = [];
  const inline = [];
  const skipped = [];

  for (const cell of cells) {
    // A22 — checked BEFORE anything that could route it. A 👤 human row gets no
    // lane and no fallback: the dispatcher must not be the layer that decides a
    // human gate is negotiable. This is the second of two independent guards
    // (the parser refuses to build a command out of prose); A18 proved that one
    // fix in one module is not enough when two modules reach the same matrix.
    if (cell.human) { skipped.push({ cell: cell, why: '👤 HUMAN ROW — never dispatched' }); continue; }
    const parsed = splitCommand(cell.command);
    if (!parsed) { skipped.push({ cell: cell, why: 'unparseable command' }); continue; }
    if (cell.held) { skipped.push({ cell: cell, why: 'HELD / not dispatched' }); continue; }
    if (/\.md$/.test(parsed.target) && !fs.existsSync(path.join(repoRoot, parsed.target))) {
      skipped.push({ cell: cell, why: 'target not found from repo root: ' + parsed.target });
      continue;
    }
    const r = route(cell, dispatchIndex, models, ctx.doneColumn, ctx.delegateModel, ctx.requiresColumn, ctx.delegateChain, { sandbox: sandbox });
    (r.lane === 'claude' ? inline : rawSpawned).push({ cell: cell, parsed: parsed, route: r });
  }

  // Batch spawned cells targeting the same plan file, action role, and routed model
  // into a single merged dispatch (--id=5,6) to reuse startup context and reduce cost.
  const spawned = [];
  const spawnMap = new Map();
  let mergeCounter = 0;
  for (const item of rawSpawned) {
    const isNoMerge = item.parsed.rest.includes('--no-merge') || (ctx.noMerge === true);
    const baseKey = [item.parsed.name, item.parsed.target, item.cell.role, item.route.model || ''].join('::');
    const key = isNoMerge ? baseKey + '::nomerge::' + (++mergeCounter) : baseKey;
    if (spawnMap.has(key)) {
      const prev = spawnMap.get(key);
      for (const id of item.parsed.ids) {
        if (prev.parsed.ids.indexOf(id) === -1) prev.parsed.ids.push(id);
      }
      prev.cell.command = '/' + prev.parsed.name + ' ' + prev.parsed.target + ' --id=' + prev.parsed.ids.join(',');
      if (item.cell.est && prev.cell.est) prev.cell.est += item.cell.est;
    } else {
      const cloned = {
        cell: Object.assign({}, item.cell),
        parsed: Object.assign({}, item.parsed, { ids: item.parsed.ids.slice() }),
        route: Object.assign({}, item.route)
      };
      spawnMap.set(key, cloned);
      spawned.push(cloned);
    }
  }

  // A merged dispatch (`--id=3,8`) is ONE process doing both rows in sequence,
  // so its budget is the SUM of their estimates. Keyed on the joined id, which
  // is also what the heartbeat prints and what `pgrep -f -- "--id=3,8"` finds.
  // Without this the cell reads `OVER est` while still inside its real budget
  // — and `OVER est` + flat CPU is the documented kill signal.
  const est = Object.assign({}, estTime);
  for (const it of spawned) {
    const mids = it.parsed.ids;
    if (mids.length < 2) continue;
    const known = mids.filter((id) => estTime[id] > 0);
    if (!known.length) continue;
    est[mids.join(',')] = known.reduce((sum, id) => sum + estTime[id], 0);
  }

  const L = [];
  L.push('#!/usr/bin/env bash');
  L.push('#');
  L.push('# wave_' + wave + ' — generated by `wb-flow wave` on ' + new Date().toISOString());
  L.push('# plan: ' + planPath);
  L.push('#');
  L.push('# Every cell in this wave is collision-free by the matrix\'s own check, so they');
  L.push('# run in PARALLEL. Sub-agents get --no-plan-update: they write only their task');
  L.push('# report. Checking Done boxes + recomputing the matrix is the orchestrator\'s');
  L.push('# job, ONCE, after this script exits.');
  L.push('#');
  if (sandbox) L.push('# sandbox: permission and sandbox bypass flags are omitted; permission refusals score REFUSED.');
  if (inline.length) {
    L.push('# NOT run here — these stay with Claude in-session:');
    for (const it of inline) L.push('#   ' + it.cell.command + '   (' + it.route.reason + ')');
    L.push('#');
  }
  if (skipped.length) {
    L.push('# Skipped:');
    for (const s of skipped) L.push('#   ' + s.cell.command + '   (' + s.why + ')');
    L.push('#');
  }
  L.push('set -uo pipefail');
  L.push('');
  L.push('REPO=' + shq(repoRoot));
  if (wbRunPath) {
    L.push('WB_RUN=' + shq(wbRunPath));
  } else {
    L.push('');
    // `\\$` so the generated shell sees a LITERAL $WB_RUN. Unescaped, `set -u`
    // treats it as an unbound variable and kills the whole wave at line 15.
    L.push('echo "⚠️  wbRun is not installed — \\$WB_RUN dispatch protection is OFF."');
    L.push('echo "   Run: npx wb-flow init"');
    L.push('');
  }
  L.push('RUN_DIR="${WB_WAVE_LOG_DIR:-$REPO/.wb/workflows/reports/waves/' + wave + '_$(date +%Y%m%d_%H%M%S)}"');
  L.push('mkdir -p "$RUN_DIR"');
  if (ctx.sessions) {
    // Beside the wave logs, but NOT inside the timestamped run dir — the point
    // is that it outlives a single wave.
    L.push('SESSION_DIR="${WB_WAVE_SESSION_DIR:-$(dirname "$RUN_DIR")/sessions}"');
    L.push('mkdir -p "$SESSION_DIR"');
    L.push('command -v jq >/dev/null 2>&1 || echo "⚠️  jq not found — session ids cannot be captured; runs stay cold."');
  }
  L.push('cd "$REPO" || exit 1');
  L.push('');
  L.push('command -v opencode >/dev/null 2>&1 || { echo "❌ opencode not on PATH"; exit 127; }');
  L.push('');

  if (Object.keys(est).length > 0) {
    var estEntries = Object.entries(est).map(function (kv) {
      return '[' + shq(kv[0]) + ']=' + kv[1];
    });
    L.push('declare -A EST=(' + estEntries.join(' ') + ')');
    L.push('declare -A CELL_START');
    L.push('');
    L.push('_heartbeat_start_time=$(date +%s)');
    L.push('heartbeat() {');
    L.push('  while true; do');
    L.push('    sleep 30');
    L.push('    local now_wave=$(( $(date +%s) - _heartbeat_start_time ))');
    L.push('    local wm=$(( now_wave / 60 ))');
    L.push('    local ws=$(( now_wave % 60 ))');
    L.push('    printf "\\n── ⏱️  %dm%02ds elapsed ──\\n" $wm $ws');
    L.push('    local any_running=0');
    L.push('    for i in "${!PIDS[@]}"; do');
    L.push('      if kill -0 "${PIDS[$i]}" 2>/dev/null; then');
    L.push('        any_running=1');
    L.push('        local tid="${TASK_IDS[$i]:-}"');
    L.push('        local est_val=${EST[$tid]:-0}');
    L.push('        local start=${CELL_START[$tid]:-0}');
    L.push('        local ec=0');
    L.push('        [ "$start" -gt 0 ] 2>/dev/null && ec=$(( ($(date +%s) - start) / 60 ))');
    L.push('        local cpu_s=$(ps -o times= -p "${PIDS[$i]}" 2>/dev/null | tr -d " ")');
    L.push('        if [ "$est_val" -gt 0 ] && [ "$start" -gt 0 ] 2>/dev/null; then');
    L.push('          local pct=$(( ($(date +%s) - start) * 100 / (est_val * 60) ))');
    L.push('          if [ "$pct" -ge 100 ]; then');
    L.push('            local over=$(( ($(date +%s) - start)/60 - est_val ))');
    L.push('            printf "  🔄 %-6s OVER est %sm by %sm (CPU %ss)\\n" "$tid" "$est_val" "$over" "${cpu_s:-0}"');
    L.push('          else');
    L.push('            printf "  🔄 %-6s ~%3d%% of %sm (%sm elapsed, CPU %ss)\\n" "$tid" "$pct" "$est_val" "$ec" "${cpu_s:-0}"');
    L.push('          fi');
    L.push('        else');
    L.push('          printf "  🔄 %-6s running %sm (CPU %ss)\\n" "$tid" "$ec" "${cpu_s:-0}"');
    L.push('        fi');
    L.push('      fi');
    L.push('    done');
    L.push('    [ "$any_running" -eq 0 ] && { printf "── all cells finished ──\\n"; break; }');
    L.push('  done');
    L.push('}');
    L.push('');
  }
  L.push('echo "🌊 Wave ' + wave + ' — ' + spawned.length + ' spawned cell(s), logs in $RUN_DIR"');
  L.push('echo');
  L.push('');
  L.push('declare -a PIDS=() NAMES=() TASK_IDS=()');
  L.push('');

  if (!spawned.length) {
    L.push('echo "Nothing to spawn in this wave — every cell is Claude-in-session or held."');
    L.push('exit 0');
    L.push('');
  }

  // The heartbeat is forked AFTER the dispatch block, never before it. A
  // backgrounded bash function receives a COPY of the shell's state at fork
  // time, so a heartbeat started here — while PIDS is still empty — can never
  // see a cell: `any_running` is 0 on its first tick, it prints "all cells
  // finished" 30s into the wave and exits. That is what happened in every wave
  // on 2026-08-03; no progress line, no `% of est` and no `OVER est` warning
  // has ever rendered. Dispatch is non-blocking (`&`), so PIDS is fully
  // populated by the time the loop below ends — the fork belongs after it.
  // ── Dual-pass execution (output_conventions §10.2 rule 13) ─────────────────
  // `--wave=A` must run `A.work` and THEN `A.valid`. Three shipped documents say
  // "sequentially executes … followed by" — output_conventions.md:512,
  // wbWork_template.md:293, wbPlan_template.md:305 — and until 2026-08-10 the
  // generated script launched BOTH sub-rows into one parallel batch with a
  // single `wait` at the very end. Measured that day: dispatches at lines 167
  // and 345, the only `wait` at 361, zero barriers between them.
  //
  // The 08-09 plan's D1 fix made `--wave=A` *expand* to both sub-rows; it never
  // *ordered* them. Those are different claims and only the first was proved. A
  // validate cell pairing its own wave's work therefore started before the
  // worker had written its task report, scoring G2 NO-OP against work still in
  // flight. It had not bitten only because every validate cell so far either
  // paired an EARLIER wave's rows or routed to Claude in-session (excluded from
  // the script entirely).
  //
  // Each phase is a self-contained dispatch → heartbeat → collect block. The
  // collect's `wait` IS the barrier: phase 2's dispatch lines are only reached
  // once it returns.
  const phases = [
    { label: '🔨 work', items: spawned.filter(function (it) { return it.cell.role !== 'validator'; }) },
    { label: '✅ validate', items: spawned.filter(function (it) { return it.cell.role === 'validator'; }) },
  ].filter(function (p) { return p.items.length; });

  L.push('FAILED=0');
  L.push('');

  let n = 0;
  for (let pIdx = 0; pIdx < phases.length; pIdx++) {
  const phase = phases[pIdx];
  if (phases.length > 1) {
    L.push('# ═══ phase ' + (pIdx + 1) + '/' + phases.length + ' — ' + phase.label
           + ' (' + phase.items.length + ' cell(s)) ═══');
    if (pIdx > 0) {
      L.push('echo');
      L.push('echo "🌊 Wave ' + wave + ' · ' + phase.label + ' — starting now that 🔨 work has finished"');
      // Validation of work that never landed is not silently skipped: the
      // validator's own Gate 2 reports NO-OP per id, which is the honest
      // outcome. The warning exists so the operator is not surprised by it.
      L.push('[ "$FAILED" -gt 0 ] && echo "⚠️  $FAILED work cell(s) failed — validation still runs; expect NO-OP for any id whose task report is missing."');
    }
    L.push('');
  }
  L.push('_PHASE_START=${#PIDS[@]}');
  L.push('');

  for (const item of phase.items) {
    n++;
    const { cell, parsed, route: r } = item;
    const slug = parsed.name + '_' + (parsed.ids.join('-') || 'x') + '_' + n;
    // Every id this cell carries, not just the first: it keys the summed EST
    // entry above, it is what the heartbeat prints, and it matches the string
    // `pgrep -f -- "--id=3,8"` needs for the liveness check.
    const taskId = parsed.ids.join(',') || slug;
    L.push('# [' + n + '] ' + ROLES.filter((x) => x.key === cell.role)[0].label + ' — ' + r.reason);
    if (cell.suggestedModel) {
      const estTag = cell.est ? ' (⏱️ ' + cell.est + ' min)' : '';
      L.push('#     matrix suggested: ' + cell.suggestedModel + estTag + '  →  routed to: ' + r.model);
    }
    const firstExecutable = (r.chain && r.chain.length ? r.chain : [r.model]).filter(function(m) { return m; })[0];
    if (firstExecutable && r.model && firstExecutable !== r.model) {
      console.error('❌ Assertion failed: --list model \'' + r.model + '\' disagrees with generated script model \'' + firstExecutable + '\' for cell ' + taskId);
      process.exit(1);
    }
    if (Object.keys(est).length > 0) {
      L.push('CELL_START[' + shq(taskId) + ']=$(date +%s)');
    }
    L.push('(');

    // _meta — makes a status snapshot self-describing (output_conventions mandates it)
    var kindLabel = cell.role === 'worker' ? '🔨 work' : (cell.role === 'mechanical' ? '📋 mechanical' : '✅ validate');
    var roleLabel = ROLES.filter(function (x) { return x.key === cell.role; })[0].label;
    var metaCmd = '/' + parsed.name + ' ' + parsed.target + ' --id=' + (parsed.ids.length ? parsed.ids.join(',') : '*');
    var chainStr = (r.chain || [r.model]).filter(Boolean).join(' || ');
    var estMins = cell.est || '';
    var taskTexts = parseTaskText(ctx.text || (fs.existsSync(planPath) ? fs.readFileSync(planPath, 'utf8') : ''));
    var taskDesc = (parsed.ids.map(function (id) { return taskTexts[id]; }).filter(Boolean).join('; ') || '').replace(/[\r\n]+/g, ' ').trim();
    L.push('  cat >"$RUN_DIR/' + slug + '.meta" <<\'METAE\'');
    L.push('COMMAND=' + metaCmd);
    L.push('WAVE=' + wave);
    L.push('KIND=' + kindLabel);
    L.push('ROLE=' + roleLabel);
    L.push('TASK=' + taskDesc);
    L.push('EXECUTOR=' + (r.model || 'claude (in-session)'));
    L.push('CHAIN=' + chainStr);
    L.push('EST=' + estMins);
    L.push('DISPATCH=parallel');
    L.push('SANDBOX=' + (sandbox ? '1' : '0'));
    L.push('PLAN=' + planPath);
    L.push('METAE');
    // …and a RUN-LEVEL `_meta`, which is the filename output_conventions actually
    // mandates and the only one `wb-flow watch` reads (it does
    // path.join(runDir, '_meta')). The per-cell `<slug>.meta` above is richer but
    // invisible to the consumer; writing only that left every status snapshot
    // reporting "(no _meta — header inferred from paths)".
    // First cell to finish wins; they agree on everything except COMMAND's --id.
    L.push('  [ -f "$RUN_DIR/_meta" ] || cat >"$RUN_DIR/_meta" <<\'METAR\'');
    L.push('COMMAND=' + metaCmd);
    L.push('WAVE=' + wave);
    L.push('KIND=' + kindLabel);
    L.push('EXECUTOR=' + (r.model || 'claude (in-session)'));
    L.push('DISPATCH=parallel');
    L.push('SANDBOX=' + (sandbox ? '1' : '0'));
    L.push('PLAN=' + planPath);
    L.push('METAR');

    var gateOpts = {
      sessionKey: ctx.sessions ? sessionKeyFor(ctx.scopeName, r.model, planPath) : null,
      model: r.model,
      chain: r.chain,
      wbRunPath: wbRunPath,
      planDirRel: planDirRel,
      verifyColumn: verifyColumn,
      repoRoot: repoRoot,   // codex lane resolves the template path from this
      planPath: planPath,   // wbValid G3 needs to read the plan file
      sandbox: sandbox,
    };

    for (var pi = 0; pi < (cell.prelude || []).length; pi++) {
      var preParsed = splitCommand(cell.prelude[pi]);
      if (!preParsed) continue;
      emitDispatchGates(L, Object.assign({}, gateOpts, { parsed: preParsed, isPrelude: true }));
    }

    emitDispatchGates(L, Object.assign({}, gateOpts, { parsed: parsed, isPrelude: false }));

    // --summary: the FULL cell output still lands in its log file; only the
    // decision lines reach the terminal. A cell's stream is mostly `ls` output,
    // ANSI codes and file dumps the orchestrator never acts on — and it is paid
    // for in the orchestrator's own context window, once per cell.
    //
    // `|| true` keeps grep from deciding the pipeline's exit status: under
    // `set -o pipefail` a grep that matched nothing would report the cell as
    // failed, and a grep that matched would mask a real failure.
    //
    // Process substitution (`>(…)`) instead of a pipe so that `$!` captures the
    // dispatch subshell's own PID — not the tee or the grep.  Without this the
    // heartbeat trackers `wait` on a pipeline tail that is long dead, and every
    // cell reports "finished" while the agent is still running (bug 1).
    if (ctx.summary) {
      L.push(') > >(tee "$RUN_DIR/' + slug + '.log" | { grep --line-buffered -E '
             + shq(GATE_LINE_PATTERN) + ' || true; }) 2>&1 &');
    } else {
      L.push(') > >(tee "$RUN_DIR/' + slug + '.log") 2>&1 &');
    }
    L.push('PIDS+=($!); NAMES+=(' + shq(slug) + '); TASK_IDS+=(' + shq(taskId) + ')');
    if (jobs && n % jobs === 0) {
      L.push('wait   # --jobs=' + jobs + ' throttle');
    }
    L.push('');
  }

  // This phase's cells are dispatched and PIDS is populated — now the heartbeat
  // can see them. One heartbeat PER PHASE: a single one forked before phase 1
  // would print "all cells finished" and exit during the gap between phases.
  if (Object.keys(est).length > 0) {
    L.push('heartbeat &');
    L.push('HEARTBEAT_PID=$!');
    L.push('');
  }

  L.push('# ── collect ' + phase.label + ' ' + '─'.repeat(Math.max(0, 58 - phase.label.length)));
  L.push('for (( _i=_PHASE_START; _i<${#PIDS[@]}; _i++ )); do');
  L.push('  if wait "${PIDS[$_i]}"; then');
  L.push('    echo "  ✅ ${NAMES[$_i]}"');
  L.push('  else');
  L.push('    echo "  ❌ ${NAMES[$_i]}  → $RUN_DIR/${NAMES[$_i]}.log"');
  L.push('    FAILED=$((FAILED+1))');
  L.push('  fi');
  L.push('done');
  if (Object.keys(est).length > 0) {
    L.push('kill $HEARTBEAT_PID 2>/dev/null || true');
    L.push('wait $HEARTBEAT_PID 2>/dev/null || true');
  }
  L.push('');
  }   // ── end phase loop ──
  L.push('echo');
  L.push('if [ "$FAILED" -gt 0 ]; then');
  L.push('  echo "⚠️  Wave ' + wave + ': $FAILED of ' + spawned.length + ' cell(s) failed. Do NOT check their Done boxes."');
  L.push('else');
  L.push('  echo "✅ Wave ' + wave + ': all ' + spawned.length + ' cell(s) completed."');
  L.push('fi');
  L.push('');
  L.push('echo');
  L.push('echo "🚀 Suggested Next Command(s) (by Est. Time & Model Cost):"');
  L.push('echo "   • Next Wave (Standard): .wb/bin/wbRun claude -p --permission-mode auto \\"/wbWork ' + planPath + ' --wave=next -y\\""');
  L.push('echo "   • Next Wave (with --as):  .wb/bin/wbRun claude -p --permission-mode auto \\"/wbWork ' + planPath + ' --wave=next --as=\\"expert,steps\\" -y\\""');
  L.push('echo "   • All Waves (Auto):      .wb/bin/wbRun claude -p --permission-mode auto \\"/wbWork ' + planPath + ' --wave=all -y\\""');
  L.push('echo');
  L.push('echo "Next (orchestrator, in this session):"');
  L.push('echo "  1. read each task report under \\$RUN_DIR and the plan\'s tasks/ tree"');
  L.push('echo "  2. check the Done box for every cell that succeeded"');
  if (inline.length) {
    L.push('echo "  3. run the Claude-in-session cells:"');
    for (const it of inline) L.push('echo "       ' + it.cell.command.replace(/"/g, '\\"') + '"');
    L.push('echo "  4. recompute the 🌊 Next Executable Sequence, once"');
  } else {
    L.push('echo "  3. recompute the 🌊 Next Executable Sequence, once"');
  }
  L.push('');
  L.push('exit "$FAILED"');
  L.push('');
  return { script: L.join('\n'), spawned: spawned, inline: inline, skipped: skipped };
}
function resolveWbRun(repoRoot) {
  const installed = path.join(repoRoot, '.wb', 'bin', 'wbRun');
  if (fs.existsSync(installed)) return installed;
  const template = path.join(repoRoot, 'templates', '_shared', 'wbRun');
  if (fs.existsSync(template)) return template;
  return '';
}

module.exports = {
  sessionArgsShell, shq, templatePathFor, inlineTemplatePrompt, sessionKeyFor,
  keyFileOf, emitDispatchGates, buildScript, resolveWbRun
};
