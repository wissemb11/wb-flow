# wbTest Template v2.1


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbTest`

## Two forms

```
/wbTest <pkg>              # run existing tests, report results
/wbTest <pkg> --profile    # same + timing/memory profile
```

## When to run

- Before `/wbRelease` — must pass.
- Before `/wbDeploy` — must pass.
- After `/wbRefactor` — verify nothing broke.
- After `/wbDebug` produces a fix — confirm the fix landed.
- When `reports/` shows recent test failures you haven't addressed.

## When *not* to run

- To check code quality → `/wbAudit`.
- To verify plan execution → `/wbReview`.
- To add missing coverage → `/wbPlan --task="add tests for X"` followed by execution.
- Before starting work on a feature → tests won't tell you what to build.

## Reading the output

Three bands:
- **All pass, no coverage gaps** — you're good. Proceed.
- **Some fail** — triage first. Is it test-wrong or code-wrong? Don't reflexively "fix the test."
- **Fails to run at all** — config bug, not code bug. Fix the test setup.

## The test vs. code question

When a test fails, ask in this order:
1. Was the test correct? (Does the expected behavior match what was actually agreed?)
2. Is the code wrong against that expected behavior?
3. Is this a symptom of an open architectural decision that blocks cleanly passing the test?

If (3), mark the test as `xit()` with a comment referencing the open decision. Don't delete.

## The most common mistake

**Fixing the test to match the code.** If the code produces `<div class="wbcode-placeholder">` but the test expects `<code>`, the default instinct is "update the test." That's often wrong. The test was written to match an earlier agreed-on behavior. If code drifted, the test is the witness, not the culprit. Investigate the code change first.

## When /wbTest refuses

- Test config is broken (no plugin, no runner) — refuses, tells you to fix config.
- No tests exist — reports "0 tests found, coverage is 0%". Not a failure, just a note. Doesn't auto-generate tests.

> For deeper reading: [`docs_claude/commands/wbTest/wbTest_practical_claude.md`](../../docs/docs_claude/commands/wbTest/wbTest_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--profile` | `-p` |
| `--task` | `-t` |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbTest <scope_folder>           # normal mode — produce a fresh output file
/wbTest <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbTest` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-p` → `--profile`
- `-t` → `--task`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



> **How to use**: This is the manual template for executing dynamic tests. Use this to verify that the code actually RUNS and BEHAVES correctly in real environments.
> **Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to every cell of the output (relative links, full-syntax commands, self-correct mode).

---

## Detection (Self-Correct Mode)

Trigger self-correct when the input file's first H1 matches:
`# Test Report: <scope> — <YYYY-MM-DD>` *(or the legacy `# Test Entry #N` header for entry-N append mode).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

Test-specific gap-fills:

- Plain-text test file paths → relative markdown links per §1.
- Bare commands cited as "re-run X" → full-syntax form per §2.
- Missing pass/fail counts → infer from the captured terminal output if present.

---

## Filename & Folder Convention (v2 — Universal Daily File)

**Path:** `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/tests/test_<target>_<YYYYMMDD>.md`

> **No `<model>/` subfolder.** All models contribute to ONE test file per day per scope.
> **No timestamp in filename.** Filename uses only the date.

**Create-or-Append Rule:**
- **File does NOT exist →** CREATE the file with a header and your test run as Entry #1.
- **File ALREADY exists →** READ it, then APPEND your test run as the next Entry #N. This creates a progression log (e.g., Entry #1: 352/365, Entry #2 after fix: 365/365).
- **Every entry tagged:** `*(ModelName via Client — HH:MM)*`

---

## The Prompt (copy from here ↓)

