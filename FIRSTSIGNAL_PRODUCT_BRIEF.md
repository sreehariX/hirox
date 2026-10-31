# Hirox — agreed product scope (working name; previously FirstSignal)

Updated: 31 October 2026, Asia/Calcutta.

This records the user's accepted product direction and subsequent additions. The user's proposed working name is Hirox, replacing FirstSignal in the product UI. The file retains its existing path so previous links continue to work. Earlier idea-selection documents in this workspace describe previous candidates; this brief is the current product direction. This file is a specification, not evidence that the product has been implemented. See HIROX_BUILD_STACK.md for the selected services and naming findings.

## Product and customer

A hosted website for early-stage investors and venture scouts. It turns an investment thesis into a researched shortlist of startups and potential future founders, evidence-backed meeting recommendations, and personalized outreach drafts.

Positioning: Find promising people early, understand their work deeply, and draft an informed first conversation.

The complete service is discovery, research, qualification, and outreach preparation. The workflow ends at an editable draft. It does not send messages, book meetings, obtain replies, or make investment decisions.

The user has now requested finalization before implementation. Crustdata is the primary discovery and research data layer. The demo must use real people and companies, show evidence for both positive and negative recommendations, and end with a real generated draft. See FIRSTSIGNAL_DEMO_PLAN.md for verified public research subjects, the recording sequence, and setup dependencies. No application has been implemented yet.

## Three discovery routes

1. **Early-stage startups:** find existing teams and companies that fit the user's sector, geography, stage, and investment thesis.
2. **Potential future founders:** discover engineers, researchers, operators, maintainers, and other builders through relevant work and public professional signals. A company profile or domain is not required.
3. **Emerging teams:** investigate people publicly building together or joining an emerging venture, supported by identity and dated evidence.

Potential future founder is a research category, not a factual prediction of intent or success. Leaving a job, publishing a repository, or working at the same company does not establish that someone is founding a company, fundraising, or personally knows another person.

Support people before company formation. Use evidence-based labels such as exploring a venture, building publicly, company established, and status unknown. Do not infer legal incorporation status from the absence of a Crustdata record. Crustdata describes its company product as business intelligence rather than a legal-registry lookup.

## Inputs

- Investor thesis: sectors, geography, stage, relevant technical or commercial experience, exclusions, and desired shortlist size.
- Investor identity and authentic value proposition for outreach; optional writing samples for tone.
- Optional seed founders, companies, public profiles, or projects.

## Research coverage

Research available public professional sources and show coverage and gaps:

- Career chronology, responsibilities, progression, relevant experience, and previous ventures.
- Public professional posts, product announcements, hiring posts, and substantive discussions.
- Articles, blogs, essays, research papers, and published technical work.
- Interviews, talks, and podcasts when accessible content or transcripts are available. A title or description is not the interview itself.
- Public GitHub projects: relevant contributions, releases, maintenance, and evidence of use. Confirm profile ownership through reliable links; name similarity is insufficient.
- Team composition, complementary experience, and dated employment overlap. Label overlap as overlap unless direct collaboration is documented.
- Company stage, hiring, funding announcements, and growth signals when a company exists.
- Public requests for trials, integrations, or demos, and other substantive professional interest. These are not verified customers or revenue.

The product cannot promise exhaustive access to every platform. Search snippets and AI-generated search summaries must not become unsupported primary evidence. Fetch and inspect accessible original sources for material claims.

## Proposed edge

Combine people discovery with a dated account of what someone has built, what they publicly say about the problem, and the evidence that makes a conversation timely. Connect that research directly to outreach preparation.

An especially visual feature is the buyer-interest graph: founder -> product post -> substantive trial/integration request -> commenter's verified professional role and company. This is a useful signal where available, not a requirement for every founder. Quiet researchers and builders must not be scored poorly solely because they lack public social engagement.

Every recommendation should answer:

- Why does this person or team fit this investor's thesis?
- What relevant work supports the recommendation?
- What changed recently, if anything?
- What evidence contradicts the thesis or remains missing?
- What specific opening would make an outreach email relevant?

Assess observable, job-relevant work and thesis fit. Do not use follower count, employer prestige, or GitHub stars as stand-alone proof of talent. Do not claim a calibrated probability of entrepreneurial success. Keep thesis fit, evidence strength, and freshness separate.

