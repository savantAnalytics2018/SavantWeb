# Decision log and owner decisions

Dated 1 November 2026. "Status" is **Blocking** (launch gate) or **Optional**.

## Owner decisions needed

| ID | Decision | Owner | Consequence if unresolved | Next action | Status |
| --- | --- | --- | --- | --- | --- |
| D-01 | Confirm the inquiry inbox (`saif.islam@savantanalytics.net` is a candidate observed on the current site, not verified). | Saif | Contact form stays in preview mode; no conversion path. | Confirm the address; set `CONTACT_TO`; send an authorized test submission and confirm receipt. | **Blocking** |
| D-02 | Approve an email delivery processor. The endpoint is written for Resend (`api/contact.ts`) because it is dependency-free and has a simple REST API; any transactional provider can be swapped in one function. | Saif | No delivery; privacy page cannot name the processor. | Approve Resend (or name another); create an API key; verify the sending domain; set `CONTACT_FROM`, `RESEND_API_KEY`. | **Blocking** |
| D-03 | Approve the privacy page's "Owner review required" sections: processor, retention period, hosting provider, contact address. | Saif (+ qualified reviewer if desired) | Privacy page shows review notices. | Supply the facts; edit `src/pages/Privacy.tsx`. | **Blocking** |
| D-04 | About page describes team experience by category (large consultancies, federal civilian agencies, Fortune 500, SAS-to-Python). Approve naming specific firms, agencies, or clients, and any external links. | Saif | About stays category-level (acceptable to launch as-is). | Supply approved names/links; edit `src/content/about.ts` and `site.externalLinks`. | Optional |
| D-05 | Decide whether to expose the Calendly link (`https://calendly.com/savantanalytics` observed on current site). | Saif | No booking link shown (direct inquiry stays primary, per brief). | Verify ownership, availability, timezone behavior, and a successful test booking; then set `site.schedulingUrl`. | Optional |
| D-06 | Confirm redirect map for legacy routes `/ai` → `/services/ai-strategy` and `/migration` → `/services/legacy-modernization`. These are the only two historical routes documented in the brief's register; nothing else was guessed. | Saif | Old links 404 (helpful 404 page exists). | Confirm or adjust `vercel.json`; list any other live URLs to preserve. | **Blocking** (one-line check) |
| D-07 | Decide the fate of the existing SAS-to-Python migration resources (checklist, ROI calculator, methodology, roadmap downloads). Not carried over: the brief requires ownership/accuracy review first and prohibits presenting speculative savings as results. | Saif | Those assets are absent from the new site. | Review each; if retained, host under `/services/legacy-modernization` with disclosed assumptions. | Optional |
| D-08 | GPC reference identified by owner as Ruben Hassid's General Purpose Consulting (gpc.consulting). Applied as a *register* — short lines, direct address, named audience, numbered steps, one repeated next step — not copied layout, text, or assets. | — | — | Resolved | Done |
| D-09 | Hosting provider and publishing authority. Deployed nowhere; `vercel.json` is provided as the suggested configuration. | Saif | No launch. | Choose host; grant access; run deployment steps in README. | **Blocking** |
| D-11 | SBA certification badges — owner supplied the official EDWOSB Certified and WOSB Certified icons on 2 Nov. Shown on About and in the footer (`public/sba-*.png`, `site.certifications`). | — | — | Resolved | Done |
| D-12 | Homepage "Why Savant Analytics" states federal-agency and Fortune 500 program experience and SAS-to-Python migrations (owner-stated). Confirm wording is publishable as-is. | Saif | Lines stay as written. | Confirm or edit `src/content/home.ts` → `whyUs`. | **Blocking** (one-line check) |
| D-10 | Analytics. Disabled; a no-op adapter exists (`src/lib/analytics.ts`) with proposed events. | Saif | None. | If wanted, approve a provider and consent approach; wire the adapter. | Optional |

## Implementation decisions (reversible)

