import { addRecipeToCart, addToCart, clearCart, getCart } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getCart());
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid cart request" }, { status: 400 });
  }
  if (body.recipeId != null) {
    const recipeId = Number(body.recipeId);
    if (
      !Number.isInteger(recipeId) ||
      recipeId < 1 ||
      !(await addRecipeToCart(recipeId, body.servings))
    ) {
      return Response.json({ error: "Recipe not found" }, { status: 404 });
    }
  } else {
    const items =
      body.items ??
      (body.productId
        ? [{ productId: body.productId, quantity: body.quantity ?? 1 }]
        : []);
    for (const item of items) {
      const quantity = Math.max(1, Math.min(99, Number(item.quantity ?? 1)));
      if (
        Number.isInteger(Number(item.productId)) &&
        Number(item.productId) > 0
      )
        await addToCart(Number(item.productId), quantity);
    }
  }
  return Response.json(await getCart());
}

export async function DELETE() {
  await clearCart();
  return Response.json(await getCart());
}
