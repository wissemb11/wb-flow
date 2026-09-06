# /wbSetup — Practical

## When to run it

- **New package** — run immediately after `mkdir`, before writing any code.
- **Acquired package** — if you inherited something that never had `/wbSetup`, run it now.
- **Big rename/restructure** — if you moved the folder, re-run so context.md reflects the new reality.

Do NOT run it "to refresh" an existing, working package. That's `/wbContext`, not `/wbSetup`. Running `/wbSetup` on a package that already has a tuned `dev.md` risks overwriting hand-authored rules.

## The three forms

```
/wbSetup <pkg-path> # standard: context.md + dev.md
/wbSetup <pkg-path> --focus="<subsystem>" # + focused deep-dive file
/wbSetup core2/ --scope=global # monorepo_rules.md only
```

## What to check after it runs

1. Open `context.md` — does it actually match what the package is? Fix misreads.
2. Open `dev.md` — every rule should be a *refusal* ("never X", "do not Y"). Prose descriptions = rewrite.
3. Check the `dist/` vs `dist-dev/` rule is there if the package publishes. If not, add it.
4. If this is wb-press (Vue 2) — check that `dev.md` forbids Vue 3 syntax.

## The mistake to avoid

Running `/wbSetup` and not reading the output. The AI's inferences are fallible. A 2-minute read of `dev.md` catches 90% of mistaken rules before they cause damage.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Documented shortcuts are listed below.

| Long form | Shortcut |
|---|---|
| `--focus` | `-f` |
| `--scope` | `-s` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---
