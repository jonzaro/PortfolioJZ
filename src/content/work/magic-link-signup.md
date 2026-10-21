---
title: Passwordless signup across web, API and mobile app
card: Buyers had to invent a password on the website and remember it in the app. I'm replacing that with a magic link, and the security gate caught a real takeover path first.
summary: People who bought on the web had to set a password there, then remember it in the app. I designed and built a passwordless flow from checkout to first app launch, and the security review caught a real account-takeover path before any of it reached production.
client: Burn by Cara Loren
role: Lead developer · design and build
period: Oct 2026 – present
order: 6
status: in-progress
stack: [Firebase Auth, Prisma, Redis, Resend, AppsFlyer OneLink, Expo, Stripe]
stats:
  - value: 628
    label: Integration and unit tests passing at the API milestone
  - value: 1
    label: Account-takeover path caught in review, pre-production
  - value: 0
    label: Passwords to remember
panel:
  file: auth/consume-token.ts · simplified
  lines:
    - { kind: comment, text: "// Single-use, even when two taps arrive at once." }
    - { text: "const [row] = await db.$queryRaw`" }
    - { text: "  UPDATE login_tokens" }
    - { text: "     SET used_at = now()" }
    - { text: "   WHERE token_hash = ${sha256(token)}" }
    - { text: "     AND used_at IS NULL" }
    - { text: "     AND expires_at > now()" }
    - { text: "  RETURNING user_id`;" }
    - { text: "" }
    - { text: "if (!row) throw new AuthError('link_expired_or_used');" }
    - { kind: dim, text: "" }
    - { kind: ok, text: "✓ hashed at rest · rate-limited · 6-digit code fallback" }
---

## The problem

Most Burn members sign up and pay on the website, then use the iOS or Android app. The website made them create a password, which they then had to remember the first time they opened the app. That is friction in the worst place: between paying and the first workout.

## What I'm doing

**Designed it before building it.** I wrote a brief, a technical design and a gated roadmap, so the team could review the approach, the security model and the rollout plan before any code shipped.

**Built tokens that can't be replayed.** Login links carry a token that is stored only as a hash, is single-use, and expires. Consuming it is one conditional database update, so even two simultaneous taps can't both succeed. Every email also carries a 6-digit code as a fallback. Requests are rate-limited through Redis.

**Connected checkout to the app.** At checkout, the account is created server to server, and the user ID travels through Stripe to the subscription system, so the app recognizes a paid member on first launch. A deep link opens the app straight from the email (or sends you to the store first), and the app signs you in.

**Let the security gate do its job.** The design's security review found a real pre-account takeover: a way for someone to claim an account before its owner did. It was fixed in design, before any of it reached production. That is what the gate is for.

## Status

The API is in production. The app work is merged, and the public launch is gated on a go/no-go review. I'll update this page with results once the rollout is measured.

## What I'd tell another team

Write the threat model before the code. Fixing a security gap in a design document costs very little compared with fixing it in production.
