# Hirox

Founder intelligence, from an investment thesis to a researched outreach draft.

Hirox discovers real companies and people through Crustdata, reads source material with Firecrawl, and uses OpenAI to produce evidence-linked Meet / Watch / Pass recommendations and personalized email drafts. It does not send email.

## Local development

1. Install Node.js 22 or newer and run `npm install`.
2. Copy `.env.example` to `.env.local` and set the Crustdata, OpenAI, Firecrawl, and Supabase credentials. Keep this file private.
3. Run `npm run check:keys` and `node --env-file=.env.local scripts/verify-connections.mjs` to check the accounts.
4. Run `npm run db:setup` to create the private Supabase tables, then set `HIROX_STORAGE=supabase`.
5. Run `npm run dev` and open http://127.0.0.1:3000. If `HIROX_ACCESS_PASSWORD` is set, enter it in the sign-in screen.

When `HIROX_STORAGE=supabase`, research, sources, and drafts are saved in private Supabase tables. The database connection string is needed only for setup; the app uses the Supabase server key at runtime. For an IPv4-only machine, use the **Session pooler** connection string from the project's Connect panel. Local workflow data and test notes stay in ignored folders. Never commit credentials or saved private research.

`npm run typecheck`, `npm run test`, and `npm run build` check the application. `node --env-file=.env.local scripts/live-smoke.mjs` exercises a real Cekura research run and a draft. Add `--discover` to start from the thesis without supplied candidates. These live checks use API credits. The saved example in the website is clearly labeled and makes no API requests.

Hirox researches real companies and independent builders, gives an evidence-linked recommendation relative to the thesis, and stops at an editable email draft. It never sends email. The investor can inspect every source and the activity log. The first available run may take several minutes because it verifies multiple records and source pages.

## Product scope

See [product brief](FIRSTSIGNAL_PRODUCT_BRIEF.md), [real-data demo plan](FIRSTSIGNAL_DEMO_PLAN.md), and [stack](HIROX_BUILD_STACK.md).

Demo subjects and source snapshots are clearly labeled. Real research never silently falls back to invented data. A missing company profile does not establish pre-incorporation status; a recommendation is relative to the investor's thesis.
