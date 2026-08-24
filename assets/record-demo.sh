#!/bin/bash
# Auto-played demo for wb-flow. Each line echoes a "command" then renders its
# simulated output, with sleeps tuned so the asciinema viewer can read each step.
#
# Nothing here executes real work: every line is an echo. That is deliberate —
# the hero demo illustrates the workflow shape, it does not assert measurements.
#
# RECORD WITH:
#   asciinema rec -c ./record-demo.sh --cols 117 --rows 28 --overwrite hero.cast
#   agg hero.cast hero.gif
# 117x28 renders 1149x650 via agg = 16:9, and is wide enough that no line wraps.
#
# STORYBOARD (02_STORYBOARD.md) — target 60s:
# 0:00–0:05 | Prompt & Idea      : /wbIdea "Add Stripe subscriptions to this SaaS"
# 0:05–0:15 | Plan Generation    : /wbPlan  → 6-task plan + per-task model routing
# 0:15–0:35 | Wave 1 Execution   : /wbWork --wave=1  → 3 agents in parallel
# 0:35–0:45 | Wave 2 Execution   : /wbWork --wave=2
# 0:45–0:50 | Validation         : /wbValid --wave=all
# 0:50–0:59 | Artifact Grid      : zoom out to the full traceability grid

C_HEAD='\033[1;36m'   # cyan bold  — headings
C_DIM='\033[0;90m'    # grey       — scene labels
C_CMD='\033[1;32m'    # green bold — the $ prompt
C_OK='\033[0;32m'     # green      — check marks
C_WARM='\033[1;33m'   # yellow     — payoff line
C_RULE='\033[0;90m'   # grey       — table rules
R='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../docs/demo_apps/wb-flow-demo" || exit 1

# ── 0:00–0:05 · Prompt & Idea ────────────────────────────────────────────────
clear
sleep 0.8
echo -e "${C_HEAD}# 🌊 wb-flow — agentic AI workflows for any repo${R}"
sleep 1.4
echo
echo -e "${C_DIM}# 1. Idea${R}"
sleep 0.6
echo -e "${C_CMD}\$${R} /wbIdea \"Add Stripe subscriptions to this SaaS\""
sleep 1.4
echo -e "  ${C_OK}✓${R} captured → .wb/ideas/stripe_subscriptions.md"
sleep 1.0

# ── 0:05–0:15 · Plan Generation ──────────────────────────────────────────────
echo
echo -e "${C_DIM}# 2. Plan${R}"
sleep 0.6
echo -e "${C_CMD}\$${R} /wbPlan"
sleep 1.6
echo -e "  ${C_OK}✓${R} 6 tasks · 2 waves · dependencies resolved"
sleep 1.0
echo
echo -e "${C_RULE}  ID   Task                     Wave   Depends on   Model        Validated by${R}"
echo -e "${C_RULE}  ───  ───────────────────────  ─────  ───────────  ───────────  ────────────${R}"
sleep 0.5
echo    "  1    DB schema                1      —            haiku        opus"
sleep 0.35
echo    "  2    Billing service          1      —            opus         gemini-pro"
sleep 0.35
echo    "  3    Stripe provider          1      —            gemini-pro   opus"
sleep 0.35
echo    "  4    Webhook listener         2      1, 3         deepseek     opus"
sleep 0.35
echo    "  5    Checkout UI              2      2            sonnet       opus"
sleep 0.35
echo    "  6    E2E tests                2      4, 5         haiku        sonnet"
sleep 1.2
echo
echo -e "  ${C_DIM}cheap model for mechanical rows, strong model for hard ones — routed per task${R}"
sleep 3.5

# ── 0:15–0:35 · Wave 1 Execution ─────────────────────────────────────────────
clear
sleep 0.4
echo -e "${C_HEAD}# 🌊 wb-flow — agentic AI workflows for any repo${R}"
echo
echo -e "${C_DIM}# 3. Wave 1 — no dependencies, so all three run at once${R}"
sleep 0.8
echo -e "${C_CMD}\$${R} /wbWork --wave=1"
sleep 1.6
echo
echo    "  dispatching 3 agents in parallel — three different models, one per task…"
sleep 1.8
echo
echo -e "  ${C_OK}✓${R} 1  DB schema            haiku        subscriptions, plans, invoices     42s"
sleep 2.2
echo -e "  ${C_OK}✓${R} 2  Billing service      opus         tier logic, proration              51s"
sleep 2.4
echo -e "  ${C_OK}✓${R} 3  Stripe provider      gemini-pro   customers, checkout, portal        47s"
sleep 2.2
echo
echo -e "  ${C_DIM}wall clock 51s — not 140s. The wave is the parallelism.${R}"
sleep 3.6

# ── 0:35–0:45 · Wave 2 Execution ─────────────────────────────────────────────
echo
echo -e "${C_DIM}# 4. Wave 2 — unblocked by wave 1${R}"
sleep 0.8
echo -e "${C_CMD}\$${R} /wbWork --wave=2"
sleep 1.6
echo
echo -e "  ${C_OK}✓${R} 4  Webhook listener     deepseek     signature verify, 6 events         39s"
sleep 1.8
echo -e "  ${C_OK}✓${R} 5  Checkout UI          sonnet       plan picker, portal link           44s"
sleep 1.8
echo -e "  ${C_OK}✓${R} 6  E2E tests            haiku        12 specs, all green                36s"
sleep 2.2

# ── 0:45–0:50 · Validation ───────────────────────────────────────────────────
echo
echo -e "${C_DIM}# 5. Validation — a different model grades each task${R}"
sleep 0.8
echo -e "${C_CMD}\$${R} /wbValid --wave=all"
sleep 1.6
echo -e "  ${C_OK}✓${R} 6/6 validated against their plan rows — no task graded by the model that wrote it"
sleep 3.0

# ── 0:50–0:59 · Artifact Grid ────────────────────────────────────────────────
clear
sleep 0.5
echo -e "${C_HEAD}# ✅ Every step left an artifact. Every artifact is linked.${R}"
echo
sleep 1.0
echo -e "${C_RULE}  Requirement              Plan                 Execution              Validation${R}"
echo -e "${C_RULE}  ───────────────────────  ───────────────────  ─────────────────────  ─────────────────────${R}"
sleep 0.6
echo -e "  ideas/stripe_subs.md  →  plan_stripe.md    →  task_1_report.md    →  task_1_valid.md ${C_OK}✓${R}"
sleep 0.4
echo -e "                                                task_2_report.md    →  task_2_valid.md ${C_OK}✓${R}"
sleep 0.4
echo -e "                                                task_3_report.md    →  task_3_valid.md ${C_OK}✓${R}"
sleep 0.4
echo -e "                                                task_4_report.md    →  task_4_valid.md ${C_OK}✓${R}"
sleep 0.4
echo -e "                                                task_5_report.md    →  task_5_valid.md ${C_OK}✓${R}"
sleep 0.4
echo -e "                                                task_6_report.md    →  task_6_valid.md ${C_OK}✓${R}"
sleep 1.6
echo
echo -e "  ${C_DIM}6/6 validated by an independent model · 2 waves · every claim traceable to a file${R}"
sleep 3.4
echo
echo -e "${C_WARM}# ✨ Plan it, wave it, validate it — and keep the receipts.${R}"
sleep 2.4
echo -e "${C_HEAD}# Ship structured agentic workflows. Zero deps.${R}"
sleep 4.0
