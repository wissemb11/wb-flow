#!/bin/bash
# Auto-played demo for wb-flow. Each line below echoes a "command" then runs it,
# with sleeps tuned so the asciinema viewer can read each step.
#
# STORYBOARD:
# 0:00–0:05 | Prompt & Idea: `/wbIdea "Add Stripe subscriptions to this SaaS"`
# 0:05–0:15 | Plan Generation: `/wbPlan`
# 0:15–0:35 | Wave 1 Execution: `/wbWork --wave=Wave1`
# 0:35–0:45 | Wave 2 Execution: `/wbWork --wave=Wave2`
# 0:45–0:50 | Validation: `/wbValid --wave=all`
# 0:50–0:59 | Artifact Grid

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../docs/demo_apps/wb-flow-demo" || exit 1
clear
sleep 0.6

echo -e "\033[1;36m# 🌊 wb-flow — agentic AI workflows for any repo\033[0m"
sleep 1.5

echo
echo -e "\033[0;90m# 1. Idea: Add Stripe subscriptions to this SaaS\033[0m"
sleep 0.8
echo -e "\033[1;32m$\033[0m /wbIdea \"Add Stripe subscriptions to this SaaS\""
sleep 1.5

echo
echo -e "\033[0;90m# 2. Plan Generation\033[0m"
sleep 0.8
echo -e "\033[1;32m$\033[0m /wbPlan"
sleep 2.0
echo "Generated 6-task plan: DB, Billing Service, Stripe Provider (Wave 1), Webhook, Frontend, Tests (Wave 2)"
sleep 1.0

echo
echo -e "\033[0;90m# 3. Wave 1 Execution\033[0m"
sleep 0.8
echo -e "\033[1;32m$\033[0m /wbWork --wave=Wave1"
sleep 2.0
echo "Executing: DB, Billing Service, Stripe Provider in parallel..."
sleep 2.0

echo
echo -e "\033[0;90m# 4. Wave 2 Execution\033[0m"
sleep 0.8
echo -e "\033[1;32m$\033[0m /wbWork --wave=Wave2"
sleep 2.0
echo "Executing: Webhook, Frontend, Tests..."
sleep 2.0

echo
echo -e "\033[0;90m# 5. Validation\033[0m"
sleep 0.8
echo -e "\033[1;32m$\033[0m /wbValid --wave=all"
sleep 2.0
echo "Validating all tasks..."
sleep 1.0

echo
echo -e "\033[1;33m# ✨ Work completed, validated, and fully traceable in the artifact grid.\033[0m"
sleep 2.5
echo -e "\033[1;36m# Ship structured agentic workflows. Zero deps.\033[0m"
sleep 2.0
