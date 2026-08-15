# /wbCheck: ELI5 👶

You're hiring a contractor to remodel your kitchen. Before you hand them the keys, you ask:

- "What kind of countertops do I already have?" → Granite.
- "Where does the plumbing run?" → Behind the east wall.
- "What's the electrical panel capacity?" → 200 amps.

A good contractor answers from inspection. A bad one guesses. You don't let the guesser near your kitchen.

`/wbCheck` is this interview — for AI models, about your codebase.

**The trick:** You hold the answer key (a private script on your machine). The AI model never sees it. It can only prove understanding by reading the actual source code. If it fabricates answers, you catch it instantly.

```bash
[private command] wb-core wbTest
# Shows questions → you copy to model → model answers → you grade
```

**When to skip:** If you've already verified the model on this package and nothing changed, skip the quiz. Don't re-interview a contractor who's already done good work for you.

---
