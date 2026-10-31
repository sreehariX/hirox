import { prepareResearch, discoverResearch, researchProspect, finishResearch } from "@/lib/server/research";
export async function prepareStep(id:string) {
  "use step";
  await prepareResearch(id);
}
export async function discoverStep(id:string) {
  "use step";
  return discoverResearch(id);
}
export async function prospectStep(id:string,index:number) {
  "use step";
  await researchProspect(id,index);
}
export async function finishStep(id:string,error?:string) {
  "use step";
  await finishResearch(id,error);
}
