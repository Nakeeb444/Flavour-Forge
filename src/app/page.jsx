import { App } from "@/components/layout/App";
import { getCart, getRecipeBySlug, getRecipes } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [recipes, cart] = await Promise.all([getRecipes(), getCart()]);
  const initialSlug = recipes.find((r) => r.slug === "chicken-biryani")?.slug ?? recipes[0]?.slug;
  const recipe = initialSlug ? await getRecipeBySlug(initialSlug) : null;

  return <App initialRecipes={recipes} initialRecipe={recipe} initialCart={cart} />;
}
