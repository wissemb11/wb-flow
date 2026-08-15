# /wbBroadcast — Expert

## What `/wbBroadcast` architecturally is

A **release-communication emitter** that reads release/publish/deploy reports and generates multi-format announcement content. Optionally updates `VERSION_STATUS.md` with lifecycle proposals (PREVIEW / LTS / OBSOLETE). Does not post; human applies content to actual channels.

the agent's version calls this "automated Release Communications (RelComm)." The acronym is unnecessary; the mechanism is simple. What's actually interesting is the *multi-voice generation* — different platforms get different prompts tuned to different audience expectations, not one blob of text.

## Why the multi-voice design

Generic AI announcement tools produce one text and slap it on every channel. Result: LinkedIn tone on Twitter (too verbose), Twitter tone on GitHub (not informative enough), everything on a blog (not narrative enough).

`/wbBroadcast` generates:
- **LinkedIn**: 3-5 sentences, conversational, explains why.
- **X/Twitter**: 2-3 sentences, compressed, action link.
- **GitHub release**: structured sections (Highlights/Changes/Breaking/Credits).
- **Blog**: 3-paragraph narrative (what/why/what-to-do).

Each uses a different prompt internally. The outputs are drafts in four different voices for four different reader expectations.

## Three design decisions worth naming

### 1. Refusal on internal-only releases
Not every release deserves announcement. The command analyzes release-note content and refuses if the changes are user-invisible (build config, internal rename, dev tooling). This is correct — announcing every patch trains audiences to ignore announcements.

### 2. Lifecycle status as a first-class output
PREVIEW / LTS / OBSOLETE is metadata that consumers actually use to decide whether to adopt. The command proposes lifecycle changes based on release history (3+ months stable without breaking changes → LTS eligibility) but requires human confirmation. This turns lifecycle hygiene from "we should do this someday" into an actual workflow step.

### 3. Human-in-the-loop by design
The command explicitly does not post. Writing is delegated to AI; posting is not. This is the right boundary. AI auto-posting to public channels is a whole category of reputation risk; the command won't even optionally enable it.

## The "RelComm" framing, honestly

the agent's doc says the command "implements automated Release Communications (RelComm)" and that it ensures "version lifecycle metadata is consistent across the public-facing ecosystem."

Two things here:
- **Automation scope is real but narrow.** Automates *generation*, not *distribution*. Users still have to post.
- **Lifecycle metadata consistency is real but shallow.** The command updates `VERSION_STATUS.md` if told to. It doesn't cross-reference npm tags, GitHub release tags, or documentation site metadata. "Consistency across the public-facing ecosystem" overstates what the command actually enforces.

Trim the marketing: it's a good release-notes generator with a lifecycle-proposal side dish.

## Where the command leaks

1. **Voice authenticity.** AI-generated social posts sound like AI-generated social posts. Even with multi-voice tuning, subtle tells remain. Your actual voice has to come from the edit pass.

2. **Factual hallucination.** Features get described with specifics the AI infers rather than knows. Version numbers, exact behavior, API signatures — all need human verification before posting.

3. **No cross-channel coherence.** If you post LinkedIn today, then X tomorrow with slightly different claims, nothing reconciles the drift. The command produces four separate drafts; coherence is the user's responsibility.

4. **VERSION_STATUS.md is monorepo-local.** npm, GitHub, docs site all have their own "version status" concepts. Updating `VERSION_STATUS.md` doesn't update any of them. Users must propagate manually.

5. **No audience segmentation.** Enterprise customers and hobbyist devs get the same content. Fine for solo projects; insufficient for multi-segment marketing.

## The "did NOT generate" section as integrity

Same discipline as `/wbAudit`, `/wbClean`, etc. Explicit limits:
- No email newsletter copy.
- No video scripts.
- No Slack/Discord-channel-specific tone.
- No customer-segmented variants.

This prevents users from treating the output as comprehensive. The absent channels are named; you know to produce them separately.

What `wb-flow-docs`'s playbook gets wrong about `/wbBroadcast`: framing it as pure content generation ('write release notes'), when the real value is multi-format consistency: the same announcement rendered as social post, blog entry, and changelog from a single narrative input, with per-channel tone rules applied automatically.

## One-paragraph verdict

A release-communication emitter whose real contribution is *multi-voice generation* — different platforms get differently-shaped drafts. Correct in refusing on internal-only releases (attention preservation), in treating lifecycle status as first-class, and in hard-declining auto-posting (reputation protection). The "RelComm" framing from gemini overstates automation scope; generation is automated, distribution isn't. Weakest in voice authenticity, factual hallucination, cross-channel coherence, cross-platform metadata sync, and audience segmentation. Correct for solo-developer monorepo releases where you want starting drafts in under 30 seconds; wrong for any marketing operation that requires authoritative first-draft copy.

---
