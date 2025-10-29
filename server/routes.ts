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
  insertReviewSchema
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

  const httpServer = createServer(app);
  return httpServer;
}
