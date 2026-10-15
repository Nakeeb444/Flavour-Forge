import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const user = await getCurrentUser(request);
  return Response.json({ user });
}
