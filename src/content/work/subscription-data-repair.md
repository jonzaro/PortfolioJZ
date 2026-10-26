---
title: Repairing live subscription data, with an undo button
card: A backfill left subscription data double-counting paying users. I contained it, repaired it in production, and made every repair reversible.
summary: A data backfill left the subscription table quietly double-counting paying users. I contained it at the webhook, repaired production data in place, and built a journal so every repair could be undone.
client: Burn by Cara Loren
role: Lead developer
period: Aug – Sep 2026
order: 1
stack: [TypeScript, Prisma, PostgreSQL, Stripe webhooks, RevenueCat API, Vitest, Fly.io]
stats:
  - value: 14.9% → 6.1%
    label: Overstated active subscriptions after the first repair pass
  - value: 64 → 0
    label: Duplicate web-checkout subscription pairs
  - value: 0
    label: Errors across every production merge
quote:
  text: Jon’s ability to see the big picture led him to identify and architect and solve a real subscription reporting error. Having trust in our data being accurate helps us steer the boat.
  name: Michael Zaro
  role: Strategy and client relations, Burn
panel:
  file: webhooks/subscription-takeover.ts · simplified
  lines:
    - { kind: comment, text: "// Claim the orphaned row atomically. Two webhooks can race here." }
    - { text: "const claimed = await tx.subscription.updateMany({" }
    - { text: "  where: { id: orphan.id, externalId: PLACEHOLDER }," }
    - { text: "  data:  { externalId: event.subscriptionId }," }
    - { text: "});" }
    - { text: "" }
    - { kind: comment, text: "// Lost the race: the other webhook already owns it." }
    - { text: "if (claimed.count === 0) return findByExternalId(event.subscriptionId);" }
    - { text: "" }
    - { kind: comment, text: "// Every repair writes its inverse first." }
    - { text: "await journal.record({ before: orphan, after: claimed, runId });" }
    - { kind: dim, text: "" }
    - { kind: ok, text: "✓ 43 new tests · each fails against the old code" }
---

## The problem

Burn sells subscriptions on iOS, Android and the web, and the subscription table drives everything from paywall access to the team's growth numbers. An earlier migration (mine) had backfilled historical rows with placeholder IDs. Live webhooks from the billing provider looked rows up by the real ID, never found the backfilled one, and created a fresh row on every event. Separately, each web checkout fired two webhooks that raced each other into two rows.

Nothing crashed. The numbers just got a little more wrong every day.

This is a different problem from the [Zapier replacement](/work/zapier-to-webhooks/). That project moved signup and payment data into our own API and retired a stale `paid` flag. This one came a month later: bad rows that had already reached the subscription table, which I had to find, merge and repair in production without losing history.

## What I did

**Contained it at the source first.** I changed the webhook path so it takes over the orphaned row with a single conditional update. The database decides who wins the race; the code doesn't have to. I wrote a probe script to reproduce the race against the real code path and checked that every new test failed against the broken version before I trusted it.

**Tested the repair key before using it.** The obvious join key between the two billing systems looked right. I checked it against 279 pairs I already knew were correct, and it was wrong for 250 of them. The repair used the billing provider's API as the source of truth instead.

**Repaired production in place.** Merges ran one transaction per subscription, so a failure could only ever affect one row, and event history was preserved rather than deleted.

**Made the remaining repairs reversible.** Before the larger cleanup runs, I built a write-ahead mutation journal: every change records how to undo itself, with scoped verify and undo tools. I drilled it in production (execute, verify, undo, redo) before relying on it.

**Checked the deploy, not the merge.** Midway through, I caught that a fix had been merged but never deployed. I added the running revision to the health endpoint so "is it live?" became a one-line check.

## The outcome

The overstatement of active subscriptions fell from 14.9% to 6.1% on the first pass. The web-checkout duplicates went from 64 pairs to zero, with zero errors and clean integrity checks. Stale past-due records dropped by 90% once the fix was verified in production. And the large repairs that followed carried no unrecoverable risk, because every one could be reversed.

## What I'd tell another team

A backfill and a live write path that share a unique key have to derive that key the same way. Specify it for both paths and write a test that runs the backfill and then delivers a live event for a backfilled record.
