import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { signedSession } from "@/lib/server/auth";
export async function POST(request:Request) {
  const origin=request.headers.get("origin");if(origin&&new URL(origin).host!==new URL(request.url).host)return Response.json({error:"Forbidden"},{status:403});
  const {password}=await request.json();const expected=process.env.HIROX_ACCESS_PASSWORD||"";
  if(!expected||typeof password!=="string"||Buffer.byteLength(password)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(password),Buffer.from(expected)))return Response.json({error:"Incorrect workspace password."},{status:401});
  (await cookies()).set("hirox_session",signedSession(),{httpOnly:true,sameSite:"strict",secure:!!process.env.VERCEL,path:"/",maxAge:86400});return Response.json({ok:true});
}
