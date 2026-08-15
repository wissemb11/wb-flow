# /wbRelease — ELI5

Inside the monorepo, packages refer to each other by "whatever version is on my laptop right now" (that's `workspace:*`). This is fine while you work.

But when you publish to npm, other people's laptops don't have your local packages. Their references have to point to real version numbers.

`/wbRelease` does the translation: it figures out which packages changed, bumps their versions (1.4.2 → 1.4.3), and rewrites the cross-references so that once you publish, it all works for outside users.

After you've published, `/wbRelease --restore` flips the references back to `workspace:*` so *your* development keeps working normally.

Rule: run it on the whole monorepo (`/wbRelease core2/`), not on one package.

---
