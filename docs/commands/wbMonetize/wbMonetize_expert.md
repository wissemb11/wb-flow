# /wbMonetize — Expert

## What `/wbMonetize` is, architecturally

A **bootstrap-once command** that injects the project's monetization plumbing into a target package, then becomes a passive verifier on subsequent runs. The novelty is the **detect-don't-flag** pattern: there is no `--bootstrap` or `--maintenance` flag. The command reads the target's state and infers which mode it's in. The user can't lie to it.

The plumbing itself isn't novel — `__WBC_DEV__` reads, `isWb<Pkg>Pro` getters, cookie persistence (`_wb_<pkg>_auth`), the `created()` license hook from `monorepo_rules.md §4`, and free-fallback slots are all standard `wbc-ui2` conventions. What `/wbMonetize` adds is **convention enforcement**: it injects the same plumbing the same way every time, so the user can't accidentally invent a 24th way to gate a feature.

## The pattern `/wbMonetize` enforces

The detection is hybrid — a marker (authoritative) and a heuristic (fallback):

| Signal | Authority | When trusted |
|---|---|---|
| `package.json::wbMonetize` field | **Authoritative** | Always — this is the official "I've been bootstrapped" stamp |
| Heuristic source scan (looks for `__WBC_DEV__`, `isWb<Pkg>Pro`, `_wb_<pkg>_auth`, `created()` hook) | **Fallback** | Only when marker is absent; tells us if someone gated manually |

The decision matrix:

| Marker present? | Heuristic finds gating? | Verdict |
|---|---|---|
| ❌ | ❌ | **BOOTSTRAP** — full plumbing injection |
| ✅ | ✅ | **MAINTENANCE** — verify, repair drift |
| ❌ | ✅ | **ABORT** — manual gating exists outside the convention; ask user |
| ✅ | ❌ | **ABORT** — marker says yes, code says no; data is corrupt |

The third row (manual gating, no marker) is the one that catches you. Users who hand-rolled a Pro tier before adopting `/wbMonetize` will hit this case. The right behavior is to abort, not to silently overwrite — manual gating represents a design decision the AI shouldn't paper over.

## Why bootstrap-once is the right shape

Most "feature-flag scaffold" tools default to *re-runnable*. The user runs it after each new feature; the tool re-injects gating where missing. This is wrong for two reasons:

1. **Idempotency vs. authority.** If the tool can re-bootstrap, the marker becomes informational rather than authoritative. Users learn to ignore it ("just run it again, it'll figure out the right state"). The discipline collapses.

2. **Feature placement is a business decision.** Auto-deciding "this new feature should be Pro" is exactly the kind of judgment a tool should refuse. By forcing bootstrap-once, the user is reminded that *each new feature needs an explicit Free/Pro decision*, made by them, not the tool.

The maintenance mode is **plumbing only** — cookie names, hook structure, getter wiring, `rulesVersion` drift. It will not move features between tiers. The advisory section ("feature X could be Pro") is suggestion, never patch.

## The failure modes

1. **Heuristic false positives.** Some innocuous code patterns trigger the heuristic without being real gating (e.g., a variable named `isWbCorePro` for an unrelated reason). Counter: the heuristic checks for *3 signals together*, not any one. Single-signal matches don't trigger ABORT.

2. **Marker drift.** The marker stores `rulesVersion`. If `monorepo_rules.md §4` changes, the marker shows old version, maintenance mode triggers a repair. Good — except if the user reverted `monorepo_rules.md` deliberately. Counter: the maintenance report names the diff and asks for confirmation before repairing.

3. **Test breakage from bootstrap.** The newly injected gating breaks existing tests written against the open API. The command **flags but doesn't fix** these. Expected; the user runs `/wbTest` after to triage. Counter: explicit warning in the bootstrap report; no implicit test-rewriting.

4. **Cross-package consistency.** If two packages bootstrap from different `monorepo_rules.md` versions, their plumbing diverges silently. Counter: the marker's `rulesVersion` field surfaces this on standup; user can re-run maintenance on the older one.

## What `/wbMonetize` cannot do

- It cannot decide which features are Pro vs. Free. That's monetization strategy; the tool is plumbing.
- It cannot per-component gate after bootstrap (`/wbLicense` does that — different command, different shape).
- It cannot produce dev/free/pro **build artifacts**. That's still build-config territory; no command yet.
- It cannot survey monetization coverage across the monorepo. You run it per-package and aggregate manually.

What `wb-flow-docs`'s playbook gets wrong about `/wbMonetize`: framing it as pricing strategy, when the actual scope is tier plumbing: Free/Pro/Dev feature gating, watermark injection in free tier, and the WBC_PRO=true/false build matrix. Infrastructure command, not a business decision tool.

## One-paragraph verdict

A pragmatic command whose real architectural insight is the detect-don't-flag pattern — making the user unable to lie about state. The bootstrap-once shape is correct: it forces the user to own feature-tier decisions instead of delegating them to a tool that would average to the worst possible split. Weakest point: the heuristic is fragile by necessity (single-signal false positives are real), and cross-package consistency drift is invisible until you check. Correct for once-per-package monetization scaffold; wrong tool for ongoing per-feature gating (use `/wbLicense`).

---
