import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  hashedPassword: varchar("hashed_password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  googleId: varchar("google_id").unique(), // For Google OAuth
  provider: varchar("provider").default("email"), // 'email' or 'google'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fish identifications table
export const fishIdentifications = pgTable("fish_identifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  imageUrl: text("image_url").notNull(),
  species: text("species").notNull(),
  commonName: text("common_name").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  details: jsonb("details"), // Additional details from Gemini response
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFishIdentificationSchema = createInsertSchema(fishIdentifications).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type FishIdentification = typeof fishIdentifications.$inferSelect;
export type InsertFishIdentification = z.infer<typeof insertFishIdentificationSchema>;
