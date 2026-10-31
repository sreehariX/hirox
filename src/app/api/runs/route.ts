import { z } from "zod";
import { randomUUID } from "node:crypto";
import { start } from "workflow/api";
import { researchWorkflow } from "@/workflows/research";
import { guard,apiError } from "@/lib/server/auth";
import { listRuns,saveRun } from "@/lib/server/store";
import { redactError } from "@/lib/server/providers";
import type { ResearchRun } from "@/lib/types";
export const runtime="nodejs";
const inputSchema=z.object({thesis:z.string().min(15).max(4000),seeds:z.string().max(1000).default(""),includePeople:z.boolean().default(true),limit:z.number().int().min(1).max(5).default(3),investorName:z.string().max(100).default(""),investorFirm:z.string().max(150).default(""),investorContext:z.string().max(2500).default("")});
export async function GET(request:Request) {try{await guard(request);return Response.json({runs:await listRuns()});}catch(e){return apiError(e);}}
export async function POST(request:Request) {
  try {
    await guard(request);const input=inputSchema.parse(await request.json());
    const missing=["CRUSTDATA_API_KEY","OPENAI_API_KEY"].filter(k=>!process.env[k]);if(missing.length)throw new Error(`Add ${missing.join(" and ")} to .env.local before starting live research.`);
    const existing=await listRuns();if(existing.some(r=>["queued","planning","discovering","researching"].includes(r.status)&&Date.now()-new Date(r.updatedAt).getTime()<15*60000))throw new Error("A research run is already active. Open it or cancel it before starting another.");
    const now=new Date().toISOString();const run:ResearchRun={id:randomUUID(),title:input.thesis.slice(0,80),input,mode:"live",status:"queued",createdAt:now,updatedAt:now,prospects:[],events:[],warnings:[],apiCalls:0,cacheHits:0,tokens:0};
    await saveRun(run);
    try {await start(researchWorkflow,[run.id]);}catch(e){run.status="error";run.error=redactError(e);await saveRun(run);throw e;}
    return Response.json({id:run.id},{status:201});
  }catch(e){return apiError(new Error(redactError(e)));}
}
