# /wbPublish — Practical

## Two forms

```
/wbPublish <pkg> # build + publish to npm
/wbPublish <pkg> --dry-run # show what would publish, don't push
```

## When to run

Only after `/wbRelease core2/` has run in the same cycle. If `/wbRelease` wasn't run, `/wbPublish` refuses.

## The pre-check the AI does automatically

1. Recent `/wbRelease` report exists.
2. `package.json` version matches release report version.
3. `workspace:*` protocols already unpicked.
4. `dist/` vs `dist-dev/` aligned (wbc-ui2 footgun).
5. Version not already on npm registry.

If any fail, you get a refusal with a specific fix.

## After publish

**Always** run `/wbRelease core2/ --restore`. Skipping leaves your dev tree with pinned versions instead of `workspace:*`, which breaks local package linking. Your next `pnpm install` will fetch from npm instead of using the monorepo's live copies.

## When publish fails

Auth failures, rate limits, registry outages. The AI's recovery output gives specific options. Do *not* run a fresh `/wbRelease` — version is already bumped. Fix the underlying issue and retry the `/wbPublish`, or abandon with `/wbRelease --restore` (but the version bump stays in git).

## When /wbPublish is not the right command

- App → `/wbDeploy`.
- Re-publish same version → `npm publish` directly (but check registry first).
- Pre-release tag (`@beta`, `@canary`) → `/wbRelease --prerelease=<tag>` first, then `/wbPublish`.
- Quick test → don't publish. Use `pnpm link` or local tarball install.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Long-form and short-form are equivalent — `/wbPublish --execute` and `/wbPublish -e` produce the same behavior.

| Long form | Shortcut |
|---|---|
| `--all` | `-A` |
| `--dry-run` | `-d` |
| `--prerelease` | `-p` |
| `--restore` | `-r` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---
