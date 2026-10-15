import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const CATEGORIES = ["order", "delivery", "payment", "recipe", "account", "general"];

export async function GET(request) {
  const user = await getCurrentUser(request);
  if (!user) return Response.json([]);
  const rows = await db.select().from(supportTickets).where(eq(supportTickets.userId, user.id)).orderBy(desc(supportTickets.id)).limit(20);
  return Response.json(rows);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please check the form and try again." }, { status: 400 });
  }
  const user = await getCurrentUser(request);
  const name = String(body.name ?? user?.fullName ?? "").trim();
  const email = String(body.email ?? user?.email ?? "")
    .trim()
    .toLowerCase();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();
  const orderRef =
    String(body.orderRef ?? "")
      .trim()
      .slice(0, 40) || null;
  const category = CATEGORIES.includes(String(body.category)) ? String(body.category) : "general";

  if (name.length < 2 || name.length > 80) return Response.json({ error: "Enter your name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Enter a valid email so we can reply." }, { status: 400 });
  if (subject.length < 3 || subject.length > 120)
    return Response.json({ error: "Add a short subject (3–120 characters)." }, { status: 400 });
  if (message.length < 10 || message.length > 2000)
    return Response.json({ error: "Tell us a little more (10–2000 characters)." }, { status: 400 });

  const [ticket] = await db
    .insert(supportTickets)
    .values({ userId: user?.id ?? null, name, email, category, subject, message, orderRef })
    .returning();
  return Response.json({ ticket });
}
