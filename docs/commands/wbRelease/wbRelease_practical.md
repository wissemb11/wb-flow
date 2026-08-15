# /wbRelease — Practical

## Four forms

```
/wbRelease core2/ # standard flow
/wbRelease core2/ --dry-run # preview, no changes
/wbRelease core2/ --restore # after /wbPublish succeeds
/wbRelease core2/ --prerelease=beta # 1.5.0-beta.0 style
```

Always `core2/` as the target. Never a sub-package.

## The full release workflow

```
/wbAudit <pkg> # must pass
/wbTest <pkg> # must pass
/wbRelease core2/ --dry-run # preview
/wbRelease core2/ # real release (unpicks workspace:)
/wbPublish <pkg> # actually push to npm
/wbRelease core2/ --restore # restore workspace: protocols
```

Each step checks the previous. Skipping `--restore` is the most common mistake — your next `pnpm install` will start fetching from npm instead of using local packages.

## What triggers a version bump

The AI uses conventional commits:
- `fix:` → patch (1.4.2 → 1.4.3)
- `feat:` → minor (1.4.3 → 1.5.0)
- `feat!:` or `BREAKING CHANGE:` in commit body → major (1.5.0 → 2.0.0)

If your commits don't use conventional prefixes, the AI will ask. Don't let it guess.

## When `/wbRelease` refuses

- `/wbTest` report shows failures → fix tests first.
- `/wbAudit` report has BLOCKER findings → fix blockers first.
- No packages have changes since last release → nothing to release.
- Git working tree is dirty → commit or stash first.
- Current branch is not the one configured for releases → switch or override.

Don't bypass the refusal. Each one represents a real failure mode.

## The `--restore` discipline

**Always run `--restore` after `/wbPublish` succeeds.** Not doing this means:
- Next `pnpm install` fetches newly-published versions from npm.
- Your local dev stops using live workspace code.
- You'll be confused when a local code change doesn't show up in a downstream package.

Consider adding `--restore` to your end-of-day routine even if you're not sure you published — it's a no-op if protocols are already restored.

## When /wbRelease is *not* the right command

- App (not package) → `/wbDeploy`.
- Just want to publish without bumping → edit version manually, use `/wbPublish`.
- Just want to commit changes → `git commit`. Release is for consumer-visible versions.
- Pre-release experimental version → `--prerelease=...` flag, or manual `npm publish --tag=canary`.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Long-form and short-form are equivalent — `/wbRelease --execute` and `/wbRelease -e` produce the same behavior.

| Long form | Shortcut |
|---|---|
| `--dry-run` | `-d` |
| `--prerelease` | `-p` |
| `--restore` | `-r` |
| `--tag` | `-t` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---
