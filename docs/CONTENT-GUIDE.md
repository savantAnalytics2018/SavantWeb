# Content editing guide

Everything a reader sees comes from `src/content/`. You can change wording without touching components. After editing, run `npm run build` — it refuses to build if something required is missing.

## Files

| File | Edit this to change… |
| --- | --- |
| `site.ts` | Firm name, owner name, navigation labels, header CTA, hero copy, relevance strip, footer line, final invitation, **public email / scheduling link / external links** (all `null`/empty until verified). |
| `services.ts` | The five services: title, problem, work, detail paragraphs, audience, deliverables, considerations, guardrails, illustrative example, card action, meta description (≤170 chars). |
| `approach.ts` | Buyer situations, the four stages, scoping notes, FAQ. |
| `about.ts` | About page intro, paragraphs, principles, homepage blurb. |
| `meta.ts` | Page titles and descriptions (service pages are generated from `services.ts`). |

## Rules enforced at build time (`validate.ts`)

- Exactly one service has `role: 'lead'` and exactly two have `role: 'pathway'` — this drives the homepage layout.
- Every service needs a title, problem, work, deliverables, detail paragraphs, card action, and meta description.
- Each illustrative example must contain the word "hypothetical" or "illustrative".
- Meta descriptions ≤ 170 characters. Nav hrefs are site paths.

## Conventions

- Sentence case for headings. Uppercase only in eyebrows (handled by CSS).
- Frame outcomes as intended improvements, not guaranteed results. The test suite fails on "trusted by", "guaranteed", "revolutionary", "seamless", "limitless", "% savings".
- Don't add client names, logos, testimonials, statistics, certifications, or publications here unless they are approved and recorded in `docs/PROVENANCE.md`.
- Strings are plain text. Use `’` for a curly apostrophe inside single-quoted strings, or switch the string to double quotes.

## Adding a service

1. Add an object to `services` in `services.ts` with a new `id` (lowercase, hyphenated; it becomes the URL `/services/<id>`).
2. Add the id to the `ServiceId` union in `types.ts`.
3. Give it `role: 'support'` unless you are restructuring the hierarchy.
4. Reference it from a buyer situation in `approach.ts` if relevant.
5. `npm run build` — the route, sitemap entry, form option, and 404 page list update automatically.

## Turning on contact delivery

See README → Environment variables. Set `VITE_CONTACT_ENDPOINT`, deploy the `api/contact.ts` function with its three server variables, submit an authorized test, confirm receipt, then update the Privacy page sections marked "Owner review required".
