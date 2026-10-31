import { guard,apiError } from "@/lib/server/auth";
import { storageMode,verifyDatabase } from "@/lib/server/store";
import { crust,redactError } from "@/lib/server/providers";
import type { SetupStatus } from "@/lib/types";
function state():SetupStatus {return {crustdata:{configured:!!process.env.CRUSTDATA_API_KEY},openai:{configured:!!process.env.OPENAI_API_KEY},firecrawl:{configured:!!process.env.FIRECRAWL_API_KEY},supabase:{configured:!!(process.env.SUPABASE_URL&&process.env.SUPABASE_SECRET_KEY)},storage:storageMode(),model:process.env.OPENAI_MODEL||"gpt-5-mini",ready:!!(process.env.CRUSTDATA_API_KEY&&process.env.OPENAI_API_KEY)};}
export async function GET(request:Request){try{await guard(request);return Response.json(state());}catch(e){return apiError(e);}}
export async function POST(request:Request){try{
  await guard(request);const s=state();
  await Promise.allSettled([
    (async()=>{if(!s.crustdata.configured)return;try{const data=await crust("/account/endpoints");s.crustdata.verified=true;s.crustdata.message=`Authenticated. Endpoint permissions retrieved (${Object.keys(data).length} groups).`;}catch(e){s.crustdata.verified=false;s.crustdata.message=redactError(e);}})(),
    (async()=>{if(!s.openai.configured)return;try{const res=await fetch(`https://api.openai.com/v1/models/${encodeURIComponent(s.model)}`,{headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},signal:AbortSignal.timeout(15000)});s.openai.verified=res.ok;s.openai.message=res.ok?`${s.model} is available.`:`Model check returned ${res.status}. Verify model access and billing.`;}catch{s.openai.verified=false;s.openai.message="Model check could not complete.";}})(),
    (async()=>{if(!s.supabase.configured)return;try{s.supabase.message=await verifyDatabase();s.supabase.verified=true;}catch(e){s.supabase.verified=false;s.supabase.message=redactError(e);}})(),
  ]);s.firecrawl.message=s.firecrawl.configured?"Key configured; verified on the first page extraction.":"Optional: Crustdata web fetch is available as fallback.";
  return Response.json(s);
}catch(e){return apiError(e);}}
