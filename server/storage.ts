import { 
  users,
  categories,
  providers,
  services,
  inquiries,
  messages,
  reviews,
  priceCards,
  availability,
  addresses,
  bookings,
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
  type InsertReview,
  type PriceCard,
  type InsertPriceCard,
  type Availability,
  type InsertAvailability,
  type Address,
  type InsertAddress,
  type Booking,
  type InsertBooking
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
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
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
  
  // Price Card methods (Jiffy-style)
  getPriceCard(id: string): Promise<PriceCard | undefined>;
  getPriceCardsByProviderId(providerId: string): Promise<PriceCard[]>;
  getPublicPriceCards(filters?: {
    category?: string;
    city?: string;
    search?: string;
  }): Promise<PriceCard[]>;
  createPriceCard(priceCard: InsertPriceCard): Promise<PriceCard>;
  updatePriceCard(id: string, updates: Partial<PriceCard>): Promise<PriceCard | undefined>;
  deletePriceCard(id: string): Promise<boolean>;
  
  // Availability methods
  getAvailability(id: string): Promise<Availability | undefined>;
  getAvailabilityByProviderId(providerId: string): Promise<Availability | undefined>;
  setAvailability(availability: InsertAvailability): Promise<Availability>;
  updateAvailability(providerId: string, updates: Partial<Availability>): Promise<Availability | undefined>;
  
  // Address methods
  getAddress(id: string): Promise<Address | undefined>;
  getAddressesByUserId(userId: string): Promise<Address[]>;
  getDefaultAddress(userId: string): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, updates: Partial<Address>): Promise<Address | undefined>;
  setDefaultAddress(userId: string, addressId: string): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<boolean>;
  
  // Booking methods
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingByRef(bookingRef: string): Promise<Booking | undefined>;
  getBookingsByCustomerId(customerId: string): Promise<Booking[]>;
  getBookingsByProviderId(providerId: string, filters?: { status?: string }): Promise<Booking[]>;
  createBooking(booking: InsertBooking & { bookingRef: string; subtotal: number; tax: number; total: number }): Promise<Booking>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined>;
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
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
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
    if (filters?.minPrice !== undefined) {
      conditions.push(gte(providers.hourlyRate, filters.minPrice));
    }
    if (filters?.maxPrice !== undefined) {
      conditions.push(lte(providers.hourlyRate, filters.maxPrice));
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        like(providers.bio, searchTerm)
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    switch (filters?.sortBy) {
      case 'rating':
        query = query.orderBy(desc(providers.ratingAvg)) as any;
        break;
      case 'price-low':
        query = query.orderBy(providers.hourlyRate) as any;
        break;
      case 'price-high':
        query = query.orderBy(desc(providers.hourlyRate)) as any;
        break;
      default:
        query = query.orderBy(desc(providers.ratingAvg)) as any;
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

  // Price Card methods (Jiffy-style)
  async getPriceCard(id: string): Promise<PriceCard | undefined> {
    const [priceCard] = await db.select().from(priceCards).where(eq(priceCards.id, id));
    return priceCard || undefined;
  }

  async getPriceCardsByProviderId(providerId: string): Promise<PriceCard[]> {
    return await db
      .select()
      .from(priceCards)
      .where(eq(priceCards.providerId, providerId))
      .orderBy(desc(priceCards.createdAt));
  }

  async getPublicPriceCards(filters?: {
    category?: string;
    city?: string;
    search?: string;
  }): Promise<PriceCard[]> {
    const conditions = [eq(priceCards.isActive, true)];
    
    if (filters?.category) {
      conditions.push(eq(priceCards.category, filters.category));
    }
    if (filters?.city) {
      conditions.push(like(priceCards.city, `%${filters.city}%`));
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        like(priceCards.title, searchTerm)
      );
    }
    
    return await db
      .select()
      .from(priceCards)
      .where(and(...conditions))
      .orderBy(priceCards.title);
  }

  async createPriceCard(insertPriceCard: InsertPriceCard): Promise<PriceCard> {
    const [priceCard] = await db
      .insert(priceCards)
      .values(insertPriceCard)
      .returning();
    return priceCard;
  }

  async updatePriceCard(id: string, updates: Partial<PriceCard>): Promise<PriceCard | undefined> {
    const [updated] = await db
      .update(priceCards)
      .set(updates)
      .where(eq(priceCards.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePriceCard(id: string): Promise<boolean> {
    const result = await db.delete(priceCards).where(eq(priceCards.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Availability methods
  async getAvailability(id: string): Promise<Availability | undefined> {
    const [avail] = await db.select().from(availability).where(eq(availability.id, id));
    return avail || undefined;
  }

  async getAvailabilityByProviderId(providerId: string): Promise<Availability | undefined> {
    const [avail] = await db.select().from(availability).where(eq(availability.providerId, providerId));
    return avail || undefined;
  }

  async setAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const existing = await this.getAvailabilityByProviderId(insertAvailability.providerId);
    
    if (existing) {
      const [updated] = await db
        .update(availability)
        .set({
          weekly: insertAvailability.weekly,
          exceptions: insertAvailability.exceptions,
          updatedAt: new Date()
        })
        .where(eq(availability.providerId, insertAvailability.providerId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(availability)
        .values({
          ...insertAvailability,
          updatedAt: new Date()
        })
        .returning();
      return created;
    }
  }

  async updateAvailability(providerId: string, updates: Partial<Availability>): Promise<Availability | undefined> {
    const [updated] = await db
      .update(availability)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(availability.providerId, providerId))
      .returning();
    return updated || undefined;
  }

  // Address methods
  async getAddress(id: string): Promise<Address | undefined> {
    const [address] = await db.select().from(addresses).where(eq(addresses.id, id));
    return address || undefined;
  }

  async getAddressesByUserId(userId: string): Promise<Address[]> {
    return await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
  }

  async getDefaultAddress(userId: string): Promise<Address | undefined> {
    const [address] = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)));
    return address || undefined;
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const [address] = await db
      .insert(addresses)
      .values({
        ...insertAddress,
        createdAt: new Date()
      })
      .returning();
    return address;
  }

  async updateAddress(id: string, updates: Partial<Address>): Promise<Address | undefined> {
    const [updated] = await db
      .update(addresses)
      .set(updates)
      .where(eq(addresses.id, id))
      .returning();
    return updated || undefined;
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<Address | undefined> {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, userId));
    
    const [updated] = await db
      .update(addresses)
      .set({ isDefault: true })
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .returning();
    
    return updated || undefined;
  }

  async deleteAddress(id: string): Promise<boolean> {
    const result = await db.delete(addresses).where(eq(addresses.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Booking methods
  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingByRef(bookingRef: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.bookingRef, bookingRef));
    return booking || undefined;
  }

  async getBookingsByCustomerId(customerId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.customerId, customerId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByProviderId(providerId: string, filters?: { status?: string }): Promise<Booking[]> {
    const conditions = [eq(bookings.providerId, providerId)];
    
    if (filters?.status) {
      conditions.push(eq(bookings.status, filters.status as any));
    }
    
    return await db
      .select()
      .from(bookings)
      .where(and(...conditions))
      .orderBy(desc(bookings.scheduledAt));
  }

  async createBooking(booking: InsertBooking & { bookingRef: string; subtotal: number; tax: number; total: number }): Promise<Booking> {
    const scheduledAt = typeof booking.scheduledAt === 'string' 
      ? new Date(booking.scheduledAt) 
      : booking.scheduledAt;
    
    const [created] = await db
      .insert(bookings)
      .values({
        ...booking,
        scheduledAt,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
      .returning();
    return created;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
