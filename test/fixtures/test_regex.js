const fs = require('fs');
let text = fs.readFileSync('.wb/workflows/reports/2026/08/09/plans/plan_wb-flow_20260809.md', 'utf8');

let cleanText = text;
cleanText = cleanText.replace(/\n### 📋 Copy\/Paste Execution Scenarios[\s\S]*?(?=\n### |\n## |\n<!--|\n*$)/g, '\n');
cleanText = cleanText.replace(/\n### 🚀 Recommended Next Execution Command\(s\)[\s\S]*?(?=\n### |\n## |\n<!--|\n*$)/g, '\n');
cleanText = cleanText.replace(/\n### 💰 Plan Budget Estimate[\s\S]*?(?=\n### |\n## |\n<!--|\n*$)/g, '\n');
fs.writeFileSync('plan_cleaned.md', cleanText);
