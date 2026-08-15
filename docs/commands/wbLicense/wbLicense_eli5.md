# /wbLicense — ELI5

Some features in your packages are for paying users (Pro tier). Others are free.

`/wbLicense` does two things:
- Point it at a **file** → it adds a "is this user Pro?" check around the premium code.
- Point it at a **folder** → it reports: did any Pro feature accidentally leak out where a Free user can reach it?

The gate it uses is `__WBC_PRO__`. Set by the build. Free if missing or false, Pro if true.

Important: this is a client-side check. Someone with DevTools can flip the flag. The goal is *convenience barrier*, not security. If you need real security, use `/wbSecure` and a server-side check.

---
