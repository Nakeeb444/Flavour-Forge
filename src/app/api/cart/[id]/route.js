import { getCart, removeCartItem, setCartQuantity } from "@/lib/data";
import { cartSessionResponse, readCartSession } from "@/lib/cart-session";

export const dynamic = "force-dynamic";

export async function PATCH(request, context) {
  const session = readCartSession(request);
  const { id } = await context.params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId < 1) {
    return cartSessionResponse(
      session,
      { error: "Invalid cart item." },
      { status: 400 },
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return cartSessionResponse(
      session,
      { error: "Invalid quantity." },
      { status: 400 },
    );
  }
  const quantity = Number(body?.quantity);
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
    return cartSessionResponse(
      session,
      { error: "Quantity must be between 0 and 99." },
      { status: 400 },
    );
  }
  await setCartQuantity(itemId, quantity, session.ownerKey);
  return cartSessionResponse(session, await getCart(session.ownerKey));
}

export async function DELETE(request, context) {
  const session = readCartSession(request);
  const { id } = await context.params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId < 1) {
    return cartSessionResponse(
      session,
      { error: "Invalid cart item." },
      { status: 400 },
    );
  }
  await removeCartItem(itemId, session.ownerKey);
  return cartSessionResponse(session, await getCart(session.ownerKey));
}
