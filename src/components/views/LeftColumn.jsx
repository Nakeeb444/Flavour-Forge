"use client";

import {
  ArrowRight,
  BoxIcon,
  HeadsetIcon,
  HeartIcon,
  UserIcon,
} from "@/components/ui/icons";
import { HomePage } from "@/components/views/HomePage";
import { CartPage } from "@/components/shop/CartPage";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RECIPE_CATEGORIES } from "@/components/recipes/categories";

import { CustomerCare } from "@/components/support/CustomerCare";

export const FILTERS = ["All", ...RECIPE_CATEGORIES];

function FilterChips({ filter, onFilter }) {
  return (
    <div
      role="group"
      aria-label="Recipe types"
      className="scrollbar-thin flex gap-2 overflow-x-auto pb-1"
    >
      {FILTERS.map((f) => (
        <button
          key={f}
          type="button"
          aria-pressed={filter === f}
          onClick={() => onFilter(f)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition active:scale-90 ${
            filter === f
              ? "scale-105 bg-brand-500 text-white shadow-orange-200"
              : "bg-white text-stone-600 hover:-translate-y-0.5 hover:bg-brand-50"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

function RecipeGrid({ list, selectedSlug, onSelect, onToggleFavorite, empty }) {
  if (list.length === 0) {
    return (
      <div className="card px-4 py-10 text-center text-sm text-stone-500">
        {empty}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-3">
      {list.map((r, i) => (
        <RecipeCard
          key={r.id}
          recipe={r}
          index={i}
          selected={r.slug === selectedSlug}
          onSelect={() => onSelect(r.slug)}
          onToggleFavorite={() => onToggleFavorite(r.id)}
        />
      ))}
    </div>
  );
}

export function LeftColumn(props) {
  const {
    view,
    filtered,
    filter,
    search,
    onFilter,
    selectedSlug,
    onSelect,
    onToggleFavorite,
    onChangeView,
  } = props;
  const gridProps = { selectedSlug, onSelect, onToggleFavorite };

  if (view === "home") {
    return (
      <HomePage
        recipeCount={props.recipes.length}
        onBrowse={(category) => {
          onFilter(category);
          onChangeView("recipes");
        }}
        onShop={() => onChangeView("shop")}
        onHelp={() => onChangeView("support")}
      />
    );
  }

  if (view === "recipes") {
    return (
      <div className="animate-fade-up space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
            Find something good
          </p>
          <h1 className="font-display mt-1 text-[28px] font-bold">
            Recipe categories
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Vegetarian favourites, shareable starters and more — choose a
            category to explore.
          </p>
        </div>
        <FilterChips filter={filter} onFilter={onFilter} />
        <section
          aria-label={
            search?.trim() ? "Recipe search results" : `${filter} recipes`
          }
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-ink">
              {search?.trim()
                ? `Results for “${search.trim()}”`
                : `${filter} recipes`}
            </h2>
            <span className="shrink-0 text-xs text-stone-500">
              {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
            </span>
          </div>
          <RecipeGrid
            list={filtered}
            {...gridProps}
            empty={
              search?.trim()
                ? "No recipes match that search. Try a dish, ingredient or cuisine."
                : `No ${filter.toLowerCase()} recipes available yet.`
            }
          />
        </section>
      </div>
    );
  }

  if (view === "favorites") {
    const favs = props.recipes.filter((r) => r.isFavorite);
    return (
      <div className="animate-fade-up space-y-4">
        <h1 className="font-display flex items-center gap-2 text-[26px] font-bold">
          <HeartIcon className="text-red-500" filled /> Favourites
        </h1>
        <RecipeGrid
          list={favs}
          {...gridProps}
          empty="No favourites yet. Tap the heart on a recipe to save it."
        />
      </div>
    );
  }

  if (view === "shop") {
    return (
      <ShopGrid
        products={props.shopProducts}
        onAddProduct={props.onAddProduct}
      />
    );
  }

  if (view === "cart") {
    return (
      <CartPage
        cart={props.cart}
        busy={props.busy}
        onUpdateQty={props.onUpdateQty}
        onRemove={props.onRemove}
        onClear={props.onClear}
        onCheckout={props.onCheckout}
        onBrowse={() => onChangeView("recipes")}
      />
    );
  }

  if (view === "orders") {
    return (
      <div className="animate-fade-up space-y-4">
        <h1 className="font-display flex items-center gap-2 text-[26px] font-bold">
          <BoxIcon /> My Orders
        </h1>
        {props.orders.length === 0 ? (
          <div className="card px-4 py-10 text-center text-sm text-stone-500">
            No order requests yet. Submit a request from your cart to see it here.
          </div>
        ) : (
          props.orders.map((o) => {
            let items = [];
            try {
              items = JSON.parse(o.items);
            } catch {}
            return (
              <div key={o.id} className="card px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">Order request #{o.id}</p>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    Recorded
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-stone-500">
                  {new Date(o.createdAt).toLocaleString()} · {o.itemCount} items
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-stone-600">
                  {items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                </p>
                <p className="mt-2 text-right text-sm font-bold">₹ {o.total}</p>
              </div>
            );
          })
        )}
      </div>
    );
  }

  if (view === "support") {
    return (
      <CustomerCare
        user={props.user}
        onToast={props.onToast}
        onOpenTerms={props.onOpenTerms}
      />
    );
  }

  // profile
  const favCount = props.recipes.filter((r) => r.isFavorite).length;
  return (
    <div className="animate-fade-up space-y-4">
      <h1 className="font-display flex items-center gap-2 text-[26px] font-bold">
        <UserIcon /> Profile
      </h1>
      <div className="card flex flex-col items-center px-4 py-8 text-center">
        <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-200 to-brand-500 text-3xl font-bold text-white">
          {props.user?.photoURL ? (
            <img
              src={props.user.photoURL}
              alt={`${props.user.fullName}'s profile`}
              className="h-full w-full object-cover"
            />
          ) : (
            props.user?.fullName.charAt(0).toUpperCase() ?? "G"
          )}
        </span>
        <p className="mt-3 text-lg font-bold">
          {props.user?.fullName ?? "Guest chef"}
        </p>
        <p className="text-sm text-stone-500">
          {props.user?.email ??
            "Create a free account to save your favourite recipes and orders."}
        </p>
        <div className="mt-6 grid w-full grid-cols-3 gap-2">
          {[
            ["Favourites", favCount],
            ["Orders", props.orders.length],
            ["In Cart", props.cart.count],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-orange-50 py-3">
              <p className="text-xl font-bold text-brand-600">{v}</p>
              <p className="text-xs text-stone-500">{l}</p>
            </div>
          ))}
        </div>
        {props.user?.firebaseUid && (
          <div className="mt-4 flex w-full flex-col gap-2">
            <button
              type="button"
              disabled={props.notificationsBusy}
              onClick={props.onEnableNotifications}
              className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-brand-400 hover:text-brand-700 disabled:cursor-wait disabled:opacity-60"
            >
              {props.notificationsBusy
                ? "Enabling notifications…"
                : "Enable push notifications"}
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => props.onChangeView("support")}
          className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 text-left transition-colors duration-300 hover:bg-orange-100"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">
            <HeadsetIcon width={21} height={21} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-ink">
              Customer Care
            </span>
            <span className="block text-xs text-stone-500">
              Contact us or track your support tickets
            </span>
          </span>
          <ArrowRight
            width={18}
            height={18}
            className="shrink-0 text-brand-600"
          />
        </button>
        {props.user ? (
          <button
            onClick={props.onSignOut}
            className="mt-5 rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-stone-600 transition-colors duration-500 hover:border-red-200 hover:text-red-600"
          >
            Sign out
          </button>
        ) : (
          <div className="mt-5 w-full">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={props.onCreateAccount}
                className="group flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-brand-500 to-amber-500 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Create account
                <ArrowRight
                  width={16}
                  height={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
              <button
                type="button"
                onClick={props.onSignIn}
                className="rounded-full border border-orange-200 px-3 py-3 text-sm font-bold text-brand-700 transition hover:border-brand-400 hover:bg-orange-50"
              >
                Sign in
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              Save your favourite recipes and keep your order history in one
              place.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
