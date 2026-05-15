# wbAudit — Expert Architecture

> Deep-dive into `/wbAudit` internals: how it scans code, scores findings, and produces structured reports.

---

## 1. System Role

`/wbAudit` is a **read-only inspector**. It scans actual source code and configuration files to produce an honest, scored assessment. It never modifies files — it only describes reality.

| Property | Value |
|---|---|
| **Role** | 🧠 Planner (analytical) |
| **Input** | Folder path or file path |
| **Output** | Structured audit report in `reports/YYYY/MM/DD/audits/` |
| **Mutates files** | Never |
| **Reads context.md** | Yes — uses it for project identity and goals |

---

## 2. Scan Pipeline

```
Input path → Context read → Source scan → Finding extraction → Scoring → Report generation
```

### Stage Details

| Stage | Action |
|---|---|
| **Context read** | Reads `.wb/workflows/context.md` for project identity, dependencies, goals |
| **Source scan** | Recursively scans `src/`, `package.json`, config files |
| **Finding extraction** | Identifies issues by category (structure, quality, security, performance) |
| **Scoring** | Assigns severity (CRITICAL, HIGH, MEDIUM, LOW, INFO) and computes aggregate score |
| **Report generation** | Writes markdown report with findings table, score, and recommendations |

---

## 3. Scan Profiles

| Profile | Flag | Focus |
|---|---|---|
| **Architecture** (default) | `--profile=architecture` | Structure, dependencies, patterns, code organization |
| **Security** | `--profile=security` | Secrets, input validation, dependency vulnerabilities |
| **Performance** | `--profile=performance` | Bundle size, render cycles, memory leaks, lazy loading |

---

## 4. Scoring Algorithm

```
Score = 10 - (CRITICAL × 2) - (HIGH × 1) - (MEDIUM × 0.5) - (LOW × 0.1)
Score = max(1, min(10, Score))
```

| Severity | Weight | Example |
|---|---|---|
| CRITICAL | -2.0 | Missing `package.json`, exposed secrets |
| HIGH | -1.0 | No tests, 130 stub files |
| MEDIUM | -0.5 | Missing JSDoc, unused exports |
| LOW | -0.1 | Missing description field, minor naming inconsistency |
| INFO | 0 | Observation only, no score impact |

---

## 5. Report Structure

```markdown
# Audit: <scope> — YYYY-MM-DD

> Model, scope, profile metadata

## Score: N/10
Category breakdown table

## Findings
### F1. [SEVERITY] Title
Description, evidence, fix recommendation

## Inventory Summary
File counts, line counts, metrics

## Prioritized Recommendations
Action table ordered by priority
```

---

## 6. Self-Correct Behavior

When passed an existing audit report (instead of a folder path), `/wbAudit` enters self-correct mode:

| Check | Action |
|---|---|
| Finding already resolved | Mark as `Resolved` |
| New issues since last audit | Add with `NEW` tag |
| Score inconsistency | Recalculate from current findings |

---

## 7. What wbAudit Does NOT Do

| Action | Use Instead |
|---|---|
| Fix any issues | `/wbWork` |
| Run tests | `/wbTest` |
| Check security adversarially | `/wbSecure` |
| Generate a plan from findings | `/wbPlan` (reads audit output) |
| Modify source code | Never |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)
