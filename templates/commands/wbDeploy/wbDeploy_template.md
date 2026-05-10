# wbDeploy Template v2.1


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbDeploy`

## Three forms

```
/wbDeploy <app>                    # deploy to configured target (usually gh-pages)
/wbDeploy <app> --dry-run          # preview, no push
/wbDeploy <app> --target=local     # build + serve locally for testing
```

## The safe flow

```
/wbDeploy <app> --target=local     # build + preview locally
# test in browser, confirm no prod-specific bugs
/wbDeploy <app> --dry-run          # preview what would deploy
/wbDeploy <app>                    # real deploy
```

Skipping the local step is the #1 cause of "works in dev, broken in prod" deploys.

## Prerequisites

The app must have `.wb/workflows/deploy.md` filled in with target, repo, branch, base-url. `/wbDeploy` refuses if missing.

For GitHub Pages specifically, see [wbDeploy_github_pages_guide_claude](../wbDeploy_github_pages_guide_claude.md).

## Gates the AI checks before deploy

1. `/wbTest` must have passed recently. Failures BLOCK.
2. `/wbAudit` BLOCKERS block. MAJORS are advisory.
3. Build output is present (`dist/`).
4. Deploy config is complete.

If any gate fails, the command refuses with a specific fix.

## After a successful deploy

The AI tells you the live URL. **Open it.** The AI cannot verify the live site works — that's your job. Click around. Check the console. Refresh on a deep link.

If the live site is broken but local-test passed, the issue is deploy-specific (base URL, CORS, DNS, GitHub Pages caching). Start with hard refresh + 5 min wait.

## When to deploy

- After `/wbAudit` on the app is clean.
- After user-facing changes.
- As part of a release cycle for apps bundled with package releases.
- NOT after internal refactors nobody will see.
- NOT for experimental changes. Create a scratch deploy target if needed.

## When /wbDeploy is the wrong command

- Package (code others import) → `/wbPublish`.
- Just want to see your changes locally → `npm run dev`. That's different from `--target=local`.
- Want to stage to a preview URL → set up a scratch deploy target in `deploy.md`, don't deploy to prod.

> For deeper reading: [`docs_claude/commands/wbDeploy/wbDeploy_practical_claude.md`](../../docs/docs_claude/commands/wbDeploy/wbDeploy_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--dry-run` | `-d` |
| `--prod` | `-P` |
| `--target` | `-t` |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbDeploy <scope_folder>           # normal mode — produce a fresh output file
/wbDeploy <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbDeploy` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-d` → `--dry-run`
- `-P` → `--prod`
- `-t` → `--target`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



> **How to use**: This is the manual template for orchestrating the deployment of consumer applications (e.g., demo sites, documentation) to web hosting platforms like Vercel, AWS, or a custom VPS.
> **Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to every cell of the output (relative links, full-syntax commands, self-correct mode).

---

## Detection (Self-Correct Mode)

Trigger self-correct when the input file's first H1 matches:
`# Deploy: <scope> — <YYYY-MM-DD>` *(or the legacy `# Deploy Entry #N` header).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

Deploy-specific gap-fills:

- Plain-text `.env.production`, build-output paths → relative markdown links per §1.
- Bare deploy commands → full-syntax form per §2 where applicable.
- Missing post-deploy smoke-test result → leave blank (do not fabricate).

---

## Filename & Folder Convention (v2 — Universal Daily File)

**Path:** `<target_folder>/.wb/workflows/reports/<YYYY>/<MM>/<DD>/deployments/deploy_<target>_<YYYYMMDD>.md`

> **No `<model>/` subfolder.** All models contribute to ONE deploy file per day per scope.
> **No timestamp in filename.** Filename uses only the date.

**Create-or-Append Rule:**
- **File does NOT exist →** CREATE the file with a header and your deployment log as Entry #1.
- **File ALREADY exists →** READ it, then APPEND as the next Entry #N.
- **Every entry tagged:** `*(ModelName via Client — HH:MM)*`

---

## The Prompt (copy from here ↓)

