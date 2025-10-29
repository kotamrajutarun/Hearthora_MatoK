import { 
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
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private providers: Map<string, Provider>;
  private services: Map<string, Service>;
  private inquiries: Map<string, Inquiry>;
  private messages: Map<string, Message>;
  private reviews: Map<string, Review>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.providers = new Map();
    this.services = new Map();
    this.inquiries = new Map();
    this.messages = new Map();
    this.reviews = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async getProvider(id: string): Promise<Provider | undefined> {
    return this.providers.get(id);
  }

  async getProviderByUserId(userId: string): Promise<Provider | undefined> {
    return Array.from(this.providers.values()).find(
      (provider) => provider.userId === userId,
    );
  }

  async getAllProviders(filters?: {
    categoryId?: string;
    city?: string;
    minRating?: number;
    maxHourlyRate?: number;
  }): Promise<Provider[]> {
    let providers = Array.from(this.providers.values());
    
    if (filters?.categoryId) {
      providers = providers.filter((p) => p.categoryId === filters.categoryId);
    }
    if (filters?.city) {
      providers = providers.filter((p) => 
        p.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    if (filters?.minRating) {
      providers = providers.filter((p) => p.ratingAvg >= filters.minRating!);
    }
    if (filters?.maxHourlyRate) {
      providers = providers.filter((p) => p.hourlyRate <= filters.maxHourlyRate!);
    }
    
    return providers;
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const id = randomUUID();
    const provider: Provider = { 
      ...insertProvider, 
      id,
      ratingAvg: 0,
      ratingCount: 0
    };
    this.providers.set(id, provider);
    return provider;
  }

  async updateProvider(id: string, updates: Partial<Provider>): Promise<Provider | undefined> {
    const provider = this.providers.get(id);
    if (!provider) return undefined;
    const updatedProvider = { ...provider, ...updates };
    this.providers.set(id, updatedProvider);
    return updatedProvider;
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServicesByProviderId(providerId: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.providerId === providerId,
    );
  }

  async getAllServices(filters?: {
    categoryId?: string;
    mode?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Service[]> {
    let services = Array.from(this.services.values());
    
    if (filters?.categoryId) {
      services = services.filter((s) => s.categoryId === filters.categoryId);
    }
    if (filters?.mode) {
      services = services.filter((s) => s.mode === filters.mode);
    }
    if (filters?.minPrice !== undefined) {
      services = services.filter((s) => s.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      services = services.filter((s) => s.price <= filters.maxPrice!);
    }
    
    return services;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = { 
      ...insertService, 
      id,
      ratingAvg: 0,
      ratingCount: 0
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    const updatedService = { ...service, ...updates };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: string): Promise<boolean> {
    return this.services.delete(id);
  }

  async getInquiry(id: string): Promise<Inquiry | undefined> {
    return this.inquiries.get(id);
  }

  async getInquiriesByCustomerId(customerId: string): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values()).filter(
      (inquiry) => inquiry.customerId === customerId,
    );
  }

  async getInquiriesByProviderId(providerId: string): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values()).filter(
      (inquiry) => inquiry.providerId === providerId,
    );
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = randomUUID();
    const inquiry: Inquiry = { 
      ...insertInquiry, 
      id,
      status: 'new',
      createdAt: new Date()
    };
    this.inquiries.set(id, inquiry);
    return inquiry;
  }

  async updateInquiry(id: string, updates: Partial<Inquiry>): Promise<Inquiry | undefined> {
    const inquiry = this.inquiries.get(id);
    if (!inquiry) return undefined;
    const updatedInquiry = { ...inquiry, ...updates };
    this.inquiries.set(id, updatedInquiry);
    return updatedInquiry;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByInquiryId(inquiryId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.inquiryId === inquiryId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage, 
      id,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByProviderId(providerId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter((review) => review.providerId === providerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getReviewsByCustomerId(customerId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.customerId === customerId,
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = { 
      ...insertReview, 
      id,
      createdAt: new Date()
    };
    this.reviews.set(id, review);
    
    const providerReviews = await this.getReviewsByProviderId(insertReview.providerId);
    const avgRating = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
    
    const provider = await this.getProvider(insertReview.providerId);
    if (provider) {
      await this.updateProvider(insertReview.providerId, {
        ratingAvg: Number(avgRating.toFixed(1)),
        ratingCount: providerReviews.length
      });
    }
    
    return review;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    const updatedReview = { ...review, ...updates };
    this.reviews.set(id, updatedReview);
    
    const providerReviews = await this.getReviewsByProviderId(review.providerId);
    const avgRating = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
    
    await this.updateProvider(review.providerId, {
      ratingAvg: Number(avgRating.toFixed(1)),
      ratingCount: providerReviews.length
    });
    
    return updatedReview;
  }
}

export const storage = new MemStorage();
