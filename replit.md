# Hearthora - Service Provider Marketplace

A full-stack marketplace web application connecting customers with local service providers (UrbanPro clone).

## Overview

Hearthora is a professional marketplace platform that enables customers to find and hire local service providers across multiple categories including tutoring, home services, fitness, music & arts, and technology. The platform features inquiry-based quote requests, in-app messaging, provider profiles with ratings/reviews, comprehensive service listings with advanced filtering, AND Jiffy-style instant booking with fixed-price services.

## Recent Changes

**October 29, 2025 - Jiffy Instant Booking Integration (IN PROGRESS):**
- **Backend:** Complete - 23 Jiffy storage methods, 19 API endpoints, field whitelisting security
- **Frontend:** Complete - InstantBrowse, Addresses, MyBookings, PriceCards, Availability, Jobs pages
- **Seeding:** Complete - 6 price cards, 5 availability schedules, demo customer (2 addresses), 2 demo bookings
- **Bug Fixes:**
  - Fixed booking preview/creation API payload format (priceCardId + addOnNames)
  - Updated insertBookingSchema to omit providerId/durationMinutes (derived from priceCard)
  - Updated storage JOINs to include related data (priceCard, address, provider/customer)
  - Fixed route ordering - moved /provider/price-cards, /provider/availability, /provider/jobs BEFORE /provider/:id to prevent route collision
  - Added null-safe checks for customer/address fields in Jobs page
- **Testing:** Customer booking flow works end-to-end (browse → select → book → view MyBookings). Provider Jobs page loads and displays bookings. Testing provider accept/start/complete flow.

**October 29, 2025 - UrbanPro Replica Project (COMPLETE):**
- Design System & Tokens - UrbanPro color palette implemented
- Header/Navigation Component - Full UrbanPro header with all navigation
- Placeholder pages for 7 navigation items
- Bug fixes: Nested anchor tags, LSP type errors

**Previous (MVP - COMPLETE):**
- Complete MVP features: Home, Providers list, Provider Profile
- Database: PostgreSQL with Drizzle ORM, seeded with 5 categories, 5 providers, 7 services
- Backend: Session-based auth, CRUD operations, role-based access control
- Frontend: TanStack Query integration, loading/error/empty states
- Security: Session regeneration, sameSite cookies, bcrypt hashing
- Testing: Authentication flow, providers listing filters/sort

## Project Architecture

### Technology Stack
- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, Wouter (routing), TanStack Query
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with Drizzle ORM for persistence
- **Authentication:** Express-session with bcrypt password hashing
- **Forms:** react-hook-form + zodResolver with Drizzle insert schemas

### Database Schema (7 tables)
1. **users** - User accounts (customers, providers, admins)
2. **categories** - Service categories (tutoring, home services, fitness, music, technology)
3. **providers** - Provider profiles with ratings, skills, experience
4. **services** - Service listings with pricing, mode (online/in-person)
5. **inquiries** - Customer quote requests to providers
6. **messages** - In-app messaging between customers and providers
7. **reviews** - Customer reviews with ratings for providers

### API Routes
- **Authentication:** POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me
- **Categories:** GET /api/categories
- **Providers:** GET /api/providers (with filters), GET /api/providers/:id, PUT /api/providers/:id
- **Services:** GET /api/services (with filters), POST /api/services, PUT /api/services/:id, DELETE /api/services/:id
- **Inquiries:** GET /api/inquiries, POST /api/inquiries, PUT /api/inquiries/:id
- **Messages:** GET /api/messages/:inquiryId, POST /api/messages
- **Reviews:** GET /api/reviews/provider/:providerId, POST /api/reviews

### Frontend Pages
- **Home (/)** - Hero section with search, category chips, featured providers
- **Providers (/providers)** - Browse providers with filters (category, city, mode, price range, rating)
- **Provider Profile (/provider/:id)** - Provider details, services, reviews, quote request
- **Provider Dashboard (/dashboard/provider)** - Manage profile, services, inquiries, reviews
- **Login (/login)** - User authentication
- **Register (/register)** - New user registration (customer or provider role)
- **Placeholder Pages** - Ask & Answer, Success Stories, Paid Courses, Free Classes, Tuition Fees, Write Review, Help (coming soon pages with navigation back to home)

## User Preferences

### Design Guidelines
- Professional, trust-first marketplace UI inspired by Airbnb/Upwork/UrbanPro
- Inter font family throughout for clean, modern aesthetic
- Consistent spacing system: 16px (small), 24px (medium), 32px (large)
- Three-level text color hierarchy: default, secondary (muted), tertiary (very muted)
- Hover/active interactions using hover-elevate and active-elevate-2 utility classes
- No mock data in production paths - all data comes from backend APIs
- Comprehensive data-testid attributes on all interactive elements and meaningful displays

### Development Workflow
- Follow fullstack_js blueprint patterns
- Drizzle-first schema pattern with createInsertSchema for validation
- Forms using react-hook-form + zodResolver tied to shared schemas
- TanStack Query for all data fetching with proper cache invalidation
- Session-based authentication with security best practices (regeneration, sameSite cookies)

## Security

### Authentication Security
- **Password Hashing:** bcrypt with salt rounds = 10
- **Session Management:** 
  - express-session with httpOnly cookies
  - sameSite: 'lax' for CSRF protection
  - Session regeneration on login/register to prevent fixation attacks
  - 24-hour session lifetime
- **Role-Based Access Control:** Middleware validates user roles on protected endpoints
- **Validation:** Zod schemas validate all request bodies

### Production Recommendations
1. Set `app.set('trust proxy', 1)` for HTTPS behind load balancers
2. Use strong SESSION_SECRET environment variable
3. Consider adding CSRF tokens for additional defense-in-depth
4. Enable secure cookies in production (secure: true when NODE_ENV === 'production')

## Running the Project

The workflow "Start application" runs `npm run dev` which:
1. Starts Express server on port 5000
2. Starts Vite dev server for frontend
3. Seeds database with 5 categories, 5 providers (with ratings), and 7 services
4. Serves both frontend and backend on the same port

## Database Seeding

The database is automatically seeded on startup with:
- **5 Categories:** Tutoring & Education, Home Services, Fitness & Wellness, Music & Arts, Technology
- **5 Providers:** Sarah Johnson (Tutoring), Michael Chen (Home Services), Emily Rodriguez (Fitness), David Kim (Music), Lisa Patel (Technology)
- **Provider Ratings:** Realistic ratings (4.6-5.0) and rating counts (38-127 reviews)
- **7 Services:** Math Tutoring, SAT Prep, Plumbing, Personal Training, Yoga, Piano Lessons, Web Development
- **Provider Credentials:** All providers have username/email/password (password: "provider123")

## Testing

### E2E Test Coverage
- ✅ Complete authentication flow (register → login → logout → login)
- ✅ Form validation and error handling
- ✅ Session persistence across page loads
- ✅ User menu navigation and logout

### Test Data
All tests use dynamically generated unique data (nanoid) to avoid conflicts with existing data in the in-memory store.

## Future Enhancements
- Connect Providers page to fetch real data from /api/providers
- Implement TanStack Query for service listings, inquiries, and messages
- Add loading/error states throughout the application
- Implement provider dashboard functionality (add/edit/delete services)
- Add messaging interface between customers and providers
- Implement review submission and display
- Add image upload for provider profiles and services
- Implement admin dashboard for platform management
