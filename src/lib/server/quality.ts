import type { Prospect, Source, CitedPoint } from "../types";
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
  if(p.decision==="Meet"&&(!p.reasonsFor.length||readable.length<2)) {
    p.decision="Watch";p.confidence="Limited";p.unknowns.push("More readable source evidence is needed before recommending outreach.");
  }
  if(seedOnly&&p.kind==="company"&&/series[ _-]?[a-z]|public|ipo/i.test(p.stage)&&!/^unknown/i.test(p.stage)) {
    p.decision="Pass";p.thesisFit="Outside";
  }
  return p;
}
