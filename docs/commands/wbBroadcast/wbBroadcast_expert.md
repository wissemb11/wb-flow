# wbBroadcast — Expert Architecture

> How `/wbBroadcast` generates release announcements and distribution templates.

---

## 1. System Role

`/wbBroadcast` is a **communication generator**. It reads the latest release report and produces announcement templates for various channels.

| Property | Value |
|---|---|
| **Role** | 📋 Mechanical (template) |
| **Input** | Release report or folder path |
| **Output** | Broadcast report in `reports/YYYY/MM/DD/broadcasts/` |
| **Mutates files** | No (creates report only) |

---

## 2. Channel Templates

| Channel | Format |
|---|---|
| **GitHub Release** | Markdown with changelog, assets, migration notes |
| **npm README** | Updated badge, latest version highlight |
| **Social** | Short-form announcement (280 chars) |
| **Internal** | Team notification with technical details |

---

## 3. Content Sources

| Source | Extracts |
|---|---|
| Release report | Version, changelog, date |
| `package.json` | Package name, keywords |
| CHANGELOG.md | What changed since last release |
| Audit report | Quality score improvements |

---

## 4. Output Structure

```markdown
# Broadcast: <package> v<version>

## GitHub Release
[Full markdown release body]

## Social
[Short announcement]

## Internal
[Team notification with links]
```

---

## 5. Integration

| Flow | Commands |
|---|---|
| After release | `/wbRelease .` → `/wbPublish .` → `/wbBroadcast .` |
| Standalone | `/wbBroadcast .` (reads latest release) |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)
