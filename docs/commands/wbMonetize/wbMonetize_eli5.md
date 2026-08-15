# /wbMonetize — ELI5

Adding the Free/Pro/Dev split to a package — once.

The AI reads the package, decides which features should be paid, and wires up:
- `__WBC_DEV__` flags
- `isWb<Pkg>Pro` getters
- license cookies
- a fallback for free users

Then it stamps `package.json::wbMonetize` so future runs know it's already bootstrapped.

Re-running it on the same package = maintenance only. It will *never* move a feature between Free and Pro automatically. That's your call.

---
