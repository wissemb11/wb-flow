# /wbLicense — Practical

## Two modes

```
/wbLicense <file> # inject __WBC_PRO__ gate + emit pro-required event
/wbLicense <folder> # audit package for tier leaks and pattern drift
```

## When to run each

**File mode:** immediately after shipping a new premium feature. Before `/wbGit`. Before any consumer imports the unguarded export.

**Folder mode:** periodically (monthly is fine) and always before `/wbRelease` on packages that have Pro features.

## The gate pattern this project uses

```js
if (typeof __WBC_PRO__ === 'undefined' || !__WBC_PRO__) {
 this.$emit('pro-required', { feature: '<name>' });
 return;
}
// premium logic here
```

Always `typeof` check first — `__WBC_PRO__` is undefined in dev without the define plugin, and ReferenceError kills the flow. The `pro-required` event is the project's convention for surfacing upgrade CTAs to the parent.

If you find a different pattern in existing code (global `window.__WBC_PRO__`, env var `VITE_WBC_PRO`, silent fallback), it's drift. Audit mode flags this.

## The security caveat

`__WBC_PRO__` is **client-side**. Anyone with DevTools can flip it. This is by design — the wbc-ui2 model is:

- **Client gate** (`__WBC_PRO__`) = convenience barrier. Stops honest users from wandering into Pro features by accident.
- **Server gate** (in your API) = actual security. Stops adversarial users.

`/wbLicense` handles the first. `/wbSecure` + your backend handle the second. Don't confuse them.

## Reading the audit output

Three finding classes, ranked:

- **LEAK** = Pro code runs for Free users. High priority.
- **INCONSISTENT** = gate works but pattern differs from convention. Medium priority.
- **OK** = correctly gated. Just reassurance.

Every audit also names what it didn't check (notably: runtime bypass, server-side enforcement, business logic).

## The one mistake to avoid

**Treating `/wbLicense` as security.** It's not. If someone bypasses the gate and accesses a Pro feature, the worst case should be: they use a nice-to-have for free. The *data* should never be at risk because the server should enforce the same tier check independently. If your Pro feature leaks sensitive data when the client gate is bypassed, the feature is designed wrong, not the gate.

## When /wbLicense is the wrong command

- Pure security / vulnerability scan → `/wbSecure`.
- Generic code quality review → `/wbAudit`.
- Finding leaks in existing ungated code you haven't tier-decided yet → `/wbVision` first (what's Pro?), then `/wbLicense`.

<!-- FLAGS_SHORTCUTS_START -->
## Flags & shortcuts

Long-form and short-form are equivalent — `/wbLicense --execute` and `/wbLicense -e` produce the same behavior.

| Long form | Shortcut |
|---|---|
| `--scope` | `-s` |

`-h`, `--h`, and `--help` are accepted on **every** `/wb*` command and print the manual instead of executing.
<!-- FLAGS_SHORTCUTS_END -->

---
