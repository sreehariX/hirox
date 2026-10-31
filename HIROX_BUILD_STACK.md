# Hirox — working name and selected build stack

Updated: 31 October 2026, Asia/Calcutta.

## Working name

The user proposed Hirox. Use Hirox as the hackathon working name, with a descriptive subtitle such as "Founder intelligence". The product is the previously agreed FirstSignal scouting, research, qualification, and email-drafting service.

The name is short, but a public search found existing businesses using it, including Hirox microscopes and HiroX Software Solutions. This is a searchability finding, not trademark clearance or a claim about domain availability. Keep the name provisional for a longer-term launch.

Sources:

- https://www.hirox.com/global-home/
- https://www.hirox-software-solutions.com/

## Selected stack

| Layer | Choice | Purpose |
| --- | --- | --- |
| Website and server endpoints | Next.js, React, TypeScript | One codebase for the investor workspace and server-side API access. |
| UI styling and components | Tailwind CSS, shadcn/ui, Lucide icons | Build the discovery cards, evidence panels, and draft editor. |
| Relationship graph | React Flow | Inspect people, companies, projects, posts, and evidence connections. |
| Hosting | Vercel | Deploy the website and server functions; obtain a public demo URL. |
| Long-running research | Vercel Workflow SDK | Execute bounded research steps with persistence, retries, and recovery. Check project-plan access and package compatibility during implementation. |
| App database and files | Supabase Postgres and Storage | Save prospects, research runs, source metadata/excerpts, decisions, and drafts. Use Supabase Auth if account login is included. |
| Primary external data | Crustdata | Discover and enrich people/companies; retrieve supported job, social, and web evidence. |
| Additional page extraction | Firecrawl | Read selected accessible articles, blogs, product pages, and interview text when needed. Crustdata remains the primary research layer. |
| Model provider | OpenAI | Plan tool use, extract structured findings, compare evidence against the thesis, and generate grounded drafts. Choose the exact model after checking account access and a small real-data trial. |
| Model integration | Vercel AI SDK, OpenAI provider, Zod | Tool calling, structured result validation, and incremental output. |
| Source control/submission | GitHub | Store source, setup instructions, architecture, and the final hackathon repository. Never commit secrets. |
| Debugging | Vercel logs, workflow history, saved application events | Diagnose failed calls, incomplete steps, and source coverage. No Langfuse. |

Supabase stores user-visible application data. Workflow persistence stores execution state. Keep these responsibilities distinct and use stable IDs for each research run and step. Retrying a step must not create duplicate drafts or records. A paid external read may still be repeated after an ambiguous failure; cache successfully saved results and do not promise exactly-once external billing.

## Runtime flow

1. The website accepts an investor thesis and optional explicitly shown seed candidates.
2. A server endpoint validates the request and starts a persisted research run.
3. Workflow steps use Crustdata for discovery, identity resolution, and enrichment.
4. Relevant public pages are fetched through Crustdata or extracted using Firecrawl.
5. OpenAI produces structured, source-linked findings and Meet / Watch / Pass reasons.
6. Supabase stores evidence, provenance, decisions, and progress for the website to display.
7. The user selects a supported prospect and generates, edits, copies, or exports an email draft.

All provider credentials are used server-side. The browser receives only permitted app data and public client configuration. Drafting is the terminal action; no outreach is sent.

## Accounts and access

- Confirmed active by the user: Crustdata and OpenAI.
- Still to configure in the workspace/deployment: provider secrets; Firecrawl key; Supabase project connection; Vercel deployment access; GitHub repository access for submission.
- Check Crustdata endpoint permissions, especially indexed Social Post Search, before relying on gated fields.
- A custom domain is optional for the hackathon. An available Vercel deployment URL is sufficient; no Hirox-related URL availability has been checked.
- Langfuse is explicitly excluded. AgentMail, voice/video APIs, payments, AWS, and additional model providers are outside this first build.

## Technical references checked

- https://nextjs.org/docs
- https://vercel.com/docs/workflows
- https://workflow-sdk.dev/
- https://vercel.com/docs/functions/limitations
- https://supabase.com/docs
- https://docs.firecrawl.dev/features/scrape
- https://reactflow.dev/
- https://ai-sdk.dev/docs/introduction

