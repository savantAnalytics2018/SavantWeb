# Test deployment — `savantweb-test` (branch `market-research`)

Purpose: run the new build (Digital-Twin Market Research tab + wizard) on live Cloudflare
infrastructure at its own URL, with the forms and email **switched on**, without touching
the production Worker (`savantweb`) or `savantanalytics.net`.

Result: `https://savantweb-test.<account>.workers.dev` — public to anyone with the link,
`noindex` (because `VITE_INDEXABLE` is not set), forms live, emails delivered.

This is the same procedure used for the production Worker (`docs/DEPLOY-CLOUDFLARE.md`),
with three differences: a different branch, a different wrangler config, and the study
endpoint enabled.

---

## 1. Create the Worker (Cloudflare dashboard, ~3 minutes)

Workers & Pages → **Create** → **Workers** → **Import a repository** (Connect to Git)

| Setting | Value |
|---|---|
| Repository | `savantAnalytics2018/SavantWeb` |
| Project / Worker name | `savantweb-test` |
| Production branch | `market-research` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy --config wrangler.test.jsonc` |
| Root directory | (leave empty) |

The deploy command is the one line that differs from production — it points at
`wrangler.test.jsonc`, whose `name` is `savantweb-test`. If it is left as plain
`npx wrangler deploy`, the build would try to overwrite the production Worker. Double-check it.

## 2. Build variables (Settings → Build → Variables and Secrets, type *Text*)

| Variable | Value | Notes |
|---|---|---|
| `NODE_VERSION` | `22` | same as production |
| `VITE_CONTACT_ENDPOINT` | `/api/contact` | enables the contact form |
| `VITE_STUDY_ENDPOINT` | `/api/study` | enables the Market Research wizard |

Do **not** set `VITE_INDEXABLE` or `VITE_SITE_ORIGIN` — the test site must stay `noindex`.

## 3. Secrets (Settings → Variables and Secrets, type *Secret*)

| Secret | Value | Notes |
|---|---|---|
| `RESEND_API_KEY` | the Resend API key | same key as production is fine |
| `CONTACT_FROM` | `onboarding@resend.dev` | Resend's built-in test sender; no DNS needed |
| `CONTACT_TO` | the owner's email (the address registered with Resend) | receives contact-form inquiries |
| `STUDY_TO` | the owner's email (the address registered with Resend) | receives Market Research requests |
| `STUDY_TURNAROUND` | (leave unset) | optional; see `.env.example` |

**Resend test-sender limit:** `onboarding@resend.dev` can deliver **only to the email address
on the Resend account**. That is enough to prove the whole flow: the internal
"research request" email arrives, and if the wizard is submitted with that same address the
prospect confirmation arrives too. Submissions with any other email return `confirmationSent:
false` (the success screen says so honestly). Once `savantanalytics.net` is verified in Resend
(after DNS moves to Cloudflare), change `CONTACT_FROM` to e.g. `research@savantanalytics.net`
and the limit goes away. Nothing else changes.

## 4. First deploy

Save → Cloudflare builds the branch (≈2–3 min) → the Worker gets a `workers.dev` URL
(Settings → Domains & Routes; turn on the `workers.dev` route if it is off).

## 5. Smoke test on the live URL

1. `/` — home loads; nav shows **Digital-Twin Market Research / Run It**.
2. `/market-research` — landing; no "preview mode" notice anywhere.
3. `/market-research/start` — wizard: fill all four steps with the owner's email, submit.
   - Success screen shows a reference `TYI-YYYY-XXXXXX` and "confirmation sent".
   - Inbox receives `[TYI-…] Research request — <Company> — <Type>` and the prospect confirmation.
4. `/contact` — submit once; inbox receives the inquiry.
5. `/api/study` with GET → 405; empty POST → 422 (sanity).
6. `/test-your-idea` → 301 to `/market-research`.

## 6. Going to production later

- Merge `market-research` into `main` (the production Worker builds from `main`).
- On the production Worker add build variable `VITE_STUDY_ENDPOINT=/api/study` and secret `STUDY_TO`.
- `CONTACT_FROM` on production must be an address on a domain verified in Resend.
- Optional: delete the `savantweb-test` Worker, or keep it as a staging environment.

## Rollback / safety

- The test Worker is independent: deleting it affects nothing else.
- `wrangler.jsonc` (production) is unchanged on this branch.
- `main` is unchanged until the merge in step 6.
