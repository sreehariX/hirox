# Hirox — real-data demo and build acceptance plan (previously FirstSignal)

Prepared on 31 October 2026, Asia/Calcutta. This is a preparation artifact, not a completed product or an executed Crustdata run.

## Final product

A hosted investor workspace that discovers early-stage startups and potential future founders, researches public professional evidence, explains Meet / Watch / Pass decisions against a thesis, and generates personalized outreach drafts. The service ends at an editable draft.

Crustdata is central: company search/identify/enrichment; people search/enrichment; social posts and discussion context where enabled; web search/fetch for primary articles, interview text, project pages, and papers; job postings for company context. Watchers are an extension after the first complete run works.

## Demo thesis

Use a global thesis so the real examples are not incorrectly restricted to India:

Find seed-stage companies building tools for reliable AI agents, and researchers or independent builders doing relevant work. Exclude companies that have already announced a Series A or later. Explain who merits a meeting, who belongs on a watchlist, and who is outside this thesis. Draft outreach to a supported meeting candidate.

This is an example investor mandate, not a statement that the user operates an investment fund.

## Real subjects researched for the demo

These are reproducible research subjects and potential demo candidates, not hardcoded recommendations. A fresh discovery run can return different prospects. If supplied as seeds, show that explicitly in the input. Do not pretend seeded profiles were discovered by an unrestricted live search.

### Cekura / Tarush Agarwal — potential meeting candidate

- Company's 30 June 2025 announcement reports a $2.4M seed round and describes voice/chat agent testing and monitoring. Its team description discusses complementary testing, trading-systems, and contact-center experience. These are company-reported facts, not audited independent findings.
- A 20 July 2026 article based on an interview with Tarush discusses the limits of text-only voice-agent tests, production failure modes, and the product's origins.
- A 15 October 2026 company article describes its approach to benchmarking deployed voice-agent systems. It supplies a recent professional topic for outreach, subject to verifying the full page during the run.
- Research question: does current evidence still meet the seed-stage restriction? An older seed announcement is not proof that no later round occurred. Current fundraising intent is unknown unless explicitly documented.
- Real discrepancy worth preserving: the company announcement says $2.4M while the interview article describes $2.5M. Present both with attribution if material; do not silently choose a total or turn the discrepancy into an allegation.
- A draft can discuss testing the deployed audio pipeline and ask a specific question about production failure modes. Do not claim the investor personally listened to an interview or invent investor portfolio credentials.

Sources:

- https://www.cekura.ai/blogs/fundraise
- https://www.ycombinator.com/companies/cekura-ai
- https://teamignite.vc/blog/ignite-ai-the-future-of-voice-ai-testing-and-self-improving-agents-with-tarush-agarwal-or-ep284
- https://www.cekura.ai/blogs/cekura-bench-vs-tau-bench
- https://www.linkedin.com/posts/sidhantkabra_workshop-series-continues-back-for-part-activity-7472335874047770625-6oz9

### Composio — outside the example stage restriction

- The company blog index labels its July 2025 announcement as a $25M Series A; the linked founder article describes $29M in funding overall.
- Its agent-tool infrastructure is relevant to the broad sector, but an already-announced Series A fails the example investor's explicit stage limit.
- The decision is Pass for this thesis, not a claim that Composio is a poor company.

Sources:

- https://composio.dev/blog/series-a
- https://composio.dev/blog?tax=category&term=7

### Shreya Shankar — person-first research / watch example

- Her own website describes her work on DocETL, data systems, and AI evaluation, and states that she will join CMU as an assistant professor in 2027.
- Her website directly links to her GitHub profile, which links back and identifies the same academic trajectory. This is stronger identity evidence than matching a name.
- Her public technical work justifies investigating relevance to the thesis. The reviewed sources do not establish that she is starting a company or fundraising. Do not label her a pre-incorporation founder or infer a lack of legal incorporation.
- Her homepage also communicates a preference against AI-generated email. Treat this as relevant contact-preference data. For this demo, keep the prospect in research/watch status and draft for the supported startup candidate instead.
- This example demonstrates that a strong research record need not become an immediate investor outreach recommendation.

