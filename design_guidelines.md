# Hearthora Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from established marketplace leaders - Airbnb (trust-building, search patterns), Upwork (provider profiles, service listings), and UrbanPro (quote flow). This creates familiar patterns that reduce friction while establishing credibility in the competitive service marketplace space.

## Core Design Principles
1. **Trust First**: Every design decision reinforces provider credibility and platform reliability
2. **Discovery Focused**: Make finding the right provider effortless through clear information hierarchy
3. **Conversation Ready**: Streamline the path from browsing to inquiry submission
4. **Professional Polish**: Maintain sophistication that appeals to both customers and service professionals

---

## Typography System

### Font Families
- **Primary (Headings)**: Inter (weights: 400, 500, 600, 700) - Clean, professional, excellent for marketplace UI
- **Secondary (Body)**: Inter (weights: 400, 500) - Unified type system for cohesion
- **Accent (Stats/Numbers)**: Inter (weight: 600-700) - Emphasize ratings and pricing

### Hierarchy
- **Hero Headline**: text-5xl md:text-6xl, font-bold, tracking-tight
- **Page Titles**: text-3xl md:text-4xl, font-semibold
- **Section Headers**: text-2xl md:text-3xl, font-semibold
- **Card Titles**: text-xl font-semibold
- **Body Large**: text-lg, font-normal
- **Body Standard**: text-base, font-normal
- **Body Small**: text-sm, font-normal
- **Captions/Metadata**: text-xs md:text-sm, font-medium, uppercase tracking-wide for labels

---

## Spacing System
**Tailwind Units**: Maintain consistency using **2, 4, 6, 8, 12, 16, 20, 24** as primary spacing values.

- **Component Padding**: p-4 to p-8 for cards/containers
- **Section Spacing**: py-16 md:py-24 for major sections
- **Grid Gaps**: gap-4 md:gap-6 lg:gap-8 for card grids
- **Form Fields**: space-y-4 for form groups, gap-3 for inline elements
- **Button Padding**: px-6 py-3 for primary, px-4 py-2 for secondary

---

## Layout Architecture

### Container Strategy
- **Full-width sections**: w-full with inner max-w-7xl mx-auto px-4 md:px-6
- **Content sections**: max-w-6xl mx-auto
- **Narrow content**: max-w-4xl for provider bios, service descriptions

### Grid Systems
- **Provider Cards**: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- **Service Listings**: grid grid-cols-1 lg:grid-cols-2 gap-6 (larger cards with more detail)
- **Category Chips**: flex flex-wrap gap-3 for horizontal scrollable categories
- **Dashboard Layout**: Two-column split with sidebar navigation (w-64) + main content (flex-1)

---

## Component Library

### Navigation
**Main Header**: Sticky top navigation with elevation shadow
- Logo + Search Bar (centered, prominent) + Auth CTA/User Menu
- Mobile: Hamburger menu, search accessible via icon
- Height: h-16 md:h-20

**Category Navigation**: Horizontal scrollable pill buttons below header
- Pill style with icons, active state with subtle emphasis
- Smooth horizontal scroll on mobile

### Hero Section (Homepage)
**Layout**: Full-width with overlay treatment
- Height: min-h-[500px] md:min-h-[600px] - not full viewport
- Centered content: Search bar + headline + subheadline
- **Background**: Large hero image (professionals working, service scenarios, diverse providers)
- Search bar: max-w-3xl, elevated with shadow, includes category dropdown + location input + search button
- Buttons on image: backdrop-blur-sm bg-white/90 treatment

**Images Section**: 
- Hero background: Wide professional photo showing service providers in action (tutors teaching, handymen working, professionals consulting) - conveys trust and activity
- Category cards: Icon-based, no images needed
- Provider cards: Headshot photos (square, rounded)
- Service cards: Service/work photos (landscape 16:9 ratio)

### Search & Filters (Provider List Page)
**Sidebar Filters** (Desktop): w-64, sticky positioning
- Stacked filter groups with subtle borders
- Category dropdown, City input, Mode toggle (Online/In-person), Rating stars, Price range slider
- Apply/Clear buttons at bottom

