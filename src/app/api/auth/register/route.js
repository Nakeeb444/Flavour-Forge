import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword, setSessionCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  const fullName = String(body.fullName ?? "")
    .trim()
    .replace(/\s+/g, " ");
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  if (fullName.length < 2 || fullName.length > 80) {
    return Response.json({ error: "Enter your name (2–80 characters)." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 72) {
    return Response.json({ error: "Password must be between 8 and 72 characters." }, { status: 400 });
  }
  if (body.acceptTerms !== true) {
    return Response.json({ error: "Please accept the Terms & Conditions to create an account." }, { status: 400 });
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return Response.json({ error: "An account with that email already exists. Sign in instead." }, { status: 409 });

  try {
    const [user] = await db
      .insert(users)
      .values({ fullName, email, passwordHash: await hashPassword(password), acceptedTermsAt: new Date() })
      .returning({ id: users.id, fullName: users.fullName, email: users.email });
    const { token, maxAge } = await createSession(user.id);
    const response = Response.json({ user });
    setSessionCookie(response, token, maxAge);
    return response;
  } catch {
    // A concurrent registration may win the unique email constraint.
    return Response.json({ error: "An account with that email already exists. Sign in instead." }, { status: 409 });
  }
}
