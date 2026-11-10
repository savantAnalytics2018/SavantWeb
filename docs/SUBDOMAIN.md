# twinresearch.savantanalytics.net — the research offer's own front door

**Status (10 Nov 2026): code ready; DNS blocked on Change A.**

## What it is
One Worker, one deploy, two hostnames:

| Host | `/` serves | Header |
| --- | --- | --- |
| savantanalytics.net | Home | Full nav; last tab "Digital-Twin Market Research" → the subdomain (when `VITE_RESEARCH_ORIGIN` is set) |
| twinresearch.savantanalytics.net | Market Research landing (`/start` → wizard) | Slim nav: the offer, "Start your free study", and a "Savant Analytics →" button back to the main site |

Deep links (`/about`, `/contact`, …) still work on the research host — it is the same site — so nothing breaks if someone edits the URL. The main site's `/market-research` keeps working too.

## How it works
- `worker/index.ts`: if the hostname starts with `twinresearch.` (override with the `RESEARCH_HOST_PREFIX` var), `/` → `/market-research` and `/start` → `/market-research/start` before the asset lookup.
- `src/lib/host.ts`: client-side hostname check; `src/components/Layout.tsx` swaps the header/footer after mount so prerendered HTML hydrates cleanly.
- Build vars: `VITE_RESEARCH_ORIGIN=https://twinresearch.savantanalytics.net` and `VITE_SITE_ORIGIN=https://savantanalytics.net` (both already used elsewhere / documented in DEPLOY-CLOUDFLARE.md).

## To switch it on (in order; each step needs Saif's go-ahead)
1. **Change A** (DNS move from Wix to Cloudflare) per `docs/DNS-MIGRATION.md`. A Worker custom domain requires the zone on Cloudflare; a CNAME at Wix will not work.
2. In the Cloudflare dashboard → the Worker → Settings → Domains & Routes → **Add custom domain** `twinresearch.savantanalytics.net`. Cloudflare creates the DNS record and certificate itself. (For testing first, add it to `savantweb-test`.)
3. Set `VITE_RESEARCH_ORIGIN` on the Worker's build settings and redeploy, so the main site's tab points at the subdomain.
4. Later, when the research pages are indexable: canonical tag on `/market-research` pointing at the subdomain root, and a 301 from `savantanalytics.net/market-research` → subdomain. Not done yet — keep both live until then.

## Before step 2
- `twinresearch` has no existing DNS record in the 12-record Wix inventory, so the custom domain conflicts with nothing. Confirm the spelling (one word, no hyphen) before it is created — changing a custom domain later means a new certificate.
