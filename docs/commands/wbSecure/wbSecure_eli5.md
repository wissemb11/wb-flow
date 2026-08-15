# /wbSecure — ELI5

You're about to put your code on the internet. Before you do, you want to make sure attackers can't break in.

`/wbSecure` looks for the obvious holes:
- Are there passwords or API keys hardcoded in the code?
- Can someone inject HTML/JavaScript through your forms?
- Are your dependencies known-broken?
- Are tier checks (Pro features) actually enforced?

Output is **CRITICAL** (fix now), **WARNING** (fix soon), **SAFE** (verified OK).

CRITICAL findings block `/wbDeploy`. They're not negotiable.

This is a *client-side scan*. It doesn't replace real security work — server-side checks, penetration testing, real auditors. It catches the obvious stuff before it ships.

---
