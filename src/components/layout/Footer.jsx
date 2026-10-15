"use client";

import { ArrowRight, HeadsetIcon, RecipesIcon } from "@/components/ui/icons";

export function Footer({ onNavigate, onOpenTerms }) {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-12 border-t border-orange-100 pb-24 pt-8 text-stone-600 lg:pb-28"
      aria-label="Site footer"
    >
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="text-lg font-extrabold tracking-tight">
            <span className="text-ink">Flavour</span>{" "}
            <span className="text-brand-500">Forge</span>
          </p>
          <p className="mt-2 max-w-[300px] text-sm leading-relaxed">
            A place to find your next meal, gather ingredients and enjoy the
            little moments around food.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-ink">
            Explore
          </h2>
          <div className="mt-3 flex flex-col items-start gap-2 text-sm">
            <button
              onClick={() => onNavigate("home")}
              className="hover:text-brand-600"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("recipes")}
              className="inline-flex items-center gap-1 hover:text-brand-600"
            >
              <RecipesIcon width={15} height={15} /> Recipes
            </button>
            <button
              onClick={() => onNavigate("shop")}
              className="hover:text-brand-600"
            >
              Shop ingredients
            </button>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-ink">
            Here to help
          </h2>
          <div className="mt-3 flex flex-col items-start gap-2 text-sm">
            <button
              onClick={() => onNavigate("support")}
              className="inline-flex items-center gap-1 hover:text-brand-600"
            >
              <HeadsetIcon width={15} height={15} /> Customer Care
            </button>
            <button onClick={onOpenTerms} className="hover:text-brand-600">
              Terms &amp; Conditions
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 pt-5 text-xs text-stone-500">
        <span>© {year} Flavour Forge. Made for the joy of cooking.</span>
        <button
          onClick={() => onNavigate("recipes")}
          className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline"
        >
          Find a recipe <ArrowRight width={14} height={14} />
        </button>
      </div>
    </footer>
  );
}
