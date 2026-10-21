---
title: Moving a live checkout site off WordPress, verified with real purchases
card: I ran the cutover of the signup and checkout site from WordPress to Vercel, and proved purchase, app access and cancellation worked with real money.
summary: Burn's signup and checkout site ran on an aging WordPress install. The marketing team built a new Astro site. I owned the cutover (DNS, secrets, checkout and tracking) and verified it with real purchases.
client: Burn by Cara Loren
role: Lead developer · cutover and infrastructure
period: Sep – Oct 2026
order: 5
stack: [Astro, Vercel, Stripe Checkout, Cloud DNS, Doppler, PostHog, nginx]
stats:
  - value: 17 / 17
    label: Production paths verified on cutover day
  - value: 3
    label: Live checkout bugs found and fixed during cutover
  - value: 1
    label: Real purchase, login and cancel, verified end to end
panel:
  file: scripts/verify-cutover.sh · output, simplified
  lines:
    - { kind: dim, text: "$ ./verify-cutover.sh getburnapp.com" }
    - { kind: ok, text: "200  /                      apex served by Vercel" }
    - { kind: ok, text: "308  www → apex             canonical redirect" }
    - { kind: ok, text: "200  /checkout              live Stripe key" }
    - { kind: ok, text: "302  /thank-you             → production host" }
    - { kind: ok, text: "200  wp./cancel             legacy, still served" }
    - { kind: ok, text: "200  wp./webhooks/*         legacy, still served" }
    - { kind: dim, text: "     … 11 more" }
    - { kind: dim, text: "" }
    - { kind: ok, text: "✓ 17/17 · purchase → app login → cancel verified" }
---

## The problem

The site where people sign up and pay for Burn ran on WordPress. The marketing team designed and built a new Astro site on Vercel. Someone had to move a live checkout to it without dropping sales, breaking app logins, or losing tracking. That was my part.

## What I did

**Staged the cutover.** I didn't flip everything at once. Vercel took over the domain while WordPress moved behind it on a separate hostname, still serving the two things that couldn't move yet: the cancellation page and two webhooks. That let the new site go live without a big-bang migration.

**Moved the infrastructure.** I changed DNS, moved the site's secrets into Doppler with automatic sync to Vercel, and corrected the primary domain and search-indexing settings so search engines index the new site under one canonical domain.

**Found and fixed the checkout bugs.** Three issues surfaced in live checks: production was running on a Stripe test key, some price lookup keys were missing, and a framework setting was sending the post-purchase redirect to `localhost`. I fixed each one and audited the roughly 40-minute window in which checkout had been on the test key.

**Fixed tracking that ad blockers were eating.** I added a first-party analytics proxy, so client events stopped disappearing for users with ad blockers.

**Verified with real money.** I made a real purchase, logged into the app with it, and cancelled it, end to end on production. I also hardened the legacy WordPress install before retiring it.

## The outcome

Seventeen production paths were checked and passing on cutover day. The full money path (buy, get access, cancel) was verified with a real transaction rather than a test card. The team can now change the site without touching WordPress.

## What I'd tell another team

Test cards prove your code works. A real purchase proves your configuration works, and configuration is what breaks during a migration.
