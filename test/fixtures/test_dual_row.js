const fs = require('fs');
const WV = require('./bin/wave.js');
const nextJs = require('child_process').execSync;

const FIXTURE_DUAL = `
# Plan Backlog: dual-row — 2026-08-10

## 🌊 Next Executable Sequence

| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |
|---|---|---|---|---|
| **A · 🔨 work** | — | — | \`/wbWork deployement/packages/wb-flow/next/core/demo.md --id=1\`<br>→ *Codex (auto)* | — |
| **A · ✅ validate** | — | \`/wbValid deployement/packages/wb-flow/next/core/demo.md --id=1\`<br>→ *Codex (auto)* | — | — |

## 🧭 Next
`;

const FIXTURE_VALIDATE_ONLY = `
# Plan Backlog: validate-only — 2026-08-10

## 🌊 Next Executable Sequence

| Wave | 🧠 Planner | ✅ Validator | 🔨 Worker | 📋 Mechanical |
|---|---|---|---|---|
| **A · ✅ validate** | — | \`/wbValid deployement/packages/wb-flow/next/core/demo.md --id=1\`<br>→ *Codex (auto)* | — | — |

## 🧭 Next
`;

fs.writeFileSync('fixture_dual.md', FIXTURE_DUAL);
fs.writeFileSync('fixture_valid.md', FIXTURE_VALIDATE_ONLY);

console.log("=== ROW 2 Assertions (Dual Row) ===");
const outA = nextJs('node bin/wave.js fixture_dual.md --wave=A --print').toString();
console.log("(a) Contains wbValid dispatch:", outA.includes('wbValid') ? "PASS" : "FAIL");

const outAWork = nextJs('node bin/wave.js fixture_dual.md --wave=A.work --print').toString();
console.log("(b) --wave=A.work yields 0 validate cells:", outAWork.includes('wbValid') ? "FAIL" : "PASS");

const outAValid = nextJs('node bin/wave.js fixture_dual.md --wave=A.valid --print').toString();
console.log("(c) --wave=A.valid yields only validate cells:", (!outAValid.includes('wbWork') && outAValid.includes('wbValid')) ? "PASS" : "FAIL");

const outAW = nextJs('node bin/wave.js fixture_dual.md --wave=A:W --print').toString();
console.log("(d) --wave=A:W narrows to Worker:", (!outAW.includes('wbValid') && outAW.includes('wbWork')) ? "PASS" : "FAIL");


console.log("=== ROW 2 Assertions (Validate-Only Row) ===");
const outVA = nextJs('node bin/wave.js fixture_valid.md --wave=A --print').toString();
console.log("(a) Contains wbValid dispatch:", outVA.includes('wbValid') ? "PASS" : "FAIL");

const outVAWork = nextJs('node bin/wave.js fixture_valid.md --wave=A.work --print').toString();
console.log("(b) --wave=A.work yields 0 validate cells:", outVAWork.includes('wbValid') ? "FAIL" : "PASS");

const outVAValid = nextJs('node bin/wave.js fixture_valid.md --wave=A.valid --print').toString();
console.log("(c) --wave=A.valid yields only validate cells:", (!outVAValid.includes('wbWork') && outVAValid.includes('wbValid')) ? "PASS" : "FAIL");

const outVAW = nextJs('node bin/wave.js fixture_valid.md --wave=A:W --print').toString();
console.log("(d) --wave=A:W narrows to Worker:", (!outVAW.includes('wbValid') && !outVAW.includes('wbWork')) ? "PASS" : "FAIL"); // Worker is empty in validate-only!

console.log("=== ROW 3 Assertion ===");
const nextOut = nextJs('node bin/next.js fixture_dual.md --json').toString();
const nextData = JSON.parse(nextOut);
const hasMiscount = nextData.waves.some(w => w.spawned > w.cells);
console.log("Row 3 (b) wave-cell miscount:", hasMiscount ? "FAIL" : "PASS");

