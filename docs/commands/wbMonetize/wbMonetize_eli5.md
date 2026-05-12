# wbMonetize — ELI5 Guide

## What is this?

Analyzes your project's feature set, user base, dependencies, and market position to recommend concrete monetization strategies — pricing tiers, paywall placement, licensing models, and revenue projections. It's the business-model equivalent of a code review: it looks at what you've built and tells you what's worth charging for.

The analysis profiles your project across four dimensions: what it does and who uses it (from README, usage data, and issue tracker sentiment), which features drive retention vs. churn (by analyzing which APIs/modules get the most attention), how your competitors price similar offerings (by comparing against known market data), and where your licensing posture puts you (open-core vs. source-available vs. proprietary). The output is a structured monetization plan with projected MRR under different scenarios.

**What It Analyzes:**
- Usage patterns — which features power users rely on vs. casual users (from API call frequency, module imports, or telemetry)
- Feature value segmentation — which capabilities are table-stakes (keep free) vs. competitive differentiators (gate behind a paid tier)
- Competitor pricing benchmarks — how similar tools price their offerings and where you'd slot in
- License risk — whether your current license and dependency tree support commercial use or need restructuring (e.g., AGPL dependencies block most enterprise sales)
- Conversion friction points — what's likely to stop free users from upgrading (feature discovery, pricing complexity, trial length)

**When to use it:** When you're considering making your project commercially sustainable. Best used early — before you've made irreversible architecture decisions (like putting everything behind a paywall) or picked a license that blocks enterprise adoption.

## Why do I need it?

Building something users love is hard. Figuring out how to make money from it is a separate, often-neglected skill. Most developers either give everything away for free (burnout) or gate too aggressively (no adoption). `wbMonetize` applies structured business-model analysis so you can focus on building while it flags common mistakes: giving away your most valuable features, picking a license that scares off enterprise buyers, or pricing so far from market norms that nobody converts.

**Tips:**
- Be realistic about your user base size — revenue projections are directional, not promises
- Use `--license-only` if you're only interested in licensing advice, not pricing
- Run competitor pricing research manually before using the tool for more accurate benchmark comparisons

## Simple Example

**Full analysis:** `/wbMonetize` — scans your project structure, README, dependency tree, and any available usage data to produce a monetization strategy report with tier recommendations, price points, and projected MRR.

**License-only advice:** `/wbMonetize --license-only` — skips pricing analysis entirely and just recommends licensing models (MIT, Apache-2.0, AGPL-3.0, or dual-license) based on your project's goals, community expectations, and dependency compatibility.

**Adjust existing pricing:** `/wbMonetize --existing-plan ./pricing.json --adjust +15%` — takes your current pricing plan, applies market-adjusted increases, and produces updated tiers with projected revenue impact. Useful when you've validated initial pricing and need to optimize.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)

## Common Pitfalls

**Over-relying on projections.** Revenue estimates are based on assumptions about conversion rates and market size. Validate with real users before investing heavily in a tier structure.

**Gating the wrong features.** The feature that's hardest to build isn't always the one users will pay for. Focus on gating features that deliver clear, incremental value (premium support, advanced analytics) rather than core functionality.

**Ignoring license compatibility.** If your project uses AGPL- or GPL-licensed dependencies, you may not be able to offer a proprietary commercial license without rewrites. Check this before committing to a licensing model.

**Setting prices without user research.** What you think is "obviously worth $50/mo" may feel expensive to your target audience. Run the recommendations past a few actual users before publishing pricing pages.

**Making the free tier too good.** If free users get everything they need, nobody will convert. The free tier should be genuinely useful but have clear, intentional limitations that point toward the paid tier — e.g., usage caps, not feature hobbling.

**Forgetting to re-run after a major feature launch.** New features change your value proposition. Re-run `wbMonetize` after shipping something significant to see if it shifts your tier structure.
