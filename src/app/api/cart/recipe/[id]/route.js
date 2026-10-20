import {
  getCart,
  removeRecipeCartItem,
  setRecipeCartQuantity,
} from "@/lib/data";
import { cartSessionResponse, readCartSession } from "@/lib/cart-session";

export const dynamic = "force-dynamic";

export async function PATCH(request, context) {
  const session = readCartSession(request);
  const { id } = await context.params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId < 1)
    return cartSessionResponse(
      session,
      { error: "Invalid cart item." },
      { status: 400 },
    );
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
  const value = Number(body?.quantity);
  if (!Number.isInteger(value) || value < 0 || value > 99)
    return cartSessionResponse(
      session,
      { error: "Quantity must be between 0 and 99." },
      { status: 400 },
    );
  await setRecipeCartQuantity(itemId, value, session.ownerKey);
  return cartSessionResponse(session, await getCart(session.ownerKey));
}

export async function DELETE(request, context) {
  const session = readCartSession(request);
  const { id } = await context.params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId < 1)
    return cartSessionResponse(
      session,
      { error: "Invalid cart item." },
      { status: 400 },
    );
  await removeRecipeCartItem(itemId, session.ownerKey);
  return cartSessionResponse(session, await getCart(session.ownerKey));
}
