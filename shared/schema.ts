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
  password: text("password").notNull(),
  role: text("role").notNull().$type<"customer" | "provider" | "admin">(),
  photoUrl: text("photo_url"),
  username: text("username"),
  categoryId: text("category_id"),
  city: text("city"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============= CATEGORY TABLE =============
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// ============= PROVIDER TABLE =============
export const providers = pgTable("providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  categoryId: varchar("category_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  hourlyRate: integer("hourly_rate").notNull(),
  experienceYears: integer("experience_years").notNull(),
  skills: text("skills").array().notNull().default(sql`ARRAY[]::text[]`),
  bio: text("bio").notNull(),
  photoUrl: text("photo_url"),
  ratingAvg: doublePrecision("rating_avg").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  ratingAvg: true,
  ratingCount: true,
  createdAt: true,
});

export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Provider = typeof providers.$inferSelect;

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
  status: true,
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
  providerId: varchar("provider_id").notNull(),
  customerId: varchar("customer_id").notNull(),
  serviceId: varchar("service_id").notNull(),
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

export const registerFormSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
  categoryId: z.string().optional(),
  city: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterFormInput = z.infer<typeof registerFormSchema>;

// ============= PRICE CARD TABLE (Jiffy-style fixed-price catalog) =============
export const priceCards = pgTable("price_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull(),
  serviceId: varchar("service_id"),
  title: text("title").notNull(),
  category: text("category").notNull(),
  city: text("city"),
  description: text("description").notNull(),
  basePrice: integer("base_price").notNull(),
  addOns: jsonb("add_ons").$type<Array<{ name: string; price: number }>>().notNull().default(sql`'[]'::jsonb`),
  durationMinutes: integer("duration_minutes").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPriceCardSchema = createInsertSchema(priceCards).omit({
  id: true,
  createdAt: true,
}).extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  basePrice: z.number().min(0, "Price must be positive"),
  durationMinutes: z.number().min(15, "Duration must be at least 15 minutes"),
  addOns: z.array(z.object({
    name: z.string(),
    price: z.number().min(0)
  })).default([]),
});

export type InsertPriceCard = z.infer<typeof insertPriceCardSchema>;
export type PriceCard = typeof priceCards.$inferSelect;

// ============= AVAILABILITY TABLE (Provider schedules) =============
export const availability = pgTable("availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().unique(),
  weekly: jsonb("weekly").$type<Array<{ 
    day: number; 
    slots: Array<{ start: string; end: string }> 
  }>>().notNull().default(sql`'[]'::jsonb`),
  exceptions: jsonb("exceptions").$type<Array<{ 
    date: string; 
    slots: Array<{ start: string; end: string }> 
  }>>().notNull().default(sql`'[]'::jsonb`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true,
  updatedAt: true,
}).extend({
  weekly: z.array(z.object({
    day: z.number().min(0).max(6),
    slots: z.array(z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format"),
      end: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format")
    }))
  })).default([]),
  exceptions: z.array(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    slots: z.array(z.object({
      start: z.string(),
      end: z.string()
    }))
  })).default([]),
});

export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Availability = typeof availability.$inferSelect;

// ============= ADDRESS TABLE (User delivery addresses) =============
export const addresses = pgTable("addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  label: text("label").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
}).extend({
  label: z.string().min(1, "Label is required"),
  line1: z.string().min(5, "Address line 1 is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(3, "Postal code is required"),
});

export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof addresses.$inferSelect;

// ============= BOOKING TABLE (Jiffy-style instant bookings) =============
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingRef: varchar("booking_ref", { length: 10 }).notNull().unique(),
  customerId: varchar("customer_id").notNull(),
  providerId: varchar("provider_id").notNull(),
  priceCardId: varchar("price_card_id").notNull(),
  addressId: varchar("address_id").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  addOns: jsonb("add_ons").$type<Array<{ name: string; price: number }>>().notNull().default(sql`'[]'::jsonb`),
  subtotal: integer("subtotal").notNull(),
  tax: integer("tax").notNull().default(0),
  total: integer("total").notNull(),
  currency: text("currency").notNull().default("CAD"),
  status: text("status").notNull().$type<"pending" | "accepted" | "declined" | "cancelled" | "in_progress" | "completed">().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  bookingRef: true,
  providerId: true,
  durationMinutes: true,
  subtotal: true,
  tax: true,
  total: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  scheduledAt: z.string().or(z.date()),
  addOnNames: z.array(z.string()).default([]),
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
