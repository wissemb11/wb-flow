# wbBroadcast — Practical Walkthrough

> How to generate release announcements for various channels.

---

## 1. Generate Announcements

```bash
/wbBroadcast packages/my-lib
```

```text
[AI] Reading release: my-lib v1.1.0 (2026-05-11)
[AI]
[AI] ## GitHub Release
[AI] ### my-lib v1.1.0
[AI] - feat: new validation engine
[AI] - fix: dropdown alignment
[AI]
[AI] ## Social
[AI] "my-lib v1.1.0 is out! New validation engine + bug fixes."
[AI]
[AI] Report: reports/2026/05/11/broadcasts/broadcast_my-lib_20260511.md
```

---

## 2. Post-Release Flow

```bash
/wbRelease packages/my-lib --minor    # 1. Bump version
/wbPublish packages/my-lib            # 2. Publish to npm
/wbBroadcast packages/my-lib          # 3. Generate announcements
```

---

## 3. Using the Templates

Copy the generated templates to their respective channels:
- GitHub Release → paste into GitHub "New Release" form
- Social → post to Twitter/LinkedIn
- Internal → send to team Slack/Discord

---

## 4. Common Patterns

| Pattern | Command |
|---|---|
| After release | `/wbBroadcast .` |
| Specific version | `/wbBroadcast . --version=1.1.0` |
| Internal only | `/wbBroadcast . --channel=internal` |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)
