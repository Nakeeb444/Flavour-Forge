"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Sidebar, MobileNav, ScrollDock } from "@/components/layout/Sidebar";
import { useScrollDock } from "@/components/layout/useScrollDock";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { LeftColumn, FILTERS } from "@/components/views/LeftColumn";
import { recipeMatchesCategory } from "@/components/recipes/categories";
import { RecipeDetail } from "@/components/recipes/RecipeDetail";
import { RecipeDock } from "@/components/recipes/RecipeDock";
import { CheckoutAuthModal } from "@/components/account/CheckoutAuthModal";
import { TermsModal } from "@/components/support/Terms";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";

function subscribeToTheme(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function App({ initialRecipes, initialRecipe, initialCart }) {
  const [view, setView] = useState("home");
  const dockVisible = useScrollDock();
  const navigate = useCallback((nextView) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Vegetarian");
  const [recipes, setRecipes] = useState(initialRecipes);
  const [recipe, setRecipe] = useState(initialRecipe);
  const [recipeOpen, setRecipeOpen] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [servings, setServings] = useState(initialRecipe?.servings ?? 4);
  const [selectedIngredientId, setSelectedIngredientId] = useState(
    initialRecipe?.ingredients.find((i) => i.slug === "tomato")?.ingredientId ??
      initialRecipe?.ingredients[0]?.ingredientId ??
      null,
  );
  const [cart, setCart] = useState(initialCart);
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState([]);
  const [shopProducts, setShopProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => "light",
  );

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem("ff-theme", next);
    } catch {}
  }, [theme]);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const toast = useCallback((message) => {
    const id = ++toastId.current;
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(
      () => setToasts((current) => current.filter((item) => item.id !== id)),
      3300,
    );
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (alive) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setAuthChecked(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (view === "orders" || view === "profile") {
      fetch("/api/orders", { cache: "no-store" })
        .then((r) => r.json())
        .then(setOrders)
        .catch(() => {});
    }
    if (view === "shop" && shopProducts.length === 0) {
      fetch("/api/products")
        .then((r) => r.json())
        .then(setShopProducts)
        .catch(() => {});
    }
  }, [view, shopProducts.length, user?.id]);

  useEffect(() => {
    if (!recipeOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setRecipeOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [recipeOpen]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return recipes.filter((item) => {
      const matchesFilter = query || recipeMatchesCategory(item, filter);
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.cuisine.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        item.ingredientNames.some((ingredient) =>
          ingredient.toLowerCase().includes(query),
        );
      return matchesFilter && matchesSearch;
    });
  }, [recipes, filter, search]);

  const selectRecipe = useCallback(
    async (slug) => {
      if (recipe?.slug === slug) {
        setRecipeOpen(true);
        return;
      }
      setLoadingRecipe(true);
      try {
        const response = await fetch(`/api/recipes/${slug}`);
        if (!response.ok) throw new Error("Recipe request failed");
        const data = await response.json();
        setRecipe(data);
        setServings(data.servings);
        setSelectedIngredientId(
          data.ingredients.find((item) => item.slug === "tomato")
            ?.ingredientId ??
            data.ingredients[0]?.ingredientId ??
            null,
        );
        setRecipeOpen(true);
      } catch {
        toast("Could not load this recipe. Please try again.");
      } finally {
        setLoadingRecipe(false);
      }
    },
    [recipe?.slug, toast],
  );

  const toggleFavorite = useCallback(
    async (recipeId) => {
      setRecipes((items) =>
        items.map((item) =>
          item.id === recipeId
            ? { ...item, isFavorite: !item.isFavorite }
            : item,
        ),
      );
      setRecipe((item) =>
        item && item.id === recipeId
          ? { ...item, isFavorite: !item.isFavorite }
          : item,
      );
      try {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        });
        if (!response.ok) throw new Error("Favorite request failed");
        const data = await response.json();
        setRecipes((items) =>
          items.map((item) =>
            item.id === recipeId
              ? { ...item, isFavorite: data.isFavorite }
              : item,
          ),
        );
        setRecipe((item) =>
          item && item.id === recipeId
            ? { ...item, isFavorite: data.isFavorite }
            : item,
        );
        toast(
          data.isFavorite
            ? "Saved to your favourites"
            : "Removed from favourites",
        );
      } catch {
        setRecipes((items) =>
          items.map((item) =>
            item.id === recipeId
              ? { ...item, isFavorite: !item.isFavorite }
              : item,
          ),
        );
        setRecipe((item) =>
          item && item.id === recipeId
            ? { ...item, isFavorite: !item.isFavorite }
            : item,
        );
        toast("Could not update favourites.");
      }
    },
    [toast],
  );

  const cartRequest = useCallback(
    async (input, init, successMessage) => {
      setBusy(true);
      try {
        const response = await fetch(input, {
          headers: { "Content-Type": "application/json" },
          ...init,
        });
        if (!response.ok) throw new Error("Cart request failed");
        const data = await response.json();
        setCart(data);
        if (successMessage) toast(successMessage);
        return data;
      } catch {
        toast("Could not update your cart. Please try again.");
      } finally {
        setBusy(false);
      }
    },
    [toast],
  );

  const addProduct = useCallback(
    (productId, quantity = 1, label) =>
      cartRequest(
        "/api/cart",
        { method: "POST", body: JSON.stringify({ productId, quantity }) },
        label ? `${label} added to cart` : "Added to cart",
      ),
    [cartRequest],
  );

  const addIngredient = useCallback(
    (ingredient) => {
      const product =
        ingredient.products.find((item) => item.isDefault) ??
        ingredient.products[0];
      if (!product) return;
      setSelectedIngredientId(ingredient.ingredientId);
      addProduct(product.id, 1, product.name);
    },
    [addProduct],
  );

  const factor = recipe ? servings / recipe.servings : 1;

  const buyAll = useCallback(async () => {
    if (!recipe) return;
    const result = await cartRequest(
      "/api/cart",
      {
        method: "POST",
        body: JSON.stringify({ recipeId: recipe.id, servings }),
      },
      `${recipe.name} added as a complete recipe kit`,
    );
    if (result) {
      setRecipeOpen(false);
      navigate("cart");
    }
  }, [recipe, servings, cartRequest, navigate]);

  const placeOrder = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/orders", { method: "POST" });
      if (response.status === 401) {
        setAuthOpen(true);
        return;
      }
      const data = await response.json();
      if (!response.ok || !data.order || !data.cart)
        throw new Error(data.error ?? "Checkout failed");
      setCart(data.cart);
      setOrders((current) => [data.order, ...current]);
      toast(`Order #${data.order.id} placed. Thank you!`);
      setRecipeOpen(false);
      setView("orders");
    } catch {
      toast("Checkout could not be completed. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [toast]);

  const checkout = useCallback(async () => {
    if (!authChecked) {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();
        setUser(data.user);
        setAuthChecked(true);
        if (data.user) {
          void placeOrder();
          return;
        }
      } catch {
        setAuthChecked(true);
      }
    }
    if (!user) {
      setAuthOpen(true);
      return;
    }
    void placeOrder();
  }, [authChecked, user, placeOrder]);

  const authenticateAndCheckout = useCallback(
    (authenticatedUser) => {
      setUser(authenticatedUser);
      setAuthOpen(false);
      toast(
        `Welcome, ${authenticatedUser.fullName.split(" ")[0]}. Placing your order…`,
      );
      void placeOrder();
    },
    [placeOrder, toast],
  );

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setOrders([]);
      toast("You have signed out.");
    }
  }, [toast]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1720px] gap-4 px-3 pb-32 pt-1 sm:gap-5 sm:px-5 lg:pb-12">
      <Sidebar view={view} onChange={navigate} cartCount={cart.count} />
      <MobileNav view={view} onChange={navigate} cartCount={cart.count} />
      <ScrollDock
        view={view}
        onChange={navigate}
        cartCount={cart.count}
        visible={dockVisible}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          search={search}
          onSearch={(value) => {
            setSearch(value);
            if (value.trim() && view === "home") navigate("recipes");
          }}
          onToggleFilters={() => {
            setFilter(FILTERS[(FILTERS.indexOf(filter) + 1) % FILTERS.length]);
            setSearch("");
            if (view !== "recipes") navigate("recipes");
          }}
          user={user}
          onProfile={() => navigate("profile")}
          onHome={() => navigate("home")}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <div className="flex-1 pt-2">
          <main className="min-w-0">
            <LeftColumn
              view={view}
              recipes={recipes}
              filtered={filtered}
              filter={filter}
              search={search}
              onFilter={(category) => {
                setFilter(category);
                setSearch("");
              }}
              selectedSlug={recipe?.slug ?? null}
              onSelect={selectRecipe}
              onToggleFavorite={toggleFavorite}
              onChangeView={navigate}
              cart={cart}
              orders={orders}
              shopProducts={shopProducts}
              onAddProduct={(id, quantity) => addProduct(id, quantity)}
              user={user}
              onSignOut={signOut}
              onToast={toast}
              onOpenTerms={() => setTermsOpen(true)}
              busy={busy}
              onUpdateQty={(endpoint, quantity) =>
                cartRequest(endpoint, {
                  method: "PATCH",
                  body: JSON.stringify({ quantity }),
                })
              }
              onRemove={(endpoint) =>
                cartRequest(endpoint, { method: "DELETE" }, "Removed from cart")
              }
              onClear={() =>
                cartRequest("/api/cart", { method: "DELETE" }, "Cart cleared")
              }
              onCheckout={checkout}
            />
          </main>
        </div>
        <Footer onNavigate={navigate} onOpenTerms={() => setTermsOpen(true)} />
      </div>

      {recipe && !recipeOpen && view === "recipes" && (
        <RecipeDock
          recipe={recipe}
          onOpen={() => setRecipeOpen(true)}
          dockVisible={dockVisible}
        />
      )}

      {recipe && recipeOpen && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-stone-950/35 px-2 py-3 backdrop-blur-[3px] sm:px-6 sm:py-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setRecipeOpen(false);
          }}
        >
          <div
            id="recipe-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recipe-sheet-title"
            className="animate-sheet-in relative max-h-[94vh] w-full max-w-[1100px] overflow-y-auto rounded-[26px] shadow-[0_30px_100px_rgba(50,30,15,0.25)] sm:max-h-[92vh]"
          >
            <button
              onClick={() => setRecipeOpen(false)}
              aria-label="Close recipe"
              className="sticky top-3 z-30 float-right mr-3 mt-3 -mb-12 flex h-10 w-10 items-center justify-center rounded-full border border-orange-100 bg-white/95 text-stone-600 shadow-md backdrop-blur transition-colors duration-500 hover:text-brand-600"
            >
              <CloseIcon width={19} height={19} />
            </button>
            <RecipeDetail
              recipe={recipe}
              loading={loadingRecipe}
              servings={servings}
              onServings={setServings}
              selectedIngredientId={selectedIngredientId}
              onSelectIngredient={setSelectedIngredientId}
              onAddIngredient={addIngredient}
              onAddProduct={(id, quantity) => addProduct(id, quantity)}
              onBuyAll={buyAll}
              onToggleFavorite={() => toggleFavorite(recipe.id)}
              onHome={() => {
                setRecipeOpen(false);
                navigate("home");
              }}
              onRecipes={() => {
                setRecipeOpen(false);
                navigate("recipes");
              }}
            />
          </div>
        </div>
      )}

      {authOpen && (
        <CheckoutAuthModal
          onClose={() => setAuthOpen(false)}
          onAuthenticated={authenticateAndCheckout}
          onOpenTerms={() => setTermsOpen(true)}
        />
      )}
      {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}

      <div
        className={`pointer-events-none fixed bottom-20 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2 transition-[bottom] duration-500 ${dockVisible ? "lg:bottom-28" : "lg:bottom-6"}`}
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className="animate-toast flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-xl"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500">
              <CheckIcon width={12} height={12} strokeWidth={3} />
            </span>
            {item.message}
          </div>
        ))}
      </div>
    </div>
  );
}
