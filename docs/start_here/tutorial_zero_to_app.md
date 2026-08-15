---
title: "Tutorial: From Empty Folder to Full App"
description: Build a complete Personal Finance Tracker from scratch using wb-flow agentic workflow commands.
---

# Tutorial: From Empty Folder to Full App ()

> **Goal:** Build a complete, working application from absolute scratch using the **wb-flow**.
> **Prerequisites:** A terminal and an LLM integrated with the 30-command ecosystem.

This tutorial proves the power of the framework. We are not just refactoring legacy code; we are using agents to architect, plan, build, and validate a greenfield project — a **Personal Finance Tracker** with budgets, transaction history, and spending insights.

---

## Step 1: The Blank Slate & Scaffolding

Start by creating an empty folder for your new application. Instead of manually scaffolding the project with CLI tools, you can instruct the worker agent to do it for you using the new **Inline Task** feature!

**1. Terminal (Bash):**
```bash
mkdir my-finance-app
```

**2. AI Agent Window (the agent Code, Cline, Antigravity, etc.):**
```text
/wbWork my-finance-app/ "Scaffold a modern Vue 3 application with Vite in this directory"
```

## Step 2: Bootstrap the Agentic Brain

An agent needs to know who it is and what rules to follow. We establish the project's "identity" first.