| ID | Decision | Rationale |
| --- | --- | --- |
| I-01 | No existing repository was supplied and no GitHub account was linked, so the site was built fresh with Vite + React 19 + TypeScript, prerendered to static HTML. | Brief §13: use static-first React/TS when there is no usable starting point. Public pages ship as HTML; JS only hydrates navigation and the form. |
| I-02 | Routing with `react-router-dom`; every public route is prerendered by `scripts/prerender.mjs`; `404.html` is generated for hosts that serve it. | Keeps a client-only shell out of the critical path; real HTML for crawlers and no-JS readers. |
| I-03 | Single global stylesheet with CSS custom properties; no CSS framework, no animation library. | Brief §10, §13. Tokens centralized; total CSS ≈ 4 KB gzipped. |
| I-04 | Fonts are the system stacks from the brief (Georgia/Cambria serif; system-ui sans). No webfonts loaded. | Zero font cost; no license questions; meets the editorial direction. A self-hosted serif can be added later. |
| I-05 | Hero SVG is inline (≈1.6 KB) so the static composition renders with first paint. | Brief §11, §17. |
| I-06 (superseded by v1.3) | Hero animation depicted agent orchestration: an orchestrator node dispatches work packets to five agent nodes and receives results; agent status arcs turn; a slow dashed management loop surrounds the system. CSS transform/opacity only. Pause control persists in `sessionStorage`; offscreen/hidden pauses; `prefers-reduced-motion` renders a complete static version (packets resting at agents). A one-line caption in real HTML carries the meaning. | Owner direction 1 Nov ("agent orchestration or manage, short sentence"); brief §11 constraints kept. |
| I-07 | Contact form posts JSON to `VITE_CONTACT_ENDPOINT`; without it the form renders a preview notice and a disabled submit. Success is shown only on HTTP 200 + `{ok:true}`. | Brief §15: no simulated success, no dead conversion path. |
| I-08 | Endpoint spam controls: honeypot field, minimum 2 s fill time, in-memory rate limit (5 / 10 min / IP, per instance), 16 KB body cap, server-side validation shared with the client. | Proportionate; no CAPTCHA widget introduced (would need approval). |
| I-09 | `border-strong` token `#6F8077` added for interactive boundaries (3.9:1 on canvas); `#D3DDD5` kept decorative only. | Brief §10, §12. |
| I-10 | Illustrative examples: three on the homepage (strategy, modernization, evaluation) and one per service detail page. Each is labeled "hypothetical, not a client case study" and validated at build time. | Brief §14. |
| I-11 | No Insights page, no testimonials, no logos, no statistics, no phone number. | Brief §4, §8, §14. The observed phone number and `info@` address were not carried over (unverified). |
| I-12 | JSON-LD limited to `Organization { name, url }` on the homepage. | Brief §17. |
| I-13 | Security headers and a CSP (`script-src 'self'`, `style-src 'self' 'unsafe-inline'`) in `vercel.json`. The inline-style allowance exists because React sets a handful of inline `style` attributes; it can be tightened by moving those to classes. | Brief §16. |


## Changelog

- **2026-11-01 v1.1** — Copy tightened site-wide; hero animation reworked to agent orchestration with caption; About rewritten as team experience (no individual biography); certification slot added (D-11).
- **2026-11-01 v1.2** — Audience-targeted homepage in short-line register (D-08 resolved; D-12 added).
| I-14 | v1.3 hero: a four-column board (Backlog → AI agents → Your review → Production). Work items move through, agents show a working arc, a check pops at the review gate, finished items stack in Production. Answers the buyer's pain (pilots that never ship; nobody owns the risk) and shows human review in the loop. Transform/opacity only; reduced-motion shows one item per column. | Owner direction 1 Nov: practical, addresses the challenge. |
- **2026-11-01 v1.3** — Hero rewritten around the buyer's gap (mandate vs legacy system); board animation; audience-cards section removed; "Why a small team" added (senior people, no bench — owner-stated). D-12 now covers all five why-us lines.
| I-15 | v2.5 palette: navy/blue/red replaces the brief's green/teal/amber tokens after owner review ("green doesn't go well"). Token names unchanged (`--color-green`, `--color-teal`) so components did not change; values did. Contrast re-verified ≥4.5:1 for text, ≥3:1 UI. | Owner direction 4 Nov. |

## D-13 — Market Research tab aligned to the business-strategy research (9 Nov 2026)
Source: "Digital-Twin Research: What Business to Build" (Claude Doc). Changes on the intake tab only; paid tiers are not on the site.
- Positioning: hero and deliverable copy now promise a reviewed first pass that ends with what to test with real people, not a prediction.
- Gate: consumer-mailbox requests are accepted but routed to REVIEW (subject tag + triage block); company domain recorded for the one-per-organisation rule; work email stays "preferred" on the form.
- Trust: a track-record slot (twin-vs-human agreement rate) with an honest "measuring" state until five studies are scored. Fill `trackRecord.agreement` in testYourIdea.ts.
- Signpost: "If the snapshot raises more questions" paragraph and two FAQs (what if I need more / will every request be accepted). No prices.
- Scoping fields: optional "When do you need to decide?" and "What happens if you get this wrong?" on screen 1; shown in the brief and used to flag Decision-Study candidates.
- Terms: consent line now states decision support, not a forecast; confirmation email uses the same wording (replaces "not real people").
- Instrumentation: referrer/UTM captured per session and sent as `source`; decision type attached to submit/accept analytics events.

## D-14 — Market Research tab revised per 10 Nov live-page review
Applied: 42% stat removed (population mismatch) → practical hero; "How teams use it" scenarios removed (Saif); three outputs replace the five-item contents list; compact sample (finding / caveat / next test) with the full report behind an expander (mobile ~18 → ~9 viewports); four steps → three; human-validation note reworded to "simulated only; selected studies compared separately; human evidence identified"; agreement-rate promise withdrawn until a metric is defined; FAQ "Are these real people?" shortened, academic numbers moved to a scoped "What does the research say" FAQ; reviewer wording made controlled (no "remove implausible responses"); "Need a deeper answer?" replaces "most teams act on the snapshot alone"; sample report: Q2 adoption question added so the chart has an instrument, objection caption says "when asked", decision language softened, A base price and C cap specified, reviewer line marked as example; wizard step 2 "Whose perspective should we explore?", question example reworded, problem-type gets its own concept label.
Not applied (owner decisions): "Run It" nav sublabel kept (Nov 6 decision); privacy page "Owner review required" placeholders need Saif's processor/retention facts; audience types stay commercial-only.
