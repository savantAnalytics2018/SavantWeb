# Cloudflare zone for savantanalytics.net — exact records to enter

Prepared 2026-11-02 from the confirmed Wix inventory (MX verified at ns8 and ns9). **For comparison and approval. Nothing is changed by this document.**

Pre-flight status: MX confirmed · Google Admin reports DKIM not authenticating for the domain; **no DKIM record was identified** (the `google` selector resolves NXDOMAIN) — nothing to copy on current evidence · DNSSEC: registry reports `delegationSigned: false`, no DS to remove · analytic.expert: still to be inspected separately.

## Records — 12 total

| # | Type | Name | Content | Priority | TTL | Proxy status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | A | `@` | `185.230.63.171` | — | 3600 | **DNS only** (gray cloud) |
| 2 | A | `@` | `185.230.63.186` | — | 3600 | **DNS only** (gray cloud) |
| 3 | A | `@` | `185.230.63.107` | — | 3600 | **DNS only** (gray cloud) |
| 4 | CNAME | `www` | `cdn3.wixdns.net` | — | 3600 | **DNS only** (gray cloud) |
| 5 | CNAME | `m` | `www4.wixdns.net` | — | 3600 | **DNS only** (gray cloud) |
| 6 | MX | `@` | `aspmx.l.google.com` | 10 | 3600 | n/a |
| 7 | MX | `@` | `alt1.aspmx.l.google.com` | 20 | 3600 | n/a |
| 8 | MX | `@` | `alt2.aspmx.l.google.com` | 30 | 3600 | n/a |
| 9 | MX | `@` | `aspmx2.googlemail.com` | 40 | 3600 | n/a |
| 10 | MX | `@` | `aspmx3.googlemail.com` | 50 | 3600 | n/a |
| 11 | TXT | `@` | `MS=ms17224690` | — | 3600 | n/a |
| 12 | TXT | `@` | `google-site-verification=jfEcweXBlqQnYx0zR0pFcobVLf-uJtesDxiffu2JO-g` | — | 3600 | n/a |

In the Cloudflare UI, `@` can be typed as `@` or `savantanalytics.net`; TTL is set by choosing **Custom → 3600** (or "1 hr"). TXT content is entered without surrounding quotes.

## Records that must NOT exist in the zone

- No `NS` records for `ns8.wixdns.net` / `ns9.wixdns.net` (Cloudflare manages its own NS).
- No SPF, DKIM, DMARC, or any TXT not in rows 11–12.
- No Cloudflare-added "parking" or placeholder A/AAAA records.
- No proxied (orange-cloud) records of any kind.

## How to use this list

1. Cloudflare → Domains → **Add a domain** → `savantanalytics.net` → Free plan.
2. On the "Review DNS records" screen, Cloudflare shows what its scan found. Compare row by row against the table:
   - Missing row → add it.
   - Extra row → **do not delete.** Switch it to DNS only if it is an A/CNAME, note exactly what it is, and send it to the chat for review before anything is removed.
   - Any A/CNAME showing orange cloud → switch to DNS only.
   - MX 40/50 must read `aspmx2.googlemail.com` / `aspmx3.googlemail.com` — the scan may pick up either set; correct to these.
3. Continue to the page showing the two assigned Cloudflare nameservers. **Stop. Copy them into the chat.** Do not change anything at Network Solutions yet.
4. After the chat-side comparison passes and you give explicit approval, the nameserver change is Change A in `DNS-MIGRATION.md` §2.

## Nameserver note (Network Solutions)

Network Solutions hides DNS record controls because the domain is delegated to Wix's nameservers; that is expected. Do **not** use "reset to default nameservers." The only registrar-side action in this migration is replacing `ns8.wixdns.net` / `ns9.wixdns.net` with the two Cloudflare-assigned nameservers, in §2, after approval.
