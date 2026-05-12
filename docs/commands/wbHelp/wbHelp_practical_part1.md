# /wbHelp — Practical: Getting Help Effectively

> This walkthrough teaches you how to use `/wbHelp` to quickly find the right command, understand its flags, and discover related workflows.

---

## When to Use `/wbHelp`

| Situation | Command |
|---|---|
| "What commands are available?" | `/wbHelp` |
| "How do I use /wbAudit?" | `/wbHelp wbAudit` |
| "What flags does /wbPlan accept?" | `/wbHelp wbPlan` or `/wbPlan --help` |
| "What should I run on this package?" | `/wbHelp wbAudit packages/wb-core` (contextual) |

---

## The Three Help Modes

### Mode 1: Catalog (no arguments)

```bash
/wbHelp
```

Returns the full command list grouped by role. Use this when you're new to wb-flow or can't remember a command name.

**Pro tip:** The catalog is generated from `wb_commands_reference.json`. If a command is missing, it hasn't been registered yet.

### Mode 2: Command Help (one argument)

```bash
/wbHelp wbClean
```

Returns detailed help for one command: syntax, flags, examples, and related commands. Use this when you know which command you need but want to check the flags.

**Pro tip:** You can also use `--help` directly on any command:
```bash
/wbClean src/ --help    # same as /wbHelp wbClean
```

### Mode 3: Contextual Help (command + scope)

```bash
/wbHelp wbAudit packages/wb-core
```

Returns command help enriched with scope-specific suggestions. Use this when you want the AI to recommend the best flags and options for your specific package.

---

## Common Patterns

### Pattern 1: Discovery Workflow

```bash
/wbHelp                          # browse the catalog
/wbHelp wbAudit                  # learn about /wbAudit
/wbAudit packages/wb-core        # run it
```

### Pattern 2: Quick Flag Lookup

```bash
/wbPlan --help                   # check flags without leaving the flow
/wbPlan packages/wb-core --resume  # use the flag you found
```

### Pattern 3: Troubleshooting

```bash
/wbHelp wbWork                   # check the expected input format
# → Discovers that /wbWork needs a plan file, not a folder
/wbWork plan_wb-core_20260511.md --task=3  # correct invocation
```

---

## Tips

1. **`--help` works everywhere** — you never need to switch to `/wbHelp` explicitly.
2. **Case doesn't matter** — `/wbHelp wbaudit` works the same as `/wbHelp wbAudit`.
3. **Contextual help is optional** — if you don't provide a scope, you get generic help.
4. **Help is always safe** — it never reads your code, writes files, or modifies state.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)
