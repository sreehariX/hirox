import {writeFile} from 'node:fs/promises';
const base='http://127.0.0.1:3000';
const discovery=process.argv.includes('--discover');
let cookie='';
const mask=x=>{let value=String(x);for(const key of [process.env.CRUSTDATA_API_KEY,process.env.OPENAI_API_KEY,process.env.FIRECRAWL_API_KEY,process.env.SUPABASE_SECRET_KEY,process.env.SUPABASE_DB_URL,process.env.HIROX_ACCESS_PASSWORD])if(key)value=value.split(key).join('[redacted]');return value;};
async function call(path,method='GET',body){const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(180000)});const data=await response.json();if(!response.ok)throw Error(`${path}: ${response.status} ${mask(data.error||'request failed')}`);return {data,response};}
if(process.env.HIROX_ACCESS_PASSWORD){const {response}=await call('/api/auth','POST',{password:process.env.HIROX_ACCESS_PASSWORD});cookie=response.headers.get('set-cookie')?.split(';')[0]||'';if(!cookie)throw Error('Workspace login did not set a session cookie.');}
const {data:setup}=await call('/api/status','POST');
console.log('Verified services:',Object.fromEntries(['crustdata','openai','firecrawl','supabase'].map(k=>[k,setup[k].verified??setup[k].configured])));
if(!setup.crustdata.verified||!setup.openai.verified||!setup.supabase.verified)throw Error('A required connection did not verify.');
const {data:history}=await call('/api/runs');
let runId=history.runs.find(r=>['queued','planning','discovering','researching'].includes(r.status))?.id;
if(runId){const {data:existing}=await call('/api/runs/'+runId);if(existing.status==='queued'&&existing.events.length===0&&Date.now()-new Date(existing.createdAt).getTime()>30000){await call('/api/runs/'+runId,'PATCH',{action:'cancel'});runId=undefined;console.log('Closed a stalled workflow from an earlier local build.');}}
if(!runId){const {data}=await call('/api/runs','POST',{thesis:'Find seed-stage companies building tools for reliable AI agents. Include researchers and independent builders doing relevant work. Exclude companies that have announced Series A or later. Explain who deserves a conversation and why.',seeds:discovery?'':'cekura.ai',includePeople:true,limit:discovery?3:1,investorName:'',investorFirm:'',investorContext:'I research early-stage tools for reliable AI agents.'});runId=data.id;console.log('Started live research run:',runId,discovery?'(fresh discovery)':'(supplied seed)');}
await writeFile(discovery?'.hirox/discovery-smoke-run-id':'.hirox/live-smoke-run-id',runId);
let last='';
for(let i=0;i<100;i++){
  const {data:run}=await call('/api/runs/'+runId);
  const current=`${run.status} / ${run.events.at(-1)?.label||'starting'}`;
  if(current!==last){console.log(current);last=current;}
  if(['complete','error','cancelled'].includes(run.status)){
    console.log('Research result:',JSON.stringify({status:run.status,prospects:run.prospects.map(p=>({name:p.name,status:p.status,decision:p.decision,sources:p.sources.length,readable:p.sources.filter(s=>s.status==='fetched').length,warnings:p.warnings.length})),apiCalls:run.apiCalls,cacheHits:run.cacheHits,error:run.error?mask(run.error):null}));
    const candidate=run.prospects.find(p=>p.status==='complete'&&p.sources.filter(s=>s.status==='fetched').length>=2);
    if(candidate){try{const {data:draft}=await call('/api/runs/'+runId+'/draft','POST',{prospectId:candidate.id,tone:'Thoughtful',context:'I research early-stage tools for reliable AI agents.'});console.log('Draft result:',JSON.stringify({subject:draft.subject,words:draft.body.trim().split(/\s+/).length,citations:draft.citations.length}));}catch(e){console.error('Draft failed:',mask(e.message));process.exitCode=1;}}
    if(run.status!=='complete')process.exitCode=1;
    break;
  }
  await new Promise(r=>setTimeout(r,4000));
  if(i===99){console.error('Research timed out after polling.');process.exitCode=1;}
}
