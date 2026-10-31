# Hirox

Hirox turns a VC's investment thesis into a researched shortlist of startups and promising builders, with evidence-backed recommendations and personalized email drafts.

Built for ContextCon 03 at IIT Bombay.

## The service

At an early-stage fund, an analyst, associate, or scout spends hours finding companies, reading about their founders, checking whether they fit the fund's interests, and preparing an introduction. The work usually ends up spread across profiles, browser tabs, notes, and a CRM.

Hirox takes on that scouting and first-pass research workflow. The intended customer and payer is the VC firm; its investment team uses the results to decide whom to contact. Angel investors can use the same workflow.

The starting point is an investment thesis, rather than a company name you already know. You can also bring a shortlist you want investigated. Funded startups are included when they fit the thesis. A seed-stage mandate can exclude Series A companies; that is a choice about fit, not a limit to researching companies before funding.

## What it does now

1. **Plans the search.** Turns the thesis into company and people searches, research priorities, and exclusions.
2. **Finds prospects.** Searches Crustdata for relevant companies and independent builders, or works through names supplied in **Your shortlist**.
3. **Researches each prospect.** Collects company records, founder experience, public social activity, and hiring signals where available. It selects up to four public pages per prospect for deeper reading.
4. **Makes a case.** Produces a **Meet**, **Watch**, or **Pass** recommendation relative to the thesis, with supporting sources, concerns, unknowns, a timeline, and an evidence connection graph.
5. **Prepares an introduction.** When the user requests a draft, it writes a short email using specific details from the research. The draft can be edited, saved, and copied.

The **Research library** keeps the runs, evidence, and drafts together. The activity log shows provider requests, reused responses, and research gaps.

The investor still verifies ambiguous identities and important claims, chooses whom to approach, and sends the email. Hirox does not send messages or make investment decisions. An unknown funding stage stays unknown. A person without a verified company is not automatically described as a future founder or someone raising money.

### Try it

Choose **3 prospects**, leave **Your shortlist** empty, and use:

> Find seed-stage startups and independent builders creating tools for reliable AI agents. Prioritize shipped products, relevant founder experience, and public evidence of customer use. Explain who deserves a meeting, the concerns, and what remains unknown. Exclude confirmed Series A or later companies. Do not assume anyone is fundraising.

A fresh run can take several minutes. The recorded demo uses real completed research: one thesis-only discovery run and another investigating a supplied shortlist of Cekura, Composio, and Shreya Shankar. Those results belong to our configured database; a fresh installation starts with an empty library. See the [demo notes](DEMO_SCRIPT.md).

## What it could do next

The next useful step is monitoring: return to a saved prospect when a product ships, the team changes, or new evidence answers an open question. We would also add fund-specific memory and CRM integration so the same company is not researched repeatedly without knowing the team's previous conversations.

Before opening this to multiple funds, we need accounts, isolated workspaces, and usage controls. The current build is a shared workspace without a login. Sending email would be a separate feature with explicit approval, contact preferences, and a record of what was sent.

We focused this build on getting from a thesis to an inspectable research brief and draft. Live company and people data, readable web sources, and structured model outputs now make that workflow practical to build and test together.

## How to run it, and how it is built

Hirox is a Next.js 16.4.3 and React 19 application written in TypeScript. Server routes call the providers; API keys stay on the server. OpenAI's Responses API produces structured plans, assessments, and drafts using **gpt-5-mini** by default, configurable through `OPENAI_MODEL`.

The Workflow SDK runs planning, discovery, prospect research, and completion as separate steps. This is one orchestrated research workflow. Supabase stores runs and cached responses; local file storage is also supported. React Flow renders the evidence graph.

### Where Crustdata is used

| Job | Endpoint |
| --- | --- |
| Discover companies | `/company/search` |
| Resolve company identity and retrieve context | `/company/identify`, `/company/enrich` |
| Discover people and find founders | `/person/search` |
| Retrieve career history and professional context | `/person/enrich` |
| Read public professional activity | `/social_post/search` |
| Look for hiring signals | `/job/search` |
| Find supporting web sources | `/web/search/live` |
| Fall back when page extraction fails | `/web/enrich/live` |

Firecrawl reads selected product pages, blogs, articles, and written interviews. Its search endpoint supplements Crustdata when fewer than three usable web results are returned. Provider responses are cached for 24 hours; reused data is marked in the activity log.

### Local setup

Use **Node.js 24**. From the repository root:

```sh
npm ci
```

Copy `.env.example` to `.env.local`. Set `CRUSTDATA_API_KEY`, `OPENAI_API_KEY`, and `FIRECRAWL_API_KEY`. Leave `OPENAI_MODEL=gpt-5-mini` and use `HIROX_STORAGE=local` to save research on this machine.

```sh
npm run dev
```

Open [localhost:3000](http://127.0.0.1:3000). Keep real credentials in the ignored environment file.

For **Supabase**, also set `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `SUPABASE_DB_URL`. Use the project's session pooler connection string for the last value, then run:

```sh
npm run db:setup
```

Set `HIROX_STORAGE=supabase` and restart the app. The database URL is only used for table setup; runtime requests use the server secret key. The migration restricts direct table access to the server role.

For hosting, follow the [Vercel deployment instructions](DEPLOY_VERCEL.md), including Supabase storage and Workflow runtime settings.

### Checks

```sh
npm run test
npm run typecheck
npm run build
```

With Supabase configured and the local app running, these optional checks use real data and consume API credits:

```sh
node --env-file=.env.local scripts/live-smoke.mjs
node --env-file=.env.local scripts/live-smoke.mjs --discover
```

By default, the first researches Cekura and creates a draft; the second tests discovery without supplied candidates. If a run is already active, the script follows that run instead.

## The approaches we tried

- **Supplied names and open discovery.** We tested both. They answer different questions, so the interface keeps their origins visible instead of presenting a supplied company as a discovery.
- **Search snippets and deeper reading.** Snippets helped find sources but were too thin for strong recommendations. We added full-page reading and checks that downgrade a Meet when the available evidence is insufficient.
- **Name matching.** Multiple people can share a name. Ambiguous records stay separate and require confirmation instead of being merged into a convincing but unreliable profile.
- **Long outreach drafts.** Early drafts asked for too much. We narrowed them to one concrete detail, one reason to connect, and one simple question.
- **Research worth returning to.** Saving the evidence and draft in the library makes the output useful after the first session. A failed or missing source remains a gap; it is never replaced with invented research.
