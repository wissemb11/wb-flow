# wbDoc — Expert Architecture

> How `/wbDoc` generates and maintains project documentation.

---

## 1. System Role

`/wbDoc` is a **documentation generator**. It reads source code to produce or update README files, API docs, and usage guides.

| Property | Value |
|---|---|
| **Role** | 🔨 Worker (generative) |
| **Input** | Folder or file path |
| **Output** | Documentation files (README.md, API.md) |
| **Mutates files** | Yes — creates/updates documentation |

---

## 2. Documentation Types

| Type | Flag | Output |
|---|---|---|
| **README** (default) | — | `README.md` at project root |
| **API** | `--type=api` | `API.md` with function signatures |
| **Usage** | `--type=usage` | Usage guide with examples |
| **Changelog** | `--type=changelog` | `CHANGELOG.md` from git history |

---

## 3. Source Analysis

`/wbDoc` reads source code to extract:

| Source | Extracts |
|---|---|
| `package.json` | Name, description, scripts, dependencies |
| Exported functions | Function signatures, parameters, return types |
| JSDoc comments | Descriptions, @param, @returns |
| Vue components | Props, events, slots |
| Config files | Build tool, test runner, lint rules |

---

## 4. README Template

Generated READMEs follow this structure:

```markdown
# Package Name
> Description from package.json

## Installation
npm install command

## Usage
Import and usage examples

## API
Exported functions and types

## Development
Scripts and setup instructions

## License
License information
```

---

## 5. Self-Correct Behavior

When `README.md` already exists:
- Preserves hand-written sections (badges, custom content)
- Updates auto-generated sections (API, installation)
- Adds `Last updated` timestamp

---

## 6. What wbDoc Does NOT Do

| Action | Use Instead |
|---|---|
| Create tutorials | Manual writing or `/wbWork` |
| Generate API reference sites | External tools (TypeDoc, VuePress) |
| Write architecture docs | `/wbContext` for identity docs |
| Create changelogs from git | `/wbRelease` handles changelog |

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)
