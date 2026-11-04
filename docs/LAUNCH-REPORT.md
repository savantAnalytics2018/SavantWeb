# Launch-readiness report — SavantAnalytics.net rebuild

**Date:** 1 November 2026 · **Build:** v1.0.0 · **Status: PREVIEW — not launched.**

This build is complete and tested as a preview. It is not deployed to production and the contact
form is intentionally in preview mode until the owner decisions below are resolved.

## Implementation summary

- 12 routes prerendered to static HTML: Home, Services, five service pages, Approach, About, Contact, Privacy, 404.
- Original hero SVG composition with pause control, reduced-motion support, offscreen pausing.
- Typed content model with build-time validation; no copy inside components.
- Contact form with idle / submitting / success / error states, duplicate-submit guard, preserved input on error, preview mode when unconfigured. Serverless endpoint with shared validation, honeypot, timing check, rate limit, no PII logging.
- SEO: per-route titles, descriptions, canonicals, OG tags, sitemap, robots (noindex unless `VITE_INDEXABLE=true`), Organization JSON-LD, social image.
- Security headers + CSP and legacy redirects in `vercel.json`. Analytics adapter present but disabled.

## Acceptance checklist (evidence in `qa/a11y-results.txt` and `qa/screenshots/`)

| Check | Result | Evidence |
| --- | --- | --- |
| Type check | **Pass** | `npm run typecheck` clean (TypeScript 7.0.2) |
| Unit/integration tests | **Pass** | 27/27 (content validation, routing, mobile nav, animation pause, form validation, server rejection + retry, network failure, double-click, server field errors, endpoint 503/405/422/honeypot/502/429) |
| Production build | **Pass** | `npm run build` — 12 routes, content validation passed |
| Proposition + CTA clear at 360 / 768 / 1024 / 1440 | **Pass** | `qa/screenshots/home-{360,768,1024,1440}.png` |
| Primary CTA above the fold | **Pass** | 360×640 and 1366×768 (`fold-*.png`) |
| No horizontal overflow at 320 px | **Pass** | all 8 routes checked |
| One H1 per page, no heading-level skips, 4 landmarks | **Pass** | all routes |
| Skip link, tab order, 3 px visible focus ring | **Pass** | skip → `#main` focused; order: skip → wordmark → nav → CTA |
| Mobile nav: keyboard, `aria-expanded`, Escape closes + restores focus | **Pass** | |
| Touch targets ≥ 44 px (primary controls) | **Pass** | 44–45 px heights measured at 360 px |
| Text contrast ≥ 4.5:1, UI boundaries ≥ 3:1 | **Pass** | lowest text pair 5.43:1; control border 3.86:1; warm accent used decoratively only |
| `prefers-reduced-motion` → static, no control shown | **Pass** | 0 running animations |
| Pause control pauses all 3 animations; choice persists across reload | **Pass** | |
| Browser back after in-site navigation | **Pass** | `/services` → back → `/` |
| 404 page for unknown routes and unknown service ids | **Pass** | |
| Hero SVG ≤ 25 KB compressed | **Pass** | 520 B gzipped |
| First-load JS ≤ 150 KB compressed | **Pass** | 98.4 KB gzipped (React 19 + router + app) |
| No placeholder text / no env leakage in built output | **Pass** | scans clean |
| Form never shows success on failure | **Pass** | tested (network error, 502, 422) |
| Contact endpoint receipt verified | **Not run** | Requires D-01/D-02 (no authorized inbox or provider key) |
| Redirects `/ai`, `/migration` | **Not verified** | `vercel.json` only applies on Vercel; verify after deploy |
| Cross-browser (Firefox, WebKit) | **Not run** | Chromium only in this environment |
| Core Web Vitals (field) | **Not available** | Lab build is light (static HTML, ~100 KB JS, no webfonts); measure after deploy |
| 200 % zoom reflow | **Equivalent pass** | 320 px width check stands in for 640 px @ 200 %; manual confirmation recommended |

## Launch gates

| Gate | Status |
| --- | --- |
| Approved public content and biography | **Open** — copy needs owner read-through (voice); biography minimal by design (D-04) |
| Verified claim permissions | **Met** — no unverified claims are published |
| Working contact destination | **Blocked** — D-01, D-02 |
| Privacy copy matching reality | **Blocked** — D-03 |
| Accessible essential interactions | **Met** (Chromium; automated + scripted manual checks) |
| Passing production build | **Met** |
| Acceptable documented performance | **Met (lab)** — budgets satisfied; field data after launch |
| Domain and indexing configuration | **Blocked** — D-09; set `VITE_INDEXABLE=true` in production only |
| Explicit publishing authority | **Blocked** — D-09 |

