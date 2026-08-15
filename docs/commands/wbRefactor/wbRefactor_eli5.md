# /wbRefactor — ELI5

You rearrange the furniture in your living room. The room does the same thing (you still watch TV, sit, eat) — it just looks better.

`/wbRefactor` rearranges code the same way. The code does the same thing afterward. It just looks cleaner, has shorter functions, or is easier to read.

**Three hard rules:**

1. **Only refactor after `/wbAudit` asked you to.** Don't refactor code that's working fine and nobody complained about. That's cleaning things that don't need cleaning.
2. **Never refactor code that has a bug.** Fix the bug first. Refactoring with a bug embedded either hides it or makes it worse.
3. **Never refactor code with no tests.** Without tests, you can't prove the refactor didn't break anything.

If any of those rules are violated, the command refuses. That's a feature.

---
