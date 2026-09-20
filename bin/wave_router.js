'use strict';
const os = require('os');
const path = require('path');
const { NAME_TO_SLUG, AGY_ONLY_SLUGS, CODEX_ONLY_RE, DEFAULT_MODELS, KNOWN_SLUGS, ROLES } = require('./wave_constants');
const { splitCommand, parseHeaderRoster, parseModelRecommendations, keyOf } = require('./wave_parser');

function resolveDisplayName(name) {
  const key = name.toLowerCase().replace(/\s+/g, ' ').trim();
  if (/^claude\s*\(auto\)$|^claude\s*\(in-session\)$/.test(key) || key === '(auto)' || key === '(in-session)') return '';
  if (/^codex\s*\(auto\)$/.test(key) || key === 'codex (auto)') return 'Codex (auto)';
  if (/^(antigravity|agy)\s*\(auto\)$/.test(key) || key === 'antigravity (auto)' || key === 'agy (auto)') return 'Antigravity (auto)';
  if (/^(grok|xai|supergrok)\s*\(auto\)$/.test(key)) return 'Grok (auto)';
  // A roster written by `wb-flow model` holds dispatchable SLUGS, not the
  // human display names the hand-written rosters used. Pass those through
  // untouched — otherwise every generated roster reads as "unrecognised model"
  // and silently falls back to DEFAULT_MODELS.
  const raw = String(name).trim();
  if (raw.indexOf('/') !== -1) {
    // C62 — the old passthrough returned ANY slash-bearing string, so a
    // fabricated vendor/model (`bogus-vendor/x`, `opencode/not-a-real-x`) walked
    // straight past the `--set` guard and into the roster. Resolve a namespaced
    // slug against the catalog and the curated in-code sets instead of trusting
    // the slash to mean "known".
    return knownSlugs().has(raw) ? raw : undefined;
  }
  if (/^(gemini|claude|gpt-oss)[\w.-]*-(high|medium|low|thinking)$/.test(raw)) return raw;
  return NAME_TO_SLUG.get(key) || undefined;
}

let _knownSlugs;
function knownSlugs() {
  if (_knownSlugs !== undefined) return _knownSlugs;
  const s = new Set();
  // The catalog (models.json) is authoritative for "which models exist". Seed it
  // first, so a namespaced slug resolves only when some source actually knows it.
  const cat = catalogRoutes();
  if (cat) { for (const slug of cat.keys()) s.add(slug); }
  // Curated in-code sets — always present, so a fresh install with no catalog
  // still validates against the models the system itself ships as defaults or a
  // display name this side recognises.
  for (const v of NAME_TO_SLUG.values()) s.add(v);
  for (const k of Object.keys(DEFAULT_MODELS)) s.add(DEFAULT_MODELS[k]);
  for (const bare of AGY_ONLY_SLUGS) s.add(bare);
  for (const k of KNOWN_SLUGS) s.add(k);
  _knownSlugs = s;
  return s;
}
function isClaudeExecutor(doneCell) {
  return /claude|opus|sonnet|haiku/i.test(String(doneCell || ''));
}

/**
 * Choose the first validator from `chain` that is billed to a different pool
 * than the executor.  Model names are not an independence boundary: two Claude
 * models remain one provider/pool.  Keep the shared classifier in model.js as
 * the sole source of that fact rather than growing another prefix map here.
 *
 * When every candidate is in the executor's pool, return the chain head and
 * mark it forced.  Callers render that fact in their routing reason so a
 * same-provider validation is an explicit, reviewable exception.
 */
function crossProviderPick(chain, executorModel) {
  const candidates = (Array.isArray(chain) ? chain : [chain])
    .map(function (model) { return String(model || '').trim(); })
    .filter(Boolean);
  const poolOf = require('./model.js').poolOf;
  const executorPool = poolOf(executorModel);
  const head = candidates[0] || '';
  const picked = candidates.find(function (model) {
    return executorPool && executorPool !== 'unknown' && poolOf(model) !== executorPool;
  }) || head;
  const validatorPool = picked ? poolOf(picked) : 'unknown';
  return {
    model: picked,
    forced: !!picked && (!executorPool || executorPool === 'unknown' || validatorPool === executorPool),
    executorPool: executorPool,
    validatorPool: validatorPool,
  };
}

