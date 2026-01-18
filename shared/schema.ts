import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// User profiles table - stores business info and subscription status
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey(), // Supabase user ID
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  companyName: text("company_name"),
  websiteUrl: text("website_url"),
  industry: text("industry"),
  companySize: text("company_size"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("inactive"), // active, inactive, canceled, past_due
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  createdAt: true,
  updatedAt: true,
});

export const updateUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => userProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  brandName: text("brand_name").notNull(),
  brandDomain: text("brand_domain").notNull(),
  competitors: text("competitors").array().notNull().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Prompt Sets table
export const promptSets = pgTable("prompt_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  persona: text("persona"),
  funnelStage: text("funnel_stage"),
  country: text("country"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPromptSetSchema = createInsertSchema(promptSets).omit({
  id: true,
  createdAt: true,
});

export type InsertPromptSet = z.infer<typeof insertPromptSetSchema>;
export type PromptSet = typeof promptSets.$inferSelect;

// Prompts table
export const prompts = pgTable("prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  promptSetId: varchar("prompt_set_id").notNull().references(() => promptSets.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
});

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

// Scans table
export const scans = pgTable("scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  engines: jsonb("engines").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertScanSchema = createInsertSchema(scans).omit({
  id: true,
  createdAt: true,
});

export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scans.$inferSelect;

// Scan Results table
export const scanResults = pgTable("scan_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanId: varchar("scan_id").notNull().references(() => scans.id, { onDelete: "cascade" }),
  promptId: varchar("prompt_id").notNull().references(() => prompts.id, { onDelete: "cascade" }),
  engine: text("engine").notNull(),
  answer: text("answer").notNull(),
  brandScore: integer("brand_score").notNull().default(0),
  competitorScores: jsonb("competitor_scores").notNull().$type<Record<string, number>>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertScanResultSchema = createInsertSchema(scanResults).omit({
  id: true,
  createdAt: true,
});

export type InsertScanResult = z.infer<typeof insertScanResultSchema>;
export type ScanResult = typeof scanResults.$inferSelect;

// Extended types for frontend
export type ProjectWithStats = Project & {
  promptCount: number;
  lastScanDate?: Date | null;
  visibilityScore?: number;
};

export type PromptSetWithPrompts = PromptSet & {
  prompts: Prompt[];
};

export type ScanResultWithPrompt = ScanResult & {
  prompt: Prompt;
};

export type GapAnalysis = {
  promptId: string;
  promptText: string;
  brandScore: number;
  competitorScores: Record<string, number>;
  suggestedAnswer?: string;
  suggestedPageType?: string;
};
