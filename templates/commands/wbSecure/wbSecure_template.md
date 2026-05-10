# /wbSecure: Execution Template


<!-- HELP_GATE_START -->
## Help intercept (handle FIRST — before any other action)

**If `$ARGUMENTS` contains `--help`, `-h`, or `--h`** (case-insensitive, anywhere in the args), DO NOT execute the command's normal procedure. Instead:

1. Output the **HELP BLOCK** below verbatim (rendered as markdown).
2. Stop. Do not perform any file reads, writes, or other tool calls.
3. Do not generate any reports under `.wb/workflows/reports/`.

Otherwise, ignore this section and proceed to the rest of the template.

### HELP BLOCK — `/wbSecure`

## Two forms

```
/wbSecure <target>                       # full security scan
/wbSecure <target> --focus="<area>"      # narrowed (e.g., auth, xss, deps)
```

## When to run

- **Before `/wbDeploy`** of any user-facing app. Mandatory if the app handles user input.
- **Before `/wbPublish`** of a package that handles untrusted input.
- **After dependency updates** — `npm update` can introduce vulnerable transitive deps.
- **Periodically** (monthly) on production apps.
- **After any security-adjacent code change** — auth, sessions, input handling, anything user-controlled.

## When *not* to run

- On a feature branch you'll throw away.
- Mid-development before the surface is stable.
- As a substitute for proper backend security (server-side validation, real pentests).
- Without server-side equivalent — `/wbSecure` only checks client; real security is server.

## Reading the output

Three severity levels:

- **🔴 CRITICAL** — fix before any further deploy. Blocks `/wbDeploy`.
- **🟡 WARNING** — fix soon. Doesn't block deploy but should be tracked.
- **🟢 SAFE** — verified clean.

CRITICAL findings include immediate action items (revoke this token NOW, sanitize this v-html before next deploy).

## The integration with /wbDeploy

`/wbDeploy` reads the latest `/wbSecure` report and refuses if CRITICAL findings exist. This is automatic. To override (rare, dangerous), you'd need to run `/wbDeploy --force-past-security`, which requires explicit user override.

WARNING findings don't block. They show in the deploy preview as advisory.

## What /wbSecure cannot detect

- **Server-side vulnerabilities** — out of scope; client scan only.
- **Logic bugs that allow privilege escalation** — these need domain understanding.
- **Supply-chain attacks** — `npm audit` is the right tool.
- **Runtime tampering** — DevTools can flip flags; client gating is convenience, not security.
- **Zero-days not yet in CVE databases** — the scanner only knows public vulnerabilities.
- **Authentication design flaws** — needs human security review.

Every report names these limits in its "did NOT check" section.

## When /wbSecure is the wrong command

- Generic code quality → `/wbAudit`.
- Tier-gate consistency → `/wbLicense`.
- Dead code / leftovers → `/wbClean`.
- Pure dep CVE check → `npm audit` directly.

`/wbSecure` answers: *"can this be exploited?"* Specifically.

## The mistake to avoid

**Treating `/wbSecure` SAFE as "secure."** A SAFE result means: no obvious findings under the scanner's checklist. It does not mean: nothing is wrong. Real-world security requires human judgment, threat modeling, and ongoing pentests. `/wbSecure` is the *cheap* layer of security work, not the *complete* one.

> For deeper reading: [`docs_claude/commands/wbSecure/wbSecure_practical_claude.md`](../../docs/docs_claude/commands/wbSecure/wbSecure_practical_claude.md) (or the `_eli5_`, `_expert_`, `_examples_` siblings).

<!-- FLAGS_TABLE_START -->
## Flags & shortcuts

Both forms are equivalent — pass either:

| Long form | Shortcut |
|---|---|
| `--focus` | `-f` |
| `--force-past-security` | `-F` |

`-h` / `--help` / `--h` (any command) prints this help block instead of executing.
## Self-correct mode (dual-mode invocation)

```
/wbSecure <scope_folder>           # normal mode — produce a fresh output file
/wbSecure <previous_output_file>   # self-correct mode — verify & repair the file in place
```

When the first arg is an existing output file from a prior `/wbSecure` run (detected by its first H1 — see this template's **Detection** section), the command runs in **verify-and-repair** mode: gap-fills missing fields, normalizes links, ticks done/valid checkboxes whose reports exist, never rewrites authored content. See [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

<!-- FLAGS_TABLE_END -->
<!-- HELP_GATE_END -->

<!-- FLAG_NORMALIZE_START -->
## Flag normalization (apply BEFORE parsing args)

Before processing `$ARGUMENTS`, normalize these short-form flags to their long equivalents:

- `-f` → `--focus`
- `-F` → `--force-past-security`

The rest of this template documents only the long forms; the substitution above is the only place short forms are mentioned.
<!-- FLAG_NORMALIZE_END -->



**ROLE:** The Guard
**TARGET:** The provided component or package path.
**Read first:** [`../_shared/output_conventions.md`](../_shared/output_conventions.md) — applies to the security report (relative links, full-syntax commands, self-correct mode).

---

## ━━━ DETECTION (Self-Correct Mode) ━━━

Trigger self-correct when the input file's first H1 matches:
`# Security: <scope> — <YYYY-MM-DD>` *(or the legacy `# Security Entry #N` header).*

Behavior is defined in [`../_shared/output_conventions.md`](../_shared/output_conventions.md) §3.

Security-specific gap-fills:

- Plain-text vulnerable file paths → relative markdown links per §1.
- Bare `/wbAudit` / `/wbTest` cited → full-syntax form per §2.
- Missing CVE / severity classification → infer from `npm audit` output if available.

---

## ━━━ OBJECTIVE ━━━
Your job is to act as a Red Team security scanner. You must actively hunt for vulnerabilities in the target code before it is deployed to production.

## ━━━ PHASE 1: VULNERABILITY SCAN ━━━
1. Scan the target files specifically looking for:
   - Hardcoded secrets or API keys.
   - Cross-Site Scripting (XSS) vulnerabilities (e.g., raw HTML injection in Vue).
   - Insecure direct object references or missing tier checks (cross-referencing `monorepo_rules.md`).

## ━━━ PHASE 2: DEPENDENCY AUDIT ━━━
1. Check the `package.json` for notoriously insecure or outdated libraries.

## ━━━ PHASE 3: REPORTING ━━━
Generate a security report: `.wb/workflows/reports/<YYYY>/<MM>/<DD>/security/security_<target>_<YYYYMMDD>.md` (create-or-append; tag your entry `*(ModelName — HH:MM)*`). Categorize findings as [CRITICAL], [WARNING], or [SAFE]. Apply output_conventions.md §1 (relative links for every vulnerable file) and §2 (full-syntax for any /wb* command cited).

End the report with:

## 🧭 What's Next?

Run `/wbNext <target_folder>` to get a current, ranked list of next actions (typically `/wbPlan <target> "fix critical findings"` for [CRITICAL] items).
