import { createHash, randomUUID } from "node:crypto";
import * as cheerio from "cheerio";
import { readCache, writeCache } from "./store";
import { safeUrl } from "../utils";
import type { Source } from "../types";

export type CallRecord={provider:string;endpoint:string;cached:boolean;ok:boolean;message:string};
export type Reporter=(record:CallRecord)=>Promise<void>;
export class ProviderError extends Error { constructor(public provider:string, public status:number, message:string){super(`${provider}: ${message}`);} }
const queues=new Map<string,Promise<void>>();const lastCall=new Map<string,number>();
async function throttle(key:string,ms:number) {
  const before=queues.get(key)||Promise.resolve();
  const next=before.then(async()=>{const wait=ms-(Date.now()-(lastCall.get(key)||0));if(wait>0)await new Promise(r=>setTimeout(r,wait));lastCall.set(key,Date.now());});
  queues.set(key,next.catch(()=>{}));await next;
}
function errorMessage(status:number,body:string) {
  if(status===401)return "API key was rejected. Check the local environment file.";
  if(status===402)return "The account does not have enough credits for this request.";
  if(status===403)return "This endpoint or field is not enabled for this account.";
  if(status===429)return "Rate limit reached. Try again shortly.";
  try {const j=JSON.parse(body);return String(j.message||j.detail||j.error?.message||j.error||`HTTP ${status}`).slice(0,350);}catch{return `Request returned HTTP ${status}.`;}
}
export async function crust<T=Record<string,unknown>>(endpoint:string,body?:unknown,report?:Reporter):Promise<T> {
  const key=process.env.CRUSTDATA_API_KEY;if(!key)throw new ProviderError("Crustdata",401,"CRUSTDATA_API_KEY is missing.");
  const cacheKey=createHash("sha256").update(`crust:${key.slice(-8)}:${endpoint}:${JSON.stringify(body)}`).digest("hex");
  if(body) {const cached=await readCache(cacheKey);if(cached){await report?.({provider:"Crustdata",endpoint,cached:true,ok:true,message:"Saved result reused (within 24 hours)."});return cached as T;}}
  await throttle(endpoint,endpoint.includes("/web/")?6200:2100);
  for(let attempt=0;attempt<2;attempt++) {
    let response:Response;
    try {response=await fetch(`https://api.crustdata.com${endpoint}`,{method:body?"POST":"GET",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json","x-api-version":"2025-11-01"},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(90000),cache:"no-store"});}
    catch {await report?.({provider:"Crustdata",endpoint,cached:false,ok:false,message:"Network request timed out or failed."});throw new ProviderError("Crustdata",0,"Network request timed out or failed.");}
    if(response.status===429 && attempt===0){await new Promise(r=>setTimeout(r,Math.min(15000,Number(response.headers.get("retry-after")||8)*1000)));continue;}
    if(!response.ok){const msg=errorMessage(response.status,await response.text());await report?.({provider:"Crustdata",endpoint,cached:false,ok:false,message:msg});throw new ProviderError("Crustdata",response.status,msg);}
    const data=await response.json();if(body)await writeCache(cacheKey,data);
    await report?.({provider:"Crustdata",endpoint,cached:false,ok:true,message:"Live response received."});return data as T;
  }
  throw new ProviderError("Crustdata",429,"Rate limit reached.");
}
export function source(data:Omit<Source,"id"|"fetchedAt">):Source {return {...data,id:`s_${randomUUID().slice(0,8)}`,fetchedAt:new Date().toISOString()};}
export async function searchWeb(query:string,report?:Reporter):Promise<Source[]> {
  const result=await crust<{results?:{title?:string;url?:string;link?:string;snippet?:string;description?:string}[]}>("/web/search/live",{query,sources:["web"]},report);
  return (result.results||[]).filter(x=>safeUrl(x.url||x.link||"")).slice(0,8).map(x=>source({title:x.title||"Search result",url:safeUrl(x.url||x.link||""),content:x.snippet||x.description||"",provider:"Crustdata",kind:"search",status:"snippet",endpoint:"/web/search/live"}));
}
export async function readPage(url:string,report?:Reporter):Promise<Source|null> {
  url=safeUrl(url);if(!url)return null;
  const key=process.env.FIRECRAWL_API_KEY;
  const hash=createHash("sha256").update(`page:${url}`).digest("hex");
  const old=await readCache(hash) as Source|null;
  if(old){await report?.({provider:old.provider,endpoint:"page extraction",cached:true,ok:true,message:"Saved source reused."});return {...old,cached:true};}
  if(key) {
    try {
      const res=await fetch("https://api.firecrawl.dev/v2/scrape",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({url,formats:["markdown"],onlyMainContent:true,timeout:45000,maxAge:0}),signal:AbortSignal.timeout(55000)});
      if(!res.ok)throw new ProviderError("Firecrawl",res.status,errorMessage(res.status,await res.text()));
      const out=await res.json();if(!out.success||!out.data?.markdown)throw new Error("No readable text returned.");
      const s=source({title:out.data.metadata?.title||new URL(url).hostname,url,content:String(out.data.markdown).slice(0,22000),provider:"Firecrawl",kind:/github.com/.test(url)?"project":"article",status:"fetched",publishedAt:out.data.metadata?.publishedTime});
      await writeCache(hash,s);await report?.({provider:"Firecrawl",endpoint:"/v2/scrape",cached:false,ok:true,message:`Read ${new URL(url).hostname}.`});return s;
    }catch(e){await report?.({provider:"Firecrawl",endpoint:"/v2/scrape",cached:false,ok:false,message:e instanceof ProviderError?e.message:"Page extraction unavailable; trying Crustdata."});}
  }
  try {
    const rows=await crust<{success?:boolean;url?:string;title?:string;content?:string}[]>("/web/enrich/live",{urls:[url]},report);
    const row=rows.find(r=>r.success&&r.content);if(!row?.content)return null;
    const $=cheerio.load(row.content);$("script,style,nav,footer,header,noscript,svg").remove();
    const s=source({title:row.title||new URL(url).hostname,url,content:$("body").text().replace(/\s+/g," ").slice(0,22000),provider:"Crustdata",kind:"article",status:"fetched",endpoint:"/web/enrich/live"});
    await writeCache(hash,s);return s;
  }catch{return null;}
}
export function redactError(e:unknown) {
  let message=e instanceof Error?e.message:"An unexpected error occurred.";
  for(const k of [process.env.CRUSTDATA_API_KEY,process.env.OPENAI_API_KEY,process.env.FIRECRAWL_API_KEY,process.env.SUPABASE_SECRET_KEY,process.env.SUPABASE_DB_URL])if(k)message=message.split(k).join("[redacted]");
  return message.slice(0,600);
}
