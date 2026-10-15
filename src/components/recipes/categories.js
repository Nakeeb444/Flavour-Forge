// Every recipe has one primary browsing category, even if it has several tags.
// Cuisine filters are also available alongside those type-based categories.
export const RECIPE_CATEGORIES = [
  "Vegetarian",
  "Non-Vegetarian",
  "Starters",
  "Indian",
  "Italian",
  "Chinese",
  "Desserts",
  "Ice Cream",
  "Chocolate",
];

export function recipeCategory(recipe) {
  const tags = recipe.tags ?? [];
  if (tags.includes("Non-Vegetarian")) return "Non-Vegetarian";
  if (tags.includes("Ice Cream")) return "Ice Cream";
  if (tags.includes("Chocolate")) return "Chocolate";
  if (tags.includes("Desserts")) return "Desserts";
  if (tags.includes("Starters")) return "Starters";
  if (recipe.cuisine === "Italian") return "Italian";
  if (recipe.cuisine === "Chinese") return "Chinese";
  if (tags.includes("Vegetarian")) return "Vegetarian";
  return "Indian";
}

export function recipeMatchesCategory(recipe, category) {
  return (
    recipeCategory(recipe) === category ||
    recipe.cuisine === category ||
    (recipe.tags ?? []).includes(category)
  );
}
