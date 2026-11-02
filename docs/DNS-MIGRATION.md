# savantanalytics.net — DNS migration and web cutover plan

Status: **PLAN ONLY. No changes authorized or made.** Based on the Wix DNS inventory snapshot of 2026-11-02 17:13 UTC.

Setup today: registrar **Network Solutions** (expires 2027-09-09) · DNS hosted at **Wix** (ns8/ns9.wixdns.net) · website **Wix** · email **Google Workspace** · new site deployed as Cloudflare Worker `savantweb` (preview: savantweb.saifislam04.workers.dev, verified working).

Target: DNS hosted at **Cloudflare** (free zone), Worker attached to `savantanalytics.net` + `www`. Registrar unchanged. Email unchanged.

Two separate, separately-authorized changes:
- **Change A — DNS provider move** (nameservers → Cloudflare). Website still Wix, email still Google. Reversible by restoring nameservers.
- **Change B — web cutover** (Worker takes apex + www). Done only after A is verified.

---

## 0. Pre-flight checks (do these first, nothing changes)

### 0.1 MX discrepancy — RESOLVED 2026-11-02

Authoritative query of ns8.wixdns.net returned priorities 40/50 as `aspmx2.googlemail.com` / `aspmx3.googlemail.com`, matching public resolvers. The Wix UI's `alt3/alt4` display is not what is published. The table in §1 carries the authoritative values.

<details><summary>Original check (for the record)</summary>


```
nslookup -type=MX savantanalytics.net ns8.wixdns.net
nslookup -type=MX savantanalytics.net ns9.wixdns.net
nslookup -type=MX savantanalytics.net 8.8.8.8
```

