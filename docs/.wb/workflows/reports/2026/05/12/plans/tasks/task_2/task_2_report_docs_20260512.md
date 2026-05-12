# Task 2: Fix 253 npm URLs lost scope prefix

**Model:** DeepSeek V4 Flash
**Plan:** plan_docs_20260512.md

## Changes

Bulk sed: `[wb-flow on npm](...wb-flow)` → `[@wbc-ui2/wb-flow on npm](...@wbc-ui2/wb-flow)` across all `.md` files + manual fix of README.md variant.

## Verification

- Stale unscoped npm: **0** (was 253) ✅
- Correct scoped npm: **256** ✅

## 🔍 Validation (QA)

**Score:** 10/10 ✅ PASS