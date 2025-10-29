import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============= USER TABLE =============
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().$type<"customer" | "provider" | "admin">(),
  photoUrl: text("photo_url"),
  bio: text("bio"),
  skills: text("skills").array().notNull().default(sql`ARRAY[]::text[]`),
  experienceYears: integer("experience_years"),
  hourlyRate: integer("hourly_rate"),
  city: text("city"),
  location: jsonb("location").$type<{ lat: number; lng: number }>(),
  ratingAvg: doublePrecision("rating_avg").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  passwordHash: true,
  ratingAvg: true,
  ratingCount: true,
  createdAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============= SERVICE CATEGORY TABLE =============
export const serviceCategories = pgTable("service_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  iconUrl: text("icon_url").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
  createdAt: true,
});

export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type ServiceCategory = typeof serviceCategories.$inferSelect;

// ============= SERVICE TABLE =============
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: varchar("category_id").notNull(),
  providerId: varchar("provider_id").notNull(),
  price: integer("price").notNull(),
  mode: text("mode").notNull().$type<"online" | "in-person">(),
  city: text("city"),
  active: boolean("active").notNull().default(true),
  photos: text("photos").array().notNull().default(sql`ARRAY[]::text[]`),
  ratingAvg: doublePrecision("rating_avg").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  ratingAvg: true,
  ratingCount: true,
  createdAt: true,
}).extend({
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0, "Price must be positive"),
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// ============= INQUIRY TABLE =============
export const inquiries = pgTable("inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  providerId: varchar("provider_id").notNull(),
  serviceId: varchar("service_id").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().$type<"new" | "replied" | "closed">().default("new"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
}).extend({
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;

// ============= MESSAGE TABLE =============
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inquiryId: varchar("inquiry_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
}).extend({
  text: z.string().min(1, "Message cannot be empty"),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// ============= REVIEW TABLE =============
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingOrInquiryId: varchar("booking_or_inquiry_id").notNull(),
  serviceId: varchar("service_id").notNull(),
  raterId: varchar("rater_id").notNull(),
  rateeId: varchar("ratee_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
}).extend({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// ============= AUTH SCHEMAS =============
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = insertUserSchema;
export type RegisterInput = InsertUser;
