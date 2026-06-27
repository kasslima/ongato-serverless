import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "dev"] }).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const animals = sqliteTable("animals", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl : text("image_url").notNull(),
  age : text("age", { enum: ["0 a 6 meses", "6 a 12 meses", "1 a 2 anos", "2 a 5 anos", "5 a 9 anos", "mais de 9 anos"] }).notNull(),
  gender : text("gender", { enum: ["macho", "femea"] }).notNull(),
  size: text("size", { enum: ["pequeno", "medio", "grande"] }).notNull(),
  type: text("type", { enum: ["gato", "cachorro"] }).notNull(),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  attributes: text("attributes"),
  description : text("description"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const banners = sqliteTable("banners", {
  id: integer("id").primaryKey(),
  title : text("title").notNull(),
  imageUrl : text("image_url").notNull(),
  description : text("description"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey(),
  title : text("title").notNull(),
  imageUrl : text("image_url").notNull(),
  text : text("text"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const donations = sqliteTable("donations", {
  id: integer("id").primaryKey(),
  amount: integer("amount").notNull(),
  status: text("status", { enum: ["pending", "paid", "expired", "failed"] }).notNull(),
  stripeSessionId: text("stripe_session_id"),
  donorEmail: text("donor_email"),
  paidAt: text("paid_at"),
  thankYouEmailQueuedAt: text("thank_you_email_queued_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

