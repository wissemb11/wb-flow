# /wbGit — Practical Guide

## Step-by-Step Walkthrough

### Scenario: You've made changes to three files

```bash
# 1. Stage your changes
git add src/components/Button.tsx src/hooks/useAuth.ts src/utils/helpers.ts

# 2. Generate a commit message
/wbGit
# Output: feat(components): add loading state to Button
#         refactor(hooks): extract useAuth from LoginPage
#         feat(utils): add debounce helper

# 3. Review the message, then commit manually
git commit -m "feat(components): add loading state to Button"
```

### Practical Tips

- Stage related changes together for better scope detection
- Use `--review` to see the diff summary alongside the proposed message
- For multi-module changes, run `/wbGit` once per module for cleaner commit history
- The generated message is a suggestion — edit it if the scope or type is wrong


### Advanced Example: Multi-module Changes

```bash
# Stage changes from one module first
git add src/api/
/wbGit --review
# Output: feat(api): add user search endpoint

# Then commit before staging the next module
git commit -m "feat(api): add user search endpoint"

# Stage the second module
git add src/components/
/wbGit --review  
# Output: feat(components): add user search UI
```


> **Pro tip:** The `--review` flag is your safety net. Use it for the first week until you trust the generated messages.

---

← [Home](../../README.md) · [Commands](../../README.md#the-command-catalog) · [Install](../../../README.md) | [@wbc-ui2/wb-flow on npm](https://www.npmjs.com/package/@wbc-ui2/wb-flow) · [flow.wbc-ui.com](https://flow.wbc-ui.com) · [wi-bg.com](https://www.wi-bg.com)
