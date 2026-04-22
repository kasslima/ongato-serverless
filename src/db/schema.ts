import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { create } from "node:domain";

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
  age : text("age").notNull(),
  gender : text("gender").notNull(),
  size: text("size").notNull(),
  type: text("type").notNull(),
  description : text("description").notNull(),
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