function executorPoolsFromDoneCell(doneCell) {
  const text = String(doneCell || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text || /^⬜|^—|^$/.test(text)) return [];

  const poolOf = require('./model.js').poolOf;
  const candidates = [];
  const slugs = text.match(/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/g) || [];
  candidates.push.apply(candidates, slugs);

  // Done cells may carry display names from older plans rather than catalog
  // slugs. Use broad sentinels only to identify the provider pool for a warning.
  if (/claude|opus|sonnet|haiku/i.test(text)) candidates.push('Claude (auto)');
  if (/codex|chatgpt|openai|gpt-5/i.test(text)) candidates.push('Codex (auto)');
  if (/agy|antigravity|gemini/i.test(text)) candidates.push('Antigravity (auto)');
  if (/grok|xai|supergrok/i.test(text)) candidates.push('Grok (auto)');

  const pools = [];
  candidates.forEach(function (candidate) {
    const pool = poolOf(candidate);
    if (pool && pool !== 'unknown' && pools.indexOf(pool) === -1) pools.push(pool);
  });
  return pools;
}

function sameProviderWarning(delegateChain, ids, doneColumn) {
  const chain = splitModelChain(Array.isArray(delegateChain) ? delegateChain.join('||') : delegateChain);
  const head = chain[0] || String(Array.isArray(delegateChain) ? delegateChain[0] || '' : delegateChain || '').trim();
  if (!head || !doneColumn || !ids || !ids.length) return '';

  const poolOf = require('./model.js').poolOf;
  const validatorPool = poolOf(head);
  if (!validatorPool || validatorPool === 'unknown') return '';

  const matched = [];
  ids.forEach(function (id) {
    const pools = executorPoolsFromDoneCell(doneColumn[id]);
    if (pools.indexOf(validatorPool) !== -1 && matched.indexOf(id) === -1) matched.push(id);
  });
  if (!matched.length) return '';

  return ' — same-provider validation — operator --model head pool ' + validatorPool +
    ' matches executor pool for id(s) ' + matched.join(', ');
}

/**
 * Decide who runs a cell.
 * Returns { lane: 'claude'|'opencode', model, chain, cli, reason }
 *
 * `cli` is the resolved CLI descriptor for the primary model so that --list
 * and the generator always agree on the dispatch CLI (bug 4 — routing
 * divergence). Null when lane is 'claude'.
 */
/** Same `||` grammar the roster uses; kept local so wave_router imports nothing from wave.js. */
function splitModelChain(raw) {
  return String(raw == null ? '' : raw)
    .split(/\s*(?:\|\||,)\s*/)
    .map(function (s) { return s.trim(); })
    .filter(function (s, i, a) { return s && a.indexOf(s) === i; });
}

