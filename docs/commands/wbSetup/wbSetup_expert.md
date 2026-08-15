# /wbSetup — Expert

## What `/wbSetup` is, architecturally

A **context-bootstrapping command** that reduces future-session ambiguity by externalizing package-specific constraints into two filesystem artifacts. The novelty is not the artifacts themselves — it's that both files are structurally distinct:

- `context.md` holds **descriptive state** (facts about the package).
- `dev.md` holds **prescriptive constraints** (actions the AI must refuse).

This split is the real work. Most "AI context" tooling collapses both into one big `README.md`-shaped blob. When you mix facts and rules, the AI treats rules as soft suggestions ("your project uses Vue 3" sounds like an observation, not a command). By dedicating `dev.md` to refusals, you turn the rules into something the AI's decoder must actually condition on.

## The pattern `/wbSetup` enforces

1. **Read manifest** (declarative truth: package.json, lerna.json).
2. **Read entry + representatives** (de facto truth: what the code actually does).
3. **Diff** — what does the manifest claim vs. what the code does? If they disagree, `dev.md` gets a rule about it.
4. **Check `reports/`** — if past audits flagged recurring mistakes, those become rules.
5. **Write both files** — idempotent writes; safe to re-run if the files already exist (except for `dev.md`, which has hand-authored rules you don't want overwritten).

Step 3 is where the command earns its keep. The dist/ vs dist-dev/ mismatch in wbc-ui2 is exactly this — `package.json main` claims `dist/` but vite's config writes to `dist-dev/`. A naive context-generator would just record both facts. `/wbSetup` turns it into a prohibition: *don't rename `main:` without updating vite.*

## The failure modes

1. **Naive over-generation.** The AI writes 40 rules for a simple package. Most are obvious or redundant. Counter: `dev.md` should be the *minimum* set of refusals, not the exhaustive one. If a rule is obvious to any Vue developer, it doesn't belong.

2. **Silent drift.** 6 months later, the package has moved to Vue 3.5 but `dev.md` still enforces Vue 3.4 patterns. There's no expiry mechanism. Counter: re-run `/wbSetup` after major dep bumps; treat `dev.md` staleness as a bug.

3. **Rule contradiction.** A `--focus` run adds rules that contradict base `dev.md`. Nothing catches this. Counter: manual review after every `--focus`.

4. **`--scope=global` erases local nuance.** If you run global setup too late in the project, it may flatten package-specific rules into generic monorepo rules. Counter: global first, then per-package. Not the reverse.

## What `/wbSetup` cannot do

- It cannot know what the package *should* be, only what it *is*. If you're starting from a wrong architecture, `/wbSetup` will faithfully document the wrong architecture.
- It cannot catch missing code. If a Pro-tier feature is supposed to exist and doesn't, `/wbSetup` won't flag it. That's `/wbAudit`'s job.
- It cannot enforce rules after writing them. `dev.md` is a declaration; enforcement is downstream, per-session.

What `wb-flow-docs`'s playbook gets wrong about `/wbSetup`: framing it as one-time initialization, when the Claude edition produces THREE files (context.md, dev.md, dev_reference.md) informed by the parent OBJECTIVE.md. Without the OBJECTIVE brief, the produced context.md comes out near-empty — observed failure mode.

## One-paragraph verdict

A pragmatic bootstrap command whose real value is the context/dev split — prescriptive refusals, not descriptive prose. The 3-phase flow (manifest → entry → reports) is solid and the "diff → rule" heuristic is the right inversion. Weakest point: no drift detection; `dev.md` rot is invisible until it causes harm. Correct for once-per-package bootstrap; should not be overused as a refresh mechanism.

---
