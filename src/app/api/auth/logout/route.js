import { clearSessionCookie, revokeSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  await revokeSession(request);
  const response = Response.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
