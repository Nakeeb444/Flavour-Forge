"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarsIcon,
  CartIcon,
  ChevronRight,
  ClockIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  PotIcon,
  UsersIcon,
} from "@/components/ui/icons";

import { inr, scaleQuantity } from "@/lib/utils";
import { IngredientFlow } from "@/components/recipes/IngredientFlow";
import { ProductVisual } from "@/components/shop/ProductVisual";

const TABS = ["About", "Ingredients", "Instructions", "Nutrition"];

export function RecipeDetail({
  recipe,
  loading,
  servings,
  onServings,
  selectedIngredientId,
  onSelectIngredient,
  onAddIngredient,
  onAddProduct,
  onBuyAll,
  onToggleFavorite,
  onHome,
  onRecipes,
}) {
  const [tab, setTab] = useState("About");

  const factor = recipe ? servings / recipe.servings : 1;
  const estimate = useMemo(() => {
    if (!recipe) return 0;
    return recipe.ingredients.reduce((s, i) => {
      const p = i.products.find((x) => x.isDefault) ?? i.products[0];
      return s + (p ? p.price * Math.max(1, Math.ceil(factor)) : 0);
    }, 0);
  }, [recipe, factor]);

  const selectedIngredient = recipe?.ingredients.find(
    (ingredient) => ingredient.ingredientId === selectedIngredientId,
  );

  if (!recipe) {
    return (
      <div className="card flex min-h-[500px] items-center justify-center text-stone-500">
        {loading ? "Loading recipe…" : "Select a recipe to see details."}
      </div>
    );
  }

  return (
    <div
      className={`card animate-fade-up overflow-hidden p-4 transition ${loading ? "opacity-60" : ""}`}
    >
      {/* breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-stone-500">
        <button onClick={onHome} className="hover:text-brand-600">
          Home
        </button>
        <ChevronRight width={14} height={14} />
        <button onClick={onRecipes} className="hover:text-brand-600">
          Recipes
        </button>
        <ChevronRight width={14} height={14} />
        <span className="text-ink">{recipe.name}</span>
      </nav>

      {/* title */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1
          id="recipe-sheet-title"
          key={recipe.id}
          className="font-display animate-title text-[34px] font-bold leading-none tracking-tight"
        >
          {recipe.name}
        </h1>
        <button
          onClick={onToggleFavorite}
          aria-label={
            recipe.isFavorite ? "Remove from favourites" : "Add to favourites"
          }
          aria-pressed={recipe.isFavorite}
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-colors duration-500 ${
            recipe.isFavorite
              ? "text-red-500"
              : "text-stone-400 hover:text-red-500"
          }`}
        >
          <HeartIcon width={22} height={22} filled={recipe.isFavorite} />
        </button>
      </div>
      <p className="mt-2 max-w-[520px] text-[15px] leading-snug text-stone-600">
        {recipe.description}
      </p>

      {/* meta */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-600">
        <span className="flex items-center gap-1.5">
          <ClockIcon width={16} height={16} />{" "}
          {recipe.prepTime + recipe.cookTime} min
        </span>
        <span className="flex items-center gap-1.5">
          <UsersIcon width={16} height={16} /> {recipe.servings} servings
        </span>
        <span className="ml-auto flex items-center gap-1.5 rounded-xl bg-ink px-3 py-1.5 text-sm font-semibold text-white">
          <BarsIcon width={16} height={16} className="text-brand-400" />{" "}
          {recipe.difficulty}
        </span>
      </div>

      <IngredientFlow
        recipe={recipe}
        factor={factor}
        selectedIngredientId={selectedIngredientId}
        onSelectIngredient={onSelectIngredient}
        onAddIngredient={onAddIngredient}
      />

      {selectedIngredient && (
        <section
          className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-4"
          aria-label={`${selectedIngredient.name} products`}
        >
          <div className="flex items-center gap-3">
            <ProductVisual
              emoji={selectedIngredient.emoji}
              name={selectedIngredient.name}
              size="sm"
            />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-ink">
                {selectedIngredient.name} options
              </h2>
              <p className="text-xs leading-relaxed text-stone-500">
                {selectedIngredient.about}
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {selectedIngredient.products.map((product) => (
              <div
                key={product.id}
                className="flex min-w-0 items-center gap-2 rounded-xl border border-orange-100 bg-white p-2.5"
              >
                <ProductVisual
                  emoji={selectedIngredient.emoji}
                  name={product.name}
                  productId={product.id}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {product.size} · {inr(product.price)}
                  </p>
                </div>
                <button
                  onClick={() => onAddProduct(product.id, 1)}
                  aria-label={`Add ${product.name}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600"
                >
                  <PlusIcon width={14} height={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* servings + buy all */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 rounded-full bg-white px-2 py-1.5 shadow-md ring-1 ring-orange-100">
          <button
            onClick={() => onServings(Math.max(1, servings - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 text-brand-500 transition hover:bg-orange-50 active:scale-90"
            aria-label="Decrease servings"
          >
            <MinusIcon width={16} height={16} />
          </button>
          <span
            key={servings}
            className="min-w-[88px] text-center text-[15px] font-semibold transition-colors duration-500"
          >
            {servings} servings
          </span>
          <button
            onClick={() => onServings(Math.min(20, servings + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 text-brand-500 transition hover:bg-orange-50 active:scale-90"
            aria-label="Increase servings"
          >
            <PlusIcon width={16} height={16} />
          </button>
        </div>
        <button
          onClick={onBuyAll}
          className="group flex flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-3 text-white shadow-lg shadow-orange-200 transition-[transform,filter] duration-500 ease-out hover:brightness-105 active:scale-[0.99]"
        >
          <CartIcon
            width={26}
            height={26}
            className="transition group-hover:-rotate-12 group-hover:scale-110"
          />
          <span className="text-left leading-tight">
            <span className="block text-[17px] font-bold">
              Add Complete Recipe to Cart
            </span>
            <span className="text-sm">
              {inr(estimate)}{" "}
              <span className="text-xs opacity-80">
                for {servings} servings
              </span>
            </span>
          </span>
          <ArrowRight
            width={20}
            height={20}
            className="ml-2 transition group-hover:translate-x-1.5"
          />
        </button>
      </div>

      {/* tabs */}
      <div className="mt-5 flex border-b border-orange-100">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex-1 pb-2.5 text-[15px] font-semibold transition ${
              tab === t ? "text-brand-600" : "text-stone-600 hover:text-ink"
            }`}
          >
            {t}
            {tab === t && (
              <span className="absolute inset-x-6 -bottom-px h-[3px] rounded-full bg-brand-500" />
            )}
          </button>
        ))}
      </div>

      <div
        key={tab}
        className="animate-fade-up min-h-[70px] py-4 text-[15px] leading-relaxed text-stone-700"
      >
        {tab === "About" && <p>{recipe.about}</p>}
        {tab === "Ingredients" && (
          <ul className="grid gap-2 sm:grid-cols-2">
            {recipe.ingredients.map((i, idx) => (
              <li
                key={i.id}
                onClick={() => onSelectIngredient(i.ingredientId)}
                style={{ animationDelay: `${idx * 45}ms` }}
                className="animate-pop-in flex cursor-pointer items-center gap-3 rounded-xl bg-orange-50/60 px-3 py-2 transition hover:translate-x-1 hover:bg-orange-50"
              >
                <span className="text-xl">{i.emoji}</span>
                <span className="flex-1 font-medium">{i.name}</span>
                <span className="text-sm text-stone-500">
                  {scaleQuantity(i.quantity, factor)}
                  {i.note ? ` · ${i.note}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
        {tab === "Instructions" && (
          <ol className="space-y-3">
            {recipe.instructions.map((s, i) => (
              <li
                key={i}
                style={{ animationDelay: `${i * 70}ms` }}
                className="animate-pop-in flex gap-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        )}
        {tab === "Nutrition" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Calories", `${recipe.calories} kcal`],
              ["Protein", `${recipe.protein} g`],
              ["Carbs", `${recipe.carbs} g`],
              ["Fat", `${recipe.fat} g`],
            ].map(([l, v], i) => (
              <div
                key={l}
                style={{ animationDelay: `${i * 70}ms` }}
                className="animate-pop-in rounded-xl bg-orange-50/60 px-3 py-3 text-center"
              >
                <p className="text-lg font-bold text-ink">{v}</p>
                <p className="text-xs text-stone-500">{l} / serving</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            icon: ClockIcon,
            label: "Prep Time",
            value: `${recipe.prepTime} min`,
          },
          {
            icon: PotIcon,
            label: "Cook Time",
            value: `${recipe.cookTime} min`,
          },
          {
            icon: UsersIcon,
            label: "Servings",
            value: String(recipe.servings),
          },
          { icon: BarsIcon, label: "Difficulty", value: recipe.difficulty },
        ].map(({ icon: Icon, label, value }, i) => (
          <div
            key={label}
            style={{ animationDelay: `${i * 80}ms` }}
            className="animate-pop-in flex items-center gap-3 rounded-xl border border-orange-100 bg-white px-3 py-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <Icon width={28} height={28} className="text-brand-500" />
            <div>
              <p className="text-xs text-stone-500">{label}</p>
              <p className="text-[15px] font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