function route(cell, dispatchIndex, models, doneColumn, delegateModel, requiresColumn, delegateChain, opts) {
  let result;
  const cellCommand = splitCommand(cell.command);
  const routedIds = cell.pairsIds && cell.pairsIds.length
    ? cell.pairsIds
    : (cellCommand ? cellCommand.ids : []);
  // A cell may write the ROLE VARIABLE rather than a model — `-M=$WORKER`,
  // which the shell expands at paste time from the assignments emitted beside
  // `P=`. That is a reference to the role's own chain, NOT a per-cell override,
  // so it must not take the delegate branch: doing so labelled every cell
  // "per-cell override — not the WORKER chain", which is the exact opposite of
  // what it says.
  const cellRefsRole = !!(cellCommand && /^\$[A-Z_]+$/.test(String(cellCommand.delegateModel || '')));
  const hasCellDelegateModel = !cellRefsRole && !!(cellCommand && cellCommand.delegateModel);
  const resolvedCellDelegateModel = hasCellDelegateModel
    ? resolveDisplayName(cellCommand.delegateModel)
    : undefined;
  const cellDelegateModel = hasCellDelegateModel
    ? (resolvedCellDelegateModel === undefined ? cellCommand.delegateModel : resolvedCellDelegateModel)
    : '';
  const effectiveDelegateModel = delegateModel || cellDelegateModel;
  // --model / -M is the highest-priority override: the operator is delegating
  // THIS invocation to a named model, so it outranks role routing and even the
  // executor!=validator rule. Stated explicitly because silently overriding that
  // rule is exactly the kind of thing that should never be implicit.
  if (delegateModel) {
    // Carry the operator's whole `||` chain, not just its head. The generator
    // already emits a left-to-right fallback loop from `chain` (advancing only
    // on a G1/INFRA failure) — but these delegate branches used to set `model`
    // alone, so `chain` was undefined and every -M dispatch ran with no
    // fallback at all, while the roster-routed cells beside it had one.
    const opChain = (delegateChain && delegateChain.length ? delegateChain : [effectiveDelegateModel])
      .filter(Boolean);
    result = { lane: 'opencode', model: effectiveDelegateModel, chain: opChain,
               reason: '--model=' + opChain.join(' || ') +
                       (opChain.length > 1 ? ' — operator chain, ' + opChain.length + ' deep' : '') +
                       ' — explicitly delegated by the operator' +
                       (cell.role === 'validator' ? sameProviderWarning(opChain, routedIds, doneColumn) : '') };
  } else if (hasCellDelegateModel && resolvedCellDelegateModel === '') {
    result = { lane: 'claude', model: null,
               reason: 'cell --model=' + cellCommand.delegateModel + ' — explicitly runs in-session' };
  } else if (effectiveDelegateModel) {
    // A cell may carry its own chain: `-M="a||b"` written into the matrix.
    const cellChain = splitModelChain(effectiveDelegateModel);
    result = { lane: 'opencode', model: cellChain[0] || effectiveDelegateModel, chain: cellChain,
               reason: 'cell --model=' + cellChain.join(' || ') + ' — explicitly delegated by the operator' +
                       (cell.role === 'validator' ? sameProviderWarning(cellChain, routedIds, doneColumn) : '') };
  } else if (cell.role === 'planner') {
    result = { lane: 'claude', model: null, reason: 'Planner — deep reasoning stays with Claude in-session' };
  } else if (cell.role === 'worker') {
    // Never delegate to yourself. If the roster names the ORCHESTRATOR for a role
    // ("Claude (auto)" / "(in-session)"), running that cell means spawning a cold
    // subprocess of the model already holding the plan — paying a full re-read to
    // reach a worse-informed copy of the agent that dispatched it. Run it here.
    //
    // Before this check the sentinel resolved to an empty slug, was skipped, and
    // the role fell through to DEFAULT_MODELS — so a roster naming Claude as
    // 🔨 Worker silently dispatched to deepseek-v4-pro instead. Wrong lane AND
    // wrong model, with no warning.
    const inSession = models.inSession || {};
    if (inSession.worker) {
      result = { lane: 'claude', model: null, reason: 'Worker roster names the orchestrator — runs in-session, not delegated' };
    } else {
      result = { lane: 'opencode', model: models.worker, chain: chainFor(models, 'worker'), reason: 'Worker lane' };
    }
  } else if (cell.role === 'mechanical') {
    const inSession = models.inSession || {};
    if (inSession.mechanical) {
      result = { lane: 'claude', model: null, reason: 'Mechanical roster names the orchestrator — runs in-session, not delegated' };
    } else {
      result = { lane: 'opencode', model: models.mechanical, chain: chainFor(models, 'mechanical'), reason: 'Mechanical lane — no judgment to buy' };
    }
  } else {
    // Validator: never let the executor validate itself — EXCEPT on 🧠 Planner
    // rows (see below).
    const parsed = cellCommand;
    const ids = (cell.pairsIds.length ? cell.pairsIds : (parsed ? parsed.ids : []));

    // Which role executed the row being validated? The matrix knows while the
    // dispatch is still in it; the plan's `Requires` column knows afterwards.
    // For merged cells (--id=X,Y), collect roles from ALL ids.
    let allPlanner = true;
    let anyPlanner = false;
    let firstRole = null;
    let rolesFound = false;

    if (parsed && cell.pairsWave) {
      for (const id of ids) {
        const hit = dispatchIndex[keyOf(cell.pairsWave, parsed.target, id)];
        if (hit) {
          rolesFound = true;
          if (!firstRole) firstRole = hit;
          if (hit === 'planner') anyPlanner = true;
          if (hit !== 'planner') allPlanner = false;
        }
      }
    }
    
    if (!rolesFound && requiresColumn) {
      for (const id of ids) {
        if (requiresColumn[id]) {
          rolesFound = true;
          if (!firstRole) firstRole = requiresColumn[id];
          if (requiresColumn[id] === 'planner') anyPlanner = true;
          if (requiresColumn[id] !== 'planner') allPlanner = false;
        }
      }
    }

    if (!rolesFound) allPlanner = false;
    let executorRole = firstRole;

    // 🧠 Planner rows are EXEMPT from executor≠validator: a Planner row may be
    // validated by the model that produced it, so its pairing stays in-session.
    // The rule exists to stop a model grading its own *edits* — but a Planner row
    // produces a decision, and its validation is a re-read of reasoning that is
    // already in the orchestrator's context. Handing that to a second model buys
    // a spawn and a cold re-read, not independence. Worker and Mechanical rows —
    // the ones that touch files — keep the rule.
    if (allPlanner) {
      result = {
        lane: 'claude',
        model: null,
        reason: 'pairs ' + (ids.length > 1 ? 'only 🧠 Planner rows' : 'a 🧠 Planner row') + ' — Planner rows may be self-validated, so it stays in-session',
      };
    } else if (doneColumn) {
      // 1. Authoritative: the ☐ Done column says who actually executed it.
      //    Check ALL ids in the merged cell.
      let anyFound = false;
      let executedByClaude = [];
      let executedByOpencode = [];
      
      for (const id of ids) {
        const doneCell = doneColumn[id];
        if (!doneCell || /^⬜|^—|^$/.test(doneCell.trim())) continue;
        anyFound = true;
        if (isClaudeExecutor(doneCell)) {
          executedByClaude.push(id);
        } else {
          executedByOpencode.push(id);
        }
      }
      
      if (anyFound) {
        if (executedByClaude.length > 0) {
          // If ANY id was executed by Claude, Claude cannot validate the batch.
          const fallbackChain = chainFor(models, 'selfValidator');
          const pick = crossProviderPick(fallbackChain, 'Claude (auto)');
          result = {
            lane: 'opencode',
            model: pick.model,
            // Keep the selected model first: a failed cross-provider choice
            // must not fall back to a same-provider candidate before another
            // independent candidate has been tried.
            chain: [pick.model].concat(fallbackChain.filter(function (model) { return model !== pick.model; })),
            reason: 'Done column says Claude executed id(s) ' + executedByClaude.join(', ') +
              (pick.forced
                ? ' — same-provider validation — chain offers no alternative'
                : ' — validator pool ' + pick.validatorPool + ' differs from executor pool ' + pick.executorPool),
          };
        } else {
          // NONE were executed by Claude. Claude can validate.
          result = {
            lane: 'claude',
            model: null,
            reason: 'Done column says no Claude model executed any id in ' + ids.join(', ') + ' — Claude validates',
          };
        }
      } else {
        // 2. Fallback, before the task has been executed: the role resolved above.
        result = {
          lane: 'claude',
          model: null,
          reason: executorRole
            ? 'pairs ' + (anyPlanner ? 'mixed rows including non-planner' : 'a ' + executorRole + ' row') + ' (opencode will execute) — Claude validates'
            : 'validator task — Claude validates (no executor recorded yet)',
        };
      }
    } else {
      // 2. Fallback, before the task has been executed: the role resolved above.
      result = {
        lane: 'claude',
        model: null,
        reason: executorRole
          ? 'pairs a ' + executorRole + ' row (opencode will execute) — Claude validates'
          : 'validator task — Claude validates (no executor recorded yet)',
      };
    }
  }

  if (opts && opts.sandbox && result.lane === 'opencode') {
    result.reason += ' — sandboxed dispatch (permission bypass flags omitted)';
  }
  result.cli = result.lane === 'opencode' ? cliFor(result.model, opts) : null;
  return result;
}

