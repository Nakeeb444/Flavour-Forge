import { toggleFavorite } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const body = await req.json();
  const isFavorite = await toggleFavorite(Number(body.recipeId));
  return Response.json({ recipeId: Number(body.recipeId), isFavorite });
}
