# wbStopTrack — Practical Walkthrough

> How to use `/wbStopTrack` to end your session cleanly.


## Summary

Always stop tracking before switching contexts. Use `--next` to chain sessions without gaps. Review your tracking log weekly.

---

## 1. End-of-Day Close

```bash
/wbStopTrack .
```

```text
--- SESSION FINALIZED ---
Date: 2026-05-12 18:30
Tasks completed: 6/6
Models used: Opus 4 complex
Est. cost: ~$0.15
```

---

## 2. Multi-Project Close

```bash
/wbStopTrack packages/wb-core     # close wb-core session
/wbStopTrack apps/wb-flow          # close wb-flow session
```

---

## 3. Before Model Switch

```bash
/wbTrack . --save                  # 1. Save state
/wbStopTrack .                     # 2. Finalize for the day
```

---

## 4. Next Morning

```bash
/wbTrack .                         # starts a fresh session
```

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)