**Mobile Filters**: Bottom sheet modal triggered by "Filters" button
- Same filter structure in scrollable modal
- Sticky apply button at bottom

**Results Grid**: Displays provider cards with relevance sorting

### Provider Card
**Layout**: Aspect ratio card with hover elevation
- Top: Square photo (aspect-square, rounded-lg overflow-hidden)
- Content padding: p-6
- Name (text-xl font-semibold), Skills tags (flex flex-wrap gap-2, badge style)
- Star rating + review count, Hourly rate (prominent, font-semibold), City with location icon
- Bottom: "View Profile" button (full-width, subtle style)

### Service Card  
**Layout**: Horizontal split on desktop, stacked on mobile
- Left: Landscape service photo (aspect-video, w-64 on desktop)
- Right: Title, Provider name (linked), Price, Mode badge, Rating, Category tag
- Description preview (2-3 lines, text-ellipsis)
- "Request Quote" CTA button

### Provider Profile Page
**Layout**: Multi-section vertical flow
1. **Profile Header**: Grid layout (lg:grid-cols-3 gap-8)
   - Left: Large profile photo (rounded-full, size-32 md:size-48)
   - Center-Right: Name, Bio, Skills tags, Experience years, Rating summary
   - Right: Contact card with hourly rate, location, "Request Quote" CTA
   
2. **Services Section**: Grid of service cards
   
3. **Reviews Section**: Stacked review cards with star ratings, customer names, dates, comments

### Service Detail Page
**Layout**: Two-column desktop (lg:grid-cols-3)
- Main (col-span-2): Photo gallery (primary large image + thumbnails grid), Full description, Provider mini-card
- Sidebar (col-span-1): Sticky pricing card with "Request Quote" form preview (message textarea + submit)

### Inquiry/Quote Modal
**Design**: Centered modal (max-w-2xl)
- Service title reference at top
- Message textarea (rows-6)
- Submit button with clear CTA text
- Success state: Confirmation with link to messages

### Messaging Interface (Dashboard)
**Layout**: Three-column structure
- Left (w-80): Inquiry list with unread indicators
- Center (flex-1): Message thread with bubble chat UI
- Right (w-64): Inquiry details card (service reference, status, quote actions)

### Dashboard Navigation
**Sidebar**: Fixed width (w-64), vertical nav links with icons
- Sections: My Profile, My Services, Inquiries, Reviews (provider), All Providers/Categories/Reviews (admin)
- Active state with subtle background highlight

### Forms
**Styling**: Consistent input treatment
- Labels: text-sm font-medium mb-2
- Inputs: h-12, rounded-lg, border focus:ring treatment
- Textareas: min-h-32
- Buttons: Consistent padding (px-6 py-3), rounded-lg
- Error states: Red border + error text below field

### Trust Signals
**Rating Display**: Consistent star visualization
- Filled/empty star icons (gold filled stars)
- Number format: "4.8 (127 reviews)"
- Prominent placement on all provider/service cards

**Verification Badges**: Small badge icons next to provider names where applicable
**Review Cards**: Avatar + name + rating + date + comment text, subtle border separation

### Footer
**Multi-column layout**: 4 columns on desktop, stacked on mobile
- Column 1: Logo + tagline
- Column 2: Browse (Categories, All Providers, How It Works)
- Column 3: For Providers (Become a Provider, Provider Login, Resources)
- Column 4: Company (About, Contact, Terms, Privacy)
- Bottom bar: Copyright + social icons

---

## Animations
Use sparingly and purposefully:
- Hover elevations on cards (translate-y-1 shadow-lg transition)
- Button hover states (subtle scale or opacity shifts)
- Modal entry/exit (fade + scale)
- NO scroll-triggered animations, parallax, or complex transitions

---

## Accessibility
- Maintain ARIA labels on all interactive elements
- Focus states with visible outlines (ring-2 ring-offset-2)
- Semantic HTML structure
- Alt text for all provider photos and service images
- Form labels properly associated with inputs