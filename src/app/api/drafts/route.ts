import { guard,apiError } from "@/lib/server/auth";
import { listRuns,getRun } from "@/lib/server/store";
export async function GET(request:Request){try{await guard(request);const summaries=await listRuns();const runs=await Promise.all(summaries.map(r=>getRun(r.id)));return Response.json(runs.flatMap(r=>r?r.prospects.filter(p=>p.draft).map(p=>({runId:r.id,runTitle:r.title,prospectId:p.id,name:p.name,draft:p.draft})):[]));}catch(e){return apiError(e);}}
