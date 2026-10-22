# Jon Zaro, portfolio

Source for jonzaro.com: a homepage plus case studies, written in [Astro](https://astro.build) and deployed as a static site.

## Run it

Requires Node 22 (`.nvmrc`).

```bash
nvm use
npm install
npm run dev      # http://localhost:4321
npm run check    # typecheck
npm run build    # static output in dist/
```

## Structure

| Path | What it is |
|---|---|
| `DESIGN.md` | The design system (Stripe-inspired, from VoltAgent/awesome-design-md) plus this site's adaptations. Read it before changing UI. |
| `src/content/work/*.md` | One file per case study. Frontmatter holds the card copy, stats and code panel; the body is the write-up. The schema lives in `src/content.config.ts`. |
| `src/pages/resume.astro` | Public resume (no phone number). After editing it, regenerate the PDF with `npm run build && npm run preview`, then `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --print-to-pdf=public/jon-zaro-resume.pdf http://localhost:4321/resume/`. Keep it to one page. |
| `src/pages/consulting.astro` | Contract-work landing page (not in the main nav; linked from the contact band and footer): services, how it works, case studies, CTA to book a call. |
| `src/pages/index.astro` | Homepage: hero, proof strip, experience and skills, AI and automation, case studies, principles, side projects, contact. |
| `src/pages/work/[slug].astro` | Case study template. |
| `src/components/` | Mountain hero, ship log, code panel, case card, CTA band, nav, footer. |
| `src/site.ts` | Email, Calendly, GitHub and LinkedIn links. |

## Adding a case study

Copy an existing file in `src/content/work/`, change `order`, and keep the content rules in `DESIGN.md`: client metrics only as percentages, ratios and test counts, each traceable to a work log.

## Deploy

`netlify.toml` builds with `npm run build` and publishes `dist/` on Node 22. Connect the repo in Netlify (Add new site → Import from Git) and point the domain at it. Vercel also works with no config.

The previous single-page HTML site is in git history on `main`, before the `feature/redesign-2026` branch.
