import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
export function signedSession() {const expires=Date.now()+86400000;return `${expires}.${createHmac("sha256",process.env.HIROX_ACCESS_PASSWORD||"").update(String(expires)).digest("hex")}`;}
export async function guard(request:Request) {
  const origin=request.headers.get("origin");
  if(origin&&new URL(origin).host!==new URL(request.url).host)throw new Error("FORBIDDEN");
  const password=process.env.HIROX_ACCESS_PASSWORD;
  if(process.env.VERCEL&&!password)throw new Error("Set HIROX_ACCESS_PASSWORD before public deployment.");
  if(!password)return;
  const cookie=(await cookies()).get("hirox_session")?.value||"";const [expires,signature]=cookie.split(".");
  const expected=createHmac("sha256",password).update(expires||"").digest("hex");
  if(!signature||Number(expires)<Date.now()||signature.length!==expected.length||!timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))throw new Error("UNAUTHORIZED");
}
export function apiError(e:unknown) {
  const message=e instanceof Error?e.message:"Request failed.";
  return Response.json({error:message}, {status:message==="UNAUTHORIZED"?401:message==="FORBIDDEN"?403:400});
}
