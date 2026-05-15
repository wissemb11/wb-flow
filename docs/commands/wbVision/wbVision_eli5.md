# wbVision — ELI5 Guide

## What is this?

Articulates and refines the long-term direction for your project by cross-referencing what you *say* you're building against what your code and commits *actually* show. It reads your README, commit history, open issues, and architecture to produce a coherent vision document — highlighting gaps between stated goals and real priorities.

The real value is the tension it surfaces. For example, if your README says "mobile-first" but your last 200 commits are all backend API work, the vision report flags that misalignment. It also spots implicit architecture principles you never wrote down — like always preferring composition over inheritance — and makes them explicit so new contributors don't have to guess.

**What It Produces:**
- A vision statement and 3–5 strategic goals with measurable outcomes for the next 6–12 months
- Architecture principles extracted from actual code patterns (not aspirational)
- Non-goals that explicitly prevent scope creep
- A competitive landscape section positioning your project against alternatives
- A phased quarterly roadmap with success metrics

**When to use it:** At project inception, before major pivots, or when the team disagrees on direction. Refresh quarterly to keep the document aligned with reality.

## Why do I need it?

Projects without a clear vision drift. Every feature request gets a yes, the architecture becomes inconsistent, and the team disagrees on priorities. `wbVision` forces clarity by showing you the gap between what you say and what you build. Onboarded a new developer? The vision document gets them oriented in 10 minutes instead of 2 weeks of context-gathering.

**Tips:**
- Use `--refine` to update an existing vision document incrementally as the project evolves
- Share the output team-wide — a vision only works if everyone has read and bought into it
- Run `--diff v1.0.0..HEAD` before quarterly planning to see where your trajectory has diverged from the stated vision

## Simple Example

**Generate vision:** `/wbVision` — reads project context (README, commit log, issue tracker, directory structure) and produces a vision document with strategic goals, architecture principles, and a phased roadmap.

**Refine with feedback:** `/wbVision --refine VISION.md --feedback "focus more on mobile"` — takes an existing vision document and revises it based on new direction, preserving what's still relevant and rewriting only the sections that need to change.

**Trajectory check:** `/wbVision --diff v1.0.0..HEAD` — compares actual development trajectory (derived from commits and PR merges) against the stated vision and highlights where the project has drifted. Useful before stakeholder updates.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Treating the vision as set-in-stone.** A vision that never changes becomes irrelevant — refresh it quarterly as the market and your understanding evolve.

**Writing aspirational goals that contradict actual code.** If the vision says "API-first" but your codebase has logic leaking into views, flag this during review rather than papering over it.

**Skipping the non-goals section.** Without explicit "we are NOT building X" boundaries, stakeholders assume everything is in scope. Be specific about what you're choosing not to do.

**Not socializing the output.** A vision document nobody has read is worse than no document — schedule a team review session after each refresh.

**Letting the competitive landscape go stale.** Outdated competitor analysis leads to wrong prioritization. Update this section whenever the market shifts or a major competitor release changes the landscape.

**Skipping the `--diff` flag before quarterly planning.** Running `/wbVision --diff` before a planning session surfaces drift you'd otherwise miss until it's baked into the roadmap.