/**
 * The dispatch chain for a role: every model, in order, minus the in-session
 * sentinel (which is a lane, not a spawnable model). Falls back to the single
 * resolved model when no chain was parsed.
 */
function chainFor(models, key) {
  const c = (models.chains && models.chains[key]) || [];
  const usable = c.filter(function (m) { return m && m !== ''; });
  return usable.length ? usable : [models[key]].filter(Boolean);
}
/**
 * Which CLI runs this model, and how.
 *
 * `opencode` and `agy` are both first-class executors — they take different
 * flags and different model-name shapes, and a model belongs to exactly one.
 * An agy name is bare (`gemini-3.1-pro-high`); an opencode slug is
 * provider-prefixed (`opencode/deepseek-v4-pro`).
 *
 * `--dangerously-skip-permissions` is NOT optional on agy: without it, headless
 * mode auto-denies any tool the prompt needs and returns *empty output with a
 * zero exit code* — a silent success that has produced nothing. Verified in a
 * terminal 2026-08-02.
 */
// ─── catalog-authoritative routing ──────────────────────────────────────────
// Delegates to bin/cli_registry.js — the SAME table the picker and probe use,
// so a model can never be probed through one CLI and dispatched through
// another. The regex branches in cliForHeuristic() below remain the fallback
// for slugs the catalog does not mention.
const REG = require('./cli_registry.js');
const PROVIDER_CLI = REG.PROVIDER_CLI;

