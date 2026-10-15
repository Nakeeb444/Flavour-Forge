import { getCart, removeCartItem, setCartQuantity } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function PATCH(req, ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  await setCartQuantity(Number(id), Math.min(99, Number(body.quantity)));
  return Response.json(await getCart());
}

export async function DELETE(_req, ctx) {
  const { id } = await ctx.params;
  await removeCartItem(Number(id));
  return Response.json(await getCart());
}
