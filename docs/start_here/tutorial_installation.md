# Step-by-Step Tutorial: Installing & Bootstrapping `wb-flow`

This field manual walks you through installing `wb-flow` on your development machine and wiring its 33 slash-command Operating Procedures directly into your terminal AI assistants (**Claude Code**, **OpenCode**, **Antigravity / Gemini CLI**, **Cursor**, **Codex**).

<InstallationAnimation />

---

## 🏗️ Architecture & Integration Flow

Below is how `wb-flow` bootstraps command templates into stable storage and generates native wrapper commands for every assistant:

---

## 📍 Step 1: Installing the CLI

You can install `wb-flow` using `npm` globally, run it on-demand via `npx`, or clone the source directly.

### Option A: Global Installation (Recommended)

Installing globally makes the `wb-flow` binary available everywhere in your shell:

```bash
npm install -g wb-flow
```

Verify your installation and inspect available flags:

```bash
wb-flow --version
# Output: 1.0.2

wb-flow --help
```

### Option B: One-Shot Execution via `npx`

If you prefer zero global footprint, run `npx wb-flow` directly inside any target repository:

```bash
cd ~/projects/my-awesome-app
npx wb-flow
```

### Option C: Source Clone / Contributor Setup

If you want to contribute to `wb-flow` core or maintain a custom template library:

```bash
git clone https://github.com/wissemb11/wb-flow.git ~/.wb-flow-src
cd ~/.wb-flow-src && npm link
cd ~/projects/my-awesome-app
wb-flow
```

---

## 🔌 Step 2: Wiring Slash Commands (`wb-flow init`)

`wb-flow` features an automated setup wizard (`wb-flow init`) that detects all installed AI coding assistants and writes native slash-command wrappers for each of them in a single interactive pass.

Run the initializer in your terminal:

```bash
wb-flow init
```

### Interactive Step-by-Step Breakdown

```text
🚀 wb-flow init — wiring the /wb* commands into your assistants

Where should the /wb* commands be available?
  1) Globally — every project on this machine
  2) This project only — /home/user/my-awesome-app
> [1]
```

1. **Global Scope (`1`)**: Stores master command templates in `~/.wb-flow/commands/`. All wrapper files point to absolute paths, enabling `/wbPlan`, `/wbAudit`, and `/wbWork` across **any repo** on your machine.
2. **Project Scope (`2`)**: Stores templates inside `./.wb/commands/`. Relative links allow you to commit templates to Git so your entire engineering team shares identical SOP contracts.

Next, `wb-flow init` scans your system paths to detect active assistants:

```text
Which assistants should get the commands? (detected ones default to Yes)
  Claude Code       → ~/.claude/commands             [Y/n]
  OpenCode          → ~/.config/opencode/command     [Y/n]
  Gemini CLI        → ~/.gemini/commands             [y/N]
  Antigravity (agy) → ~/.gemini/config/skills        [Y/n]
```

Press `Enter` to confirm auto-detected assistants. `wb-flow` will immediately generate all 33 command wrappers across selected platforms!

---

## 🤖 Non-Interactive / CI Bootstrap (`--yes`)

For automated dev-container setups, Docker images, or CI/CD pipelines, pass the `--yes` (`-y`) flag along with explicit options:

```bash
# Global bootstrap for Claude Code & OpenCode
wb-flow init --scope=global --agents=claude,opencode -y

# Project-level bootstrap preview without writing
wb-flow init --scope=project --agents=all --dry-run
```

---

## 🎯 Step 3: Executing Your First Workflow

Once installation and wiring are complete, test the integration inside your preferred assistant terminal interface.

<FirstWorkflowAnimation />

### 1. Launch your assistant CLI:
```bash
claude
# OR
opencode
```

2. **Index your repository context:**
   Type `/wbSetup .` in the assistant prompt. The assistant reads `wbSetup_template.md` and generates `context.md` + `dev.md`.

3. **Generate an architectural plan:**
   Type `/wbPlan "implement rate limiting on API endpoints"`. Your assistant generates a structured task table and execution matrix.

4. **Execute work items strictly:**
   Type `/wbWork --id=1` to run the first task with full traceability and automated verification.

---

## 🔍 Verification & Troubleshooting

To confirm that command wrappers are correctly linked and up to date, run the internal validator:

```bash
node ~/.wb-flow/bin/verify-wrappers.js
```

If an assistant does not register slash commands after running `init`:
- **Claude Code**: Verify that `~/.claude/commands/wbPlan.md` exists. Restart the `claude` session.
- **OpenCode**: Check `~/.config/opencode/command/wbPlan.md`.
- **Antigravity (`agy`)**: Antigravity uses skills instead of slash commands. Run tasks using natural language: `run wbPlan on src/api`.
