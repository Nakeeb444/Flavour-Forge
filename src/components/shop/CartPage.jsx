"use client";

import {
  ArrowRight,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { ProductVisual } from "@/components/shop/ProductVisual";
import { inr } from "@/lib/utils";

export function CartPage({
  cart,
  busy,
  onUpdateQty,
  onRemove,
  onClear,
  onCheckout,
  onBrowse,
}) {
  return (
    <div className="animate-fade-up mx-auto w-full max-w-[1000px] space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
            Ready when you are
          </p>
          <h1 className="font-display mt-1 text-[30px] font-bold">My Cart</h1>
          <p className="mt-1 text-sm text-stone-500">
            Recipes are kept together as complete meal kits. Shop items appear
            separately.
          </p>
        </div>
        {cart.items.length > 0 && (
          <button
            onClick={onClear}
            disabled={busy}
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            Clear cart
          </button>
        )}
      </header>
      {cart.items.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="text-5xl" aria-hidden>
            🧺
          </span>
          <h2 className="font-display text-2xl font-bold">
            Your cart is waiting for something good.
          </h2>
          <p className="max-w-md text-sm text-stone-500">
            Choose a recipe and add the complete meal kit, or pick individual
            ingredients from the shop.
          </p>
          <button
            onClick={onBrowse}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Explore recipes
          </button>
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-3">
            {cart.items.map((item) => {
              const isRecipe = item.type === "recipe";
              const endpoint = isRecipe
                ? `/api/cart/recipe/${item.id}`
                : `/api/cart/${item.id}`;
              return (
                <article
                  key={item.key ?? `${item.type}-${item.id}`}
                  className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                >
                  {isRecipe ? (
                    <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-orange-50 sm:h-24 sm:w-28">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <ProductVisual
                      emoji={item.emoji}
                      name={item.name}
                      productId={item.productId}
                      size="lg"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    {isRecipe && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-600">
                        Complete recipe kit
                      </span>
                    )}
                    <h2 className="text-base font-bold text-ink">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-xs text-stone-500">
                      {isRecipe
                        ? `${item.servings} servings · ${item.ingredientCount} ingredients included`
                        : item.size}
                    </p>
                    <p className="mt-2 text-sm font-bold text-ink">
                      {inr(item.price * item.quantity)}{" "}
                      <span className="font-normal text-stone-500">
                        {item.quantity > 1 ? `(${inr(item.price)} each)` : ""}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <div className="flex items-center rounded-xl border border-orange-100 bg-orange-50/50">
                      <button
                        aria-label={`Decrease ${item.name}`}
                        onClick={() => onUpdateQty(endpoint, item.quantity - 1)}
                        disabled={busy}
                        className="flex h-9 w-9 items-center justify-center text-stone-600 hover:text-brand-600"
                      >
                        <MinusIcon width={15} height={15} />
                      </button>
                      <span className="min-w-7 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        aria-label={`Increase ${item.name}`}
                        onClick={() => onUpdateQty(endpoint, item.quantity + 1)}
                        disabled={busy}
                        className="flex h-9 w-9 items-center justify-center text-stone-600 hover:text-brand-600"
                      >
                        <PlusIcon width={15} height={15} />
                      </button>
                    </div>
                    <button
                      aria-label={`Remove ${item.name}`}
                      onClick={() => onRemove(endpoint)}
                      disabled={busy}
                      className="flex items-center gap-1 text-xs text-stone-500 hover:text-red-500"
                    >
                      <TrashIcon width={15} height={15} /> Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <aside className="card p-5 lg:sticky lg:top-5">
            <h2 className="font-display text-xl font-bold">Order summary</h2>
            <div className="mt-4 flex items-center justify-between border-b border-orange-100 pb-4 text-sm text-stone-600">
              <span>
                {cart.count} {cart.count === 1 ? "item" : "items"}
              </span>
              <span>{inr(cart.total)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>{inr(cart.total)}</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={busy}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-3 py-3 text-sm font-bold text-white hover:brightness-105 disabled:opacity-50"
            >
              Record Order Request <ArrowRight width={17} height={17} />
            </button>
            <p className="mt-3 text-center text-xs text-stone-500">
              This records your request only; no payment or delivery is
              arranged.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
