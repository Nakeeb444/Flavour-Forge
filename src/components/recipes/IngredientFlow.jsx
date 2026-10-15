"use client";

import { PlusIcon } from "@/components/ui/icons";
import { scaleQuantity } from "@/lib/utils";

const POSITIONS = [
  { left: 41, top: 1 },
  { left: 1, top: 13 },
  { left: 79, top: 13 },
  { left: 0, top: 41 },
  { left: 80, top: 41 },
  { left: 1, top: 69 },
  { left: 79, top: 69 },
  { left: 22, top: 85 },
  { left: 61, top: 85 },
];
const SHORT_SLOTS = {
  1: [0],
  2: [1, 2],
  3: [0, 1, 2],
  4: [1, 2, 5, 6],
  5: [0, 1, 2, 5, 6],
  6: [0, 1, 2, 3, 4, 7],
  7: [0, 1, 2, 3, 4, 5, 6],
  8: [0, 1, 2, 3, 4, 5, 6, 7],
};

function IngredientNode({
  ingredient,
  factor,
  active,
  onSelect,
  onAdd,
  position,
  index,
  animated = false,
}) {
  const fromX = (50 - position.left) * 5;
  const fromY = (50 - position.top) * 4;
  return (
    <div
      className={`flex min-w-0 items-center gap-2 rounded-full border bg-white/95 p-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.11)] backdrop-blur transition-[border-color,box-shadow] duration-500 ${animated ? "flow-node-enter" : ""} ${active ? "border-brand-400 shadow-[0_8px_28px_rgba(249,115,22,0.26)]" : "border-white/80"}`}
      style={
        animated
          ? {
              position: "absolute",
              left: `${position.left}%`,
              top: `${position.top}%`,
              width: 174,
              "--fx": `${fromX}px`,
              "--fy": `${fromY}px`,
              "--delay": `${250 + index * 110}ms`,
              zIndex: 10,
            }
          : undefined
      }
    >
      <button
        onClick={onSelect}
        aria-label={`View ${ingredient.name} options`}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[23px]"
          role="img"
          aria-label={ingredient.name}
        >
          {ingredient.emoji}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12px] font-bold text-ink">
            {ingredient.name}
          </span>
          <span className="block truncate text-[11px] text-stone-500">
            {scaleQuantity(ingredient.quantity, factor)}
          </span>
        </span>
      </button>
      <button
        onClick={onAdd}
        aria-label={`Add ${ingredient.name}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600"
      >
        <PlusIcon width={14} height={14} />
      </button>
    </div>
  );
}

export function IngredientFlow({
  recipe,
  factor,
  selectedIngredientId,
  onSelectIngredient,
  onAddIngredient,
}) {
  const items = recipe.ingredients;
  const slots = SHORT_SLOTS[items.length] ?? POSITIONS.map((_, i) => i);
  const visible = items.slice(0, 9);
  const node = (ingredient, index, animated) => (
    <IngredientNode
      key={ingredient.id}
      ingredient={ingredient}
      factor={factor}
      active={selectedIngredientId === ingredient.ingredientId}
      onSelect={() => onSelectIngredient(ingredient.ingredientId)}
      onAdd={() => onAddIngredient(ingredient)}
      position={POSITIONS[slots[index] ?? index]}
      index={index}
      animated={animated}
    />
  );

  return (
    <section aria-label="Recipe ingredient flowchart" className="mt-5">
      <div
        key={recipe.id}
        className="relative hidden h-[560px] w-full overflow-hidden rounded-[24px] bg-gradient-to-br from-orange-50/60 via-white to-amber-50/60 lg:block"
      >
        <div className="flow-halo pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(253,186,116,0.4),transparent_70%)]" />
        <div className="flow-orbit pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] rounded-full border-2 border-dashed border-orange-200/70" />
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {visible.map((ingredient, index) => {
            const point = POSITIONS[slots[index] ?? index];
            return (
              <line
                key={ingredient.id}
                x1="50%"
                y1="50%"
                x2={`${point.left + 8}%`}
                y2={`${point.top + 5}%`}
                stroke="#fb923c"
                strokeOpacity="0.62"
                strokeWidth="1.5"
                strokeDasharray="4 5"
                className="flow-line-enter"
                style={{ "--delay": `${200 + index * 110}ms` }}
              />
            );
          })}
        </svg>
        <div className="flow-dish-enter absolute left-1/2 top-1/2 h-[332px] w-[332px] overflow-hidden rounded-full border-[8px] border-white shadow-[0_22px_55px_rgba(75,37,16,0.24)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={recipe.image}
            alt={recipe.name}
            className="h-full w-full object-cover"
          />
        </div>
        {visible.map((ingredient, index) => node(ingredient, index, true))}
      </div>
      <div className="lg:hidden">
        <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-orange-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={recipe.image}
            alt={recipe.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {items.map((ingredient, index) => node(ingredient, index, false))}
        </div>
      </div>
    </section>
  );
}
