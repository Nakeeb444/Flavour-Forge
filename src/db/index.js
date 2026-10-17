import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DataType, newDb } from "pg-mem";

const databaseUrl = process.env.DATABASE_URL;

const patchPgMemCompatibility = (adapter) => {
  const originalAdaptQuery = adapter.Pool.prototype.adaptQuery;
  const originalAdaptResults = adapter.Pool.prototype.adaptResults;

  adapter.Pool.prototype.adaptQuery = function adaptQuery(query, values) {
    if (query && query.types) {
      delete query.types;
    }
    if (query && query.rowMode) {
      delete query.rowMode;
    }
    return originalAdaptQuery.call(this, query, values);
  };

  adapter.Pool.prototype.adaptResults = function adaptResults(query, res) {
    if (query && query.rowMode) {
      delete query.rowMode;
    }

    const fields = res?.fields ?? [];
    const rows = (res?.rows ?? []).map((row) => {
      const numberedRow = [];
      fields.forEach((field, index) => {
        const value = row[field.name];
        numberedRow[index] = value;
        numberedRow[field.name] = value;
      });
      return numberedRow;
    });

    return originalAdaptResults.call(this, query, { ...res, rows, fields });
  };
};

const schemaSql = `
  CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    about TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    about TEXT NOT NULL,
    image TEXT NOT NULL,
    cuisine TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    prep_time INTEGER NOT NULL,
    cook_time INTEGER NOT NULL,
    servings INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    instructions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    calories INTEGER NOT NULL,
    protein INTEGER NOT NULL,
    carbs INTEGER NOT NULL,
    fat INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity TEXT NOT NULL,
    note TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    UNIQUE(recipe_id, ingredient_id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size TEXT NOT NULL,
    price INTEGER NOT NULL,
    badge TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(ingredient_id, name, size)
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS recipe_cart_items (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    servings INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL,
    ingredient_count INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(recipe_id, servings)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL UNIQUE REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS app_migrations (
    migration_name TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    firebase_uid TEXT,
    accepted_terms_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    order_ref TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL DEFAULT '',
    customer_email TEXT NOT NULL DEFAULT '',
    total INTEGER NOT NULL,
    item_count INTEGER NOT NULL,
    items TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
`;

const createFallbackPool = () => {
  const memDb = newDb();
  memDb.public.registerFunction({
    name: "pg_advisory_xact_lock",
    args: [DataType.bigint],
    returns: DataType.text,
    implementation: () => "",
  });

  const adapter = memDb.adapters.createPg();
  patchPgMemCompatibility(adapter);

  const pool = new adapter.Pool();
  return { pool, memDb };
};

const startupPool = async () => {
  if (!databaseUrl) {
    const { pool } = createFallbackPool();
    await pool.query(schemaSql);
    return pool;
  }

  const pool = new Pool({ connectionString: databaseUrl });
  try {
    await pool.query("SELECT 1");
    return pool;
  } catch (error) {
    console.warn(
      "DATABASE_URL was not usable; falling back to the in-memory SQLite-compatible pg-mem database.",
      error.message,
    );
    const fallbackPool = createFallbackPool().pool;
    await fallbackPool.query(schemaSql);
    return fallbackPool;
  }
};

const globalForDb = globalThis;
const pool = globalForDb.__arenaNextJsPostgresqlPool ?? (await startupPool());
await pool.query(`
  CREATE TABLE IF NOT EXISTS app_migrations (
    migration_name TEXT
  )
`);
await pool.query(`
  ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT;
  ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
  CREATE UNIQUE INDEX IF NOT EXISTS users_firebase_uid_unique ON users(firebase_uid);
`);

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
