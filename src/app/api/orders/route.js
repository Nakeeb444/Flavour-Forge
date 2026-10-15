import { db } from "@/db";
import { orders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { clearCart, getCart } from "@/lib/data";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const user = await getCurrentUser(request);
  if (!user) return Response.json([]);
  const rows = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.id)).limit(20);
  return Response.json(rows);
}

export async function POST(request) {
  const user = await getCurrentUser(request);
  if (!user) return Response.json({ error: "Create an account or sign in to check out." }, { status: 401 });

  const cart = await getCart();
  if (cart.items.length === 0) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }
  const [order] = await db
    .insert(orders)
    .values({
      userId: user.id,
      customerName: user.fullName,
      customerEmail: user.email,
      total: cart.total,
      itemCount: cart.count,
      items: JSON.stringify(cart.items),
    })
    .returning();
  await clearCart();
  return Response.json({ order, cart: await getCart() });
}
