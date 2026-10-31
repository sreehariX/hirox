export async function guard(request:Request) {
  const origin=request.headers.get("origin");
  if(origin&&new URL(origin).host!==new URL(request.url).host)throw new Error("FORBIDDEN");
}
export function apiError(e:unknown) {
  const message=e instanceof Error?e.message:"Request failed.";
  return Response.json({error:message}, {status:message==="UNAUTHORIZED"?401:message==="FORBIDDEN"?403:400});
}
