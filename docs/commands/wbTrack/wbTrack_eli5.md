# /wbTrack: ELI5 👶

## The Shared Recording

You know how in a multiplayer game, you can press "Record" and everyone's actions get saved to the same replay file? Each player's moves are tagged with their name.

`/wbTrack` is that shared replay for your AI sessions.

**Without recording:**
```
/wbTest wb-core → test report created ✅
```

**With recording (first AI today):**
```
/wbTrack wb-core → creates today's shared session file 🔴
/wbTest wb-core → test report ✅ + commentary in session file 📝 *(tagged: the agent — 14:30)*
/wbStopTrack → this AI stops recording, file stays open
```

**Another AI joins later:**
```
/wbTrack wb-core → file exists → joins the session 🔵
/wbAudit wb-core → audit report ✅ + commentary in SAME file 📝 *(tagged: the agent — 18:00)*
/wbStopTrack → this AI stops recording
```

Same results. Extra documentation. **One shared file**, not one per AI.

## Why shared?

Because tomorrow, you (or another AI) can read ONE session file and understand what ALL models did — not just what happened, but WHY, and what EACH model recommends next. Instead of reading 4 separate files, you read one collaborative journal.

## Scoping

- `/wbTrack packages/wb-core` → shared session for wb-core
- `/wbTrack` → shared session for the whole monorepo
- First AI today **creates** the file, later AIs **append** to it
- Different scopes = different files (that's fine)

---
