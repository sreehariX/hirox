import type { Prospect, Source, CitedPoint } from "../types";
export function declinesGeneratedEmail(sources:Source[]) {
  return sources.some(s=>s.status==="fetched"&&/(?:AI[-\s]?generated\s+emails?[\s\S]{0,120}(?:never respond|do not send|don't send|please spare)|(?:do not send|don't send)[\s\S]{0,80}AI[-\s]?(?:generated|written)[\s\S]{0,25}emails?)/i.test(s.content));
}
export function validPoints(points:CitedPoint[],sources:Source[]) {
  const ids=new Set(sources.map(s=>s.id));
  return points.map(p=>({...p,sourceIds:[...new Set(p.sourceIds)].filter(id=>ids.has(id))})).filter(p=>p.sourceIds.length>0);
}
export function validateAssessment(p:Prospect,seedOnly:boolean):Prospect {
  const ids=new Set(p.sources.map(s=>s.id));
  p.reasonsFor=validPoints(p.reasonsFor,p.sources);p.reasonsAgainst=validPoints(p.reasonsAgainst,p.sources);
  p.timeline=p.timeline.map(x=>({...x,sourceIds:x.sourceIds.filter(id=>ids.has(id))})).filter(x=>x.sourceIds.length);
  p.connections=p.connections.map(x=>({...x,sourceIds:x.sourceIds.filter(id=>ids.has(id))})).filter(x=>x.sourceIds.length);
  p.whyNow={...p.whyNow,sourceIds:p.whyNow.sourceIds.filter(id=>ids.has(id))};
  if(!p.whyNow.sourceIds.length)p.whyNow={text:"No recent, independently supported trigger established yet.",sourceIds:[]};
  const readable=p.sources.filter(s=>s.status==="fetched");
  const independentUrls=new Set(readable.map(s=>{try{return new URL(s.url).hostname.replace(/^www\./,"");}catch{return "";}}).filter(Boolean));
  const originalWork=readable.some(s=>["article","project","social"].includes(s.kind));
  if(p.decision==="Meet"&&(!p.reasonsFor.length||readable.length<2||independentUrls.size<2||!originalWork)) {
    p.decision="Watch";p.confidence="Limited";p.unknowns.push("More readable source evidence is needed before recommending outreach.");
  }
  if(seedOnly&&p.kind==="company"&&/^(?:series\s*[a-z]\b|post[ -]?series\s*[a-z]\b|ipo\b|publicly traded\b|listed company\b)/i.test(p.stage.trim())) {
    p.decision="Pass";p.thesisFit="Outside";
  }
  return p;
}
