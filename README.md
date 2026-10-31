# Hirox

Founder intelligence, from an investment thesis to a researched outreach draft.

Hirox discovers real companies and people through Crustdata, reads source material with Firecrawl, and uses OpenAI to produce evidence-linked Meet / Watch / Pass recommendations and personalized email drafts. It does not send email.

## Local development

1. Install Node.js 22 or newer and run `npm install`.
2. Copy `.env.example` to `.env.local` and set `CRUSTDATA_API_KEY`, `OPENAI_API_KEY`, and `FIRECRAWL_API_KEY`.
3. Run `npm run dev` and open http://localhost:3000.

Local research is saved under `.hirox/`, which is excluded from Git. Supabase connection details can be added for hosted persistence. Never commit credentials or saved private research.

The repository is under active development. Incremental commits may be unverified; check the latest validation notes before relying on a revision.

## Product scope

See [product brief](FIRSTSIGNAL_PRODUCT_BRIEF.md), [real-data demo plan](FIRSTSIGNAL_DEMO_PLAN.md), and [stack](HIROX_BUILD_STACK.md).

Demo subjects and source snapshots are clearly labeled. Real research never silently falls back to invented data. A missing company profile does not establish pre-incorporation status; a recommendation is relative to the investor's thesis.
