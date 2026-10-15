import {
  getCart,
  removeRecipeCartItem,
  setRecipeCartQuantity,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export async function PATCH(request, context) {
  const { id } = await context.params;
  const { quantity } = await request.json();
  const value = Number(quantity);
  if (!Number.isInteger(value) || value < 0 || value > 99)
    return Response.json({ error: "Invalid quantity" }, { status: 400 });
  await setRecipeCartQuantity(Number(id), value);
  return Response.json(await getCart());
}

export async function DELETE(_request, context) {
  const { id } = await context.params;
  await removeRecipeCartItem(Number(id));
  return Response.json(await getCart());
}
