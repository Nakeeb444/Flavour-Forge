import { App } from "@/components/layout/App";
import { getCart, getRecipeBySlug, getRecipes } from "@/lib/data";
import { cookies } from "next/headers";
import {
  CART_SESSION_COOKIE,
  isValidCartSession,
} from "@/lib/cart-session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const cartSession = cookieStore.get(CART_SESSION_COOKIE)?.value;
  const ownerKey = isValidCartSession(cartSession) ? cartSession : null;
  const [recipes, cart] = await Promise.all([
    getRecipes(),
    getCart(ownerKey),
  ]);
  const initialSlug = recipes.find((r) => r.slug === "chicken-biryani")?.slug ?? recipes[0]?.slug;
  const recipe = initialSlug ? await getRecipeBySlug(initialSlug) : null;

  return <App initialRecipes={recipes} initialRecipe={recipe} initialCart={cart} />;
}
