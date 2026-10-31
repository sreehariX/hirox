import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Prospect, ResearchRun, Source, ResearchEvent } from "../types";
import { getRun, saveRun } from "./store";
import { crust, source, searchWeb, readPage, redactError, type Reporter } from "./providers";
import { structured, planSchema, assessmentSchema, draftSchema, RESEARCH_RULES } from "./model";
import { validateAssessment } from "./quality";
import { domainOf, safeUrl } from "../utils";

type RecordData=Record<string,any>; // Provider payloads are normalized before they reach the UI.
export function emptyProspect(name:string,kind:"company"|"person",domain="",profileUrl=""):Prospect {
  return {id:randomUUID(),name,kind,domain,profileUrl,company:kind==="company"?name:"",location:"",headline:"Research pending",stage:"Unknown",status:"pending",decision:"Watch",summary:"",whyNow:{text:"",sourceIds:[]},reasonsFor:[],reasonsAgainst:[],unknowns:[],nextQuestion:"",confidence:"Limited",thesisFit:"Partial",timeline:[],connections:[],sources:[],warnings:[]};
}
async function requiredRun(id:string) {const r=await getRun(id);if(!r)throw new Error("Research run not found.");return r;}
async function event(run:ResearchRun,label:string,detail:string,status:ResearchEvent["status"]="running",provider?:string) {
  run.events.push({id:randomUUID(),at:new Date().toISOString(),label,detail,status,provider});await saveRun(run);
}
function reporter(run:ResearchRun):Reporter {
  let pending=Promise.resolve();
  return record=>{
    pending=pending.then(async()=>{
      if(record.cached)run.cacheHits++;else run.apiCalls++;
      run.events.push({id:randomUUID(),at:new Date().toISOString(),label:`${record.provider} · ${record.endpoint}`,detail:record.message,status:record.ok?"success":"warning",provider:record.provider});
      await saveRun(run);
    });return pending;
  };
}
async function optional<T>(run:ResearchRun,p:Prospect,label:string,task:()=>Promise<T>):Promise<T|null> {
  try {return await task();}catch(e){const message=`${label}: ${redactError(e)}`;p.warnings.push(message);await event(run,label,message,"warning");return null;}
}
function profileSource(name:string,url:string,data:unknown,endpoint:string):Source {
  return source({title:`${name} · professional profile`,url:safeUrl(url),content:JSON.stringify(data,null,2).slice(0,25000),provider:"Crustdata",kind:"profile",status:"fetched",endpoint});
}
function sourceInput(sources:Source[]) {
  return sources.map(s=>({id:s.id,title:s.title,url:s.url,kind:s.kind,status:s.status,fetchedAt:s.fetchedAt,publishedAt:s.publishedAt,content:s.content.slice(0,s.kind==="profile"?14000:9500)}));
}
export async function prepareResearch(id:string) {
  const run=await requiredRun(id);if(run.status==="cancelled")return;
  if(run.plan)return;
  run.status="planning";await event(run,"Understanding your thesis","Defining the mandate, useful signals, and exclusions.","running","OpenAI");
  run.plan=await structured(planSchema,"research_plan",`${RESEARCH_RULES}\nTurn the user's mandate into a short title, a natural-language company search, a people search for relevant builders, research questions, and clear inclusion/exclusion rules. Don't invent sectors/geographies not requested. seedOnly is true only if Series A and later are explicitly excluded.`,run.input,run);
  run.title=run.plan.title;await event(run,"Research plan ready",`${run.plan.requirements.join(" · ")}`,"success","OpenAI");
}
export async function discoverResearch(id:string):Promise<number> {
  const run=await requiredRun(id);if(run.status==="cancelled")return 0;
  if(run.prospects.length)return run.prospects.length;
  if(!run.plan)throw new Error("Research plan is missing.");
  run.status="discovering";const report=reporter(run);
  if(run.input.seeds.trim()) {
    const seeds=run.input.seeds.split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean).slice(0,run.input.limit);
    run.prospects=seeds.map(seed=>{
      const urlish=/^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(seed);
      if(urlish && !seed.includes("linkedin.com/in/") && !seed.includes("github.com/"))return emptyProspect(domainOf(seed),"company",domainOf(seed));
      return emptyProspect(urlish?seed.split("/").filter(Boolean).pop()||seed:seed,"person","",urlish?seed:"");
    });
    await event(run,"Seed candidates loaded",`${seeds.length} candidates supplied by you. These are not presented as newly discovered prospects.`,"success");
    return run.prospects.length;
  }
  await event(run,"Discovering real prospects","Searching the company and people graph against your thesis.","running","Crustdata");
  const candidates:Prospect[]=[];
  const queries:Promise<void>[]=[(async()=>{
    try {
      const out=await crust<{companies?:RecordData[]}>("/company/search",{search:{query:run.plan!.companyQuery,mode:"hybrid"},fields:["basic_info","locations","funding","headcount"],limit:8},report);
      for(const row of out.companies||[]) {const b=row.basic_info||{};const p=emptyProspect(b.name||b.primary_domain||"Company","company",b.primary_domain||"",b.professional_network_url||"");p.rawProfile=row;p.sources=[profileSource(p.name,p.profileUrl||`https://${p.domain}`,row,"/company/search")];p.headline=b.description||"";candidates.push(p);}
    }catch(e){run.warnings.push(`Company discovery: ${redactError(e)}`);}
  })()];
  if(run.input.includePeople)queries.push((async()=>{
    try {
      const out=await crust<{profiles?:RecordData[]}>("/person/search",{search:{query:run.plan!.peopleQuery,mode:"hybrid"},fields:["basic_profile","social_handles","experience"],limit:5},report);
      for(const row of out.profiles||[]) {const b=row.basic_profile||{};const p=emptyProspect(b.name||"Person","person","",row.social_handles?.professional_network_identifier?.profile_url||"");p.rawProfile=row;p.sources=[profileSource(p.name,p.profileUrl,row,"/person/search")];p.headline=b.headline||b.current_title||"";candidates.push(p);}
    }catch(e){run.warnings.push(`People discovery: ${redactError(e)}`);}
  })());
  await Promise.allSettled(queries);
  if(!candidates.length)throw new Error(`No prospects were returned. ${run.warnings.join(" ")} Try a broader thesis or explicitly supplied seed candidates.`);
  const selection=await structured(z.object({ids:z.array(z.string())}),"select_prospects",`${RESEARCH_RULES}\nChoose up to ${run.input.limit} promising and useful candidates to research. Choose ONLY IDs in the supplied candidates; never invent a person. When both types are available and limit permits, select at least one company and one person-only candidate. A likely mismatch can be investigated to explain an exclusion.`,{thesis:run.input.thesis,candidates:candidates.map(p=>({id:p.id,name:p.name,kind:p.kind,profile:p.rawProfile}))},run);
  const selected=[...new Set(selection.ids)].map(id=>candidates.find(c=>c.id===id)).filter((p):p is Prospect=>!!p).slice(0,run.input.limit);
  if(run.input.limit>1)for(const kind of ["company","person"] as const){if(!selected.some(p=>p.kind===kind)){const candidate=candidates.find(p=>p.kind===kind&&!selected.includes(p));if(candidate){if(selected.length>=run.input.limit)selected.pop();selected.push(candidate);}}}
  if(!selected.length)throw new Error("The candidate selection could not be matched to real search results.");
  run.prospects=selected;await event(run,"Shortlist discovered",`Selected ${selected.length} candidates from ${candidates.length} retrieved profiles for deeper research.`,"success","OpenAI");return selected.length;
}
export async function researchProspect(id:string,index:number) {
  const run=await requiredRun(id);if(run.status==="cancelled")return;
  const p=run.prospects[index];if(!p||p.status==="complete")return;
  run.status="researching";p.status="researching";p.sources=p.sources.filter(s=>s.kind==="profile");p.warnings=[];
  const report=reporter(run);await event(run,`Researching ${p.name}`,"Resolving identity, finding original work, and checking the case for a conversation.");
  try {
    let company:RecordData|undefined=p.kind==="company"?p.rawProfile:undefined;
    let people:RecordData[]=[];
    if(p.kind==="company") {
      const identity=await optional(run,p,"Company identity",()=>crust<RecordData[]>("/company/identify",p.domain?{domains:[p.domain],exact_match:true}:{names:[p.name]},report));
      const matches=identity?.[0]?.matches||[];
      if(matches.length && (matches[0].confidence_score??0)>=0.75){company=matches[0].company_data;p.name=company?.basic_info?.name||p.name;p.domain=company?.basic_info?.primary_domain||p.domain;p.profileUrl=company?.basic_info?.professional_network_url||p.profileUrl;}
      else p.warnings.push("Company identity was not confidently resolved. Website evidence will remain separate from ambiguous profile matches.");
      if(company?.crustdata_company_id) {
        const enriched=await optional(run,p,"Company context",()=>crust<RecordData[]>("/company/enrich",{crustdata_company_ids:[company!.crustdata_company_id],fields:["basic_info","funding","headcount","people","hiring","locations"]},report));
        company=enriched?.[0]?.matches?.[0]?.company_data||company;
        p.sources.push(profileSource(p.name,p.profileUrl||`https://${p.domain}`,company,"/company/enrich"));
      }
      const found=await optional(run,p,"Founder search",()=>crust<{profiles:RecordData[]}>("/person/search",{filters:{op:"and",conditions:[{field:"experience.employment_details.current.name",type:"(.)",value:p.name},{field:"experience.employment_details.current.title",type:"(.)",value:"founder"}]},fields:["basic_profile","social_handles","experience","education"],limit:3},report));
      people=found?.profiles||[];
      if(company?.crustdata_company_id) {
        const jobs=await optional(run,p,"Hiring signals",()=>crust<{job_listings:RecordData[]}>("/job/search",{filters:{field:"company.basic_info.company_id",type:"=",value:company!.crustdata_company_id},fields:["job_details","metadata.date_added","company.basic_info.name"],limit:3},report));
        for(const j of jobs?.job_listings||[])p.sources.push(source({title:j.job_details?.title||"Hiring signal",url:safeUrl(j.job_details?.url||""),content:JSON.stringify(j).slice(0,9000),provider:"Crustdata",kind:"jobs",status:"fetched",publishedAt:j.metadata?.date_added,endpoint:"/job/search"}));
      }
    } else {
      const result=await optional(run,p,"Person identity",()=>crust<{profiles:RecordData[]}>("/person/search",{filters:{field:"basic_profile.name",type:"=",value:p.name},fields:["basic_profile","social_handles","experience","education"],limit:3},report));
      const rows=result?.profiles||[];
      if(rows.length===1)people=rows;
      else if(p.rawProfile)people=[p.rawProfile];
      else if(rows.length>1) {p.warnings.push("Multiple people share this name. These records require identity confirmation; they were not automatically merged.");p.sources.push(profileSource(`${p.name}: ambiguous identity candidates`,"",rows,"/person/search"));}
    }
    for(const person of people) {
      const name=person.basic_profile?.name||p.name;
      const profile=person.social_handles?.professional_network_identifier?.profile_url||"";
      p.sources.push(profileSource(name,profile,person,"/person/search"));
      if(profile && people.indexOf(person)===0) {
        const enriched=await optional(run,p,"Career history",()=>crust<RecordData[]>("/person/enrich",{professional_network_profile_urls:[profile],fields:["basic_profile","social_handles","experience","education","skills"]},report));
        const full=enriched?.[0]?.matches?.[0]?.person_data;
        if(full)p.sources.push(profileSource(name,profile,full,"/person/enrich"));
        const posts=await optional(run,p,"Public social activity",()=>crust<{posts:RecordData[]}>("/social_post/search",{filters:{field:"actor.professional_network_url",type:"=",value:profile},sorts:[{field:"date_posted",order:"desc"}],limit:3},report));
        for(const post of posts?.posts||[])p.sources.push(source({title:`${name} · public post`,url:safeUrl(post.share_url||""),content:JSON.stringify(post).slice(0,14000),provider:"Crustdata",kind:"social",status:"fetched",publishedAt:post.date_posted,endpoint:"/social_post/search"}));
      }
    }
    const query=p.kind==="company"?`"${p.name}" founders funding interview product latest`:`"${p.name}" projects GitHub interview research startup`;
    const results=await optional(run,p,"Public source discovery",()=>searchWeb(query,report));
    if(results)p.sources.push(...results);
    const links=[p.domain?`https://${p.domain}`:"",...(results||[]).map(s=>s.url)].filter(u=>safeUrl(u)&&!u.includes("linkedin.com")&&!u.includes("crunchbase.com"));
    const chosen=Array.from(new Set(links)).slice(0,4);
    if(results?.length) {
      const choice=await structured(z.object({urls:z.array(z.string())}),"source_selection",`${RESEARCH_RULES}\nSelect up to four supplied URLs to read deeply. Prefer the person's own work, company announcements, a substantive interview, and evidence of funding/stage. Avoid directories. Only return URLs supplied here.`,{name:p.name,kind:p.kind,thesis:run.input.thesis,urls:links,results:results.map(s=>({url:s.url,title:s.title,snippet:s.content}))},run);
      const allowed=new Set(links);const selected=choice.urls.filter(u=>allowed.has(u));if(selected.length)chosen.splice(0,chosen.length,...Array.from(new Set(selected)).slice(0,4));
    }
    for(const url of chosen) {
      const page=await readPage(url,report);if(page)p.sources.push(page);else p.warnings.push(`Could not read ${domainOf(url)}; no full-page claims were inferred.`);
    }
    if(p.sources.length===0)throw new Error("No usable evidence was retrieved for this prospect.");
    await event(run,`Evaluating ${p.name}`,"Checking thesis fit, supporting evidence, counterevidence, and unanswered questions.","running","OpenAI");
    const assessment=await structured(assessmentSchema,"prospect_assessment",`${RESEARCH_RULES}\nWrite a useful investor brief: 2-4 reasons for, 1-3 reasons against or qualification gaps, a dated timeline, up to 7 graph connections, a specific next question, and a grounded Meet/Watch/Pass recommendation. A Watch is appropriate where founder intent or identity is unestablished. Assess career progression and actual work, not personality. Use stage='Unknown' when unknown. Company field is empty for a builder with no verified company. Every timeline event/connection/reason must cite source IDs. Treat snapshot search text as snippets and professional data as reported profiles. Don't invent negative reasons to fill a quota. Do not claim incorporation status.`,{asOf:new Date().toISOString(),prospect:{name:p.name,kind:p.kind},thesis:run.input.thesis,requirements:run.plan,sources:sourceInput(p.sources)},run);
    Object.assign(p,assessment);p.status="complete";validateAssessment(p,run.plan?.seedOnly||false);
    await event(run,`${p.name}: ${p.decision}`,`${p.sources.filter(s=>s.status==="fetched").length} readable sources · ${p.confidence.toLowerCase()} evidence.`,"success","OpenAI");
  }catch(e){p.status="error";p.warnings.push(redactError(e));await event(run,`Research incomplete: ${p.name}`,redactError(e),"error");}
  await saveRun(run);
}
export async function finishResearch(id:string,error?:string) {
  const run=await requiredRun(id);if(run.status==="cancelled")return;
  const completed=run.prospects.filter(p=>p.status==="complete").length;
  run.status=error||!completed?"error":"complete";run.error=error||(!completed?"No prospect research completed. Check the activity log and retry.":undefined);run.completedAt=new Date().toISOString();
  await event(run,error?"Research needs attention":"Research saved",error||`${completed} researched prospects are ready to review.`,error?"error":"success");
}
export async function generateDraft(run:ResearchRun,p:Prospect,tone:string,context?:string) {
  if(p.status!=="complete"||p.sources.filter(s=>s.status==="fetched").length<2)throw new Error("Finish research with at least two readable sources before drafting.");
  const draft=await structured(draftSchema,"outreach_draft",`${RESEARCH_RULES}\nWrite an 80-120 word first-contact email that sounds like one thoughtful human. Mention one concrete product/work detail and, if relevant, one founder detail. Explain briefly why this is relevant to the sender's stated focus. Ask ONE easy question or for a short conversation. Do not ask for metrics, revenue, ARR/MRR, documents, code, sample reports, or a demo before a conversation; avoid a laundry list of questions or homework. No generic praise or hype. Use only supplied investor identity/context; don't invent a fund, portfolio, introductions, or sender familiarity. If investor name is blank, omit the signature entirely. Do not claim the sender watched/read something personally. Do not assume fundraising or founder intent. For a person with unknown intent use an exploratory professional conversation. Respect any public preference against AI-written outreach: if such a preference appears in sources, refuse by returning an empty subject and body. Cite factual sentences separately in citations; don't put citation markers into the actual email. ONLY use source IDs supplied. Do not write a greeting to a named founder unless their identity is supported; use the company team otherwise. Never send anything.`,{tone,investor:{name:run.input.investorName,firm:run.input.investorFirm,context:context||run.input.investorContext},thesis:run.input.thesis,prospect:{name:p.name,company:p.company,kind:p.kind,decision:p.decision,summary:p.summary,question:p.nextQuestion},sources:sourceInput(p.sources)},run);
  if(!draft.subject.trim()||!draft.body.trim())throw new Error("This person has expressed a contact preference that prevents an AI-written draft, or the model returned no usable email.");
  if(!run.input.investorName)draft.body=draft.body.replace(/\n(?:Best|Thanks|Regards|Sincerely|Cheers)[,!\s]*\n[^\n]{1,80}\s*$/i,"").trim();
  const ids=new Set(p.sources.map(s=>s.id));draft.citations=draft.citations.map(c=>({...c,sourceIds:c.sourceIds.filter(id=>ids.has(id))})).filter(c=>c.sourceIds.length);
  if(!draft.citations.length)throw new Error("The draft did not contain verifiable source references. Retry after reviewing evidence.");
  p.draft={...draft,createdAt:new Date().toISOString()};await saveRun(run);return p.draft;
}
