const fs = require('fs');
const planDir = '.wb/workflows/reports/2026/08/11/plans/claude-opus-5';
const planFiles = fs.readdirSync(planDir).filter(e => e.startsWith('plan_') && e.endsWith('.md'));
const claimMap = {};
for (const p of planFiles) {
  const content = fs.readFileSync(planDir + '/' + p, 'utf-8');
  const linkRe = /\]\((tasks\/task_[^/]+\/[^)]+\.md)\)/g;
  let m;
  while ((m = linkRe.exec(content)) !== null) {
    const rPath = m[1];
    if (!claimMap[rPath]) claimMap[rPath] = [];
    if (claimMap[rPath].indexOf(p) === -1) claimMap[rPath].push(p);
  }
}
console.log(claimMap);