Sources:

- https://www.sh-reya.com/
- https://github.com/shreyashankar
- https://www.csd.cmu.edu/calendar/2026-03-18/scs-faculty-candidate-shreya-shankar

## Website views

1. **Discover:** thesis and optional seeds, visible research progress, result cards with Meet / Watch / Pass and evidence coverage.
2. **Research:** career/work timeline, relevant company context, compact relationship graph, source excerpts and dates, reasons for/against, unknowns, and recommendation.
3. **Draft:** editable subject/body, investor context, tone control, and a side panel linking factual statements to source evidence. Copy and export only.

Represent what the model concluded with concise evidence-based explanations. There is no need to expose private model reasoning or manufacture numerical confidence in investment success.

## Two-minute recording storyboard

Timings describe the edited clip, not a promise about backend research latency. Measure real runtime; any trimmed waiting should be apparent, with elapsed research time retained.

| Clip time | What the viewer sees |
| --- | --- |
| 00:00–00:15 | Hosted website; enter the thesis and submit a new research request. Optional seed input is visibly disclosed. |
| 00:15–00:35 | Real searches/enrichments complete and evidence arrives. Show source names and fetched times from actual results. |
| 00:35–01:05 | Open a supported meeting candidate. Inspect founder experience, a substantive interview/article insight, and the original source. |
| 01:05–01:25 | Inspect one stage mismatch and one person-only result. Show why the decisions differ and what remains unknown. |
| 01:25–01:50 | Generate a contextual draft for the meeting candidate. Click one factual sentence to see its supporting source; edit the wording. |
| 01:50–02:00 | Copy/export the draft and briefly show the saved research run. |

For a five-minute finalist presentation, add a changed-thesis rerun and a refresh/resume demonstration. Neither should generate fabricated data or reapply completed work unnecessarily.

## Live-data acceptance checks

- Verify API permissions and credit balance with the actual Crustdata account before relying on gated social or research fields.
- Verify which of the candidate people/companies are returned and whether profiles resolve correctly. A public webpage does not prove the record is available via Crustdata.
- Perform genuine discovery against the submitted thesis; retain raw responses and provenance securely for debugging.
- Validate every recommendation's mandatory criteria and cite material facts. Missing stage evidence stays unknown.
- Use real public source content. Any saved real-source snapshots are labeled with retrieval time and cache status. Do not represent a fixture replay as a live API response.
- Search for disconfirming evidence, later funding, stale role information, and identity collisions before finalizing a recommendation.
- Keep long-form interview claims within retrieved content; a summary article is identified as an article, not a personally watched video or a full transcript.
- Do not turn professional comments into verified revenue/customers or public work into proof of founder intent.
- Ensure drafts contain no unsupported familiarity, investor credentials, or invented recipient addresses. Do not send email.
- Verify saved-run recovery and basic source/draft export behavior before recording.

## Required accounts and optional deals

Required: Crustdata credentials and OpenAI API credentials (both accounts confirmed active by the user); Firecrawl credentials (selected by the user); a Supabase project for persistence; a Vercel deployment account for the hosted website.

Firecrawl will handle additional public-page extraction. Langfuse is excluded at the user's request; use application run history and Vercel logs for debugging. Deepgram can be added later if accessible audio without transcripts becomes necessary. Email delivery services are unnecessary for the agreed draft-only outcome. See HIROX_BUILD_STACK.md for the selected stack.

Deal eligibility, activation, and credit availability must be checked in the user's accounts. Do not assume the pasted deal amounts have already been redeemed or are spendable.

No provider variables or .env files were found in the workspace during this preparation. The user confirmed an active Crustdata API key and usable OpenAI credits. Credential placement and actual endpoint checks remain implementation setup tasks. Keys should be placed in local/deployment secret settings, not the public repository or chat.

References for optional infrastructure:

- https://supabase.com/docs
- https://docs.firecrawl.dev/introduction
- https://vercel.com/docs/workflows
