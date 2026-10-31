import { prepareStep, discoverStep, prospectStep, finishStep } from "./steps";
export async function researchWorkflow(id:string) {
  "use workflow";
  try {
    await prepareStep(id);
    const count=await discoverStep(id);
    for(let i=0;i<count;i++)await prospectStep(id,i);
    await finishStep(id);
  }catch(e){await finishStep(id,e instanceof Error?e.message:"Research was interrupted.");}
}
