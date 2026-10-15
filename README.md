# Flavour Forge

Recipe discovery + ingredient shopping app. Two ways to run it:

## Option 1 — Just open the HTML file (no install)

Double-click **`flavour-forge.html`** in the project folder. That's it.

- Needs an internet connection the first time (React, Tailwind and Babel load from a CDN).
- Your cart, favourites, account, orders and support tickets are saved in the browser's `localStorage`.
- Keep the `public/images/` folder next to the HTML file so the recipe photos load.

The page is generated from the real app source, so it looks and behaves like the full version. Home is a welcoming landing page with no products or cart panel. Browse the expanded recipe catalog by category, including Vegetarian and Non-Vegetarian dishes, starters, desserts and cuisine-based collections. Search still looks across categories. Open a recipe to see the animated ingredient flowchart around the dish; the responsive version shows the same ingredients as an easy-to-tap grid. **Add Complete Recipe to Cart** stores one meal-kit card with servings and all ingredients bundled, not separate ingredient lines. Individual shop items remain separate in My Cart. The shop shows one ingredient category at a time: Sweet & chocolate, Hot & savoury, Milky & chilled, Fresh produce or Pantry essentials. Customer Care is available from Profile and offers contact details and support tickets. Terms & Conditions opens as a floating dialog from the footer. The logo always returns you to Home. On desktop, navigation begins as a sidebar and reappears as a bottom dock on scroll. On mobile, Favorites replaces More in the bottom bar; tap the header profile button for Profile and Customer Care.
If you change anything under `src/`, regenerate it with:

```bash
node scripts/build-standalone.mjs
```

## Option 2 — Full app (Next.js + PostgreSQL)

```bash
# 1. start PostgreSQL (Docker is easiest)
docker run --name flavour-forge-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=app_db -p 5432:5432 -d postgres:16

# 2. install + create tables
npm install
npx drizzle-kit push

# 3. run
npm run dev          # http://localhost:3000
```

The database connection string lives in `.env` (`DATABASE_URL`). Recipes and products are seeded automatically on first load. Your database and saved data are managed by the configured PostgreSQL database. Back up existing data before applying schema or seed changes.

| Command                             | Purpose                                      |
| ----------------------------------- | -------------------------------------------- |
| `npm run dev`                       | Dev server with hot reload                   |
| `npm run build && npm start`        | Production build & run                       |
| `npm run lint`                      | ESLint                                       |
| `npx drizzle-kit push`              | Apply schema changes from `src/db/schema.js` |
| `npx drizzle-kit studio`            | Browse the database                          |
| `node scripts/build-standalone.mjs` | Regenerate `flavour-forge.html`              |

## Project layout

```
flavour-forge.html      standalone page (generated)
public/images/          recipe photos
scripts/                build-standalone.mjs
src/app/                Next.js pages, layout, API routes, global CSS
src/components/         React UI by feature
  layout/                App shell, footer, sidebar, scroll dock, top bar, navigation config
  recipes/               Recipe cards, detail, animated ingredient flowchart, selected-recipe tab
  views/                 Welcoming Home and recipe, order, favorites and profile views
  shop/                  Categorized product grid, image tiles and complete cart page
  account/               Registration and sign-in dialog
  support/               Customer care and terms
  ui/                    Shared SVG icons
src/db/                 Drizzle schema, connection, seed data
src/lib/                auth, data access, utils
```

## Recipe photography

Recipe photos are stored in `public/images/` where available so the app and
standalone page can use the same images. Some externally hosted photos are
loaded from Wikimedia Commons. See
[`public/images/PHOTO-CREDITS.md`](./public/images/PHOTO-CREDITS.md) for image
credits and license details.
