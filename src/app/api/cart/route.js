import {
  addRecipeToCart,
  addToCart,
  clearCart,
  getAllProducts,
  getCart,
} from "@/lib/data";
import { cartSessionResponse, readCartSession } from "@/lib/cart-session";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const session = readCartSession(request);
  return cartSessionResponse(session, await getCart(session.ownerKey));
}

export async function POST(request) {
  const session = readCartSession(request);
  let body;
  try {
    body = await request.json();
  } catch {
    return cartSessionResponse(
      session,
      { error: "Invalid cart request" },
      { status: 400 },
    );
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return cartSessionResponse(
      session,
      { error: "Invalid cart request" },
      { status: 400 },
    );
  }
  if (body.recipeId != null) {
    const recipeId = Number(body.recipeId);
    const servings =
      body.servings == null ? undefined : Number(body.servings);
    if (!Number.isInteger(recipeId) || recipeId < 1) {
      return cartSessionResponse(
        session,
        { error: "Invalid recipe" },
        { status: 400 },
      );
    }
    if (
      servings !== undefined &&
      (!Number.isInteger(servings) || servings < 1 || servings > 20)
    ) {
      return cartSessionResponse(
        session,
        { error: "Servings must be between 1 and 20." },
        { status: 400 },
      );
    }
    if (!(await addRecipeToCart(recipeId, servings, session.ownerKey))) {
      return cartSessionResponse(
        session,
        { error: "Recipe not found or its kit is unavailable." },
        { status: 404 },
      );
    }
  } else {
    const items =
      body.items ??
      (body.productId != null
        ? [{ productId: body.productId, quantity: body.quantity ?? 1 }]
        : null);
    if (
      !Array.isArray(items) ||
      items.length < 1 ||
      items.length > 50 ||
      items.some((item) => {
        const productId = Number(item?.productId);
        const quantity = Number(item?.quantity ?? 1);
        return (
          !Number.isInteger(productId) ||
          productId < 1 ||
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > 99
        );
      })
    ) {
      return cartSessionResponse(
        session,
        { error: "Cart items must have a valid product and quantity (1–99)." },
        { status: 400 },
      );
    }
    const products = await getAllProducts();
    const availableProducts = new Set(products.map((product) => product.id));
    if (items.some((item) => !availableProducts.has(Number(item.productId)))) {
      return cartSessionResponse(
        session,
        { error: "One or more products are unavailable." },
        { status: 404 },
      );
    }
    for (const item of items) {
      await addToCart(
        Number(item.productId),
        Number(item.quantity ?? 1),
        session.ownerKey,
      );
    }
  }
  return cartSessionResponse(session, await getCart(session.ownerKey));
}

export async function DELETE(request) {
  const session = readCartSession(request);
  await clearCart(session.ownerKey);
  return cartSessionResponse(session, await getCart(session.ownerKey));
}
