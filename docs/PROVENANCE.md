# Content provenance record (private)

Source types: **Owner** (supplied by Saif / the brief), **Proposed** (marketing language written for this build, makes no factual claim), **Observed** (seen on the current public site — not verification), **Missing** (needed but not supplied).

| Claim / content | Source | Approval | Location in build |
| --- | --- | --- | --- |
| Business name "Savant Analytics" | Owner | Approved | Everywhere (`site.name`) |
| Owner name "Saif Islam" | Owner | Approved | About, footer, metadata |
| Team experience by category: large consulting firms, federal civilian agencies, Fortune 500, SAS-to-Python migration, AI governance | Owner (stated) | Category-level approved by owner direction; named firms/agencies withheld pending approval (D-04) | About page |
| SBA EDWOSB Certified and WOSB Certified | Owner (official SBA icons supplied 2 Nov 2026) | Approved | About page, footer |
| Production domain savantanalytics.net | Owner | Approved | Canonicals, sitemap, JSON-LD |
| Five service areas and their scope, deliverables, guardrails | Owner (brief §6) | Approved directional scope; commercial packages still need review | `src/content/services.ts` |
| Hero copy, relevance strip, four-stage approach, three buyer situations | Owner (brief §4, §5, §7) | Approved | `src/content/site.ts`, `approach.ts` |
| Service detail paragraphs, FAQ answers, About principles, illustrative examples | Proposed | Needs owner read-through for voice; contains no factual claims about clients, results, or credentials | `services.ts`, `approach.ts`, `about.ts` |
| Illustrative examples (4 total) | Proposed, labeled hypothetical | Approved form per brief §14 | Homepage, each service page |
| Email saif.islam@savantanalytics.net | Observed | **Not approved** — not rendered | `site.publicEmail = null` |
| Email info@savantanalytics.net | Observed | **Not approved** — not rendered | — |
| Phone 202.412.0212 | Observed | **Not approved** — not rendered | — |
| Calendly https://calendly.com/savantanalytics | Observed | **Not approved** — not rendered | `site.schedulingUrl = null` |
| Substack article "Agentic AI readiness" | Observed | **Not approved** — not linked (author/ownership/relevance review pending) | — |
| Certifications, federal-work history, quantified savings, client identities, tenure | Observed on current site | **Omitted** per brief §14 | — |
| Credentials, employers, publications, book title, photo | Missing | — | About page omits them |
| Geography, team size, operating history, client industries, partnerships, response times | Missing | Not inferred | — |
| Legacy route `/ai` and `/migration` | Observed (brief register) | Redirect targets proposed; owner confirm (D-06) | `vercel.json` |
| Privacy: processor, retention, hosting provider | Missing | Rendered as "Owner review required" notices | `src/pages/Privacy.tsx` |
| Social-sharing image | Proposed (brand tokens only, no claims) | OK | `public/og-image.png` |
