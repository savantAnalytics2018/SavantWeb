# Handoff to Dot — 10 Nov 2026

Branch: `market-research` (GitHub savantAnalytics2018/SavantWeb), latest commit `c4e4114`.
Target: the test Worker `savantweb-test` first; production only after Saif signs off.

## 1. Redeploy the test Worker from the branch
Nothing new to configure for this step — the branch builds as before (`npm run build` via wrangler.jsonc).
Check after deploy: https://savantweb-test.saifislam04.workers.dev/market-research shows the new hero
("Before you commit, find what deserves a closer test.") and a collapsed "Open the full sample report".

## 2. Make the forms send (both contact and research request)
Runtime variables (Worker → Settings → Variables and Secrets):
- `CONTACT_TO` = saif.islam@savantanalytics.net
- `STUDY_TO` = saif.islam@savantanalytics.net   (research requests; falls back to CONTACT_TO if unset)
- `CONTACT_FROM` = a sender on a domain verified in Resend (e.g. noreply@savantanalytics.net once that domain is verified in Resend)
- `RESEND_API_KEY` = secret, from the Resend dashboard
Build variable (Worker → Settings → Build → Variables):
- `VITE_CONTACT_ENDPOINT` = /api/contact
- `VITE_STUDY_ENDPOINT` = /api/study
Optional runtime variables (added 10 Nov, evening):
- `STUDY_CONFIRM_SECRET` = any long random string (signs the email confirmation links; falls back to RESEND_API_KEY if unset)
- `SITE_ORIGIN` = https://twinresearch.savantanalytics.net on the test Worker (the origin used in confirmation links; defaults to the request's own origin, so this is only needed if links should always point at one hostname)
Then retry the build. Never prefix a secret with `VITE_`.

Flow to test: submit → Savant inbox gets `[UNCONFIRMED]` email, requester gets "Confirm your research request" with a link →
click → Savant inbox gets `[CONFIRMED]`, browser lands on /start?confirmed=1 (or /market-research/start?confirmed=1 on the main host).
A gmail/yahoo address now requires a company website on the last step; the Savant copy shows it under TRIAGE.
Test: submit one research request with a @savantanalytics.net address and one with a gmail address;
the second should arrive with `[REVIEW]` in the subject and a "5. TRIAGE" block at the bottom.

## 3. Research subdomain (blocked until DNS moves)
Code is ready; the Worker already serves `twinresearch.<domain>/` as the research landing and `/start` as the wizard.
It needs the savantanalytics.net zone on Cloudflare (Change A in docs/DNS-MIGRATION.md) before a custom domain can be added.
After Change A, in order:
1. Worker → Settings → Domains & Routes → Add custom domain `twinresearch.savantanalytics.net`
   (test Worker first if Saif wants to see it before production). Cloudflare creates the DNS record and certificate.
2. Build variables: `VITE_RESEARCH_ORIGIN` = https://twinresearch.savantanalytics.net,
   `VITE_SITE_ORIGIN` = https://savantanalytics.net. Redeploy.
3. Check: subdomain root shows the research landing with the slim header; main site's last nav tab links to the subdomain.
Details and rationale: docs/SUBDOMAIN.md.

## Do not
- Change nameservers, MX, or any DNS record outside Change A as already documented and reviewed.
- Delete DNS records; flag extras for review.
- Put the API key in a `VITE_` variable or in the repo.
