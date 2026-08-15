# /wbActOn — ELI5

You have a long document with 23 findings. You don't know which to fix first.

`/wbActOn` reads the document, ranks each finding 1️⃣→N, color-codes them (🟢 quick / 🔴 console error / 🟡 cleanup / 🟣 strategy / 🔵 multi-step), assigns a recommended AI model per rank, and writes you a "if I were you" execution thread.

It never modifies your source. Just annotates and ranks.

Same engine is also exposed as `--act` flag on `/wbAudit`, `/wbReview`, `/wbStandup` — when you want the audit *and* the ranking in one run.

---
