"use client";

import { ClockIcon, HeartIcon, UsersIcon } from "@/components/ui/icons";

export function RecipeCard({
  recipe,
  selected,
  index = 0,
  onSelect,
  onToggleFavorite,
}) {
  return (
    <article
      style={{ animationDelay: `${index * 55}ms` }}
      className={`card group relative animate-pop-in overflow-hidden transition-[transform,box-shadow,border-color] duration-700 ease-out hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(234,88,12,0.15)] ${
        selected ? "border-brand-300 ring-2 ring-brand-300/70" : ""
      }`}
    >
      <button
        onClick={onSelect}
        aria-label={`View ${recipe.name} recipe`}
        className="block w-full text-left"
      >
        <span className="relative block aspect-[16/10] overflow-hidden bg-orange-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={recipe.image}
            alt={`${recipe.name} — finished dish`}
            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/images/chicken-biryani.jpg"; }}
            loading={index > 3 ? "lazy" : "eager"}
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.045]"
          />
          {recipe.tags.some((tag) =>
            ["Desserts", "Ice Cream", "Chocolate"].includes(tag),
          ) && (
            <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-brand-700 shadow-sm backdrop-blur">
              Sweet treat
            </span>
          )}
        </span>
        <span className="block px-3.5 py-3">
          <span className="block truncate text-[15px] font-semibold transition-colors duration-500 group-hover:text-brand-600">
            {recipe.name}
          </span>
          <span className="mt-2 flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <ClockIcon width={14} height={14} />{" "}
              {recipe.prepTime + recipe.cookTime} min
            </span>
            <span className="flex items-center gap-1">
              <UsersIcon width={14} height={14} /> {recipe.servings} servings
            </span>
          </span>
        </span>
      </button>
      <button
        onClick={onToggleFavorite}
        aria-label={
          recipe.isFavorite ? "Remove from favourites" : "Add to favourites"
        }
        aria-pressed={recipe.isFavorite}
        className={`absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors duration-500 hover:text-red-500 ${
          recipe.isFavorite ? "text-red-500" : "text-stone-500"
        }`}
      >
        <HeartIcon width={18} height={18} filled={recipe.isFavorite} />
      </button>
    </article>
  );
}
