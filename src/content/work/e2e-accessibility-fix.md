---
title: Unblocking end-to-end tests with five lines instead of a three-week rewrite
card: End-to-end tests couldn't see half the app, and the plan was a 29-screen UI migration. I found the root cause and fixed it in five lines.
summary: Our end-to-end test runner couldn't find half the app's buttons. The plan on the table was a 2–3 week migration of 29 screens to a new UI library. I traced it to a single accessibility setting and fixed it in five lines.
client: Burn by Cara Loren
role: Lead developer
period: Apr 2026
order: 7
stack: [React Native, Maestro, native-base, Accessibility APIs]
stats:
  - value: 5
    label: Lines changed
  - value: 29
    label: Screens that didn't need migrating
  - value: 2–3 wks
    label: Planned migration that didn't need to happen
panel:
  file: components/Pressable.tsx · diff
  lines:
    - { kind: comment, text: "// The wrapper collapsed its children into one" }
    - { kind: comment, text: "// accessibility node, hiding them from Maestro." }
    - { text: "<Box" }
    - { kind: add, text: "  accessible={false}" }
    - { text: "  onPress={onPress}" }
    - { text: ">" }
    - { text: "  {children}" }
    - { text: "</Box>" }
    - { kind: dim, text: "" }
    - { kind: ok, text: "✓ 5 files · test IDs visible on every screen" }
---

## The problem

We were setting up Maestro to run end-to-end tests on the mobile app, and it couldn't find buttons and inputs on most screens. The working theory was that the UI component library was the problem. The plan on the table was to migrate 29 screens off it, at an estimated two to three weeks.

## What I did

Before committing to a rewrite, I checked what the test runner could actually see. Maestro reads the platform accessibility tree, the same one screen readers use. A few shared wrapper components were marked as single accessible elements, which collapses everything inside them into one node. The buttons were there; the tree hid them.

Setting `accessible={false}` on those wrappers in five files exposed every child element and its test ID to the runner.

## The outcome

End-to-end testing was unblocked without a migration. Twenty-nine screens stayed as they were, and the two to three weeks planned for the rewrite went to other work.

## What I'd tell another team

Before you approve a migration, spend an hour proving the root cause. The cheapest rewrite is the one you don't need.
