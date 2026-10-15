"use client";

import { ArrowRight, ClockIcon, UsersIcon } from "@/components/ui/icons";

export function RecipeDock({ recipe, onOpen, dockVisible = false }) {
  return (
    <button
      aria-haspopup="dialog"
      aria-controls="recipe-sheet"
      aria-expanded="false"
      aria-label={`Open selected recipe ${recipe.name}`}
      onClick={onOpen}
      className={`group fixed bottom-[76px] left-1/2 z-40 flex w-[min(92vw,390px)] -translate-x-1/2 items-center gap-3 rounded-[20px] border border-white/80 bg-white/95 p-2.5 text-left shadow-[0_14px_48px_rgba(78,44,20,0.2)] backdrop-blur-xl transition-[bottom,transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(78,44,20,0.24)] sm:bottom-6 ${dockVisible ? "lg:bottom-28" : "lg:bottom-7"}`}
    >
      <span className="relative h-[58px] w-[68px] shrink-0 overflow-hidden rounded-[14px] bg-orange-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={recipe.image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.17em] text-brand-600">
          Selected recipe
        </span>
        <span className="mt-0.5 block truncate text-[15px] font-bold text-ink">
          {recipe.name}
        </span>
        <span className="mt-1 flex items-center gap-2 text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <ClockIcon width={12} height={12} />{" "}
            {recipe.prepTime + recipe.cookTime} min
          </span>
          <span className="h-1 w-1 rounded-full bg-orange-200" />
          <span className="flex items-center gap-1">
            <UsersIcon width={12} height={12} /> {recipe.servings} servings
          </span>
        </span>
      </span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition-colors duration-300 group-hover:bg-brand-600">
        <ArrowRight width={17} height={17} />
      </span>
    </button>
  );
}
