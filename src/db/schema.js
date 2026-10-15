import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  about: text("about").notNull(),
  image: text("image").notNull(),
  cuisine: text("cuisine").notNull(),
  tags: text("tags").array().notNull().default([]),
  prepTime: integer("prep_time").notNull(),
  cookTime: integer("cook_time").notNull(),
  servings: integer("servings").notNull(),
  difficulty: text("difficulty").notNull(),
  instructions: text("instructions").array().notNull().default([]),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fat: integer("fat").notNull(),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  about: text("about").notNull(),
});

export const recipeIngredients = pgTable(
  "recipe_ingredients",
  {
    id: serial("id").primaryKey(),
    recipeId: integer("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    ingredientId: integer("ingredient_id")
      .notNull()
      .references(() => ingredients.id, { onDelete: "cascade" }),
    quantity: text("quantity").notNull(),
    note: text("note"),
    position: integer("position").notNull().default(0),
  },
  (t) => [
    uniqueIndex("recipe_ingredient_unique").on(t.recipeId, t.ingredientId),
  ],
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    ingredientId: integer("ingredient_id")
      .notNull()
      .references(() => ingredients.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    size: text("size").notNull(),
    price: integer("price").notNull(),
    badge: text("badge"),
    isDefault: boolean("is_default").notNull().default(false),
  },
  (t) => [
    uniqueIndex("products_ingredient_name_size_unique").on(
      t.ingredientId,
      t.name,
      t.size,
    ),
  ],
);

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" })
    .unique(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const recipeCartItems = pgTable(
  "recipe_cart_items",
  {
    id: serial("id").primaryKey(),
    recipeId: integer("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    servings: integer("servings").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: integer("unit_price").notNull(),
    ingredientCount: integer("ingredient_count").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("recipe_cart_recipe_servings_unique").on(
      table.recipeId,
      table.servings,
    ),
  ],
);

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" })
    .unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const appMigrations = pgTable("app_migrations", {
  migrationName: text("migration_name"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  acceptedTermsAt: timestamp("accepted_terms_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  category: text("category").notNull().default("general"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  orderRef: text("order_ref"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  customerName: text("customer_name").notNull().default(""),
  customerEmail: text("customer_email").notNull().default(""),
  total: integer("total").notNull(),
  itemCount: integer("item_count").notNull(),
  items: text("items").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
