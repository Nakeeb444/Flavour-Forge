import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, getCurrentUser, setSessionCookie } from "@/lib/auth";
import { firebaseConfig } from "@/lib/src/lib/firebase";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function verifyFirebaseIdToken(idToken) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseConfig.apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    },
  );
  const data = await response.json();
  if (!response.ok || !data.users?.[0]) return null;
  return data.users[0];
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Please sign in and try again." },
      { status: 400 },
    );
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      { error: "Please sign in and try again." },
      { status: 400 },
    );
  }

  if (typeof body.idToken !== "string" || body.idToken.length > 8192) {
    return Response.json(
      { error: "Please sign in and try again." },
      { status: 400 },
    );
  }

  let firebaseUser;
  try {
    firebaseUser = await verifyFirebaseIdToken(body.idToken);
  } catch {
    return Response.json(
      { error: "Authentication service is temporarily unavailable." },
      { status: 503 },
    );
  }
  if (!firebaseUser?.localId || !firebaseUser.email) {
    return Response.json(
      { error: "Your Firebase sign-in could not be verified." },
      { status: 401 },
    );
  }

  const email = String(firebaseUser.email).trim().toLowerCase();
  const fullName = String(body.fullName ?? firebaseUser.displayName ?? "")
    .trim()
    .replace(/\s+/g, " ");
  const creatingAccount = body.acceptTerms === true;
  if (creatingAccount && (fullName.length < 2 || fullName.length > 80)) {
    return Response.json(
      { error: "Enter your name (2–80 characters)." },
      { status: 400 },
    );
  }

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.firebaseUid, firebaseUser.localId))
    .limit(1);

  if (user && user.email !== email) {
    return Response.json(
      { error: "Your Firebase account details do not match this profile." },
      { status: 403 },
    );
  }

  if (!user) {
    const [emailMatch] = await db
      .select({ id: users.id, firebaseUid: users.firebaseUid })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (emailMatch) {
      const legacySession = await getCurrentUser(request);
      if (
        emailMatch.firebaseUid ||
        !legacySession ||
        legacySession.id !== emailMatch.id
      ) {
        return Response.json(
          {
            error:
              "An account already exists for this email. Sign in with its existing password or contact support.",
          },
          { status: 409 },
        );
      }
      [user] = await db
        .update(users)
        .set({ firebaseUid: firebaseUser.localId, passwordHash: null })
        .where(eq(users.id, emailMatch.id))
        .returning({
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          firebaseUid: users.firebaseUid,
        });
    }
    if (!user && !creatingAccount) {
      return Response.json(
        { error: "Create an account before signing in." },
        { status: 404 },
      );
    }

    if (!user) {
      const [createdUser] = await db
        .insert(users)
        .values({
          fullName,
          email,
          firebaseUid: firebaseUser.localId,
          passwordHash: null,
          acceptedTermsAt: new Date(),
        })
        .returning({
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          firebaseUid: users.firebaseUid,
        });
      user = createdUser;
    }
  }

  const { token, maxAge } = await createSession(user.id);
  const response = Response.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      firebaseUid: user.firebaseUid,
      photoURL: firebaseUser.photoUrl ?? null,
    },
  });
  setSessionCookie(response, token, maxAge);
  return response;
}
