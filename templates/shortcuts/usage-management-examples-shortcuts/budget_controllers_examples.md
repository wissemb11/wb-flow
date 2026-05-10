# Budget & Token Management Shortcuts — Examples

This document outlines scenarios and use cases for the **Section 22: Budget & Token Management** shortcuts defined in `shortcuts.md`.

---

## 1. The Pre-Flight Estimate (`/quote`)

**Use Case:** You are about to run a massive refactor across 15 files and want to avoid an accidental $5.00 API charge.

**Prompt:**
> `/quote Refactor the entire authentication module in src/auth/ to use JWT instead of sessions.`

**AI Behavior:**
> **Token Estimation:**
> - Input context: ~45,000 tokens
> - Expected output: ~8,000 tokens across 5 files
> - **Estimated Cost:** $0.85
> 
> *Type "Approve" to proceed with the execution.*

---

## 2. The Strict Limit (`/le,N`)

**Use Case:** You want the AI to do a task, but only if it's cheap. If it's an expensive task, you want to do it yourself using a guided prompt.

**Prompt:**
> `/le,10 Generate a comprehensive test suite for the dashboard components.`

**AI Behavior (Scenario A - Under 10%):**
> *Task requires ~5% of token limit. Executing...*
> [Outputs the test suite code immediately]

**AI Behavior (Scenario B - Over 10%):**
> *Task rejected. Estimated token usage (35%) exceeds your 10% limit.*
> 
> **Do-It-Yourself Execution Prompt:**
> "Please copy and paste the following prompt into your terminal or a cheaper AI session to generate the tests file-by-file:
> *'Read `src/dashboard/Chart.vue` and generate Vitest unit tests covering mounting and data-fetching. Save it to `tests/Chart.spec.js`.'* (Repeat for each component)."

---

## 3. The Paced Execution (`/usage,N`)

**Use Case:** You are running an ongoing task and want to pause periodically to review the cost and approve the next chunk.

**Prompt:**
> `/usage,15 Migrate all old Vue 2 syntax to Vue 3 Composition API in the components folder.`

**AI Behavior:**
> *Executing chunk 1...*
> [Migrates 3 files]
> 
> **⏸️ Token Limit Paused**
> I have reached your 15% token usage threshold (Estimated cost spent: $0.45).
> **Remaining work:** 7 files left.
> **Estimated remaining cost:** $1.10 (approx. 35% more token usage).
> 
> *Do you approve continuing for a custom chunk of 20%?*

---

## 4. The Context Diet (`/diet`)

**Use Case:** You've been chatting with the AI for 2 hours. The context window is huge, and every single prompt is costing $0.10 just in input tokens. You only need a small CSS fix now.

**Prompt:**
> `/diet Fix the margin on the login button in Header.vue.`

**AI Behavior:**
> *Flushing conversational history and unrelated files...*
> *Retaining only `Header.vue` lines 45-60.*
> 
> Here is the fixed CSS class for the login button:
> ```css
> .login-btn { margin-left: 1rem; }
> ```
> *(Input tokens reduced from 80k to 400 tokens).*

---

## 5. The Down-Level Delegation (`/delegate`)

**Use Case:** You are in an expensive Opus/Pro session, but you need a simple regex or a basic boilerplate script that a cheap model like Haiku/Flash could do for pennies.

**Prompt:**
> `/delegate Write a regex to validate Tunisian phone numbers (+216).`

**AI Behavior:**
> *Task evaluated as trivial. Executing this on the current premium model is a waste of budget.*
> 
> **Action:** Copy and paste the prompt below into a Gemini Flash or Claude Haiku session:
> > *"Write a javascript regex that strictly matches Tunisian phone numbers starting with +216 followed by 8 digits. Provide 3 test cases."*

---
