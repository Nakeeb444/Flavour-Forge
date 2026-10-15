// Builds a single self-contained HTML page from the real app source.
//
//   node scripts/build-standalone.mjs
//
// Output:
//   flavour-forge.html          -> double-click to run (uses public/images/)
//   public/flavour-forge.html   -> also served by Next at /flavour-forge.html
//
// The page reuses the exact JSX components from src/components, loads React and
// Tailwind from a CDN, and replaces the API routes + PostgreSQL with a small
// in-browser store persisted to localStorage. No Node or database required.

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

// ---- 1. pull the component source, strip module syntax ---------------------
// In dependency order: shared UI → navigation → feature views → app shell.
const COMPONENTS = [
  "ui/icons",
  "layout/navigation",
  "layout/Sidebar",
  "layout/TopBar",
  "layout/Footer",
  "recipes/RecipeCard",
  "recipes/categories",
  "views/HomePage",
  "shop/ProductVisual",
  "shop/ShopGrid",
  "views/LeftColumn",
  "recipes/IngredientFlow",
  "recipes/RecipeDetail",
  "recipes/RecipeDock",
  "shop/CartPage",
  "account/CheckoutAuthModal",
  "support/CustomerCare",
  "support/Terms",
  "layout/useScrollDock",
  "layout/App",
];