## Known limitations

- Rate limiting is per serverless instance; pair with host-level protection for real abuse resistance.
- The CSP allows inline styles because a few components use `style` attributes; tightening is a small refactor.
- No webfont; the serif is Georgia/Cambria. If a licensed editorial serif is wanted, self-host it with two weights.
- Existing migration resources (checklist, calculator, downloads) were not carried over pending review (D-07).

## Changelog

- **2026-11-04 v2.5** — Palette: navy primary (#1B2A4A) replaces green; secondary blue (#1F4F8F) replaces teal; logo red (#D7442C / text #BF3620) as the sharp accent. Logo Option A1 (red circle, blue connected dots, black end dot). Pause-animation control hidden visually, revealed on keyboard focus. Eyebrow: "For commercial and federal technology leaders". OG image regenerated.

- **2026-11-04 v2.4** — New logo mark (line-chart tile, in the family of the existing Savant logo) in the header; full favicon set (.ico, SVG, PNG 32/192/512, Apple touch icon, web manifest). Sharp accent (logo red) used sparingly: highlighted stat, evidence numerals (light tint on green), list numerals, Specialty 02 outline, CTA hover, active nav underline.

- **2026-11-04 v2.3** — Research-led hook: "94% use AI. 2% run it at scale." (Kaufman Rossin 2026) with a cited evidence strip (RSM 2026, Kaufman Rossin 2026, Gartner). New "Where we are deepest" section: Legacy migration + Digital twins and evaluation. Colour pass: hero gradient, highlighted stat, dark evidence band, coloured specialty cards, accent numerals. Layout otherwise unchanged.

- **2026-11-02 v2.2** — Fix redirect loop on /services, /approach, /about, /contact, /privacy (and service pages): Worker assets now `drop-trailing-slash`; duplicate trailing-slash rules removed from `_redirects`. Verified with wrangler dev on all routes.

- **2026-11-02 v2.1** — SBA EDWOSB and WOSB certification badges added to About and footer.

- **2026-11-01 v2.0** — Headline is a five-word problem: "Your AI never reaches production." with the solution in smaller text. Hero art in the NOBL register: one circle, an orchestrator, five workflow pictograms (case file, database, batch process, report, compliance) drawn one by one with a done mark; 12 s loop.

- **2026-11-01 v1.9** — Headline: "Agents are easy to build. Hard to run in your enterprise." Hero art: labelled agent-orchestration diagram in the circle (Orchestrator → Agent 1–3 → Legacy app / Data / Documents → Your review) with packets, busy rings and a review check on an 8 s loop.

- **2026-11-01 v1.8** — Headline: "AI works in the demo. It stalls in your stack." Hero art: a line-drawn conductor in the circle keeps a beat; four lines play in rhythm. Caption: "Many moving parts. One conductor. Your team keeps the baton."

- **2026-11-01 v1.7** — Hero: one circle, one ink; an orchestrator node dispatches four parallel workflows whose steps light up in sequence (10 s loop). Caption: "Many workflows. One orchestrator. Your team in control."

- **2026-11-01 v1.6** — Hero animation replaced with NOBL-register line art: one outlined circle, one ink, a tangled line resolving into clean parallel lines and a review check, drawn with stroke-dashoffset on a 12 s loop. Caption: "Tangled systems made legible. Reviewed by your team."

- **2026-11-01 v1.5** — Hero animation replaced with "the sweep": a grid of legacy modules modernized behind an AI scan line, review markers resolving to checks, Legacy → Modern progress bar. Caption updated.

- **2026-11-01 v1.4** — Board animation recoloured: tinted column headers, teal/amber/green work cards with shadow, flow arrows, gradient production stack, soft board background.

- **2026-11-01 v1.3** — Hero: "An AI mandate. A legacy system. No plan in between." Board animation (backlog → agents → your review → production). Audience section removed. "Why a small team."

- **2026-11-01 v1.2** — Homepage rebuilt for a named audience (enterprise and federal technology leaders) in a short-line, scannable register modeled on the GPC (gpc.consulting) reference: pain points, three audience cards, five one-line services, three-step start, why-us, FAQ. Homepage copy now lives in `src/content/home.ts`.

- **2026-11-01 v1.1** — Tighter copy; agent-orchestration hero with caption; About as team experience; SBA certification slot (D-11, awaiting icon).
- **2026-11-01 v1.0.0** — Initial rebuild from brief v1. All pages, hero composition, contact form + endpoint scaffold, SEO assets, tests, QA scripts, documentation.
