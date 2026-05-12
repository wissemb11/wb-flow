# wb-flow: GitHub & NPM Deployment Roadmap

This document outlines the standard operating procedure for releasing `wb-flow` from the `wb-labs` monorepo to its standalone GitHub repository and the NPM registry.

---

## Phase 1: One-Time GitHub Setup (Sidebar Metadata)
To fix the missing details on the right-hand sidebar of your `wissemb11/wb-flow` GitHub repo, you must edit this in the GitHub web interface:
1. Go to your repository page on GitHub.
2. Click the **⚙️ (Gear) icon** next to the **"About"** section in the right sidebar.
3. Fill in the following:
   - **Description:** `Zero-dependency CLI that bootstraps an agentic AI workflow system into any repo. Verbs over Personas.`
   - **Website:** `https://flow.wb-ui.com`
   - **Topics:** `agentic-ai`, `workflow`, `developer-tools`, `cli`, `claude`, `gemini`, `cursor`
4. Click **Save Changes**.

---

## Phase 2: Documentation Migration (One-Time Move)
To permanently attach the documentation to the CLI package so it gets pushed together:

```bash
# 1. Move the src folder and rename it to docs
mv frontEnd/wbc-ui/core2/apps/wb-flow/wb-flow-docs/src frontEnd/wbc-ui/core2/packages/wb-flow/docs

# 2. Delete the old workspace (it is no longer needed!)
rm -rf frontEnd/wbc-ui/core2/apps/wb-flow/wb-flow-docs
```

> **Next Step:** Once this is pushed to GitHub (Phase 3), go to **Settings > Pages** on your GitHub repo, and set the build source to **Deploy from a branch** using the `main` branch and the `/docs` folder.

---

## Phase 3: The Agentic Release Cycle (Every Version)

Instead of manually editing version strings and running raw git commands, you can drive the entire release process using your own `/wb*` agentic commands.

### Step 1: Pre-flight Verification
Before releasing, ensure the code is actually ready to ship:
```bash
/wbCheck frontEnd/wbc-ui/core2/packages/wb-flow/
# OR
/wbAudit frontEnd/wbc-ui/core2/packages/wb-flow/
```

### Step 2: Bump and Prepare
Tell the AI to prepare the release. It will automatically bump `package.json`, draft the new `CHANGELOG.md` entry, and stage the files.
```bash
/wbRelease frontEnd/wbc-ui/core2/packages/wb-flow/
```

### Step 3: The Standalone Push Protocol (The `/tmp` Clone Method)
Because `packages/wb-flow` lives inside the `wb-labs` monorepo, you must extract it cleanly to preserve the standalone repository's git history. 

Run these manual bash steps to extract the folder:
```bash
rm -rf ~/tmp/wb-flow-deploy
git clone https://github.com/wissemb11/wb-flow.git ~/tmp/wb-flow-deploy
cd ~/tmp/wb-flow-deploy
find . -mindepth 1 -maxdepth 1 ! -name ".git" -exec rm -rf {} +
cp -r ~/Allprojects/wb-labs/frontEnd/wbc-ui/core2/packages/wb-flow/* ~/tmp/wb-flow-deploy/
```

Now, instead of manually writing the commit message, let your agent do it:
```bash
# Still inside ~/tmp/wb-flow-deploy
/wbGit --execute --push
```
*(The agent will analyze the diff, write a Conventional Commit like `chore(release): v1.1.0`, and push it to GitHub).*

### Step 4: Publish to NPM
Publish the final package to the Node registry:
```bash
npm publish --access public
# OR if your agent supports remote publishing:
# /wbPublish frontEnd/wbc-ui/core2/packages/wb-flow/
```

### Step 5: Log it in the Monorepo
Finally, return to your `wb-labs` monorepo to commit the version bump and changelog updates you generated in Step 2:
```bash
cd ~/Allprojects/wb-labs
/wbGit --execute
```

---

## Phase 4: Manual Release Cycle

If you prefer not to use the agentic workflow, you must execute the release cycle manually by hand.

### Step 1: Update the Version Files
You must update the following files *before* pushing:
1. **`package.json`** — Bump the `"version"` field.
2. **`CHANGELOG.md`** — Add a new section at the top detailing what features or fixes changed in this version.
3. **`docs/` files** — Only if you changed a command's behavior or added a new command.

### Step 2: The Staging & Push Protocol (The `/tmp` Clone Method)
Because `packages/wb-flow` lives inside the `wb-labs` monorepo, it cannot be pushed directly without conflicting with the parent git history.

To preserve your GitHub commit history (instead of force-pushing), you should clone the live repo, overwrite the files, and push:

```bash
# 1. Clone the existing standalone repo to a temp folder
rm -rf ~/tmp/wb-flow-deploy
git clone https://github.com/wissemb11/wb-flow.git ~/tmp/wb-flow-deploy

# 2. Remove all old files in the cloned repo (EXCEPT the hidden .git folder!)
cd ~/tmp/wb-flow-deploy
find . -mindepth 1 -maxdepth 1 ! -name ".git" -exec rm -rf {} +

# 3. Copy the fresh contents from the monorepo
cp -r ~/Allprojects/wb-labs/frontEnd/wbc-ui/core2/packages/wb-flow/* ~/tmp/wb-flow-deploy/

# 4. Commit and push the updates manually
git add .
git commit -m "chore(release): publish new version with docs"
git push origin main

# 5. Tag the release (Optional but highly recommended)
git tag v1.0.0-r01
git push origin v1.0.0-r01
```

### Step 3: Publish to NPM
Once the code is successfully pushed to GitHub, publish to the Node registry:

```bash
cd ~/tmp/wb-flow-deploy
npm publish --access public
```

### Step 4: Update the Monorepo
Finally, return to your `wb-labs` monorepo, clean up, and log the release manually:

```bash
cd ~/Allprojects/wb-labs
git add .
git commit -m "chore(wb-flow): bump version and migrate docs to packages/"
```

---

## Phase 5: Agentic Release Cycle VS Manual Release Cycle

Here is a side-by-side comparison of executing Phase 3 via `wb-flow` commands versus doing it manually.

| Step | Agentic Release Cycle | Manual Release Cycle | Which is better and why? |
|---|---|---|---|
| **1. Verification** | `/wbCheck` or `/wbAudit` | Run test suite, check coverage, manually review code quality. | **Agentic.** The AI catches logical flaws, technical debt, and architectural drift that standard automated tests miss. It guarantees a human-grade review before every release. |
| **2. Prep Release** | `/wbRelease` | Manually edit `package.json` version, read `git log`, manually write `CHANGELOG.md`. | **Agentic.** Zero cognitive load. The AI perfectly parses the commit history to draft Conventional Changelogs. It eliminates human error and forgotten version bumps. |
| **3. Commit & Push** | `/wbGit --execute --push` | `git add .` <br> `git commit -m "release"` <br> `git push` | **Agentic.** The AI analyzes the actual diff to write a highly descriptive Conventional Commit message. It prevents lazy `wip` commits and enforces strict git history hygiene. |
| **4. NPM Publish** | `/wbPublish` | `npm publish --access public` | **Tie.** For simple packages, the manual command is just as fast. For complex packages, `/wbPublish` is safer because the AI can verify the build artifacts before publishing. |
| **5. Monorepo Sync** | `/wbGit --execute` | `git commit -m "bump version"` | **Agentic.** The AI writes a context-rich commit message linking back to the release operation automatically, creating a perfect audit trail in the monorepo. |