Use three decisions: Meet, Watch, and Pass for this thesis. Meet means a conversation is justified by the available evidence; Watch means relevant work but a material uncertainty or timing gap; Pass means an explicit criterion is not met. Display reasons for, reasons against, source dates, missing information, and what could change the decision. Unknown information cannot silently satisfy a required filter. Do not frame a pass as a judgment of a person's worth or a startup's overall quality.

## Workflow and outputs

Investment thesis -> discover people and companies -> resolve identities -> gather professional evidence -> check claims and gaps -> rank prospects -> write research briefs -> generate editable email drafts.

For each shortlisted prospect, deliver:

1. A founder or company card with a clearly supported stage/status.
2. A research brief with a dated timeline, source links, and relevant excerpts.
3. A graph of supported people, company, project, and post relationships.
4. A meeting recommendation with supporting reasons and uncertainties.
5. A personalized email draft with a subject and a simple, relevant invitation.

The website has a discovery view, a prospect research view, and an email drafting view. The draft panel can show which source supports each factual sentence without inserting citation clutter into the actual email. Actions are edit, copy, and export; there is no automatic sending in the agreed scope.

## Email behavior

Research deeply, then select the one or two details that make the email relevant. Default to approximately 80–140 words, with an adjustable length and tone. Use specific language and a natural, modest request.

Do not invent mutual contacts, investor portfolio companies, meetings, promises, or personal familiarity. Do not claim the sender personally watched or read something merely because the agent retrieved it. Use only the investor's supplied value proposition. Tailor the request to the evidence: an exploratory conversation for a builder is different from a fundraising conversation with a founder who publicly says they are raising.

Keep the recipient address unresolved if unavailable; do not guess it. The application may still produce a draft without an address. Draft generation never authorizes sending.

## Crustdata use and access

- People search/enrichment: discover and identify people; obtain professional history and supported developer/research fields where accessible.
- Company search/identify/enrichment: discover existing startups and add context to employers, teams, and potential buyers.
- Social posts: retrieve professional posts and available discussion/author context. Indexed Social Post Search is disabled by default and requires account enablement.
- Web Search and Fetch: locate and read accessible articles, interviews/transcripts, product documentation, public profiles, papers, and project pages.
- Jobs: add evidence about what an existing company is hiring to build.
- Watchers: later refresh people/company changes and explain what changed; not required to finish the first discovery-to-draft run.

Check account permissions before making an optional endpoint essential. Show unavailable coverage honestly. Do not substitute fabricated evidence for blocked or missing data.

## Hackathon build focus

Prioritize one complete hosted workflow with three well-researched prospects, including at least one person whose company status is absent or uncertain if supported by real data. Build the evidence panels and draft editor before expanding platform coverage or adding live monitoring.

The demo should show a fresh thesis, a live discovery/research step, one source-backed connection, an uncertainty or disqualifying fact handled correctly, and an editable personalized draft. Clearly label any prerecorded responses or synthetic fixtures. Demonstrate research depth through inspectable evidence rather than unsupported scores.

Target a Next.js/TypeScript website hosted on Vercel, with Supabase persistence and OpenAI as the model provider. The user confirmed an active Crustdata API key and usable OpenAI credits. Use Crustdata directly from the server for company, people, social, web, and job data. The user selected Firecrawl for additional source-page extraction and explicitly excluded Langfuse. Use Vercel Workflow for resumable research execution and Supabase for application records and source evidence. Check deployment-plan access and SDK compatibility during implementation. Sending infrastructure and audio transcription are not required for the first version because drafts remain in the application and the initial interview source is available as text.

As of scope finalization, the user confirmed that Crustdata and OpenAI accounts are active, but no matching provider environment variables or .env files were found in this workspace. Actual Crustdata response coverage and endpoint access have not been tested with the user's key. Public sources are verified separately; this does not establish API availability.

## Primary documentation checked

- People Search: https://docs.crustdata.com/person-docs/search/introduction
- Web Search: https://docs.crustdata.com/web-docs/search/introduction
- Social Post Search and account-access caveat: https://docs.crustdata.com/api-reference/social-post-apis/search-the-social-post-dataset
- Company data and scope: https://crustdata.com/company-data-api
- API capabilities: https://docs.crustdata.com/general/capabilities
- Documentation index: https://docs.crustdata.com/llms.txt

