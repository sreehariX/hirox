import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { ResearchRun, RunSummary } from "../types";

const root = path.join(process.cwd(), ".hirox");
export function storageMode() { return process.env.HIROX_STORAGE === "supabase" ? "supabase" : "local"; }
function client() {
  const url=process.env.SUPABASE_URL; const key=process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Add SUPABASE_URL and SUPABASE_SECRET_KEY to connect your database.");
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
function validId(id:string) { if(!/^[a-zA-Z0-9_-]{1,90}$/.test(id)) throw new Error("Invalid record identifier."); return id; }
export async function getRun(id:string): Promise<ResearchRun|null> {
  validId(id);
  if(storageMode()==="supabase") {
    const {data,error}=await client().from("hirox_runs").select("data").eq("id",id).maybeSingle();
    if(error) throw new Error(`Database read failed: ${error.message}`); return data?.data as ResearchRun||null;
  }
  try {return JSON.parse(await fs.readFile(path.join(root,"runs",`${id}.json`),"utf8"));}
  catch(e) {if((e as NodeJS.ErrnoException).code==="ENOENT")return null;throw e;}
}
export async function saveRun(run:ResearchRun) {
  validId(run.id); run.updatedAt=new Date().toISOString();
  if(storageMode()==="supabase") {
    const {error}=await client().from("hirox_runs").upsert({id:run.id,title:run.title,status:run.status,created_at:run.createdAt,updated_at:run.updatedAt,data:run});
    if(error) throw new Error(`Database save failed: ${error.message}`); return;
  }
  const dir=path.join(root,"runs");await fs.mkdir(dir,{recursive:true});
  const temp=path.join(dir,`${run.id}.${randomUUID()}.tmp`);
  await fs.writeFile(temp,JSON.stringify(run),"utf8");await fs.rename(temp,path.join(dir,`${run.id}.json`));
}
export async function listRuns():Promise<RunSummary[]> {
  let runs:ResearchRun[]=[];
  if(storageMode()==="supabase") {
    const {data,error}=await client().from("hirox_runs").select("data").order("updated_at",{ascending:false}).limit(40);
    if(error)throw new Error(`Database read failed: ${error.message}`);runs=(data||[]).map(x=>x.data as ResearchRun);
  }else {
    const dir=path.join(root,"runs");await fs.mkdir(dir,{recursive:true});
    const names=(await fs.readdir(dir)).filter(n=>n.endsWith(".json"));
    runs=(await Promise.all(names.map(n=>getRun(n.slice(0,-5))))).filter((x):x is ResearchRun=>!!x);
  }
  return runs.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,40).map(r=>({id:r.id,title:r.title,mode:r.mode,status:r.status,createdAt:r.createdAt,updatedAt:r.updatedAt,prospects:r.prospects.length,meets:r.prospects.filter(p=>p.decision==="Meet").length,sources:r.prospects.reduce((n,p)=>n+p.sources.length,0)}));
}
export async function readCache(key:string):Promise<unknown|null> {
  if(storageMode()==="supabase") {
    const {data,error}=await client().from("hirox_cache").select("data,created_at").eq("id",key).maybeSingle();
    if(error||!data||Date.now()-new Date(data.created_at).getTime()>86400000)return null;return data.data;
  }
  try {const data=JSON.parse(await fs.readFile(path.join(root,"cache",`${key}.json`),"utf8"));return Date.now()-data.at<86400000?data.value:null;}catch{return null;}
}
export async function writeCache(key:string,value:unknown) {
  if(storageMode()==="supabase") {await client().from("hirox_cache").upsert({id:key,data:value,created_at:new Date().toISOString()});return;}
  await fs.mkdir(path.join(root,"cache"),{recursive:true});await fs.writeFile(path.join(root,"cache",`${key}.json`),JSON.stringify({at:Date.now(),value}),"utf8");
}
export async function verifyDatabase() {
  const {error}=await client().from("hirox_runs").select("id").limit(1);
  if(error)throw new Error(`Supabase: ${error.message}. Run npm run db:setup to create the tables.`);
  return "Connected. Research tables are ready.";
}
