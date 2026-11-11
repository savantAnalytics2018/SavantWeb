# Paid-study client portal (twindetail.savantanalytics.net)

One page per paid study, no accounts. Lives on the twindetail subdomain next to the tier menu.

| URL | Who | What |
|---|---|---|
| `/` | prospects by invitation | the three tiers |
| `/start/decision-study`, `/start/calibration` | prospects | scoping questionnaire → creates the study |
| `/s/<DS-reference>` | the client | status strip · scope confirmation + **Approve** · message thread · questionnaire · memo download |
| `/s` | the client | sign-in box: reference + email → fresh magic link |
| `/admin` | Savant | all studies; open one to message, write the scope confirmation, change status, upload the memo |

## How access works

- Submitting the questionnaire sets a cookie for that study and emails a **magic link** (signed token, 30 days). Opening the link sets the same cookie. No password.
- `/admin` is a magic link to the `STUDY_TO` inbox (7 days). Click "Email me a sign-in link" on `/admin`.
- Tokens are signed with `STUDY_CONFIRM_SECRET` (falls back to `RESEND_API_KEY`). Rotating it signs everyone out.
- Emails are **nudges only** — subject + link. The substance is on the page.

## Status flow

`submitted` → `reviewing` → (`needs_input` ⇄ `reviewing`) → `scope_proposed` → **client approves** → `approved` → `running` → `delivered` → `closed`

- A Savant message on a submitted/reviewing study flips it to `needs_input` and nudges the client; a client reply flips it back to `reviewing` and nudges Savant.
- `scope_proposed` requires scope text and creates a numbered **scope version** (`scope_versions` table). The client's Approve click carries the SHA-256 of the text they are looking at; the server rejects it (409) if the scope changed since the page loaded.
- Approval copies the exact text into `approved_scope` with its hash, the client's email (from the signed cookie) and a timestamp. **That record is never updated.** Editing the scope under any other status is refused (409). To change an approved scope, Savant proposes a new version (status `scope_proposed`), which the client approves again — a change order. Every version and its approval stay in `scope_versions`.
- Uploading the memo (PDF, ≤25 MB, stored in R2) sets `delivered` and nudges the client.

## Cloudflare setup (Dot) — test Worker first

1. **D1 database**
   ```
   npx wrangler d1 create savantweb-portal --config wrangler.test.jsonc
   ```
   Paste the returned `database_id` into `wrangler.test.jsonc` → `d1_databases[0].database_id` (commit that to `market-research`).
2. **Schema** (if a database was already created from the first `portal.sql`, run `db/portal-002-scope-versions.sql` instead)
   ```
   npx wrangler d1 execute savantweb-portal --remote --file=db/portal.sql --config wrangler.test.jsonc
   ```
3. **R2 bucket** (memo storage)
   ```
   npx wrangler r2 bucket create savantweb-reports
   ```
4. **Variable** (runtime, not `VITE_`): `PORTAL_ORIGIN=https://twindetail.savantanalytics.net` — the host used in emailed links. Optional; defaults to the request origin.
5. Redeploy `savantweb-test`. The build variable `VITE_DECISION_STUDY_ENDPOINT=/api/decision-study` must be set (from the earlier note) or the questionnaire stays in preview mode.

Without the D1 binding the portal routes return 503 and the questionnaire falls back to email-only — nothing else breaks.

## Verify

- Submit a test questionnaire at `/start/decision-study` (use a real inbox you control). The success screen shows **Open your study page**; the email has the same link.
- The page shows status *Submitted*. From `/admin` (sign-in link to the Savant inbox), open it, write a message → client gets "We need your input"; reply as the client → Savant gets "client replied".
- Set status *Scope confirmation ready* with scope text → client gets the approve nudge → Approve → Savant gets "SCOPE APPROVED".
- Upload a PDF → client gets "Your memo is ready" and can download it from the page.
- `/s/DS-0000-NOPE` shows the sign-in box, not an error.

## Data

- `studies`, `messages`, `events` in D1; memos in R2 under `reports/<ref>/`. D1 has point-in-time restore (30 days).
- Export: `npx wrangler d1 export savantweb-portal --remote --output=portal.sql --config wrangler.test.jsonc`.
