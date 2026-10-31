export type Decision = "Meet" | "Watch" | "Pass";
export type Source = {
  id: string; title: string; url: string; provider: "Crustdata" | "Firecrawl" | "Public source";
  kind: "profile" | "article" | "social" | "project" | "jobs" | "search";
  content: string; fetchedAt: string; publishedAt?: string; cached?: boolean;
  status: "fetched" | "snippet"; endpoint?: string;
};
export type CitedPoint = { text: string; sourceIds: string[] };
export type TimelineItem = CitedPoint & { date: string; title: string };
export type Connection = CitedPoint & { name: string; kind: "company" | "person" | "project" | "signal" };
export type Draft = { subject: string; body: string; citations: { sentence: string; sourceIds: string[] }[]; createdAt: string; edited?: boolean };
export type Prospect = {
  id: string; name: string; kind: "company" | "person"; company: string; domain: string;
  profileUrl: string; location: string; headline: string; stage: string; status: "pending" | "researching" | "complete" | "error";
  decision: Decision; summary: string; whyNow: CitedPoint; reasonsFor: CitedPoint[]; reasonsAgainst: CitedPoint[];
  unknowns: string[]; nextQuestion: string; confidence: "Strong" | "Moderate" | "Limited";
  thesisFit: "Strong" | "Partial" | "Outside"; timeline: TimelineItem[]; connections: Connection[];
  sources: Source[]; warnings: string[]; draft?: Draft; rawProfile?: Record<string, unknown>;
};
export type ResearchInput = {
  thesis: string; seeds: string; includePeople: boolean; limit: number;
  investorName: string; investorFirm: string; investorContext: string;
};
export type ResearchPlan = { title: string; companyQuery: string; peopleQuery: string; researchFocus: string[]; requirements: string[]; exclusions: string[]; seedOnly: boolean };
export type ResearchEvent = { id: string; at: string; label: string; detail: string; provider?: string; status: "running" | "success" | "warning" | "error" };
export type ResearchRun = {
  id: string; title: string; input: ResearchInput; mode: "live" | "example";
  status: "queued" | "planning" | "discovering" | "researching" | "complete" | "error" | "cancelled";
  createdAt: string; updatedAt: string; completedAt?: string; error?: string;
  plan?: ResearchPlan; prospects: Prospect[]; events: ResearchEvent[]; warnings: string[];
  apiCalls: number; cacheHits: number; tokens: number; workflowRunId?: string;
};
export type RunSummary = Pick<ResearchRun,"id"|"title"|"mode"|"status"|"createdAt"|"updatedAt"> & { prospects: number; meets: number; sources: number };
export type ServiceStatus = { configured: boolean; verified?: boolean; message?: string };
export type SetupStatus = { crustdata: ServiceStatus; openai: ServiceStatus; firecrawl: ServiceStatus; supabase: ServiceStatus; storage: string; model: string; ready: boolean; locked?: boolean };
