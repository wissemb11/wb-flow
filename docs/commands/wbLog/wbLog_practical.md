# wbLog — Practical Walkthrough

> How to use `/wbLog` to annotate your session with quick notes and decisions.

---

## 1. Logging a Quick Decision

```bash
/wbLog . "Decided to use Zustand instead of Redux for state management"
```

```text
[LOG] 2026-05-12 14:30:00 — Decided to use Zustand instead of Redux for state management
```

---

## 2. Recording a Blocker

```bash
/wbLog . "Blocked: waiting for API key from DevOps team"
```

---

## 3. Model Switch Note

```bash
/wbLog . "Switching from Sonnet to Opus — context window was getting tight"
```

---

## 4. End-of-Day Notes

```bash
/wbLog . "All 6 link-fix tasks completed and validated. Ready for release tomorrow."
```

---

## 5. Reviewing Logs

Logs are viewable in the session tracker at:
`.wb/workflows/reports/YYYY/MM/DD/track_<scope>_<date>.md`

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)
