---
title: Replacing a frozen Zapier pipeline with first-party webhooks
card: Signup and payment data ran through Zapier, and the queue had been frozen for two months. I moved it into the API with signed webhooks and tests.
summary: Signups, payments and cancellations flowed through Zapier into Airtable, and the queue had silently frozen with 700+ tasks stuck. I rebuilt the pipeline as signed webhooks in the API we already ran.
client: Burn by Cara Loren
role: Lead developer
period: May – Jul 2026
order: 2
stack: [Express, Prisma, PostgreSQL, Stripe, RevenueCat, Klaviyo, Doppler, Fly.io]
stats:
  - value: 700+
    label: Stuck Zapier tasks replaced by direct webhooks
  - value: ~40 pts
    label: Conversion inflation removed by retiring a stale paid flag
  - value: 63
    label: New tests across the cutover and follow-up
panel:
  file: routes/webhooks/stripe.ts · simplified
  lines:
    - { kind: comment, text: "// Signature checks need the exact bytes Stripe sent." }
    - { text: "router.post('/webhooks/stripe'," }
    - { text: "  express.raw({ type: 'application/json' })," }
    - { text: "  async (req, res) => {" }
    - { text: "    const event = stripe.webhooks.constructEvent(" }
    - { text: "      req.body, req.headers['stripe-signature'], secret);" }
    - { text: "" }
    - { text: "    await handlers[event.type]?.(event);" }
    - { text: "    res.sendStatus(200);" }
    - { text: "  });" }
    - { kind: dim, text: "" }
    - { kind: ok, text: "✓ 5 lifecycle events · signature-verified · idempotent" }
---

## The problem

Every signup, payment and cancellation on Burn's web checkout went through a chain of Zapier zaps into Airtable, and from there into email marketing and reporting. Since March, the Zapier queue had been frozen. More than 700 tasks were sitting unprocessed, which meant the marketing funnel was blind and nobody had been told.

The original sprint plan was to replace it with a third database and webhooks hosted on the WordPress site.

This case study is about replacing that broken pipeline. The [subscription data repair](/work/subscription-data-repair/) came later and is a separate problem: duplicate rows inside the new subscription table, caused by a backfill, and repaired in production.

## What I did

**Reworked the plan before writing code.** We already ran a Postgres database and an API server with monitoring, tests and a deploy pipeline. Adding a second database and putting revenue-critical webhooks on WordPress would have meant two more things to secure and keep alive. I moved the work into the API.

**Built signed, tested endpoints.** A signup webhook, plus a Stripe webhook covering five subscription lifecycle events. Stripe signature verification needs the raw request body, so the route bypasses the JSON parser. I also adapted the code to field changes in the latest Stripe SDK.

**Connected the rest of the stack.** Billing events from RevenueCat now forward to Klaviyo for lifecycle email. I added a proper `Subscription` model and UTM attribution fields so marketing could see which campaigns produced paying users. Secrets moved into Doppler, and the production cutover was staged and verified.

**Fixed the metric that was hiding underneath.** Two months later I retired a `paid` flag on the user record that was set once and never reset. It had been inflating conversion metrics by about 40 percentage points. Billing webhooks became the single source of truth on every platform.

## The outcome

The frozen pipeline was replaced end to end, with 20 tests on the cutover and 43 more on the follow-up. Funnel data flowed again, attribution became possible, and the team's conversion numbers stopped counting people who had only ever started a trial.

## What I'd tell another team

No-code glue is great until it carries revenue data. When it does, it needs the same monitoring as your API, or it should move into your API.
