---
title: A launch crash, a postmortem, and a CI gate so it can't happen twice
card: An over-the-air update crashed the app on launch. I hotfixed it, wrote the postmortem, and built the gate and rollback tooling that stop a repeat.
summary: An over-the-air update shipped JavaScript that needed a native module the installed app didn't have, and the app crashed before error reporting could even start. I fixed it, wrote it up, and built the release safety net that was missing.
client: Burn by Cara Loren
role: Lead developer
period: May – Aug 2026
order: 3
stack: [Expo EAS Update, React Native, GitHub Actions, Fly.io, PostgreSQL, PostHog, Sentry]
stats:
  - value: < 5 min
    label: Production rollback, down from a manual rebuild
  - value: 4
    label: People who can now deploy safely, up from 1
  - value: 1
    label: Silently failing backup found while testing recovery
panel:
  file: .github/workflows/ota-guard.yml · simplified
  lines:
    - { text: "- name: Block OTA if native deps changed" }
    - { text: "  run: |" }
    - { text: "    git diff last-prd-build -- package.json \\" }
    - { text: "      | node scripts/native-deps.js --added > added.txt" }
    - { text: "    if [ -s added.txt ]; then" }
    - { kind: warn, text: "      echo '::error::New native module. Ship a store build.'" }
    - { text: "      exit 1" }
    - { text: "    fi" }
    - { kind: dim, text: "" }
    - { kind: ok, text: "✓ OTA allowed: JS-only change since last-prd-build" }
---

## The problem

Expo apps can ship JavaScript updates over the air, skipping app review. That speed comes with a trap: if the new JavaScript imports a native module that isn't compiled into the installed binary, the app crashes on launch. It also can't recover by itself, because it crashes before it can fetch a fix.

That is what happened. Worse, the crash happened before Sentry initialized, so error reporting showed nothing. The outage lasted about 12 hours, until a hotfix update went out.

## What I did

**Hotfixed, then wrote it down.** The immediate fix made the import lazy so the app could boot without the module. Then I wrote a blameless postmortem: what happened, why monitoring missed it, and what would have caught it.

**Built the gate that would have caught it.** I built a reusable GitHub Actions workflow that compares dependencies against a `last-prd-build` tag and refuses an over-the-air release if a native module was added since the last store build. The failure message tells you exactly what to do instead.

**Made releases reversible.** As part of a wider reliability programme, I built a one-click rollback that redeploys the previous server image, `down` migration scripts for every database change, and an automatic database snapshot before each deploy. Testing that work turned up that the daily database backup had been failing silently, which no one would have found until they needed it.

**Tightened the pipeline.** I pinned the deploy tooling version and made the deploy wait on the snapshot job, which had been running alongside it without blocking anything. I also moved feature flags from GrowthBook to PostHog and launched a 3-day vs 7-day trial-length A/B test on the new flags.

## The outcome

Rollback now takes under five minutes, and migrations have tested rollback scripts. Four people can now deploy, where before only one could. Every over-the-air release now passes the native-module check first, so this class of crash is caught in CI instead of on users' phones.

## What I'd tell another team

The most dangerous failures are the ones your monitoring can't see. Ask "what happens if this breaks before Sentry loads?" and build a check for that path specifically.
