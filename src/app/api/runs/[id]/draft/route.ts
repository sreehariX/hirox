import { z } from "zod";
import { guard,apiError } from "@/lib/server/auth";
import { getRun,saveRun } from "@/lib/server/store";
import { generateDraft } from "@/lib/server/research";
import { redactError } from "@/lib/server/providers";
type Context={params:Promise<{id:string}>};
export const maxDuration=180;
export async function POST(request:Request,ctx:Context){try{
  await guard(request);const {id}=await ctx.params;
  const data=z.object({prospectId:z.string(),tone:z.enum(["Thoughtful","Concise","Conversational"]).default("Thoughtful"),context:z.string().max(2500).optional()}).parse(await request.json());
  const run=await getRun(id);if(!run)throw new Error("Run not found.");if(!["complete","error"].includes(run.status))throw new Error("Wait for research to finish before drafting.");
  const p=run.prospects.find(x=>x.id===data.prospectId);if(!p)throw new Error("Prospect not found.");
  const draft=await generateDraft(run,p,data.tone,data.context);return Response.json(draft);
}catch(e){return apiError(new Error(redactError(e)));}}
export async function PATCH(request:Request,ctx:Context){try{
  await guard(request);const {id}=await ctx.params;const data=z.object({prospectId:z.string(),subject:z.string().max(300),body:z.string().max(10000)}).parse(await request.json());
  const run=await getRun(id);if(!run)throw new Error("Run not found.");const p=run.prospects.find(x=>x.id===data.prospectId);if(!p?.draft)throw new Error("Generate a draft first.");
  p.draft={...p.draft,subject:data.subject,body:data.body,edited:true};await saveRun(run);return Response.json({ok:true});
}catch(e){return apiError(e);}}
