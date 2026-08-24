# Contributing to wb-flow

Thanks for your interest in contributing! wb-flow is a zero-dependency CLI that bootstraps agentic AI workflows into any repo.

## How to Contribute

### Architecture

Before making changes, please read the [Architecture Overview](docs/architecture.md) which explains how templates, `bin/install.js`, `bin/wave.js`, and the reports tree fit together.

### Reporting Bugs

Open an issue at [github.com/wissemb11/wb-flow/issues](https://github.com/wissemb11/wb-flow/issues) with:

- A clear title and description
- Steps to reproduce
- Expected vs actual behaviour
- Your environment (Node version, OS, AI assistant used)

### Suggesting Features

Open an issue tagged `enhancement`. Describe the problem you are solving and why the change matters more than what the change is.

### Good First Issues (Freeze-Safe)

We are currently under a **90-day feature freeze**: no new commands (the set of 33 is fixed) and no core-engineering rewrites. This is deliberate — the tool is being stabilised, not extended. There are still many freeze-safe ways to contribute right now:

- **Documentation & Typos:** Fixing typos, broken links, or clarifying instructions in the `docs/` folder or README.
- **Comparison Page Facts:** Adding or correcting technical facts on our tool comparison pages.
- **Template Wording:** Improving the clarity of markdown templates used for plans, ideas, and audits.

If you have a larger idea, please register it on the [GitHub Discussions](https://github.com/wissemb11/wb-flow/discussions) **Ideas** board rather than opening a PR — ideas raised there are queued for when the freeze lifts. Please don't open PRs against the deferred core-engineering list.

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

## Not this quarter

We are currently under a 90-day feature freeze. **Allowed:** bug fixes, documentation, test coverage, comparison-page corrections, template wording. **Deferred:** new commands (the set of 33 is fixed), core-engineering rewrites, and broad architecture changes. New command suggestions are welcome on the [Discussions Ideas board](https://github.com/wissemb11/wb-flow/discussions) and will be picked up when the window closes.
