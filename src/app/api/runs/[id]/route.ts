import { start } from "workflow/api";
import { researchWorkflow } from "@/workflows/research";
import { guard,apiError } from "@/lib/server/auth";
import { getRun,saveRun } from "@/lib/server/store";
import { redactError } from "@/lib/server/providers";
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,ctx:Context){try{await guard(request);const {id}=await ctx.params;const run=await getRun(id);return run?Response.json(run):Response.json({error:"Run not found."},{status:404});}catch(e){return apiError(e);}}
export async function PATCH(request:Request,ctx:Context){try{
  await guard(request);const {id}=await ctx.params;const run=await getRun(id);if(!run)throw new Error("Run not found.");const body=await request.json();
  if(body.action==="cancel"){run.status="cancelled";await saveRun(run);return Response.json({ok:true});}
  if(body.action==="resume") {
    if(["queued","planning","discovering","researching"].includes(run.status)&&Date.now()-new Date(run.updatedAt).getTime()<5*60000)throw new Error("This run is still active. Wait for the current step to finish.");
    run.status="queued";run.error=undefined;run.completedAt=undefined;await saveRun(run);await start(researchWorkflow,[id]);return Response.json({ok:true});
  }
  throw new Error("Unknown action.");
}catch(e){return apiError(new Error(redactError(e)));}}
