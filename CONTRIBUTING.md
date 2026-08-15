# Contributing to wb-flow

Thanks for your interest in contributing! wb-flow is a zero-dependency CLI that bootstraps agentic AI workflows into any repo.

## How to Contribute

### Reporting Bugs

Open an issue at [github.com/wissemb11/wb-flow/issues](https://github.com/wissemb11/wb-flow/issues) with:

- A clear title and description
- Steps to reproduce
- Expected vs actual behaviour
- Your environment (Node version, OS, AI assistant used)

### Suggesting Features

Open an issue tagged `enhancement`. Describe the problem you are solving and why the change matters more than what the change is.

### Pull Requests

1. Fork the repo and create a branch from `main`.
2. Make your changes. Keep the zero-dependency contract — no new `dependencies` or `devDependencies` unless discussed first.
3. Run the test suite:
   ```bash
   npm test
   ```
4. Ensure `prepublishOnly` passes:
   ```bash
   npm run prepublishOnly
   ```
5. Open a PR with a description that links the issue it addresses.

### Code Style

- No comments unless they explain *why*, not *what*.
- Match the surrounding style — hand-rolled asserts in tests, CommonJS in bin scripts, Markdown in templates.
- Template edits must update all three assistant formats (Claude Code, OpenCode, Gemini CLI) and the `wb-flow init` generator if one exists.

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
fix(wave): capture agent PID instead of pipeline tail
feat(init): add Cursor wrapper generation
docs(readme): move framework-agnostic disclaimer above the fold
```

### License

By contributing, you agree that your contributions are licensed under the project's MIT License.