let _catIdx; // undefined = not loaded yet, null = no catalog found
function catalogRoutes() {
  if (_catIdx === undefined) _catIdx = REG.loadCatalogIndex();
  return _catIdx;
}

function cliFor(model, opts) {
  const route = REG.resolveCli(model, catalogRoutes());
  if ((route.source === 'catalog' || route.source === 'sentinel') && route.cli !== 'opencode' && route.cli !== 'in-session') {
    const spec = REG.CLI_SPEC[route.cli];
    if (spec) {
      const out = { bin: spec.bin, argv: spec.argv(route.modelArg, null, opts), slashCommands: !!spec.slashCommands };
      if (spec.inlineTemplate) out.inlineTemplate = true;
      if (spec.stdinNull) out.stdinNull = true;
      return out;
    }
  }
  return cliForHeuristic(model, opts);
}

function cliForHeuristic(model, opts) {
  const name = String(model);
  // ⚠️ `-p` MUST BE LAST. agy parses with Go's `flag` package, where `-p` is an
  // alias for `--print` and takes the **next argv entry as its value** — the
  // prompt. Until 2026-08-10 this read `['-p', '--dangerously-skip-permissions']`,
  // so `-p` swallowed the permission flag and agy was asked to respond to the
  // literal string "--dangerously-skip-permissions". The real prompt, appended
  // after, was parsed as a trailing positional and dropped. Measured twice that
  // day: agy answered *"It looks like you provided the flag
  // --dangerously-skip-permissions … could you provide more context?"* and did
  // nothing, while Gate 1 scored it PASS. Go's flag parsing also stops at the
  // first non-flag argument, so every real flag has to precede `-p` as well.
  if (/^(agy|antigravity)\s*\(auto\)$/i.test(name) || name === 'Antigravity (auto)') {
    return { bin: 'agy', argv: (opts && opts.sandbox) ? ['-p'] : ['--dangerously-skip-permissions', '-p'], slashCommands: false };
  }
  if (/^codex\s*\(auto\)$/i.test(name) || name === 'Codex (auto)') {
    return {
      bin: 'codex',
      argv: (opts && opts.sandbox)
        ? ['exec', '--skip-git-repo-check']
        : ['exec', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check'],
      slashCommands: false,
      inlineTemplate: true,
      stdinNull: true,
    };
  }
  // Prefixed ⇒ opencode, always. `opencode/claude-sonnet-4-6` and the bare agy
  // `claude-sonnet-4-6` are different providers serving a same-named model.
  if (name.indexOf('/') === -1 && AGY_ONLY_SLUGS.has(name)) {
    // `-p` last — see the `(auto)` branch above for why. This affects all 11
    // AGY_ONLY_SLUGS identically; the `(auto)` name was simply the one that
    // happened to be dispatched when it was caught.
    return { bin: 'agy', argv: (opts && opts.sandbox) ? ['--model', name, '-p'] : ['--model', name, '--dangerously-skip-permissions', '-p'], slashCommands: false };
  }
  // codex. Bare names again, so AGY_ONLY_SLUGS is consulted first — `gpt-oss-*`
  // is agy's, not OpenAI's, despite the `gpt` prefix.
  if (name.indexOf('/') === -1 && CODEX_ONLY_RE.test(name)) {
    return {
      bin: 'codex',
      argv: (opts && opts.sandbox)
        ? ['exec', '-m', name, '--skip-git-repo-check']
        : ['exec', '-m', name, '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check'],
      // Verified 2026-08-03: `codex exec` expands NOTHING. Given a prompt file
      // at ~/.codex/prompts/x.md and the prompt "/x", it treated the text as
      // literal and searched the filesystem for a matching entrypoint. So the
      // prompt has to carry the template path — see inlineTemplatePrompt().
      slashCommands: false,
      inlineTemplate: true,
      // codex reads stdin even with a prompt argument. Inside a wave script,
      // stdin IS the script, so an unredirected dispatch consumes the remaining
      // lines and hangs. Non-negotiable.
      stdinNull: true,
    };
  }
  return { bin: 'opencode', argv: (opts && opts.sandbox) ? ['run', '-m', model] : ['run', '-m', model, '--dangerously-skip-permissions'], slashCommands: true };
}
function resolveModelsFromRoster(text, repoRoot, explicitModels, currentModels, packageRoot, opts) {
  const headerRoster = parseHeaderRoster(text);
  const pkgRoot = packageRoot || repoRoot;
  opts = opts || {};

  // Share the resolver with model.js so `wb-flow model --show` and
  // `wb-flow wave --list` can never disagree about which roster is in effect.
  // Selection is FRESHEST-wins, not nearest-wins: a stale scope-local copy must
  // not outrank a newer project or user roster.
  const resolveRosterFile = require('./model.js').resolveRosterFile;
  const rosterPath = resolveRosterFile(null, {
    pkgRoot: pkgRoot,
    repoRoot: repoRoot,
    implicitRoots: opts.implicitRoots,
  });
  
  let fileRoster = null;
  if (rosterPath) {
    fileRoster = parseModelRecommendations(rosterPath);
  }
  const roster = headerRoster || fileRoster;
  const sources = {};
  const resolved = Object.assign({}, currentModels);

  if (roster) {
    const sourceLabel = headerRoster ? 'plan header' : 'model_recommendations.md';
    const roleDisplayToModelKey = { planner: 'planner', validator: 'selfValidator', worker: 'worker', mechanical: 'mechanical' };
    for (const roleKey of Object.keys(roleDisplayToModelKey)) {
      const modelKey = roleDisplayToModelKey[roleKey];
      if (explicitModels[modelKey]) {
        sources[modelKey] = 'CLI flag';
        continue;
      }
      const entry = roster[roleKey];
      if (!entry) continue;
      const chainNames = Array.isArray(entry) ? entry : [entry];
      const displayName = chainNames[0];
      // Resolve the WHOLE chain; the tail is what a G1 failure falls back to.
      resolved.chains = resolved.chains || {};
      resolved.chains[modelKey] = chainNames
        .map(function (n) { const r = resolveDisplayName(n); return r === undefined ? null : r; })
        .filter(function (r) { return r !== null; });
      const slug = resolveDisplayName(displayName);
      if (slug !== undefined) {
        resolved[modelKey] = slug;
        if (slug === '') {
          // The in-session sentinel: the roster names the orchestrator itself.
          // Record it as a routing fact instead of dropping it — dropping it is
          // what silently demoted the role to DEFAULT_MODELS.
          resolved.inSession = resolved.inSession || {};
          resolved.inSession[modelKey] = true;
          sources[modelKey] = sourceLabel;
        } else if (slug) {
          sources[modelKey] = sourceLabel;
          // agy models are dispatched through their own lane (see cliFor); no
          // warning needed. Kept as a note: agy REQUIRES
          // --dangerously-skip-permissions or headless mode auto-denies every
          // tool and returns empty output that reads as a silent success.
        }
      } else {
        const known = Array.from(NAME_TO_SLUG.keys())
          .map(function (n) { return '\'' + n + '\''; }).join(', ');
        const roleLabel = (ROLES.find(function (r) { return r.key === roleKey; }) || {}).label || roleKey;
        console.error('⚠️  ' + sourceLabel + ' names an unrecognised model \''
          + displayName + '\' for ' + roleLabel
          + ' — falling back to built-in DEFAULT_MODELS.');
        console.error('   Known models: ' + known);
      }
    }
  }

  ['worker', 'mechanical', 'selfValidator'].forEach(function (key) {
    if (!sources[key]) sources[key] = 'built-in DEFAULT_MODELS';
  });

  // C55 — reachability is measured by `model --probe` and persisted into the
  // roster file, but the wave path never read it, so a roster leading with a
  // dead provider dispatched three NO-OP cells before any human saw a warning.
  // Consume the annotation that is already there: warn when a SELECTED model
  // (head or any `||` chain link) is marked unreachable, or when the roster was
  // never probed. NON-SPENDING — this reads an annotation, it does not dispatch
  // a probe (an auto-probe would spend credits; that is a maintainer decision).
  //
  // The annotation lives only in the FILE roster: a plan-header roster carries
  // model chains but never the probe's reachability marks. So these are read
  // from `fileRoster` even when `headerRoster` wins the chain resolution above.
  if (fileRoster) {
    const unreachable = fileRoster.__unreachable || [];
    const selected = new Set();
    ['planner', 'worker', 'mechanical', 'selfValidator'].forEach(function (k) {
      ((resolved.chains && resolved.chains[k]) || []).forEach(function (m) {
        if (m) selected.add(String(m).trim());
      });
      if (resolved[k]) selected.add(String(resolved[k]).trim());
    });
    const flagged = unreachable.filter(function (u) { return selected.has(u); });
    if (flagged.length) {
      console.error('⚠️  wb-flow wave — the roster marks selected model(s) unreachable: ' +
        flagged.join(', ') + '. Run `wb-flow model --probe` to verify reachability.');
    }
    const unvalidated = fileRoster.__unvalidated || [];
    const forced = unvalidated.filter(function (u) { return selected.has(u); });
    if (forced.length) {
      console.error('⚠️  wb-flow wave — the roster marks selected model(s) unvalidated (--force): ' +
        forced.join(', ') + '. Not in the catalog; wave may fail at runtime.');
    } else if (!fileRoster.__probed) {
      console.error('⚠️  wb-flow wave — this roster has never been probed (or was probed before its last write), so reachability is unverified. Run `wb-flow model --probe`.');
    }
  }

  // Name the file the chains actually came from. `wb-flow model --show` and
  // `wb-flow wave --list` both use the same freshest-wins resolver, and
  // `--list` prints the path so this is visible.
  Object.defineProperty(resolved, '__rosterPath', { value: rosterPath, enumerable: false });
  return { models: resolved, sources: sources, rosterPath: rosterPath };
}

module.exports = {
  resolveDisplayName, isClaudeExecutor, crossProviderPick, sameProviderWarning, route, chainFor, cliFor, resolveModelsFromRoster, splitModelChain,
  cliForHeuristic, catalogRoutes, PROVIDER_CLI
};
