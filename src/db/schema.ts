import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { create } from "node:domain";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const animals = sqliteTable("animals", {
  id: integer("id").primaryKey(),
  name: text("name"),
  imageUrl : text("image_url").notNull(),
  age : text("age").notNull(),
  gender : text("gender").notNull(),
  size: text("size").notNull(),
  type: text("type").notNull(),
  description : text("description").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});