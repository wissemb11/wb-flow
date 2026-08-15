# /wbAudit — ELI5

A harsh friend reading your code and telling you what's wrong.

Most AI, when asked to review code, says nice things. It's trained to be helpful, which usually means encouraging. `/wbAudit` flips that — it's the AI forced to act like a grumpy senior engineer who's seen too much bad code.

You point it at a folder (like a package) or a single file. It reads the code and produces a report: a score, a list of problems ranked by severity, and concrete fixes.

**Rule:** if the first audit says "looks good," ask for a harsher one. Be explicit: *"pretend a paying customer is about to complain. What would they say?"* The real findings are there, but you have to ask for them.

Run it before shipping, not before starting. Audit the finished thing.

---
