import { describe,it,expect } from "vitest";
import { exampleRun } from "../example";
import { declinesGeneratedEmail,validateAssessment } from "./quality";

function company(){return structuredClone(exampleRun().prospects[0]);}
describe("evidence-based recommendations",()=>{
  it("downgrades Meet when professional records repeat the same source",()=>{
    const p=company();p.sources=p.sources.filter(s=>s.url.includes("cekura.ai"));
    p.sources.push({...p.sources[0],id:"duplicate",title:"Repeated record"});
    p.reasonsFor=[{text:"Product fits",sourceIds:[p.sources[0].id]}];
    expect(validateAssessment(p,true).decision).toBe("Watch");
  });
  it("keeps a seed prospect eligible but excludes an announced Series A",()=>{
    const seed=company();seed.stage="Seed";
    expect(validateAssessment(seed,true).decision).toBe("Meet");
    const later=company();later.stage="Series A announced · July 2025";
    expect(validateAssessment(later,true).decision).toBe("Pass");
    expect(later.thesisFit).toBe("Outside");
  });
  it("does not treat a pre-Series A phrase as a completed Series A",()=>{
    const p=company();p.stage="Pre-Series A";
    expect(validateAssessment(p,true).decision).toBe("Meet");
  });
  it("drops claims pointing only to invented citations",()=>{
    const p=company();p.reasonsFor=[{text:"Unverified claim",sourceIds:["phantom"]}];
    p.whyNow={text:"Unsupported trigger",sourceIds:["phantom"]};
    const checked=validateAssessment(p,false);
    expect(checked.reasonsFor).toHaveLength(0);
    expect(checked.whyNow.sourceIds).toHaveLength(0);
    expect(checked.decision).toBe("Watch");
  });
});
describe("contact preference",()=>{
  it("detects a stated refusal of AI-generated email in a readable source",()=>{
    const p=company();p.sources[0].content="I receive dozens of AI-generated emails a week. I never respond to any of them. Please spare me.";
    expect(declinesGeneratedEmail(p.sources)).toBe(true);
  });
  it("does not mistake an ordinary AI evaluation article for a refusal",()=>{
    expect(declinesGeneratedEmail(company().sources)).toBe(false);
  });
});
