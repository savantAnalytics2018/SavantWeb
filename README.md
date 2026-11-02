# SavantAnalytics.net — site rebuild

Static-first React + TypeScript site, prerendered to plain HTML per route, with a small
hydration bundle for navigation and the contact form. No CMS, database, analytics, or
third-party widgets. Built 1 November 2026 from the *Savant Analytics Website Build Brief v1*.

## Run it

```bash
npm install
npm run dev          # local dev server (http://localhost:5173)
npm run build        # client build + SSR build + prerender → dist/
npm run preview      # serve dist/ (http://localhost:4173)
npm run typecheck    # tsc --noEmit
npm test             # vitest (27 tests)
npm run check        # typecheck + test + build
```

Node 22 and npm 10 were used. `npm run build` fails if content validation fails
(missing fields, duplicate ids, an illustrative example that doesn't say it's hypothetical).

## Where things live

| Path | What |
| --- | --- |
| `src/content/*.ts` | **All copy and settings.** Services, nav, hero, FAQ, situations, approach, about, page metadata. See `docs/CONTENT-GUIDE.md`. |
| `src/styles/global.css` | Design tokens (`:root`) and all styles. |
| `src/components/` | `Layout` (header, mobile nav, footer, skip link), `HeroArt` (SVG composition), `Sections` (cards, FAQ, examples, CTA), `ContactForm`. |
| `src/pages/` | One file per route. |
| `src/lib/` | `head.ts` (titles, canonicals, JSON-LD), `contactConfig.ts` (shared validation), `analytics.ts` (disabled adapter). |
| `api/contact.ts` | Serverless inquiry endpoint (Web Request/Response; Vercel-ready). |
| `scripts/prerender.mjs` | Writes static HTML for every route + sitemap + robots. |
| `vercel.json` | Redirects (`/ai`, `/migration`), security headers, caching. |
| `public/` | `favicon.svg`, `og-image.png`. |
| `docs/` | Decision log, provenance record, content guide, launch report. |
| `qa/` | Screenshot and accessibility scripts; results in `qa/a11y-results.txt`. |
| `src/__tests__/` | Content, routing, form, and endpoint tests. |

## Environment variables

Copy `.env.example` to `.env` (never commit it).

| Variable | Scope | Purpose |
| --- | --- | --- |
| `VITE_CONTACT_ENDPOINT` | public | Form POST target (e.g. `/api/contact`). Unset → form in preview mode, submission disabled. |
| `VITE_SITE_ORIGIN` | public | Canonical origin. Defaults to `https://savantanalytics.net`. |
| `VITE_INDEXABLE` | public | `true` only for the production build. Anything else → `noindex` + `robots.txt Disallow`. |
| `CONTACT_TO` | server | Verified recipient inbox. |
| `CONTACT_FROM` | server | Sender on a domain verified with the email provider. |
| `RESEND_API_KEY` | server | Provider key. Only if Resend is approved as the processor. |

Secrets must never be `VITE_`-prefixed; Vite inlines those into the browser bundle.

## Deploy

**Chosen host: Cloudflare Pages (free plan, commercial use allowed).** Step-by-step in `docs/DEPLOY-CLOUDFLARE.md`. The contact endpoint runs as a Pages Function (`functions/api/contact.ts`); redirects and headers are in `public/_redirects` and `public/_headers`.

### Alternative: Vercel (requires the paid Pro plan for a business site)

1. Import the repo. Framework: Vite. Build: `npm run build`. Output: `dist`.
2. Add the server variables above in Project → Settings → Environment Variables (Production).
3. Add `VITE_CONTACT_ENDPOINT=/api/contact`, `VITE_SITE_ORIGIN=https://savantanalytics.net`,
   `VITE_INDEXABLE=true` for **Production only**. Leave `VITE_INDEXABLE` unset for previews.
4. Protect preview deployments (Vercel "Deployment Protection") — `noindex` is not access control.
5. Point `savantanalytics.net` and `www` at Vercel; HTTPS is automatic.
6. **Rollback:** Vercel → Deployments → previous deployment → "Promote to Production" (instant).

Other static hosts (Netlify, Cloudflare Pages) serve `dist/` as-is; port `api/contact.ts` to
that host's function format (it's a standard `Request → Response` handler) and reproduce the
redirects and headers from `vercel.json` in the host's config.

## Common edits

- **Change service copy:** edit `src/content/services.ts`. Routes and the form's select update automatically.
- **Add/replace a service:** add an object with a new `id`; add it to the `ServiceId` union in `types.ts`. Keep exactly one `lead` and two `pathway` roles (validated).
- **Turn on a public email or scheduling link:** set `publicEmail` / `schedulingUrl` in `src/content/site.ts` — only after verification (see `docs/DECISIONS.md`).
- **Disable the hero animation entirely:** in `src/components/HeroArt.tsx` set `const animate = false;` (or remove the three `animation:` rules under `.hero-art[data-animate='true']` in `global.css`).
- **Maintain redirects:** edit `redirects` in `vercel.json`. Never guess old URLs; add only ones observed on the live site.
- **Change tokens:** `:root` in `src/styles/global.css`. Re-run `node qa/a11y.cjs` to confirm contrast.

## Status

This is a **preview build**, not a launch. See `docs/LAUNCH-REPORT.md` for the gate-by-gate status and the owner decisions that block launch.
