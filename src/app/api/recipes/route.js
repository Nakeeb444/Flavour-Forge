import { getRecipes } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getRecipes();
  return Response.json(data);
}