The first two are **authoritative** (Wix's own nameservers). Whatever they return is the truth; the Wix UI and public resolvers are both secondary. Paste all three outputs into the chat.

Interpretation:
- Both `alt3/alt4.aspmx.l.google.com` and `aspmx2/aspmx3.googlemail.com` are valid Google Workspace MX hosts (the `googlemail.com` names are Google's older documented set; `alt1–4` the newer). Either delivers. The point is to copy **what is authoritatively published**, not to pick a "better" set.
- If ns8/ns9 return the `googlemail.com` names, the Wix UI is showing a normalized/cached display and the public resolvers are right.
- If ns8/ns9 return `alt3/alt4`, the public resolvers are serving stale cache (TTL 3600) — re-run in an hour; if still different, stop and investigate before copying.

</details>

### 0.2 Google Admin — DKIM — RESOLVED 2026-11-02: **not authenticating** (DKIM off). No `_domainkey` record to copy. DKIM becomes a §5 follow-up.

<details><summary>Original check</summary>

Google Admin → Apps → Google Workspace → Gmail → **Authenticate email**. Note:
- Whether DKIM is "Authenticating email" (on) or "Not authenticating" (off).
- The selector shown (usually `google`). If on, there is a TXT at `<selector>._domainkey` that must be copied; the public lookup of `google._domainkey` returned NXDOMAIN, which suggests DKIM is not configured — confirm, don't assume.
- No SPF or DMARC exists today. **Do not add them during the move.** Note as a follow-up (see §5).

</details>

### 0.3 DNSSEC — RESOLVED 2026-11-02: Verisign .net RDAP reports `delegationSigned: false`; no DS record exists. Nothing to remove.

<details><summary>Original check</summary>

Network Solutions → domain → Advanced / DNSSEC. Confirm it is **off / no DS records**. If any DS record exists, stop: nameserver change with DS present breaks resolution. Removing DS is a separate authorized step.

</details>

### 0.4 analytic.expert — OPEN
Inspect its DNS and redirect at Wix before any action; it is out of scope for this plan and must not be affected. If its redirect is implemented at Wix as a *Wix site* feature (not DNS), it is unaffected by the savantanalytics.net nameserver change. Confirm.

---

## 1. Change A — build the Cloudflare zone (no effect on live traffic until §2)

1. Cloudflare → **Domains → Add a domain** → `savantanalytics.net` → **Free** plan. Cloudflare scans and proposes records.
2. **Compare** the imported records against the table below (also in `CLOUDFLARE-ZONE-RECORDS.md`, the approval copy). Fix every difference by hand. The authoritative MX values from §0.1 replace the MX rows if they differ.

| Type | Name | Content | Prio | TTL | Proxy | Note |
| --- | --- | --- | --- | --- | --- | --- |
| A | @ | 185.230.63.171 | | 3600 | **DNS only (gray)** | Wix site, keep |
| A | @ | 185.230.63.186 | | 3600 | **DNS only (gray)** | Wix site, keep |
| A | @ | 185.230.63.107 | | 3600 | **DNS only (gray)** | Wix site, keep |
| CNAME | m | www4.wixdns.net | | 3600 | **DNS only (gray)** | Wix mobile, keep |
| CNAME | www | cdn3.wixdns.net | | 3600 | **DNS only (gray)** | Wix site, keep |
| TXT | @ | `MS=ms17224690` | | 3600 | — | Microsoft verification, keep |
| TXT | @ | `google-site-verification=jfEcweXBlqQnYx0zR0pFcobVLf-uJtesDxiffu2JO-g` | | 3600 | — | keep |
| MX | @ | aspmx.l.google.com | 10 | 3600 | — | keep |
| MX | @ | alt1.aspmx.l.google.com | 20 | 3600 | — | keep |
| MX | @ | alt2.aspmx.l.google.com | 30 | 3600 | — | keep |
| MX | @ | aspmx2.googlemail.com | 40 | 3600 | — | **confirmed authoritative (ns8.wixdns.net, 2026-11-02)** — do not substitute alt3 |
| MX | @ | aspmx3.googlemail.com | 50 | 3600 | — | **confirmed authoritative (ns8.wixdns.net, 2026-11-02)** — do not substitute alt4 |

Rules: gray cloud (DNS only) on every A/CNAME — Cloudflare's Wix guidance requires it and it keeps the Wix site working through the move. Do **not** import ns8/ns9 as NS records. Do not add SPF/DMARC/anything not in the table. Do not delete anything Cloudflare imported that is in the table; delete anything it imported that is not (and tell me what it was).

3. Cloudflare shows two assigned nameservers (e.g. `xxx.ns.cloudflare.com`, `yyy.ns.cloudflare.com`). Write them down. **Stop here and report.** Nothing has changed yet.

---

## 2. Change A — delegation (authorized separately)

1. Network Solutions → domain → **Nameservers** → replace ns8/ns9.wixdns.net with the two Cloudflare nameservers. Record the old ones (ns8.wixdns.net, ns9.wixdns.net) for rollback.
2. Propagation: minutes to ~24 h (NS TTL is 86400). Cloudflare's overview turns **Active** when it sees the delegation.
3. Verify (your PC):
   ```
   nslookup -type=NS savantanalytics.net 8.8.8.8
   nslookup -type=MX savantanalytics.net 8.8.8.8
   nslookup savantanalytics.net 8.8.8.8
   ```
   NS should be Cloudflare's; MX and A unchanged from the table.
4. **Email test both directions**: send from the Google Workspace mailbox to an outside address, and from outside to it. Confirm receipt within a few minutes.
5. Confirm **www.savantanalytics.net still serves the Wix site**.

Rollback: set nameservers back to ns8/ns9.wixdns.net at Network Solutions. Wix still holds the full zone, so nothing else is needed.

---

## 3. Change B — web cutover to the Worker (authorized separately, after §2 passes)

1. Cloudflare → Workers & Pages → savantweb → **Domains** → **Add Domain** → `savantanalytics.net`. Cloudflare will warn that A records exist at the apex; it replaces them with the Worker binding. Confirm.
2. **Add Domain** → `www.savantanalytics.net`. Cloudflare will warn about the existing `www` CNAME → cdn3.wixdns.net; confirm replacement.
3. Leave `m` CNAME alone for now (Wix mobile host; harmless). Remove later with Wix.
4. Set the Worker's production variables first if not already: `VITE_SITE_ORIGIN=https://savantanalytics.net`, `VITE_INDEXABLE=true` (Settings → Variables), then **Retry build** so `robots.txt` and canonicals are production values.
5. Verify (within minutes):
   - https://savantanalytics.net and https://www.savantanalytics.net load the new site over HTTPS.
   - https://savantanalytics.net/ai → /services/ai-strategy; /migration → /services/legacy-modernization.
   - https://savantanalytics.net/robots.txt shows `Allow: /`; /sitemap.xml lists 11 URLs.
   - Email still works (send/receive once more — MX untouched, but verify).
6. Wix: keep the Wix site and subscription until you're satisfied (a week is reasonable). Then cancel the Wix site plan; the domain is not at Wix so nothing else moves.

Rollback: Worker → Domains → remove both custom domains; re-add the three A records and the www CNAME from the table (gray cloud). Wix serves again within minutes.

---

## 4. Not in scope (keep separate)

- Contact form delivery (`CONTACT_TO`, `CONTACT_FROM`, `RESEND_API_KEY`) — D-01/D-02. If Resend is approved, its verification TXT/CNAME records are added in Cloudflare **after** §2, as their own authorized change.
- analytic.expert redirect — inspect and preserve separately.

## 5. Follow-up (recommended, separate authorization)

No SPF or DMARC exists. Without SPF, mail from @savantanalytics.net is more likely to be junked by recipients. After the move is stable: add `v=spf1 include:_spf.google.com ~all`, enable DKIM in Google Admin and add its TXT, then a monitoring-only DMARC (`v=DMARC1; p=none; rua=mailto:…`). One at a time, each verified.
