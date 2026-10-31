import { Database, Loader2, RefreshCw } from "lucide-react";
import type { SetupStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const services = [
  { id: "crustdata", name: "Crustdata", mark: "◈", role: "Discover", detail: "Company intelligence, career history, and public professional activity." },
  { id: "firecrawl", name: "Firecrawl", mark: "◒", role: "Understand", detail: "Articles, interviews, and product pages brought into your research." },
  { id: "openai", name: "OpenAI", mark: "✳", role: "Evaluate & draft", detail: "Evidence-based assessments and personalized introductions." },
  { id: "supabase", name: "Research library", mark: "ϟ", role: "Keep your context", detail: "Your prospects, evidence, and drafts, ready to revisit." },
] as const;

export function ResearchConnections({ status, checking, onCheck }: {
  status: SetupStatus | null;
  checking: boolean;
  onCheck: () => void;
}) {
  return <div className="standard-page page-enter">
    <div className="page-heading">
      <div className="eyebrow">YOUR RESEARCH NETWORK</div>
      <h1>Research connections</h1>
      <p>The services behind your research, from discovery to the first introduction.</p>
    </div>
    <div className="connections-toolbar">
      <span><Database size={15}/>{!status ? "Loading workspace…" : status.storage === "supabase" ? "Research and drafts saved to your workspace" : "Research and drafts saved on this device"}</span>
      <button className="secondary-button" onClick={onCheck} disabled={checking}>
        {checking ? <Loader2 className="spin" size={14}/> : <RefreshCw size={14}/>}
        {checking ? "Checking…" : "Check connections"}
      </button>
    </div>
    <div className="integration-grid">
      {services.map(service => {
        const connection = status?.[service.id];
        const label = !status ? "Loading…" : checking ? "Checking…" : connection?.verified === true ? "Connected" : connection?.verified === false ? "Needs attention" : connection?.configured ? "Enabled" : "Unavailable";
        return <div className="integration-card" key={service.id}>
          <div className="integration-card-top">
            <span className={`integration-mark ${service.id}`}>{service.mark}</span>
            <span className={cn("connection-state", connection?.verified === true && "configured", connection?.verified === false && "failed")}>{label}</span>
          </div>
          <span className="integration-role">{service.role}</span>
          <h3>{service.name}</h3>
          <p>{service.detail}</p>
          {connection?.message && <div className="integration-message">{connection.message}</div>}
        </div>;
      })}
    </div>
  </div>;
}
