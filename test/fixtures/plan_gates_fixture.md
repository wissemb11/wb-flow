# Plan Backlog: gates — 2026-08-03

> **Target:** deployement/packages/wb-flow/next/core/

| # | Requires | Dep | 🔗 | Task | Verify | P | Est. Time (mins) | Worker (Suggested) | Validator (Suggested) | ☐ Done | ☐ Valid |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| G1 | 🔨 Worker | — | 📄 | Inspect the init | `test -f test/smoke.js` | P0 | 10 | DeepSeek V4 Pro | Claude | ⬜ | ⬜ |
| G2 | 🔨 Worker | — | 📄 | List the bin | `ls bin/wave.js` | P1 | 5 | DeepSeek V4 Pro | Claude | ⬜ | ⬜ |
| G3 | 🔨 Worker | — | 📄 | Count the bins | `test $(ls bin/ \| wc -l) -gt 1` | P2 | 5 | DeepSeek V4 Pro | Kimi K2.7 Code | ⬜ | ⬜ |
| G4 | 🔨 Worker | — | 📄 | Escaped-pipe guard | `for k in a b; do grep -q "$k" bin/wave.js \|\| exit 1; done` | P2 | 7 | DeepSeek V4 Pro | Claude | ⬜ | ⬜ |

## 🌊 Next Executable Sequence

| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |
|---|---|---|---|---|---|
| **A** | — | — | `/wbWork plan_gates_fixture.md --id=G1`<br>→ *DeepSeek V4 Pro* *(⏱️ 10 min)*<br><br>`/wbWork plan_gates_fixture.md --id=G2`<br>→ *DeepSeek V4 Pro* *(⏱️ 5 min)* | — |
| **B** | — | — | `/wbWork plan_gates_fixture.md --id=G3`<br>→ *DeepSeek V4 Pro* *(⏱️ 5 min)* | — |