**AI Agent Window:**
```text
/wbSetup my-finance-app/
```
**What happens:** The Architect model runs. It creates the `.wb/workflows/` directory, generating your initial `context.md` (the app's identity) and `dev.md` (the coding rules).

## Step 3: The Master Blueprint

Now, give the system your high-level idea. Don't worry about the small details—let the Strategist model do the heavy lifting of breaking it down.

**AI Agent Window:**
```text
/wbPlan my-finance-app/ "Build a Personal Finance Tracker with monthly budget management, transaction categorization, spending charts, and a settings page for currency preferences."
```
**What happens:** The General model creates today's `plan_<date>.md` file. It breaks your one sentence into a structured, chronological Directed Acyclic Graph (DAG) of tasks (e.g., Task 1: Setup Store, Task 2: Budget UI, Task 3: Transaction List, Task 4: Charts). 

## Step 4: Execution (The Worker Loop)

With the plan in place, it's time to write code. You can execute tasks one by one, or command the system to sweep through them.

**AI Agent Window:**
```text
# Execute the very first task to lay the foundation
/wbWork my-finance-app/ --id=1

# Or, tell the agent to automatically execute all pending tasks sequentially
/wbWork my-finance-app/ *
```
**What happens:** The Worker model reads the plan, writes the actual source code, and generates an execution report in `tasks/task_1/task_1_report_...md`. It then ticks the `☐ Done` column to `✅` in the main plan file.

*(Pro Tip: If you realize you forgot a feature, use the new **Inline Task** feature! Just type `/wbWork my-finance-app/ "Add a recurring transaction scheduler"` and the agent will auto-triage it, add it to the plan, and execute it immediately).*

*(Pro Tip #2: Before running `/wbWork *`, if you realize a task in the generated plan isn't needed right now, you can manipulate its state! Run `/wbWork my-finance-app/ --id=2 --def` to mark Task 2 as ⏸️ Deferred, or `--can` to mark it as 🚫 Cancelled. The Worker will smartly skip these during execution.)*

## Step 5: Quality Assurance (QA)

Never trust the Worker model blindly. Bring in a fresh model to act as the Validator.

**AI Agent Window:**
```text
/wbValid my-finance-app/ --id=1
```
**What happens:** The Validator model reads the Worker's report and the actual code. If it works, it ticks `✅ Valid`. If it fails, it leaves feedback for the Worker to fix.

## Step 6: The Polish Phase

Your app is built and working, but before you ship, you need the "Critics" and "Janitors" to ensure it is production-ready.

**AI Agent Window:**
```text
/wbClean my-finance-app/ # The Janitor removes dead code and console.logs
/wbAudit my-finance-app/ # The Critic does a brutal code-quality review
```

**What happens:** When `/wbAudit` uncovers issues, it appends them directly to your plan as a table of new tasks (e.g., tasks 5, 6, and 7). You can immediately remediate these findings by instructing the Worker to sweep them:
```text
/wbWork my-finance-app/ --id=5,6,7
```
*(Alternatively, you can run `/wbActOn` on the audit report to automatically turn those findings into a dedicated new execution plan!)*

## Step 7 (Optional): Push the Limits (Advanced)

For advanced users looking to push creativity and take their app to the next level before shipping, you can leverage advanced commands to rethink design, suggest next-gen features, or generate visionary improvements.

**AI Agent Window:**
```text
/wbVision my-finance-app/ # Analyze the UI and suggest groundbreaking design revamps
/wbNext my-finance-app/ # Propose the next set of killer features based on current trends
```

**✨ The "Gold" Behavior (What happens):**
When you run `/wbVision`, the agent doesn't just chat with you. It acts as your strategic innovation lab:
1. **File Creation**: It generates a permanent artifact (e.g., `.wb/workflows/reports/.../visions/vision_my-finance-app_<date>.md`).
2. **Strategic Ideation**: It analyzes your app and populates the file with 3 highly innovative, premium feature proposals (e.g., "AI-Powered Spending Predictions", "Bank API Auto-Import", "Shared Household Budget Sync").
3. **Actionable Pipeline**: At the bottom of the generated file, it gives you the exact copy-paste command to instantly turn any idea into a concrete execution plan:
 > `## 🧭 What's Next?`
 > `If you like one of these ideas, run /wbPlan my-finance-app/ "<idea>" to begin execution. Run /wbNext my-finance-app/ to see how it ranks against current debt.`

This creates a seamless, infinite loop from visionary ideation straight into development!

## Step 8: Version Control

Just before you deploy, you should lock in your codebase's state.

**AI Agent Window:**
```text
/wbGit my-finance-app/ # Analyzes your files and generates the perfect commit message
```

**What happens:** The agent scans your recent changes and workflow reports, then drafts a strict Conventional Commit. It also attaches a special metadata block linking directly to your active plan:
```text
feat(my-finance-app): scaffold personal finance tracker and agentic workflows

<!-- wbGit
date: 2026-05-07
model: the AI agent
plan: .wb/workflows/reports/.../plan_my-finance-app_20260507.md
-->

- Initialized Vue 3 frontend with Vite for the Personal Finance Tracker.
- Bootstrapped .wb/workflows with context, dev, and planning reports.
- Implemented budget management, transaction categorization, and spending charts.
```
*(Because agents are strictly forbidden from running `git` directly, you simply copy this perfectly formatted message and run the commit yourself—ensuring you stay in full control!)*

## Step 9: Ship It

Finally, run the release pipeline commands to lock in the version and announce it.

**AI Agent Window:**
```text
/wbTest my-finance-app/ # Run the test suites
/wbSecure my-finance-app/ # Final red-team security scan
/wbRelease my-finance-app/ # Bump versions and generate changelog
/wbBroadcast my-finance-app/ # Generate the social media launch kit!
```

**What happens for each command:**
- `/wbTest`: The agent attempts to run your test runner (e.g., `npm test`). It generates a `test_<target>_<date>.md` report. If tests fail, it logs an execution entry so you can trace the failure.
- `/wbSecure`: The Guard agent performs a static client-side analysis looking for hardcoded secrets, XSS vectors, and CVEs in dependencies. It generates a `security_<target>_<date>.md` report and assigns a `[SAFE]`, `[WARNING]`, or `[CRITICAL]` status.
- `/wbRelease`: The Orchestrator agent reads your recent plans to aggregate a changelog, checks for complex monorepo linkages, and drafts the next version bump. It generates a `release_<target>_<date>.md` file, handing off to you for the final manual publish.
- `/wbBroadcast`: The Herald agent writes a master announcement kit, generating `broadcast_<target>_<date>.md`. This contains LinkedIn/X posts, GitHub Release notes, and a blog narrative, while updating the package lifecycle status to `[PREVIEW]`, `[LTS]`, or `[OBSOLETE]`.

---

### 🎉 Congratulations
You just went from `mkdir` to a fully tested, documented, and production-ready application. You didn't just write code—you managed a virtual team of Architects, Workers, Validators, and Critics. That is the power of the **wb-flow**.

> **Deployment Note:** The complete `.wb/` folder from this tutorial—containing every architectural context, plan, audit, security scan, and vision roadmap generated—has been zipped and can be downloaded [here (download the flow)](#). This final tutorial output is permanently deployed in the GitHub docs.
