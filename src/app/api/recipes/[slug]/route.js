import { getRecipeBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(_req, ctx) {
  const { slug } = await ctx.params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(recipe);
}
