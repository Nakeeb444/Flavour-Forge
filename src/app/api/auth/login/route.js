import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Please check the form and try again." },
      { status: 400 },
    );
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      { error: "Please check the form and try again." },
      { status: 400 },
    );
  }
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  if (!email || !password || password.length > 72) {
    return Response.json(
      { error: "Enter your email and password." },
      { status: 400 },
    );
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return Response.json(
      { error: "Email or password is incorrect." },
      { status: 401 },
    );
  }

  const { token, maxAge } = await createSession(user.id);
  const response = Response.json({
    user: { id: user.id, fullName: user.fullName, email: user.email },
  });
  setSessionCookie(response, token, maxAge);
  return response;
}
