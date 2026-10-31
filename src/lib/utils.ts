import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...values: ClassValue[]) { return twMerge(clsx(values)); }
export function safeUrl(value: string): string {
  try {
    const u = new URL(value);
    if (!["https:", "http:"].includes(u.protocol) || u.username || u.password) return "";
    const h = u.hostname.toLowerCase();
    if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || h.includes(":") || /^(0|10|127|169\.254|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(h)) return "";
    return u.toString();
  } catch { return ""; }
}
export function domainOf(value: string) { try { return new URL(value.includes("://") ? value : `https://${value}`).hostname.replace(/^www\./, ""); } catch { return ""; } }
export function initials(name: string) { return name.split(/[\s.-]+/).filter(Boolean).slice(0,2).map(x => x[0]).join("").toUpperCase(); }
export function elapsed(start: string, end?: string) { const s = Math.max(0,Math.round((new Date(end || Date.now()).getTime() - new Date(start).getTime())/1000)); return s < 60 ? `${s}s` : `${Math.floor(s/60)}m ${s%60}s`; }
