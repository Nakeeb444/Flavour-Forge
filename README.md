<div align="center">
  <h1>Flavour Forge</h1>
  <p><strong>Find a recipe. Gather what you need. Make something good.</strong></p>
  <p>A recipe discovery and ingredient-shopping app built around the pleasure of cooking.</p>
</div>

## What you can do

- Explore a collection of Indian recipes, with search and category filters.
- Open a recipe for its ingredients, serving sizes, timings, and cooking steps.
- Add a complete recipe kit or individual ingredients to your cart.
- Save favourites to your account and keep track of orders.
- Use the responsive layout on desktop or mobile, with light and dark themes.
- Contact customer care and review the site's terms.

## Run the app

The full application uses Next.js and Node.js 20.9 or later. PostgreSQL is
recommended for persistent data. Without a usable `DATABASE_URL`, the app
falls back to an in-memory database; data in that fallback is not persistent.

1. Start PostgreSQL. Docker is one option:

   ```powershell
   docker run --name flavour-forge-db `
     --env POSTGRES_USER=postgres `
     --env POSTGRES_PASSWORD=postgres `
     --env POSTGRES_DB=app_db `
     --publish 5432:5432 `
     --detach postgres:16
   ```

2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL
   connection string. Keep `.env` local; it is ignored by Git.

   ```powershell
   Copy-Item .env.example .env
   ```

3. Install dependencies, apply the schema, and start the development server:

   ```powershell
   npm ci
   npx drizzle-kit push
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000). Recipes and products
   are seeded when the catalogue is first requested.

### Useful commands

| Command                             | Purpose                        |
| ----------------------------------- | ------------------------------ |
| `npm run dev`                       | Start the development server   |
| `npm run build`                     | Create a production build      |
| `npm start`                         | Serve the production build     |
| `npm run lint`                      | Run ESLint                     |
| `npm run typecheck`                 | Run the TypeScript check       |
| `npx drizzle-kit push`              | Apply the database schema      |
| `npx drizzle-kit studio`            | Inspect the database           |
| `node scripts/build-standalone.mjs` | Regenerate the standalone page |

## Standalone page

Open [`flavour-forge.html`](./flavour-forge.html) directly in a browser for a
lightweight version that does not need the Next.js server or PostgreSQL. It
loads its UI libraries from a CDN, so an internet connection is needed. Keep
`public/images/` alongside the page for local recipe photos. Standalone data
is stored in that browser's local storage and is separate from the full app.

The standalone file is generated from the application source. After changing
files under `src/`, rebuild it with:

```powershell
node scripts/build-standalone.mjs
```

## How the services fit together

- **Next.js** serves the application and API routes.
- **PostgreSQL** stores the recipe catalogue, cart, orders, and support tickets.
- **Firebase Authentication** handles email and password sign-in.
- **Cloud Firestore** stores favourites under each signed-in user's UID.
- **Cloud Functions** deliver push notifications to registered devices.
- **App Check, Analytics, and Cloud Messaging** provide request protection,
  event tracking, and browser notifications.

The app is configured for Firebase project `flavour-forge-ff313`. Its web
configuration is in [`src/lib/src/lib/firebase.js`](./src/lib/src/lib/firebase.js).
The Firebase web API key is public client configuration; do not put server
credentials or service-account keys in client code.

For another deployment environment, set these optional public variables in
`.env`:

| Variable                                  | Where to find it                                     |
| ----------------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY` | The web site's reCAPTCHA Enterprise key in App Check |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY`          | The Web Push certificate key in Cloud Messaging      |

Enable Email/Password sign-in in Firebase Authentication. App Check must be
configured for the services that require it. Browser notifications also
require the visitor's permission.

To deploy the Firebase configuration, review [`firestore.rules`](./firestore.rules)
and confirm the target project before running:

```powershell
npx firebase-tools deploy --only auth,firestore:rules,functions --project flavour-forge-ff313
```

Cloud Functions use Node.js 24. Deploying functions may require a Firebase
project with billing enabled.

## Project structure

```text
src/
  app/          Next.js pages and API routes
  components/   Layout, recipes, shopping, account, and support UI
  db/           Database schema and seed data
  lib/          Firebase setup and application data helpers
functions/      Cloud Functions for Firebase
public/
  images/       Recipe photography
scripts/        Standalone-page build script
```

Recipe photo sources, creators, and licenses are listed in
[`public/images/PHOTO-CREDITS.md`](./public/images/PHOTO-CREDITS.md).
