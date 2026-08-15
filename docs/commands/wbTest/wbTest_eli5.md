# /wbTest — ELI5

Before you leave the house, you check: keys ✅, phone ✅, wallet ❌.

`/wbTest` is the AI running the checklist of tests you already wrote and telling you which ones pass and which ones fail.

It does not write new tests. If coverage is missing, `/wbTest` tells you — but you (or `/wbPlan`) have to go add the tests yourself.

Rule: if a test fails, don't ship. Either fix the test (it was wrong) or fix the code (it was wrong). Don't delete the test.

---
