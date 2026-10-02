// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
export const heroes = sqliteTable("heroes", {
 id: text("id").primaryKey(), name: text("name").notNull(), title: text("title").notNull(),
 category: text("category").notNull(), color: text("color").notNull(), month: text("month"),
 status: text("status").notNull(), notes: text("notes").notNull(), portrait: text("portrait"),
 updated: text("updated").notNull()
});