```
━━━━━━━━━━━━━ /wbTest ━━━━━━━━━━━━━

📁 TARGET: __TARGET_PATH__
🧪 TEST TYPE: __UNIT | E2E | MANUAL | PERF__
📅 DATE: __TODAY__
🤖 MODEL: __YOUR_MODEL_NAME__
🖥️ CLIENT: __YOUR_CLIENT__

━━━ CONTEXT & GOAL ━━━
Act as a QA Engineer and Automation Expert. Your goal is to EXECUTIVELY verify the target's behavior. 

Unlike a review (which looks at code), a test focuses on EXECUTION.

━━━ INSTRUCTIONS ━━━

**[TEMPORAL MEMORY]**: Before executing your main task, you MUST scan the `.wb/workflows/reports/` directory of your target scope. Look for recent `audits/`, `reviews/`, or `tests/` reports. Use these past reports to understand recent failures, technical debt, or architectural decisions that affect your current execution.


1. **Test Setup**: Initialize the testing environment. Run `npm install` if needed.
2. **Execution**:
   - **If UNIT**: Run the test runner (e.g., `npm test`). Capture the output.
   - **If E2E/MANUAL**: Use the browser subagent to navigate the site. Perform specific actions (click, type, refresh).
3. **Verification**: Confirm that the actual output matches the expected output.
4. **Summary**: Provide a PASS/FAIL status for each test case.
5. **Results**:
   - ✅ **PASSED**: All assertions met.
   - ❌ **FAILED**: Bug detected. Provide terminal/console logs.

6. SAVE using the Universal Daily File pattern:

   CHECK if this file exists:
   `<target_folder>/.wb/workflows/reports/__YYYY__/__MM__/__DD__/tests/test___NAME_____YYYYMMDD__.md`

   - If it does NOT exist → CREATE the file with header + your test run as Entry #1
   - If it ALREADY exists → APPEND your test run as the next Entry #N

   Entry header format (use `---` only when appending, NEVER as the very first line of the file):
   # Test Entry #N — *(__YOUR_MODEL_NAME__ via __YOUR_CLIENT__ — __CURRENT_TIME__)*
   > **Model:** __YOUR_MODEL_NAME__
   > **Client:** __YOUR_CLIENT__
   > **Time:** __TODAY__ __CURRENT_TIME__
   [... your full test results; all file references as relative links per output_conventions.md §1 ...]

7. APPLY OUTPUT CONVENTIONS:
   - All test file paths and source file references → relative markdown links from the output file's directory (§1).
   - Any /wb* commands cited (e.g., "re-run /wbTest") → full-syntax form (§2).

8. END THE FILE WITH:

   ## 🧭 What's Next?

   Run `/wbNext <target_folder>` to get a current, ranked list of next actions based on these test results.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
━━━ AUTO-APPEND FOOTER ━━━

At the VERY END of the file (after "What's Next?"), you MUST append the `## 📂 Generated Files (__YYYYMMDD__)` cross-link footer. Do NOT use simple tables. You MUST use the rich "Tier 1" layout from `_shared/output_conventions.md` §5.

Format required:
```markdown
---
## 📂 Generated Files (__YYYYMMDD__)
> Auto-appended per `_shared/output_conventions.md` §5. Same-level snapshot of top-level command outputs at write time.

### 📚 Base Reference Files
| Type | File | Description |
|---|---|---|
| Foundational | [context.md](../../../../../context.md) | Permanent Identity and Architecture (Source of Truth) |
| Snapshot | [context_<scope>_<date>.md](../contexts/context_<scope>_<date>.md) | Daily snapshot used for current session context |
| Foundational | [dev.md](../../../../../dev.md) | Permanent Development Commands and Status |

### Global Files (`core2/` monorepo root)
| Category | File | Source Command |
|---|---|---|
| Reports | [audit_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_core2_<date>.md) | `/wbAudit core2/` |
| Reports | [plan_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_core2_<date>.md) | `/wbPlan core2/` |
| Tracks | [track_core2_<date>.md](../../../../../../../../../../.wb/workflows/tracks/<YYYY>/<MM>/<DD>/track_core2_<date>.md) | `/wbTrack core2/` |

<details>
  <summary>📂 Sub-Package: [Active Package Name]</summary>

| Category | File | Source Command |
|---|---|---|
| Reports | [audit_subpkg_<date>.md](../../../../../../../../../../apps/wb-core/subpkg/.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_subpkg_<date>.md) | `/wbAudit` |

</details>
```
```
