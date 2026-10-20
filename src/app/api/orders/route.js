import { db } from "@/db";
import { orders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { clearCart, getCart } from "@/lib/data";
import { ensureSeeded } from "@/db/seed";
import {
  cartSessionResponse,
  readCartSession,
} from "@/lib/cart-session";
import { and, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const user = await getCurrentUser(request);
  if (!user) return Response.json([]);
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.id))
    .limit(20);
  return Response.json(rows);
}

export async function POST(request) {
  const session = readCartSession(request);
  const user = await getCurrentUser(request);
  if (!user) {
    return cartSessionResponse(
      session,
      { error: "Create an account or sign in to check out." },
      { status: 401 },
    );
  }

  const checkoutKey = request.headers.get("Idempotency-Key");
  if (
    !checkoutKey ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      checkoutKey,
    )
  ) {
    return cartSessionResponse(
      session,
      { error: "A valid checkout request key is required." },
      { status: 400 },
    );
  }

  const findPreviousOrder = async (executor) =>
    (
      await executor
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.userId, user.id),
            eq(orders.checkoutKey, checkoutKey),
          ),
        )
        .limit(1)
    )[0];

  try {
    await ensureSeeded();
    const result = await db.transaction(async (transaction) => {
      const previousOrder = await findPreviousOrder(transaction);
      if (previousOrder) {
        return {
          order: previousOrder,
          cart: await getCart(session.ownerKey, transaction),
        };
      }

      const cart = await getCart(session.ownerKey, transaction);
      if (cart.items.length === 0) return null;

      const [order] = await transaction
        .insert(orders)
        .values({
          userId: user.id,
          customerName: user.fullName,
          customerEmail: user.email,
          total: cart.total,
          itemCount: cart.count,
          items: JSON.stringify(cart.items),
          checkoutKey,
        })
        .returning();
      await clearCart(session.ownerKey, transaction);
      return { order, cart: await getCart(session.ownerKey, transaction) };
    });

    if (!result) {
      return cartSessionResponse(
        session,
        { error: "Cart is empty" },
        { status: 400 },
      );
    }
    return cartSessionResponse(session, result);
  } catch (error) {
    if (error?.code === "23505") {
      const previousOrder = await findPreviousOrder(db);
      if (previousOrder) {
        return cartSessionResponse(session, {
          order: previousOrder,
          cart: await getCart(session.ownerKey),
        });
      }
    }
    console.error("Could not create an order.", error);
    return cartSessionResponse(
      session,
      { error: "Checkout is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
