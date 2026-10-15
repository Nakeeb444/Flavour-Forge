"use client";

import {
  ArrowRight,
  ClockIcon,
  HeadsetIcon,
  RecipesIcon,
  CartIcon,
} from "@/components/ui/icons";

const HOME_CATEGORIES = [
  {
    title: "Vegetarian favourites",
    description: "Colourful mains for everyday cooking.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=80",
    filter: "Vegetarian",
  },
  {
    title: "Non-vegetarian favourites",
    description: "Chicken and egg recipes with bold, comforting flavours.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=80",
    filter: "Non-Vegetarian",
  },
  {
    title: "Starters & snacks",
    description: "Small plates made for sharing.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
    filter: "Starters",
  },
  {
    title: "Everyday meals",
    description: "Comfort food for any day of the week.",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80",
    filter: "Indian",
  },
  {
    title: "Sweet moments",
    description: "Desserts worth making time for.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
    filter: "Desserts",
  },
  {
    title: "Cool treats",
    description: "Simple, refreshing ice cream ideas.",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80",
    filter: "Ice Cream",
  },
];

export function HomePage({ recipeCount, onBrowse, onShop, onHelp }) {
  return (
    <div className="animate-fade-up space-y-10 pb-4">
      <section className="grid overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-[0_12px_45px_rgba(90,45,20,0.08)] md:grid-cols-[1fr_0.9fr]">
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            Welcome to Flavour Forge
          </span>
          <h1 className="font-display mt-4 max-w-[550px] text-[clamp(2.3rem,4.2vw,4.5rem)] font-bold leading-[1.07] tracking-tight text-ink">
            Good food starts here.
          </h1>
          <p className="mt-5 max-w-[460px] text-base leading-relaxed text-stone-600">
            Find something delicious to make, gather the ingredients, and enjoy
            cooking at your own pace.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => onBrowse("Vegetarian")}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-600"
            >
              Browse recipes <ArrowRight width={17} height={17} />
            </button>
            <button
              onClick={onShop}
              className="rounded-xl border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition-colors duration-300 hover:bg-orange-50"
            >
              Shop ingredients
            </button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-stone-500">
            <ClockIcon width={15} height={15} /> Explore {recipeCount} recipes
            at your own pace
          </p>
        </div>
        <div className="relative min-h-[260px] bg-orange-100 md:min-h-[430px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80"
            alt="Freshly cooked chicken biryani"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </section>

      <section aria-labelledby="explore-heading">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-brand-600">
            Find your next dish
          </p>
          <h2
            id="explore-heading"
            className="font-display mt-1 text-[28px] font-bold text-ink"
          >
            What sounds good today?
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HOME_CATEGORIES.map((category) => (
            <button
              key={category.title}
              onClick={() => onBrowse(category.filter)}
              className="card group overflow-hidden text-left transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="block aspect-[16/10] overflow-hidden bg-orange-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </span>
              <span className="flex items-center justify-between gap-3 px-4 py-4">
                <span>
                  <span className="block text-base font-bold text-ink">
                    {category.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-stone-500">
                    {category.description}
                  </span>
                </span>
                <ArrowRight
                  width={18}
                  height={18}
                  className="shrink-0 text-brand-500"
                />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section
        className="card grid gap-5 px-6 py-6 sm:grid-cols-3"
        aria-label="How Flavour Forge works"
      >
        {[
          {
            icon: RecipesIcon,
            title: "Choose a recipe",
            text: "Browse meals, desserts and more.",
          },
          {
            icon: CartIcon,
            title: "Get ingredients",
            text: "Pick what you need and add it to your cart.",
          },
          {
            icon: HeadsetIcon,
            title: "Cook with ease",
            text: "Follow the steps, and ask us if you need help.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand-600">
              <Icon width={20} height={20} />
            </span>
            <span>
              <span className="block text-sm font-bold text-ink">{title}</span>
              <span className="mt-1 block text-xs leading-relaxed text-stone-500">
                {text}
              </span>
            </span>
          </div>
        ))}
      </section>
      <div className="text-center text-sm text-stone-500">
        Need a hand?{" "}
        <button
          onClick={onHelp}
          className="font-semibold text-brand-600 hover:underline"
        >
          Visit Customer Care
        </button>
      </div>
    </div>
  );
}
