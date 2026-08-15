# /wbGit — ELI5

You finished some work. You need to save it to git history.

`/wbGit` does two things:
1. Looks at what changed and writes a tidy commit message describing it.
2. (If you tell it to) actually runs `git add` + `git commit`.

The two are separate on purpose. By default, the AI just *proposes* the message — it doesn't run any git commands. To actually commit, you say "commit it" or use `--execute`.

This is the *only* command that touches git in this project. Everything else is read-only against your working tree.

Hard rules built in:
- Never `--force` push.
- Never skip hooks (`--no-verify`).
- Never bundle unrelated changes silently.

---