```
━━━━━━━━━━━━━ /wbDeploy ━━━━━━━━━━━━━

📁 TARGET APP: __TARGET_APP_PATH__
📅 DATE: __TODAY__
🤖 MODEL: __YOUR_MODEL_NAME__
🖥️ CLIENT: __YOUR_CLIENT__
🌐 ENVIRONMENT: __production_or_staging__

━━━ CONTEXT & GOAL ━━━
The user wants to deploy a physical application (e.g., documentation, demo site) to a web host (like wbc-ui.com or wbjs.net). Unlike library packages that go to NPM, this app must be built into static assets and pushed to a server/CDN.

Your goal is to act as the DevOps Deployment Agent. You must ensure the app is synced with the latest library versions, build the application, and execute the deployment commands safely.

━━━ INSTRUCTIONS ━━━

**[TEMPORAL MEMORY]**: Before executing your main task, you MUST scan the `.wb/workflows/reports/` directory of your target scope. Look for recent `audits/`, `reviews/`, or `tests/` reports. Use these past reports to understand recent failures, technical debt, or architectural decisions that affect your current execution.


1. **Infrastructure & DNS (If requested)**: Execute terminal commands to verify DNS propagation (`dig`, `ping`), configure server routing (e.g., Nginx virtual hosts), manage sub-domains, or provision SSL certificates (`certbot`).
2. **Pre-Flight Sync**: Check if the app's `package.json` needs to be updated to use the latest public versions of `wb-core` or `wb-press2` (removing local `file:` links if it's a production deploy).
3. **Environment Audit**: Verify that the correct environment variables (e.g., `.env.production`) are present for the target environment.
4. **Build Execution**: Run the application-specific build script (e.g., `npm run build` inside the app folder).
5. **Deploy Execution**: Provide or execute the specific deployment commands required for this app (e.g., `vercel --prod`, `rsync`, or FTP instructions).
6. **Post-Deploy Smoke Test**: Define how the user can verify the deployment was successful (e.g., checking specific console logs on the live URL).
7. SAVE using the Universal Daily File pattern:

   CHECK if this file exists:
   `<target_folder>/.wb/workflows/reports/__YYYY__/__MM__/__DD__/deployments/deploy___NAME_____YYYYMMDD__.md`

   - If it does NOT exist → CREATE the file with header + your deployment log as Entry #1
   - If it ALREADY exists → APPEND as the next Entry #N

8. APPLY OUTPUT CONVENTIONS (see ../_shared/output_conventions.md):
   - All file/folder references (env files, build outputs, host configs) → relative markdown links (§1).
   - Any /wb* commands cited → full-syntax form (§2).

9. END THE FILE WITH:

   ## 🧭 What's Next?

   Run `/wbNext <target_folder>` to get a current, ranked list of next actions (typically post-deploy verification or next-app deploy).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
━━━ AUTO-APPEND FOOTER ━━━

At the VERY END of the file (after "What's Next?"), you MUST append the `## 📂 Generated Files (__YYYYMMDD__)` cross-link footer. Do NOT use simple tables. You MUST use the rich "Tier 1" layout from `_shared/output_conventions.md` §5.

Format required:
```markdown
---
## 📂 Generated Files (__YYYYMMDD__)
> Auto-appended per `_shared/output_conventions.md` §5. Same-level snapshot of top-level command outputs at write time.

### 📚 Base Reference Files
| Type | File | Description |
|---|---|---|
| Foundational | [context.md](../../../../../context.md) | Permanent Identity and Architecture (Source of Truth) |
| Snapshot | [context_<scope>_<date>.md](../contexts/context_<scope>_<date>.md) | Daily snapshot used for current session context |
| Foundational | [dev.md](../../../../../dev.md) | Permanent Development Commands and Status |

### Global Files (`core2/` monorepo root)
| Category | File | Source Command |
|---|---|---|
| Reports | [audit_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_core2_<date>.md) | `/wbAudit core2/` |
| Reports | [plan_core2_<date>.md](../../../../../../../../../../.wb/workflows/reports/<YYYY>/<MM>/<DD>/plans/plan_core2_<date>.md) | `/wbPlan core2/` |
| Tracks | [track_core2_<date>.md](../../../../../../../../../../.wb/workflows/tracks/<YYYY>/<MM>/<DD>/track_core2_<date>.md) | `/wbTrack core2/` |

<details>
  <summary>📂 Sub-Package: [Active Package Name]</summary>

| Category | File | Source Command |
|---|---|---|
| Reports | [audit_subpkg_<date>.md](../../../../../../../../../../apps/wb-core/subpkg/.wb/workflows/reports/<YYYY>/<MM>/<DD>/audits/audit_subpkg_<date>.md) | `/wbAudit` |

</details>
```
```
