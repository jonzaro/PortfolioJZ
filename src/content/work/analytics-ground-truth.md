---
title: The activation metric was wrong. I rebuilt analytics on ground truth.
card: The team was steering by an activation threshold and trial counts that were both overstated. I re-checked them against billing data and rebuilt the metrics.
summary: The team's headline activation metric, "3 workouts means 80% convert," was guiding push strategy and trial length. It was built on a broken field. I re-checked it against billing data, found trials double-counted too, and rebuilt the metrics on ground truth.
client: Burn by Cara Loren
role: Lead developer
period: May – Aug 2026
order: 4
stack: [PostHog, RevenueCat API, SQL, React Native, TypeScript]
stats:
  - value: −33 pts
    label: Correction to the headline activation metric
  - value: ~30%
    label: Overstatement in reported trial volume
  - value: 67%
    label: Onboarding drop-off found on a single step, then removed
panel:
  file: analytics/identity.ts · simplified
  lines:
    - { kind: comment, text: "// Web trials were counted by email in one system," }
    - { kind: comment, text: "// by UUID in the other, so the overlap was invisible." }
    - { text: "posthog.identify(user.id, { email: user.email });" }
    - { text: "" }
    - { kind: comment, text: "// Logout must reset, or the next user inherits this ID." }
    - { text: "onSignOut(() => posthog.reset());" }
    - { text: "" }
    - { kind: del, text: "track('WorkoutComplete')" }
    - { kind: add, text: "track('workout_completed', { program_id, day })" }
    - { kind: dim, text: "" }
    - { kind: ok, text: "✓ one identity per person · one event per real occurrence" }
---

## The problem

Burn's team made product decisions on a simple rule: users who finish three workouts convert to paid at 80%. It shaped push notifications, trial length and how the team talked about engagement. Trial counts fed the same dashboards.

Both numbers came from data that didn't hold up.

## What I did

**Re-checked the metric person by person.** I re-verified every user in the cohort against actual billing entitlements instead of the database field the original analysis used. That field had been set when someone started a trial and never reset.

The real number: three workouts converts at 46.7%, not 80%. And the curve has no cliff at three; it keeps climbing, reaching 80% only at seven or more workouts. The bigger finding was that 70% of users never finished a first workout at all. The real problem was getting people started, not getting them to three.

**Found trials counted twice.** Web trials were being recorded twice, once from Stripe and once from RevenueCat. Each system identified the person differently (email in one, a UUID in the other), so the overlap was invisible in any single dashboard. Reported trial volume was roughly 30% too high. I also showed that trial-to-paid conversion couldn't be measured correctly with the existing tracking, and specified what would fix it.

**Cleaned up event tracking.** I removed duplicate events, added an identity reset on logout so shared devices stopped merging users, moved event names to a consistent structured format, and built cohorts and dashboards the team could trust.

**Acted on the funnel.** A single profile step in onboarding was losing 67% of the people who reached it. I removed the questions we didn't need, including gender and a gift address.

## The outcome

The team replaced a wrong threshold with a real curve and a clearer target: the first workout. Trial reporting was corrected, and new analytics events are now checked against a second source before they ship.

## What I'd tell another team

A dashboard that agrees with your intuition deserves the most suspicion. Before you steer by a metric, reconcile it against a second source of truth.
