# MahaPoly Search

Maharashtra DTE Polytechnic CAP cutoff explorer, built to match the MahaPoly Figma design
(landing page, guided onboarding, results dashboard, shortlist/option form).

Built from 418 colleges and ~77,000 real CAP Round cutoff records.

## Pages
- `/` — Landing page
- `/onboarding` — Admission profile form (merit %, category, gender, candidature, seat level, institute type, region)
- `/results` — Safe / Competitive / Aspirational matches with sidebar filters
- `/shortlist` — Reorderable shortlist with print and share

## Honest limitations (by design, not oversight)
- **Seat level (Home/Other/State district)** isn't verifiable per college — DTE assigns
  it per student per college, and the source data has no district field. We check all
  three by default and label this clearly in the UI rather than pretending to filter
  accurately by "your district."
- **District/region filtering** is a best-effort text match against the college's own
  name (many include a city), not a verified field.
- **No official DTE "choice code"** is shown on the shortlist — the source data doesn't
  include it, and fabricating one would be actively dangerous for a real option form.
  We show our internal reference code and tell users to confirm the real choice code on
  their CAP login.

## Run locally
npm install
npm run dev

## Deploy
Push this folder to a GitHub repo, then import it in Vercel — no configuration needed.
"# mahapoly-search-updated" 
