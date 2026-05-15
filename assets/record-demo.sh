#!/bin/bash
# Auto-played demo for wb-flow. Each line below echoes a "command" then runs it,
# with sleeps tuned so the asciinema viewer can read each step.

WBFLOW=/home/wissemb11/Allprojects/wb-labs/frontEnd/wbc-ui/core2/packages/wb-flow

cd /tmp/wb-flow-demo-target

clear
sleep 0.6

echo -e "\033[1;36m# 🌊 wb-flow — agentic AI workflows for any repo\033[0m"
sleep 1.5

echo
echo -e "\033[0;90m# Start in any empty project:\033[0m"
sleep 0.8
echo -e "\033[1;32m$\033[0m pwd && ls -la"
sleep 0.6
pwd
ls -la
sleep 1.5

echo
echo -e "\033[0;90m# One command bootstraps the workflow:\033[0m"
sleep 0.8
echo -e "\033[1;32m$\033[0m npx wb-flow"
sleep 0.8
node $WBFLOW/bin/install.js 2>&1 | head -50
sleep 2.0

echo
echo -e "\033[0;90m# .wb/ is now materialized — 31 ready-to-use commands:\033[0m"
sleep 0.8
echo -e "\033[1;32m$\033[0m ls .wb/commands/ | head -10"
sleep 0.6
ls .wb/commands/ 2>/dev/null | head -10
sleep 1.5

echo
echo -e "\033[1;33m# ✨ Your AI assistant now understands /wbAudit, /wbPlan, /wbWork…\033[0m"
sleep 2.5
echo -e "\033[1;36m# Ship structured agentic workflows. Zero deps.\033[0m"
sleep 2.0