function stripModuleSyntax(src) {
  return src
    .replace(/^"use client";\s*$/gm, "")
    .replace(/^import[\s\S]*?from\s+"[^"]+";\s*$/gm, "")
    .replace(/^import\s+"[^"]+";\s*$/gm, "")
    .replace(/^export default /gm, "")
    .replace(/^export /gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const componentSource = COMPONENTS.map((name) => {
  const base = `src/components/${name}`;
  const file = fs.existsSync(path.join(root, `${base}.jsx`))
    ? `${base}.jsx`
    : `${base}.js`;
  return `// ---- ${file} ----\n${stripModuleSyntax(read(file))}`;
}).join("\n\n");

// ---- 2. seed data + utils (same files the server uses) ---------------------
const seed = read("src/db/seed.js");
const dataStart = seed.indexOf("const INGREDIENTS");
const dataEnd = seed.indexOf("let seeded = false;");
if (dataStart < 0 || dataEnd < 0)
  throw new Error("Could not locate seed data in src/db/seed.js");
const seedData = seed.slice(dataStart, dataEnd).trim();
const expandedCatalog = stripModuleSyntax(read("src/db/recipe-expansion.js"));
const utils = stripModuleSyntax(read("src/lib/utils.js"));

// ---- 3. guard against duplicate top-level names after concatenation --------
const combinedForCheck = [
  componentSource,
  expandedCatalog,
  seedData,
  utils,
].join("\n");
const seen = new Map();
for (const m of combinedForCheck.matchAll(
  /^(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm,
)) {
  if (seen.has(m[1]))
    throw new Error(
      `Duplicate top-level declaration "${m[1]}" — rename it before building the standalone page.`,
    );
  seen.set(m[1], true);
}

// ---- 4. in-browser replacement for the API routes + database ---------------
const mockApi = String.raw`
// ---- in-browser data layer (replaces /api routes + PostgreSQL) -------------
const STORE_KEY = "flavour-forge-standalone-v1";
const FAVORITES_RESET_KEY = "flavour-forge-favorites-cleared-v1";

function buildCatalog() {
  const ingredientRows = INGREDIENTS.map((i, idx) => ({ id: idx + 1, ...i }));
  const ingBySlug = new Map(ingredientRows.map((i) => [i.slug, i.id]));
  const productRows = [];
  for (const [slug, list] of Object.entries(PRODUCTS)) {
    for (const p of list) {
      productRows.push({
        id: productRows.length + 1,
        ingredientId: ingBySlug.get(slug),
        name: p.name,
        size: p.size,
        price: p.price,
        badge: p.badge ?? null,
        isDefault: p.isDefault ?? false,
      });
    }
  }
  let riId = 0;
  const recipeRows = RECIPES.map((r, idx) => ({
    id: idx + 1,
    ...r,
    tags: [...r.tags],
    instructions: [...r.instructions],
    ingredientLinks: r.ingredients.map((ri, position) => ({
      id: ++riId,
      ingredientId: ingBySlug.get(ri[0]),
      quantity: ri[1],
      note: ri[2] ?? null,
      position,
    })),
  }));
  return { ingredientRows, productRows, recipeRows };
}
const CATALOG = buildCatalog();

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      saved.recipeCart ??= [];
      saved.seq ??= {};
      saved.seq.recipeCart ??= 0;
      if (!localStorage.getItem(FAVORITES_RESET_KEY)) {
        saved.favorites = [];
        localStorage.setItem(STORE_KEY, JSON.stringify(saved));
        localStorage.setItem(FAVORITES_RESET_KEY, "1");
      }
      return saved;
    }
    localStorage.setItem(FAVORITES_RESET_KEY, "1");
  } catch {}
  return { cart: [], recipeCart: [], favorites: [], users: [], sessions: [], orders: [], tickets: [], seq: { cart: 0, recipeCart: 0, user: 0, order: 0, ticket: 0 } };
}
let STORE = loadStore();
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(STORE));
  } catch {}
}
const nextId = (key) => (STORE.seq[key] = (STORE.seq[key] ?? 0) + 1);

const ingredientById = (id) => CATALOG.ingredientRows.find((i) => i.id === id);
const productById = (id) => CATALOG.productRows.find((p) => p.id === id);

function recipeSummary(r) {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    image: r.image,
    cuisine: r.cuisine,
    ingredientNames: r.ingredientLinks.map((l) => ingredientById(l.ingredientId)?.name).filter(Boolean),
    tags: r.tags,
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    servings: r.servings,
    difficulty: r.difficulty,
    isFavorite: STORE.favorites.includes(r.id),
  };
}
function recipeDetail(r) {
  return {
    ...recipeSummary(r),
    about: r.about,
    instructions: r.instructions,
    calories: r.calories,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
    ingredients: r.ingredientLinks.map((l) => {
      const ing = ingredientById(l.ingredientId);
      return {
        id: l.id,
        ingredientId: ing.id,
        slug: ing.slug,
        name: ing.name,
        emoji: ing.emoji,
        about: ing.about,
        quantity: l.quantity,
        note: l.note,
        products: CATALOG.productRows.filter((p) => p.ingredientId === ing.id),
      };
    }),
  };
}
function cartState() {
  const productItems = STORE.cart.map((c) => {
    const p = productById(c.productId);
    return { id: c.id, key: "product-" + c.id, type: "product", productId: c.productId, quantity: c.quantity,
      name: p.name, size: p.size, price: p.price, emoji: ingredientById(p.ingredientId).emoji };
  });
  const recipeItems = STORE.recipeCart.map((c) => {
    const r = CATALOG.recipeRows.find((recipe) => recipe.id === c.recipeId);
    return { id: c.id, key: "recipe-" + c.id, type: "recipe", recipeId: c.recipeId,
      quantity: c.quantity, servings: c.servings, price: c.price, ingredientCount: c.ingredientCount,
      name: r.name, image: r.image, slug: r.slug };
  });
  const items = [...recipeItems, ...productItems];
  return { items, total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    count: items.reduce((sum, item) => sum + item.quantity, 0) };
}
function addRecipeKit(recipeId, servings) {
  const recipe = CATALOG.recipeRows.find((r) => r.id === recipeId);
  if (!recipe) return false;
  const safeServings = Math.max(1, Math.min(20, Number(servings) || recipe.servings));
  const multiplier = Math.max(1, Math.ceil(safeServings / recipe.servings));
  const price = recipe.ingredientLinks.reduce((sum, link) => {
    const options = CATALOG.productRows.filter((p) => p.ingredientId === link.ingredientId);
    return sum + (options.find((p) => p.isDefault)?.price ?? options[0]?.price ?? 0) * multiplier;
  }, 0);
  const existing = STORE.recipeCart.find((item) => item.recipeId === recipeId && item.servings === safeServings);
  if (existing) { existing.quantity += 1; existing.price = price; }
  else STORE.recipeCart.push({ id: nextId("recipeCart"), recipeId, servings: safeServings,
    quantity: 1, price, ingredientCount: recipe.ingredientLinks.length });
  return true;
}
function addToCart(productId, quantity) {
  if (!productById(productId)) return;
  const qty = Math.max(1, Math.min(99, Number(quantity) || 1));
  const existing = STORE.cart.find((c) => c.productId === productId);
  if (existing) existing.quantity += qty;
  else STORE.cart.push({ id: nextId("cart"), productId, quantity: qty });
}

async function hashPassword(password) {
  try {
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("flavour-forge::" + password));
    return "sha256:" + Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    let h = 2166136261;
    for (const ch of password) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    return "fnv:" + h.toString(16);
  }
}
function currentUser() {
  const session = STORE.sessions[0];
  if (!session || session.expiresAt < Date.now()) return null;
  const u = STORE.users.find((x) => x.id === session.userId);
  return u ? { id: u.id, fullName: u.fullName, email: u.email } : null;
}
function startSession(userId) {
  STORE.sessions = [{ userId, expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000 }];
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleRequest(method, url, body) {
  const path = url.replace(/^https?:\/\/[^/]+/, "").split("?")[0];
  let m;

  if (path === "/api/health") return json({ ok: true });
  if (path === "/api/recipes") return json(CATALOG.recipeRows.map(recipeSummary));
  if ((m = path.match(/^\/api\/recipes\/([^/]+)$/))) {
    const r = CATALOG.recipeRows.find((x) => x.slug === decodeURIComponent(m[1]));
    return r ? json(recipeDetail(r)) : json({ error: "Not found" }, 404);
  }
  if (path === "/api/products") {
    return json(
      CATALOG.productRows
        .map((p) => ({ ...p, ingredientName: ingredientById(p.ingredientId).name, emoji: ingredientById(p.ingredientId).emoji }))
        .sort((a, b) => a.ingredientName.localeCompare(b.ingredientName) || a.id - b.id),
    );
  }

  if (path === "/api/cart") {
    if (method === "POST") {
      if (body?.recipeId != null) {
        if (!addRecipeKit(Number(body.recipeId), body.servings)) return json({ error: "Recipe not found" }, 404);
      } else {
        const items = body?.items ?? (body?.productId ? [{ productId: body.productId, quantity: body.quantity ?? 1 }] : []);
        for (const item of items) addToCart(Number(item.productId), item.quantity ?? 1);
      }
    } else if (method === "DELETE") { STORE.cart = []; STORE.recipeCart = []; }
    save();
    return json(cartState());
  }
  if ((m = path.match(/^\/api\/cart\/recipe\/(\d+)$/))) {
    const id = Number(m[1]);
    if (method === "PATCH") {
      const quantity = Math.min(99, Math.max(0, Number(body?.quantity)));
      if (quantity <= 0) STORE.recipeCart = STORE.recipeCart.filter((item) => item.id !== id);
      else STORE.recipeCart = STORE.recipeCart.map((item) => item.id === id ? { ...item, quantity } : item);
    } else if (method === "DELETE") STORE.recipeCart = STORE.recipeCart.filter((item) => item.id !== id);
    save();
    return json(cartState());
  }
  if ((m = path.match(/^\/api\/cart\/(\d+)$/))) {
    const id = Number(m[1]);
    if (method === "PATCH") {
      const qty = Math.min(99, Number(body?.quantity));
      if (qty <= 0) STORE.cart = STORE.cart.filter((c) => c.id !== id);
      else STORE.cart = STORE.cart.map((c) => (c.id === id ? { ...c, quantity: qty } : c));
    } else if (method === "DELETE") STORE.cart = STORE.cart.filter((c) => c.id !== id);
    save();
    return json(cartState());
  }

  if (path === "/api/favorites" && method === "POST") {
    const id = Number(body?.recipeId);
    const has = STORE.favorites.includes(id);
    STORE.favorites = has ? STORE.favorites.filter((x) => x !== id) : [...STORE.favorites, id];
    save();
    return json({ recipeId: id, isFavorite: !has });
  }

  if (path === "/api/auth/me") return json({ user: currentUser() });
  if (path === "/api/auth/logout") {
    STORE.sessions = [];
    save();
    return json({ ok: true });
  }
  if (path === "/api/auth/register" && method === "POST") {
    const fullName = String(body?.fullName ?? "").trim().replace(/\s+/g, " ");
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    if (fullName.length < 2 || fullName.length > 80) return json({ error: "Enter your name (2–80 characters)." }, 400);
    if (!EMAIL_RE.test(email) || email.length > 254) return json({ error: "Enter a valid email address." }, 400);
    if (password.length < 8 || password.length > 72) return json({ error: "Password must be between 8 and 72 characters." }, 400);
    if (body?.acceptTerms !== true) return json({ error: "Please accept the Terms & Conditions to create an account." }, 400);
    if (STORE.users.some((u) => u.email === email)) return json({ error: "An account with that email already exists. Sign in instead." }, 409);
    const user = { id: nextId("user"), fullName, email, passwordHash: await hashPassword(password), acceptedTermsAt: new Date().toISOString(), createdAt: new Date().toISOString() };
    STORE.users.push(user);
    startSession(user.id);
    save();
    return json({ user: { id: user.id, fullName, email } });
  }
  if (path === "/api/auth/login" && method === "POST") {
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    if (!email || !password) return json({ error: "Enter your email and password." }, 400);
    const user = STORE.users.find((u) => u.email === email);
    if (!user || user.passwordHash !== (await hashPassword(password))) return json({ error: "Email or password is incorrect." }, 401);
    startSession(user.id);
    save();
    return json({ user: { id: user.id, fullName: user.fullName, email: user.email } });
  }

  if (path === "/api/orders") {
    const user = currentUser();
    if (method === "GET") return json(user ? STORE.orders.filter((o) => o.userId === user.id).slice().reverse().slice(0, 20) : []);
    if (!user) return json({ error: "Create an account or sign in to check out." }, 401);
    const cart = cartState();
    if (cart.items.length === 0) return json({ error: "Cart is empty" }, 400);
    const order = {
      id: nextId("order"),
      userId: user.id,
      customerName: user.fullName,
      customerEmail: user.email,
      total: cart.total,
      itemCount: cart.count,
      items: JSON.stringify(cart.items),
      createdAt: new Date().toISOString(),
    };
    STORE.orders.push(order);
    STORE.cart = [];
    STORE.recipeCart = [];
    save();
    return json({ order, cart: cartState() });
  }

  if (path === "/api/support") {
    const user = currentUser();
    if (method === "GET") return json(user ? STORE.tickets.filter((t) => t.userId === user.id).slice().reverse().slice(0, 20) : []);
    const name = String(body?.name ?? user?.fullName ?? "").trim();
    const email = String(body?.email ?? user?.email ?? "").trim().toLowerCase();
    const subject = String(body?.subject ?? "").trim();
    const message = String(body?.message ?? "").trim();
    const orderRef = String(body?.orderRef ?? "").trim().slice(0, 40) || null;
    const category = ["order", "delivery", "payment", "recipe", "account", "general"].includes(body?.category) ? body.category : "general";
    if (name.length < 2 || name.length > 80) return json({ error: "Enter your name." }, 400);
    if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email so we can reply." }, 400);
    if (subject.length < 3 || subject.length > 120) return json({ error: "Add a short subject (3–120 characters)." }, 400);
    if (message.length < 10 || message.length > 2000) return json({ error: "Tell us a little more (10–2000 characters)." }, 400);
    const ticket = { id: nextId("ticket"), userId: user?.id ?? null, name, email, category, subject, message, orderRef, status: "open", createdAt: new Date().toISOString() };
    STORE.tickets.push(ticket);
    save();
    return json({ ticket });
  }

  return json({ error: "Not found" }, 404);
}

// Route the components' fetch("/api/...") calls to the in-browser store.
const realFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const url = typeof input === "string" ? input : input.url;
  if (!url.includes("/api/")) return realFetch(input, init);
  const method = (init.method ?? "GET").toUpperCase();
  let body = null;
  if (init.body) {
    try {
      body = JSON.parse(init.body);
    } catch {}
  }
  return new Promise((resolve) => setTimeout(() => resolve(handleRequest(method, url, body)), 60));
};

// ---- boot (mirrors src/app/page.jsx) --------------------------------------
(async function boot() {
  const recipes = await (await fetch("/api/recipes")).json();
  const slug = recipes.find((r) => r.slug === "chicken-biryani")?.slug ?? recipes[0]?.slug;
  const recipe = slug ? await (await fetch("/api/recipes/" + slug)).json() : null;
  const cart = await (await fetch("/api/cart")).json();
  ReactDOM.createRoot(document.getElementById("root")).render(<App initialRecipes={recipes} initialRecipe={recipe} initialCart={cart} />);
})();
`;

// ---- 5. assemble the page ----------------------------------------------------
// The Tailwind browser build injects Tailwind itself; the @import would be fetched as a file and 404.
const css = read("src/app/globals.css").replace(
  /^@import "tailwindcss";\s*$/m,
  "",
);
const layout = read("src/app/layout.jsx");
const themeScript = layout.match(/const themeScript = `([^`]+)`;/)?.[1];
if (!themeScript)
  throw new Error("Could not find themeScript in src/app/layout.jsx");

function buildHtml(imagePrefix) {
  const js = [
    componentSource,
    "// ---- src/db/recipe-expansion.js (vegetarian mains & starters) ----",
    expandedCatalog,
    "// ---- src/db/seed.js (catalog data) ----",
    seedData,
    "// ---- src/lib/utils.js ----",
    utils,
    mockApi,
  ]
    .join("\n\n")
    .replaceAll('"/images/', `"${imagePrefix}`);

  return `<!doctype html>
<!--
  Flavour Forge — standalone edition
  Generated by scripts/build-standalone.mjs from the real app source. Do not edit by hand.

  Just open this file in a browser (double-click). Needs an internet connection the first
  time for the React / Tailwind / Babel CDN scripts. Your cart, favourites, account,
  orders and support tickets are saved in this browser's localStorage.
-->
<html lang="en" suppressHydrationWarning>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Flavour Forge — Cook Today, Create Tomorrow</title>
    <meta name="description" content="Discover delicious recipes, shop ingredients and cook your favourite meals with ease." />
    <link rel="icon" type="image/png" href="public/favicon.png" />
    <script>${themeScript}</script>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <style type="text/tailwindcss">
${css}
    </style>
    <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone@7.26.4/babel.min.js"></script>
  </head>
  <body class="antialiased">
    <div id="root">
      <div style="min-height:100vh;display:grid;place-items:center;font-family:Inter,system-ui,sans-serif;color:#9a8c80;font-size:14px">Loading Flavour Forge…</div>
    </div>
    <noscript>Flavour Forge needs JavaScript enabled.</noscript>

    <script type="text/babel" data-presets="react">
const { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore } = React;

${js}
    </script>
  </body>
</html>
`;
}

fs.writeFileSync(
  path.join(root, "flavour-forge.html"),
  buildHtml("public/images/"),
);
fs.writeFileSync(
  path.join(root, "public/flavour-forge.html"),
  buildHtml("images/"),
);
console.log("Wrote flavour-forge.html and public/flavour-forge.html");
