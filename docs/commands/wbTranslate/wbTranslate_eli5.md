# /wbTranslate — ELI5

Your component has English text in it: "Sign In", "Loading...", "Profile". Hardcoded.

`/wbTranslate` does two things:
1. Replaces those strings with `$t('navbar.signIn')` style i18n keys.
2. Writes the actual translations into `en.json`, `fr.json`, `ar.json`.

Now your component renders in whichever language the user picked.

**Important:** AI translations are drafts. Get a native speaker (or yourself if you speak the language) to review before shipping. AI is decent but not perfect.

Run it once per component, after the component is otherwise done. Don't translate while the UI is still changing.

---
