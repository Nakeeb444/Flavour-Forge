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

  const fullName = String(body.fullName ?? "")
    .trim()
    .replace(/\s+/g, " ");
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  if (fullName.length < 2 || fullName.length > 80) {
    return Response.json(
      { error: "Enter your name (2–80 characters)." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }
  if (password.length < 8 || password.length > 72) {
    return Response.json(
      { error: "Password must be between 8 and 72 characters." },
      { status: 400 },
    );
  }
  if (body.acceptTerms !== true) {
    return Response.json(
      { error: "Please accept the Terms & Conditions to create an account." },
      { status: 400 },
    );
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing)
    return Response.json(
      { error: "An account with that email already exists. Sign in instead." },
      { status: 409 },
    );

  const passwordHash = await hashPassword(password);
  try {
    const { user, token, maxAge } = await db.transaction(
      async (transaction) => {
        const [createdUser] = await transaction
          .insert(users)
          .values({
            fullName,
            email,
            passwordHash,
            acceptedTermsAt: new Date(),
          })
          .returning({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
          });
        const session = await createSession(createdUser.id, transaction);
        return { user: createdUser, ...session };
      },
    );
    const response = Response.json({ user });
    setSessionCookie(response, token, maxAge);
    return response;
  } catch (error) {
    if (error?.code === "23505" && error.constraint === "users_email_unique") {
      return Response.json(
        {
          error: "An account with that email already exists. Sign in instead.",
        },
        { status: 409 },
      );
    }
    console.error("Could not register account.", error);
    return Response.json(
      { error: "Account registration is temporarily unavailable." },
      { status: 503 },
    );
  }
}
