# /wbStopTrack — ELI5

## What is `/wbStopTrack`?

When you start a work session, `/wbTrack` opens a journal and starts recording everything you do. When you're done for the day, `/wbStopTrack` closes that journal, writes a summary on the last page, and puts it on the shelf.

After that, the journal is sealed — nobody can add more entries to it. The next time you start working, `/wbTrack` will open a brand new journal.

## Why does it exist?

Without a clear "session over" signal, your session data becomes a long, unbroken stream. Yesterday's work bleeds into today's work. The standup can't tell what's finished from what's in progress. Cost estimates span multiple days with no boundaries.

`/wbStopTrack` is the full stop at the end of a sentence. It makes session data readable and actionable.

## Quick Example

```bash
/wbStopTrack .
```

That's it. The tracker gets sealed, a summary is generated, and the file is archived. Tomorrow starts clean.

## When to Use It

- End of work day — the most common use case
- Before switching to a completely different project
- Before a release — separate "dev work" from "release activities"
- When another person or agent will continue the work

## When NOT to Use It

- Mid-session when you'll resume in an hour → just leave the tracker open
- As a way to "reset" the tracker → that's not what this does; it archives, not deletes
- Before running `/wbLog` → log first, then stop tracking

## What Happens If You Forget?

Nothing breaks. The tracker stays open, and the next day's commands append to it. But the session boundary is lost, which makes the standup less useful and cost tracking less accurate.

The best practice is to make `/wbStopTrack` the last command of every work day.
