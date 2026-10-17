import { db } from "@/db";
import {
  recipes,
  ingredients,
  recipeIngredients,
  products,
  cartItems,
  recipeCartItems,
} from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { asc, eq, inArray, sql } from "drizzle-orm";

export async function getRecipes() {
  await ensureSeeded();
  const rows = await db
    .select({
      id: recipes.id,
      slug: recipes.slug,
      name: recipes.name,
      description: recipes.description,
      image: recipes.image,
      cuisine: recipes.cuisine,
      tags: recipes.tags,
      prepTime: recipes.prepTime,
      cookTime: recipes.cookTime,
      servings: recipes.servings,
      difficulty: recipes.difficulty,
    })
    .from(recipes)
    .orderBy(asc(recipes.id));
  const ingredientRows = rows.length
    ? await db
        .select({
          recipeId: recipeIngredients.recipeId,
          name: ingredients.name,
        })
        .from(recipeIngredients)
        .innerJoin(
          ingredients,
          eq(ingredients.id, recipeIngredients.ingredientId),
        )
        .where(
          inArray(
            recipeIngredients.recipeId,
            rows.map((row) => row.id),
          ),
        )
    : [];
  const namesByRecipe = new Map();
  for (const row of ingredientRows) {
    const names = namesByRecipe.get(row.recipeId) ?? [];
    names.push(row.name);
    namesByRecipe.set(row.recipeId, names);
  }
  return rows.map((r) => ({
    ...r,
    ingredientNames: namesByRecipe.get(r.id) ?? [],
    isFavorite: false,
  }));
}

export async function getRecipeBySlug(slug) {
  await ensureSeeded();
  const [r] = await db
    .select({
      recipe: recipes,
    })
    .from(recipes)
    .where(eq(recipes.slug, slug))
    .limit(1);
  if (!r) return null;

  const ingRows = await db
    .select({
      id: recipeIngredients.id,
      ingredientId: ingredients.id,
      slug: ingredients.slug,
      name: ingredients.name,
      emoji: ingredients.emoji,
      about: ingredients.about,
      quantity: recipeIngredients.quantity,
      note: recipeIngredients.note,
    })
    .from(recipeIngredients)
    .innerJoin(ingredients, eq(ingredients.id, recipeIngredients.ingredientId))
    .where(eq(recipeIngredients.recipeId, r.recipe.id))
    .orderBy(asc(recipeIngredients.position));

  const ingIds = ingRows.map((i) => i.ingredientId);
  const prodRows = ingIds.length
    ? await db
        .select()
        .from(products)
        .where(inArray(products.ingredientId, ingIds))
        .orderBy(asc(products.id))
    : [];

  const { recipe } = r;
  return {
    id: recipe.id,
    slug: recipe.slug,
    name: recipe.name,
    description: recipe.description,
    image: recipe.image,
    cuisine: recipe.cuisine,
    ingredientNames: ingRows.map((ingredient) => ingredient.name),
    tags: recipe.tags,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    isFavorite: false,
    about: recipe.about,
    instructions: recipe.instructions,
    calories: recipe.calories,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
    ingredients: ingRows.map((i) => ({
      ...i,
      products: prodRows.filter((p) => p.ingredientId === i.ingredientId),
    })),
  };
}

export async function getCart() {
  await ensureSeeded();
  const [productRows, recipeRows] = await Promise.all([
    db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        name: products.name,
        size: products.size,
        price: products.price,
        emoji: ingredients.emoji,
      })
      .from(cartItems)
      .innerJoin(products, eq(products.id, cartItems.productId))
      .innerJoin(ingredients, eq(ingredients.id, products.ingredientId))
      .orderBy(asc(cartItems.id)),
    db
      .select({
        id: recipeCartItems.id,
        recipeId: recipeCartItems.recipeId,
        quantity: recipeCartItems.quantity,
        servings: recipeCartItems.servings,
        price: recipeCartItems.unitPrice,
        ingredientCount: recipeCartItems.ingredientCount,
        name: recipes.name,
        image: recipes.image,
        slug: recipes.slug,
      })
      .from(recipeCartItems)
      .innerJoin(recipes, eq(recipes.id, recipeCartItems.recipeId))
      .orderBy(asc(recipeCartItems.id)),
  ]);
  const items = [
    ...recipeRows.map((row) => ({
      ...row,
      type: "recipe",
      key: `recipe-${row.id}`,
    })),
    ...productRows.map((row) => ({
      ...row,
      type: "product",
      key: `product-${row.id}`,
    })),
  ];
  return {
    items,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export async function addRecipeToCart(recipeId, servings) {
  await ensureSeeded();
  const [recipe] = await db
    .select({ id: recipes.id, servings: recipes.servings })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);
  if (!recipe) return false;
  const safeServings = Math.max(
    1,
    Math.min(20, Number(servings) || recipe.servings),
  );
  const links = await db
    .select({ ingredientId: recipeIngredients.ingredientId })
    .from(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, recipeId));
  const options = links.length
    ? await db
        .select({
          ingredientId: products.ingredientId,
          price: products.price,
          isDefault: products.isDefault,
        })
        .from(products)
        .where(
          inArray(
            products.ingredientId,
            links.map((link) => link.ingredientId),
          ),
        )
        .orderBy(asc(products.id))
    : [];
  const multiplier = Math.max(1, Math.ceil(safeServings / recipe.servings));
  const unitPrice = links.reduce((sum, link) => {
    const choices = options.filter(
      (option) => option.ingredientId === link.ingredientId,
    );
    return (
      sum +
      (choices.find((option) => option.isDefault)?.price ??
        choices[0]?.price ??
        0) *
        multiplier
    );
  }, 0);
  await db
    .insert(recipeCartItems)
    .values({
      recipeId,
      servings: safeServings,
      unitPrice,
      ingredientCount: links.length,
    })
    .onConflictDoUpdate({
      target: [recipeCartItems.recipeId, recipeCartItems.servings],
      set: {
        quantity: sql`${recipeCartItems.quantity} + 1`,
        unitPrice,
        ingredientCount: links.length,
      },
    });
  return true;
}

export async function setRecipeCartQuantity(id, quantity) {
  if (quantity <= 0)
    await db.delete(recipeCartItems).where(eq(recipeCartItems.id, id));
  else
    await db
      .update(recipeCartItems)
      .set({ quantity })
      .where(eq(recipeCartItems.id, id));
}

export async function removeRecipeCartItem(id) {
  await db.delete(recipeCartItems).where(eq(recipeCartItems.id, id));
}

export async function addToCart(productId, quantity) {
  await db
    .insert(cartItems)
    .values({ productId, quantity })
    .onConflictDoUpdate({
      target: cartItems.productId,
      set: { quantity: sql`${cartItems.quantity} + ${quantity}` },
    });
}

export async function setCartQuantity(id, quantity) {
  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
  }
}

export async function removeCartItem(id) {
  await db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function clearCart() {
  await Promise.all([db.delete(cartItems), db.delete(recipeCartItems)]);
}

export async function getAllProducts() {
  await ensureSeeded();
  return db
    .select({
      id: products.id,
      ingredientId: products.ingredientId,
      name: products.name,
      size: products.size,
      price: products.price,
      badge: products.badge,
      isDefault: products.isDefault,
      ingredientName: ingredients.name,
      emoji: ingredients.emoji,
    })
    .from(products)
    .innerJoin(ingredients, eq(ingredients.id, products.ingredientId))
    .orderBy(asc(ingredients.name), asc(products.id));
}
