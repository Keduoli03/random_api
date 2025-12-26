import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const quotesTable = sqliteTable("quotes", {
  id: integer().primaryKey({ autoIncrement: true }),
  uuid: text(), // Unique identifier from import
  content: text().notNull(), // hitokoto
  author: text(), // from_who
  source: text(), // from
  category: text(), // type (mapped)
  length: integer(), // length
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const imagesTable = sqliteTable("images", {
  id: integer().primaryKey({ autoIncrement: true }),
  filename: text().notNull(),
  orientation: text().notNull(), // 'h' | 'v'
  path: text().notNull(),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const statisticsTable = sqliteTable("statistics", {
  id: integer().primaryKey({ autoIncrement: true }),
  key: text().notNull().unique(), // 'quotes_viewed', 'images_viewed', 'api_total_calls'
  value: integer().notNull().default(0),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const settingsTable = sqliteTable("settings", {
  id: integer().primaryKey({ autoIncrement: true }),
  key: text().notNull().unique(), // e.g., 'image_prefix'
  value: text().notNull(),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
});
