import { 
  users,
  categories,
  providers,
  services,
  inquiries,
  messages,
  reviews,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Provider,
  type InsertProvider,
  type Service,
  type InsertService,
  type Inquiry,
  type InsertInquiry,
  type Message,
  type InsertMessage,
  type Review,
  type InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, like, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Provider methods
  getProvider(id: string): Promise<Provider | undefined>;
  getProviderByUserId(userId: string): Promise<Provider | undefined>;
  getAllProviders(filters?: {
    categoryId?: string;
    city?: string;
    minRating?: number;
    maxHourlyRate?: number;
  }): Promise<Provider[]>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: string, updates: Partial<Provider>): Promise<Provider | undefined>;
  
  // Service methods
  getService(id: string): Promise<Service | undefined>;
  getServicesByProviderId(providerId: string): Promise<Service[]>;
  getAllServices(filters?: {
    categoryId?: string;
    mode?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;
  
  // Inquiry methods
  getInquiry(id: string): Promise<Inquiry | undefined>;
  getInquiriesByCustomerId(customerId: string): Promise<Inquiry[]>;
  getInquiriesByProviderId(providerId: string): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiry(id: string, updates: Partial<Inquiry>): Promise<Inquiry | undefined>;
  
  // Message methods
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByInquiryId(inquiryId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Review methods
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByProviderId(providerId: string): Promise<Review[]>;
  getReviewsByCustomerId(customerId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  // Provider methods
  async getProvider(id: string): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    return provider || undefined;
  }

  async getProviderByUserId(userId: string): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.userId, userId));
    return provider || undefined;
  }

  async getAllProviders(filters?: {
    categoryId?: string;
    city?: string;
    minRating?: number;
    maxHourlyRate?: number;
  }): Promise<Provider[]> {
    let query = db.select().from(providers);
    
    const conditions = [];
    if (filters?.categoryId) {
      conditions.push(eq(providers.categoryId, filters.categoryId));
    }
    if (filters?.city) {
      conditions.push(like(providers.city, `%${filters.city}%`));
    }
    if (filters?.minRating !== undefined) {
      conditions.push(gte(providers.ratingAvg, filters.minRating));
    }
    if (filters?.maxHourlyRate !== undefined) {
      conditions.push(lte(providers.hourlyRate, filters.maxHourlyRate));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const [provider] = await db
      .insert(providers)
      .values({
        ...insertProvider,
        ratingAvg: 0,
        ratingCount: 0
      })
      .returning();
    return provider;
  }

  async updateProvider(id: string, updates: Partial<Provider>): Promise<Provider | undefined> {
    const [updated] = await db
      .update(providers)
      .set(updates)
      .where(eq(providers.id, id))
      .returning();
    return updated || undefined;
  }

  // Service methods
  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServicesByProviderId(providerId: string): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.providerId, providerId));
  }

  async getAllServices(filters?: {
    categoryId?: string;
    mode?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Service[]> {
    let query = db.select().from(services);
    
    const conditions = [];
    if (filters?.categoryId) {
      conditions.push(eq(services.categoryId, filters.categoryId));
    }
    if (filters?.mode) {
      conditions.push(eq(services.mode, filters.mode));
    }
    if (filters?.minPrice !== undefined) {
      conditions.push(gte(services.price, filters.minPrice));
    }
    if (filters?.maxPrice !== undefined) {
      conditions.push(lte(services.price, filters.maxPrice));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values({
        ...insertService,
        ratingAvg: 0,
        ratingCount: 0
      })
      .returning();
    return service;
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service | undefined> {
    const [updated] = await db
      .update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Inquiry methods
  async getInquiry(id: string): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry || undefined;
  }

  async getInquiriesByCustomerId(customerId: string): Promise<Inquiry[]> {
    return await db.select().from(inquiries).where(eq(inquiries.customerId, customerId));
  }

  async getInquiriesByProviderId(providerId: string): Promise<Inquiry[]> {
    return await db.select().from(inquiries).where(eq(inquiries.providerId, providerId));
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db
      .insert(inquiries)
      .values({
        ...insertInquiry,
        status: 'new',
        createdAt: new Date()
      })
      .returning();
    return inquiry;
  }

  async updateInquiry(id: string, updates: Partial<Inquiry>): Promise<Inquiry | undefined> {
    const [updated] = await db
      .update(inquiries)
      .set(updates)
      .where(eq(inquiries.id, id))
      .returning();
    return updated || undefined;
  }

  // Message methods
  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesByInquiryId(inquiryId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.inquiryId, inquiryId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({
        ...insertMessage,
        createdAt: new Date()
      })
      .returning();
    return message;
  }

  // Review methods
  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async getReviewsByProviderId(providerId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.providerId, providerId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewsByCustomerId(customerId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.customerId, customerId));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values({
        ...insertReview,
        createdAt: new Date()
      })
      .returning();
    
    // Update provider rating
    const providerReviews = await this.getReviewsByProviderId(insertReview.providerId);
    const avgRating = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
    
    await this.updateProvider(insertReview.providerId, {
      ratingAvg: Number(avgRating.toFixed(1)),
      ratingCount: providerReviews.length
    });
    
    return review;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined> {
    const [updated] = await db
      .update(reviews)
      .set(updates)
      .where(eq(reviews.id, id))
      .returning();
    
    if (updated) {
      // Recalculate provider rating
      const providerReviews = await this.getReviewsByProviderId(updated.providerId);
      const avgRating = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
      
      await this.updateProvider(updated.providerId, {
        ratingAvg: Number(avgRating.toFixed(1)),
        ratingCount: providerReviews.length
      });
    }
    
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
