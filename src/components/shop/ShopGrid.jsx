"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/ui/icons";
import { ProductVisual } from "@/components/shop/ProductVisual";
import { inr } from "@/lib/utils";

const SWEET = new Set([
  "Sugar",
  "Dark Chocolate",
  "Cocoa Powder",
  "Strawberries",
  "Alphonso Mango",
  "Chocolate Sauce",
  "Digestive Biscuits",
  "Sweetened Condensed Milk",
  "Mixed Nuts",
  "Rose Water",
  "Saffron",
]);
const HOT = new Set([
  "Chicken",
  "Spices",
  "Ginger",
  "Garlic",
  "Onion",
  "Bell Pepper",
  "Cumin Seeds",
  "Soy Sauce",
  "Hakka Noodles",
  "Tomato",
]);
const MILKY = new Set([
  "Paneer",
  "Butter",
  "Fresh Cream",
  "Yogurt",
  "Whole Milk",
  "Cream Cheese",
  "Vanilla Ice Cream",
  "Mozzarella",
  "Milk Powder",
  "Ghee",
]);
const FRESH = new Set([
  "Mint Leaves",
  "Potato",
  "Cabbage",
  "Carrot",
  "Eggs",
  "Spinach",
  "Cauliflower",
  "Green Peas",
  "Sweet Corn",
  "Green Beans",
]);

function productGroup(product) {
  const name = product.ingredientName;
  if (SWEET.has(name)) return "Sweet & chocolate";
  if (HOT.has(name)) return "Hot & savoury";
  if (MILKY.has(name)) return "Milky & chilled";
  if (FRESH.has(name)) return "Fresh produce";
  return "Pantry essentials";
}

function ShopProductCard({ product, onAdd }) {
  return (
    <article className="card flex h-full min-w-0 flex-col gap-3 p-3.5 transition-[transform,box-shadow] duration-500 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
      <div className="flex min-w-0 items-start gap-3">
        <ProductVisual
          emoji={product.emoji}
          name={product.ingredientName}
          productId={product.id}
          size="md"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-ink">
            {product.name}
          </p>
          <p className="mt-1 text-xs text-stone-500">{product.size}</p>
        </div>
      </div>
      <div className="mt-auto flex items-end justify-between gap-2 border-t border-orange-100 pt-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] text-stone-500">
            {product.ingredientName}
          </p>
          <p className="text-base font-bold text-ink">{inr(product.price)}</p>
        </div>
        <button
          onClick={() => onAdd(product.id, 1)}
          aria-label={`Add ${product.name} to cart`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors duration-300 hover:bg-brand-600"
        >
          <PlusIcon width={18} height={18} />
        </button>
      </div>
    </article>
  );
}

export function ShopGrid({ products, onAddProduct }) {
  const [category, setCategory] = useState("Sweet & chocolate");
  const sections = [
    "Sweet & chocolate",
    "Hot & savoury",
    "Milky & chilled",
    "Fresh produce",
    "Pantry essentials",
  ].map((name) => ({
    name,
    products: products.filter((product) => productGroup(product) === name),
  }));
  const active = sections.find((section) => section.name === category);

  return (
    <div className="animate-fade-up space-y-7">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
          The ingredient market
        </p>
        <h1 className="font-display mt-1 text-[28px] font-bold">
          Shop Ingredients
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Browse by food type, from sweet treats and warming spices to milky
          essentials.
        </p>
      </header>
      <div
        role="tablist"
        aria-label="Ingredient categories"
        className="scrollbar-thin flex gap-2 overflow-x-auto pb-1"
      >
        {sections.map((section) => (
          <button
            key={section.name}
            type="button"
            role="tab"
            id={`shop-tab-${sections.indexOf(section)}`}
            aria-selected={category === section.name}
            aria-controls="shop-category-panel"
            onClick={() => setCategory(section.name)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
              category === section.name
                ? "bg-brand-500 text-white"
                : "bg-white text-stone-600 shadow-sm hover:bg-brand-50"
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>
      <section
        id="shop-category-panel"
        role="tabpanel"
        aria-labelledby={`shop-tab-${sections.findIndex((section) => section.name === category)}`}
        aria-label={category}
      >
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">{category}</h2>
          <span className="text-xs text-stone-500">
            {active?.products.length ?? 0} products
          </span>
        </div>
        {products.length === 0 ? (
          <div className="card p-7 text-center text-sm text-stone-500">
            Preparing the ingredient market…
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
            {active?.products.map((product) => (
              <ShopProductCard
                key={product.id}
                product={product}
                onAdd={onAddProduct}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
