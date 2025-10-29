import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import bcrypt from "bcryptjs";
import { 
  insertUserSchema, 
  insertProviderSchema,
  insertServiceSchema,
  insertInquirySchema,
  insertMessageSchema,
  insertReviewSchema,
  insertPriceCardSchema,
  insertAvailabilitySchema,
  insertAddressSchema,
  insertBookingSchema
} from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

interface AuthRequest extends Request {
  userId?: string;
}

async function authMiddleware(req: Request, res: Response, next: Function) {
  const authReq = req as AuthRequest;
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  authReq.userId = req.session.userId;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  await seedDatabase();

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

      if (user.role === 'provider') {
        await storage.createProvider({
          userId: user.id,
          categoryId: validatedData.categoryId || '',
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          city: validatedData.city || '',
          hourlyRate: 0,
          experienceYears: 0,
          skills: [],
          bio: ''
        });
      }

      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ error: "Session error" });
        }
        req.session.userId = user.id;
        
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ error: "Session error" });
        }
        req.session.userId = user.id;
        
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const user = await storage.getUser(authReq.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/providers", async (req, res) => {
    try {
      const { categoryId, city, minRating, maxHourlyRate, minPrice, maxPrice, search, sortBy } = req.query;
      
      const filters = {
        categoryId: categoryId as string | undefined,
        city: city as string | undefined,
        minRating: minRating ? Number(minRating) : undefined,
        maxHourlyRate: maxHourlyRate ? Number(maxHourlyRate) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        search: search as string | undefined,
        sortBy: sortBy as string | undefined
      };
      
      const providers = await storage.getAllProviders(filters);
      res.json(providers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/providers/:id", async (req, res) => {
    try {
      const provider = await storage.getProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
      res.json(provider);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/providers/user/:userId", async (req, res) => {
    try {
      const provider = await storage.getProviderByUserId(req.params.userId);
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
      res.json(provider);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/providers/:id", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const provider = await storage.getProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      if (provider.userId !== authReq.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const updated = await storage.updateProvider(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/services", async (req, res) => {
    try {
      const { categoryId, mode, minPrice, maxPrice, providerId } = req.query;
      
      if (providerId) {
        const services = await storage.getServicesByProviderId(providerId as string);
        return res.json(services);
      }
      
      const filters = {
        categoryId: categoryId as string | undefined,
        mode: mode as string | undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined
      };
      
      const services = await storage.getAllServices(filters);
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/services", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      
      const provider = await storage.getProvider(validatedData.providerId);
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
      
      if (provider.userId !== authReq.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const service = await storage.createService(validatedData);
      res.json(service);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/services/:id", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      const provider = await storage.getProvider(service.providerId);
      if (!provider || provider.userId !== authReq.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const updated = await storage.updateService(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/services/:id", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      const provider = await storage.getProvider(service.providerId);
      if (!provider || provider.userId !== authReq.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deleteService(req.params.id);
      res.json({ message: "Service deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/inquiries", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const user = await storage.getUser(authReq.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let inquiries;
      if (user.role === 'customer') {
        inquiries = await storage.getInquiriesByCustomerId(authReq.userId!);
      } else if (user.role === 'provider') {
        const provider = await storage.getProviderByUserId(authReq.userId!);
        if (provider) {
          inquiries = await storage.getInquiriesByProviderId(provider.id);
        } else {
          inquiries = [];
        }
      } else {
        inquiries = [];
      }

      res.json(inquiries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/inquiries", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const validatedData = insertInquirySchema.parse({
        ...req.body,
        customerId: authReq.userId
      });

      const inquiry = await storage.createInquiry(validatedData);
      res.json(inquiry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/inquiries/:id", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const inquiry = await storage.getInquiry(req.params.id);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }

      const user = await storage.getUser(authReq.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isCustomer = inquiry.customerId === authReq.userId;
      const isProvider = user.role === 'provider' && (
        await storage.getProviderByUserId(authReq.userId!)
      )?.id === inquiry.providerId;

      if (!isCustomer && !isProvider) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const updated = await storage.updateInquiry(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/messages/:inquiryId", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const inquiry = await storage.getInquiry(req.params.inquiryId);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }

      const user = await storage.getUser(authReq.userId!);
      const isCustomer = inquiry.customerId === authReq.userId;
      const isProvider = user?.role === 'provider' && (
        await storage.getProviderByUserId(authReq.userId!)
      )?.id === inquiry.providerId;

      if (!isCustomer && !isProvider) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const messages = await storage.getMessagesByInquiryId(req.params.inquiryId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/messages", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId: authReq.userId
      });

      const inquiry = await storage.getInquiry(validatedData.inquiryId);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }

      const user = await storage.getUser(authReq.userId!);
      const isCustomer = inquiry.customerId === authReq.userId;
      const isProvider = user?.role === 'provider' && (
        await storage.getProviderByUserId(authReq.userId!)
      )?.id === inquiry.providerId;

      if (!isCustomer && !isProvider) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/reviews/provider/:providerId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProviderId(req.params.providerId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reviews", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        customerId: authReq.userId
      });

      const review = await storage.createReview(validatedData);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Helper function to generate booking reference
  function generateBookingRef(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let ref = '';
    for (let i = 0; i < 8; i++) {
      ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ref;
  }

  // ===== PRICE CARDS ROUTES (Jiffy-style) =====
  
  app.get("/api/price-cards/public", async (req, res) => {
    try {
      const { category, city, q } = req.query;
      const priceCards = await storage.getPublicPriceCards({
        category: category as string | undefined,
        city: city as string | undefined,
        search: q as string | undefined
      });
      res.json(priceCards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/price-cards/mine", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const user = await storage.getUser(authReq.userId!);
      if (user?.role !== 'provider') {
        return res.status(403).json({ error: "Only providers can access this" });
      }

      const provider = await storage.getProviderByUserId(authReq.userId!);
      if (!provider) {
        return res.status(404).json({ error: "Provider profile not found" });
      }

      const priceCards = await storage.getPriceCardsByProviderId(provider.id);
      res.json(priceCards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/price-cards", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const user = await storage.getUser(authReq.userId!);
      if (user?.role !== 'provider') {
        return res.status(403).json({ error: "Only providers can create price cards" });
      }

      const provider = await storage.getProviderByUserId(authReq.userId!);
      if (!provider) {
        return res.status(404).json({ error: "Provider profile not found" });
      }

      const validatedData = insertPriceCardSchema.parse({
        ...req.body,
        providerId: provider.id
      });

      const priceCard = await storage.createPriceCard(validatedData);
      res.json(priceCard);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/price-cards/:id", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const user = await storage.getUser(authReq.userId!);
      if (user?.role !== 'provider') {
        return res.status(403).json({ error: "Only providers can update price cards" });
      }

      const provider = await storage.getProviderByUserId(authReq.userId!);
      if (!provider) {
        return res.status(404).json({ error: "Provider profile not found" });
      }

      const existing = await storage.getPriceCard(req.params.id);
      if (!existing || existing.providerId !== provider.id) {
        return res.status(404).json({ error: "Price card not found" });
      }

      const safeUpdates = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        city: req.body.city,
        basePrice: req.body.basePrice,
        addOns: req.body.addOns,
        durationMinutes: req.body.durationMinutes,
        isActive: req.body.isActive,
        serviceId: req.body.serviceId
      };

      const filtered = Object.fromEntries(
        Object.entries(safeUpdates).filter(([_, v]) => v !== undefined)
      );

      const updated = await storage.updatePriceCard(req.params.id, filtered);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/price-cards/:id", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const user = await storage.getUser(authReq.userId!);
      if (user?.role !== 'provider') {
        return res.status(403).json({ error: "Only providers can delete price cards" });
      }

      const provider = await storage.getProviderByUserId(authReq.userId!);
      if (!provider) {
        return res.status(404).json({ error: "Provider profile not found" });
      }

      const existing = await storage.getPriceCard(req.params.id);
      if (!existing || existing.providerId !== provider.id) {
        return res.status(404).json({ error: "Price card not found" });
      }

      await storage.deletePriceCard(req.params.id);
      res.json({ message: "Price card deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== AVAILABILITY ROUTES =====
  
  app.get("/api/availability/mine", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const user = await storage.getUser(authReq.userId!);
      if (user?.role !== 'provider') {
        return res.status(403).json({ error: "Only providers can access this" });
      }

      const provider = await storage.getProviderByUserId(authReq.userId!);
      if (!provider) {
        return res.status(404).json({ error: "Provider profile not found" });
      }

      const availability = await storage.getAvailabilityByProviderId(provider.id);
      res.json(availability || { weekly: [], exceptions: [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/availability/public/:providerId", async (req, res) => {
    try {
      const availability = await storage.getAvailabilityByProviderId(req.params.providerId);
      res.json(availability || { weekly: [], exceptions: [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/availability/weekly", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const user = await storage.getUser(authReq.userId!);
      if (user?.role !== 'provider') {
        return res.status(403).json({ error: "Only providers can set availability" });
      }

      const provider = await storage.getProviderByUserId(authReq.userId!);
      if (!provider) {
        return res.status(404).json({ error: "Provider profile not found" });
      }

      const validatedData = insertAvailabilitySchema.parse({
        providerId: provider.id,
        weekly: req.body.weekly || [],
        exceptions: req.body.exceptions || []
      });

      const availability = await storage.setAvailability(validatedData);
      res.json(availability);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== ADDRESS ROUTES =====
  
  app.get("/api/addresses", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const addresses = await storage.getAddressesByUserId(authReq.userId!);
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/addresses", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const validatedData = insertAddressSchema.parse({
        ...req.body,
        userId: authReq.userId
      });

      const address = await storage.createAddress(validatedData);
      res.json(address);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/addresses/:id", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const address = await storage.getAddress(req.params.id);
      if (!address || address.userId !== authReq.userId) {
        return res.status(404).json({ error: "Address not found" });
      }

      const safeUpdates = {
        label: req.body.label,
        line1: req.body.line1,
        line2: req.body.line2,
        city: req.body.city,
        postalCode: req.body.postalCode,
        lat: req.body.lat,
        lng: req.body.lng
      };

      const filtered = Object.fromEntries(
        Object.entries(safeUpdates).filter(([_, v]) => v !== undefined)
      );

      const updated = await storage.updateAddress(req.params.id, filtered);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/addresses/:id/default", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const address = await storage.getAddress(req.params.id);
      if (!address || address.userId !== authReq.userId) {
        return res.status(404).json({ error: "Address not found" });
      }

      const updated = await storage.setDefaultAddress(authReq.userId!, req.params.id);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/addresses/:id", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const address = await storage.getAddress(req.params.id);
      if (!address || address.userId !== authReq.userId) {
        return res.status(404).json({ error: "Address not found" });
      }

      await storage.deleteAddress(req.params.id);
      res.json({ message: "Address deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== BOOKING ROUTES =====
  
  app.get("/api/bookings/mine", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const user = await storage.getUser(authReq.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let bookings;
      if (user.role === 'provider') {
        const provider = await storage.getProviderByUserId(authReq.userId!);
        if (!provider) {
          return res.status(404).json({ error: "Provider profile not found" });
        }
        const status = req.query.status as string | undefined;
        bookings = await storage.getBookingsByProviderId(provider.id, { status });
      } else {
        bookings = await storage.getBookingsByCustomerId(authReq.userId!);
      }

      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/bookings/ref/:bookingRef", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const booking = await storage.getBookingByRef(req.params.bookingRef);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.customerId !== authReq.userId) {
        const user = await storage.getUser(authReq.userId!);
        if (user?.role === 'provider') {
          const provider = await storage.getProviderByUserId(authReq.userId!);
          if (!provider || booking.providerId !== provider.id) {
            return res.status(403).json({ error: "Access denied" });
          }
        } else {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/bookings/preview", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { priceCardId, addOnNames = [] } = req.body;
      
      const priceCard = await storage.getPriceCard(priceCardId);
      if (!priceCard) {
        return res.status(404).json({ error: "Price card not found" });
      }

      const selectedAddOns = priceCard.addOns.filter(addon => addOnNames.includes(addon.name));
      const subtotal = priceCard.basePrice + selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
      const tax = 0;
      const total = subtotal + tax;

      res.json({
        basePrice: priceCard.basePrice,
        addOns: selectedAddOns,
        subtotal,
        tax,
        total,
        currency: 'CAD'
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/bookings", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const user = await storage.getUser(authReq.userId!);
      if (user?.role === 'provider') {
        return res.status(403).json({ error: "Providers cannot create bookings" });
      }

      const validatedData = insertBookingSchema.parse({
        ...req.body,
        customerId: authReq.userId
      });

      const priceCard = await storage.getPriceCard(validatedData.priceCardId);
      if (!priceCard) {
        return res.status(404).json({ error: "Price card not found" });
      }
      
      if (!priceCard.isActive) {
        return res.status(400).json({ error: "This service is no longer available" });
      }

      const selectedAddOns = priceCard.addOns.filter(addon => 
        (req.body.addOnNames || []).includes(addon.name)
      );
      const subtotal = priceCard.basePrice + selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
      const tax = 0;
      const total = subtotal + tax;

      const booking = await storage.createBooking({
        ...validatedData,
        providerId: priceCard.providerId,
        durationMinutes: priceCard.durationMinutes,
        addOns: selectedAddOns,
        bookingRef: generateBookingRef(),
        subtotal,
        tax,
        total
      });

      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/bookings/:id/provider-respond", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const user = await storage.getUser(authReq.userId!);
      if (user?.role !== 'provider') {
        return res.status(403).json({ error: "Only providers can respond to bookings" });
      }

      const provider = await storage.getProviderByUserId(authReq.userId!);
      if (!provider) {
        return res.status(404).json({ error: "Provider profile not found" });
      }

      const booking = await storage.getBooking(req.params.id);
      if (!booking || booking.providerId !== provider.id) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.status !== 'pending') {
        return res.status(400).json({ error: "Can only respond to pending bookings" });
      }

      const { action } = req.body;
      if (action !== 'accept' && action !== 'decline') {
        return res.status(400).json({ error: "Invalid action. Must be 'accept' or 'decline'" });
      }

      const updated = await storage.updateBooking(req.params.id, {
        status: action === 'accept' ? 'accepted' : 'declined'
      });

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/bookings/:id/start", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const user = await storage.getUser(authReq.userId!);
      if (user?.role !== 'provider') {
        return res.status(403).json({ error: "Only providers can start bookings" });
      }

      const provider = await storage.getProviderByUserId(authReq.userId!);
      if (!provider) {
        return res.status(404).json({ error: "Provider profile not found" });
      }

      const booking = await storage.getBooking(req.params.id);
      if (!booking || booking.providerId !== provider.id) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.status !== 'accepted') {
        return res.status(400).json({ error: "Can only start accepted bookings" });
      }

      const updated = await storage.updateBooking(req.params.id, {
        status: 'in_progress'
      });

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/bookings/:id/complete", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const user = await storage.getUser(authReq.userId!);
      const booking = await storage.getBooking(req.params.id);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const canComplete = booking.customerId === authReq.userId || 
        (user?.role === 'provider' && (await storage.getProviderByUserId(authReq.userId!))?.id === booking.providerId);

      if (!canComplete) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (booking.status !== 'in_progress') {
        return res.status(400).json({ error: "Can only complete in-progress bookings" });
      }

      const updated = await storage.updateBooking(req.params.id, {
        status: 'completed'
      });

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/bookings/:id/cancel", authMiddleware, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const user = await storage.getUser(authReq.userId!);
      const booking = await storage.getBooking(req.params.id);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const isCustomer = booking.customerId === authReq.userId;
      const isAdmin = user?.role === 'admin';

      if (!isCustomer && !isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (isCustomer && booking.status !== 'pending') {
        return res.status(400).json({ error: "Customers can only cancel pending bookings" });
      }

      const updated = await storage.updateBooking(req.params.id, {
        status: 'cancelled'
      });

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
