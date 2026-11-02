# Deploy to Cloudflare (free plan) and point savantanalytics.net at it

> The project is deployed as a **Cloudflare Worker with static assets** (`wrangler.jsonc`, `worker/index.ts`). Cloudflare's dashboard now creates this by default when you connect a Git repo. Pages Functions (`functions/`) are kept for anyone who prefers a Pages project; both use the same handler.

## Worker build settings (Workers & Pages → savantweb → Settings → Build)

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`
- Build variables: `NODE_VERSION` = `22`, `VITE_SITE_ORIGIN` = `https://savantanalytics.net`, `VITE_INDEXABLE` = `true` (production only), `VITE_CONTACT_ENDPOINT` = `/api/contact`
- Secrets (Settings → Variables and Secrets, type *Secret*): `CONTACT_TO`, `CONTACT_FROM`, `RESEND_API_KEY`

---


## 1. Cloudflare project (one time, ~5 minutes)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Pick the GitHub repo. Settings:
   - Production branch: `main`
   - Build command: `npm run build`
   - Build output directory: `dist`
3. **Environment variables** (Production). Add before the first production deploy:
   | Name | Value | Type |
   | --- | --- | --- |
   | `NODE_VERSION` | `22` | plain |
   | `VITE_SITE_ORIGIN` | `https://savantanalytics.net` | plain |
   | `VITE_INDEXABLE` | `true` | plain |
   | `VITE_CONTACT_ENDPOINT` | `/api/contact` | plain |
   | `CONTACT_TO` | *(confirmed inbox)* | **encrypted** |
   | `CONTACT_FROM` | *(sender on a verified domain)* | **encrypted** |
   | `RESEND_API_KEY` | *(from Resend)* | **encrypted** |
   For the **Preview** environment set only `NODE_VERSION`; leave `VITE_INDEXABLE` unset so previews stay `noindex`.
4. **Save and Deploy**. First build takes ~1 minute. You get a `*.pages.dev` URL — check it end to end.

## 2. Contact delivery (Resend, free tier)

1. resend.com → add domain `savantanalytics.net` → add the DNS records it shows (at Wix, see §3) → verify.
2. Create an API key → paste as `RESEND_API_KEY` in Cloudflare.
3. Set `CONTACT_FROM` to e.g. `inquiries@savantanalytics.net` and `CONTACT_TO` to the inbox you read.
4. Redeploy, submit a test inquiry on the `*.pages.dev` URL, confirm it lands.

## 3. DNS at Wix (the cut-over)

Cloudflare → your Pages project → **Custom domains** → add `savantanalytics.net` and `www.savantanalytics.net`. It shows the records to create.

At Wix: **Domains** → savantanalytics.net → **Advanced** → **Edit DNS**:
- Change the **A record** for `@` (or replace with the CNAME Cloudflare specifies) to the value Cloudflare shows.
- Change **CNAME `www`** → `<project>.pages.dev`.
- **Do not touch MX / TXT records** (email keeps working).
- Add the Resend verification records from §2.

Propagation: minutes to a few hours. The Wix site keeps serving until DNS flips; nothing is deleted.

## 4. Verify after cut-over

- `https://savantanalytics.net` and `https://www.savantanalytics.net` load the new site over HTTPS.
- `/ai` → `/services/ai-strategy`, `/migration` → `/services/legacy-modernization` (from `public/_redirects`).
- `curl -I https://savantanalytics.net` shows the security headers (from `public/_headers`).
- `robots.txt` says `Allow: /` and `sitemap.xml` lists 11 URLs.
- Submit one real inquiry; confirm receipt.
- Google Search Console: add the property, submit the sitemap.

## Rollback

Cloudflare → Pages project → **Deployments** → pick the previous one → **Rollback to this deployment**. Instant. To go back to Wix entirely, restore the previous DNS records at Wix.

## Day-to-day

Push to `main` → Cloudflare builds and deploys automatically. Pull requests get preview URLs. Content edits are in `src/content/` (see `docs/CONTENT-GUIDE.md`).
