# UrbanPro Design Guidelines

## Design Approach
**Reference-Based**: Exact replica of UrbanPro.com's visual identity and interaction patterns. Drawing from UrbanPro's trust-first marketplace design that emphasizes statistics, verification, and discovery through prominent search and category navigation.

## Core Design Principles
1. **Trust Through Numbers**: Prominently display statistics (7.5L+ Tutors, 55L+ Students, 4L+ Reviews)
2. **Discovery First**: Large search bar and category navigation as primary entry points
3. **Verification Visible**: Green verified badges and review counts build credibility
4. **Action Oriented**: Multiple CTAs throughout (Post Learning Need, Signup as Tutor)

---

## Color System

### Primary Palette
- **Primary Blue**: #0073E6 (or similar bright professional blue) - CTAs, links, brand elements, active states
- **Success Green**: #28A745 - Verified badges, success messages, checkmarks
- **Highlight Orange/Yellow**: #FF9500 - Featured items, countdown timers, rating stars
- **Background White**: #FFFFFF - Primary background
- **Section Gray**: #F7F8FA - Subtle section backgrounds for visual separation

### Text Hierarchy
- **Primary Text**: #1A1A1A - Headlines, provider names, important content
- **Secondary Text**: #555555 - Body text, descriptions
- **Muted Text**: #999999 - Labels, metadata, timestamps
- **Link Blue**: #0073E6 - Inherit from primary, hover: darken 10%

### UI Elements
- **Border Gray**: #E5E5E5 - Card borders, dividers
- **Input Border**: #CCCCCC - Form inputs, focus: Primary Blue
- **Shadow**: rgba(0,0,0,0.08) for card elevations
- **Star Gold**: #FFD700 - Rating stars

---

## Typography System

### Font Family
**Primary**: System sans-serif stack (Segoe UI, Roboto, Helvetica Neue, Arial) - matches UrbanPro's clean, professional typography

### Hierarchy
- **Hero Headline**: text-4xl md:text-5xl lg:text-6xl, font-bold, text-[#1A1A1A]
- **Statistics Numbers**: text-4xl md:text-5xl, font-bold, text-[#0073E6]
- **Page Titles**: text-3xl md:text-4xl, font-semibold
- **Section Headers**: text-2xl md:text-3xl, font-semibold
- **Card Titles**: text-lg md:text-xl, font-semibold
- **Body Large**: text-base md:text-lg
- **Body Standard**: text-sm md:text-base
- **Captions/Metadata**: text-xs md:text-sm, text-[#999999]
- **CTA Buttons**: text-base font-semibold, uppercase tracking-wide

---

## Spacing System
**Tailwind Units**: 2, 4, 6, 8, 12, 16, 20, 24

- **Component Padding**: p-4 md:p-6 for cards
- **Section Spacing**: py-12 md:py-20 lg:py-24
- **Grid Gaps**: gap-4 md:gap-6
- **Form Spacing**: space-y-4
- **Button Padding**: px-8 py-3 for primary CTAs, px-6 py-2.5 for secondary

---

## Layout Architecture

### Container Strategy
- **Full-width sections**: w-full with inner max-w-7xl mx-auto px-4 md:px-6 lg:px-8
- **Content sections**: max-w-6xl mx-auto
- **Narrow forms**: max-w-2xl

### Grid Systems
- **Tutor Cards**: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
- **Category Cards**: grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4
- **Featured Sections**: grid grid-cols-1 lg:grid-cols-2 gap-8

---

## Component Library

### Header Navigation
**Sticky header** (h-16 md:h-20) with shadow on scroll
- **Layout**: Logo (left) + Primary Nav Links (center) + "Post Learning Need" button (orange) + "Signup as Tutor" button (blue outline) + Login link (right)
- **Mobile**: Hamburger menu, sticky header with logo + menu icon
- **Background**: White with border-b border-[#E5E5E5]

### Hero Section
**Height**: min-h-[550px] md:min-h-[650px] - NOT full viewport
**Layout**: Centered content on gradient or image background
- **Headline**: "Find Best Tutors & Institutes Near You" style, large and bold
- **Search Bar**: max-w-4xl, prominent with shadow-lg
  - Combined inputs: "Looking for" dropdown + "Location" input + "Search" button (bright blue)
  - Background: white, rounded-lg, p-2, individual inputs with subtle borders
- **Trust Statistics Row**: Below search, flex layout with 3-4 stat boxes
  - Format: Large blue number + small label ("7.5L+ Tutors", "55L+ Students", "4L+ Reviews")
- **Buttons on Image**: backdrop-blur-sm bg-white/90 treatment for legibility

### Statistics Section
**Prominent placement** below hero or as dedicated section
- **Layout**: Grid 3-4 columns, centered
- **Style**: Each stat card with icon, large blue number, description
- **Background**: Light gray section (bg-[#F7F8FA])

### Category Navigation
**Horizontal scrollable chips** below header or in dedicated section
- **Style**: Pill buttons with icons, white background, border, hover: blue border
- **Layout**: flex gap-3, horizontal scroll on mobile
- **Categories**: Tuition, Dance Classes, Yoga, Music, Cooking, etc. with representative icons

### Tutor/Provider Cards
**Aspect ratio card** with hover shadow elevation
- **Top**: Square photo (aspect-square, rounded-t-lg)
- **Content (p-4 md:p-6)**:
  - Name (text-lg font-semibold) + Verified badge (green checkmark icon)
  - Subject/Specialization tags (blue text, small)
  - Star rating (gold stars) + review count "(127 reviews)"
  - Experience: "10+ years" with icon
  - Hourly rate (text-lg font-semibold, blue) or "View Profile"
  - Location with pin icon
  - "Contact" button (full-width, blue)
- **Border**: border border-[#E5E5E5], hover: shadow-lg transition

### Category Cards
**Icon-based cards** for browsing categories
- **Layout**: Centered icon + category name + tutor count
- **Background**: White with subtle hover lift
- **Grid**: 2 columns mobile, 4-6 columns desktop

### Trust Badges & Verification
**Verified Badge**: Green circle with white checkmark, placed next to tutor names
**Featured Badge**: Orange "Featured" label or star icon on premium listings
**Review Count**: Always visible alongside ratings

### Featured Tutors Section
**Carousel or grid** with "Featured Tutors" heading
- Highlight cards: Yellow/orange accent border or badge
- Enhanced card design with more details visible

### Testimonials Section
**Carousel layout** with student testimonials
- **Card Style**: White background, shadow, quote icon
- **Content**: Student photo (small, rounded-full), name, rating, testimonial text
- **Controls**: Dots or arrows for navigation
- **Background**: Light gray section for contrast

### Live Classes Section
**Grid of upcoming classes** with countdown timers
- **Card Elements**: Class thumbnail, instructor photo, title, time remaining (orange countdown), price, "Enroll Now" CTA
- **Timer Style**: Orange background, white text, prominent

### Post Learning Need CTA
**Floating or prominent CTA** encouraging customers to post requirements
- **Style**: Orange background, white text, large button
- **Placement**: Header + floating bottom-right + dedicated sections
- **Text**: "Post Your Learning Requirement" or similar

### Footer
**Multi-section layout**: 
- **Top Row**: 4-5 columns (Popular Categories, Top Cities, Company Info, Resources, Contact)
- **Middle Row**: Trust badges, payment icons, social media links
- **Bottom Bar**: Copyright, Terms, Privacy links
- **Background**: Dark gray (#2C3E50) with white text for contrast

### Forms (Contact, Signup)
**Style**: 
- Labels: text-sm font-medium mb-1.5
- Inputs: h-12, rounded border border-[#CCCCCC], focus:border-[#0073E6] focus:ring-2 focus:ring-[#0073E6]/20
- Primary buttons: bg-[#0073E6] text-white hover:bg-[#0062CC]
- Secondary buttons: border border-[#0073E6] text-[#0073E6] hover:bg-[#0073E6]/5

### Rating Display
**Gold stars** (#FFD700) with half-star support
- Format: "★★★★★ 4.8 (127)"
- Size variations: Small (cards), Large (profiles)

---

## Images

### Hero Section
**Large hero image**: Wide professional photo showing diverse tutors/students in learning environments (classroom settings, online tutoring, music lessons, yoga classes). Overlay with gradient (dark to transparent bottom-to-top) for text legibility.

### Category Cards
**Icon-based**: Use simple line icons for each category, no photos needed.

### Tutor Cards
**Headshot photos**: Professional square photos (1:1 ratio), rounded corners.

### Testimonial Section
**Student photos**: Small circular photos (rounded-full) accompanying testimonials.

### Live Classes Section
**Class thumbnails**: Landscape photos (16:9) showing class activities or instructor in action.

---

## Animations
**Minimal and purposeful**:
- Card hover: shadow elevation (shadow-md to shadow-xl)
- Button hover: subtle scale (scale-105) or background darken
- Carousel: Smooth slide transitions
- NO scroll-triggered animations or parallax

---

## Accessibility
- ARIA labels on all interactive elements
- Visible focus states: ring-2 ring-[#0073E6] ring-offset-2
- Semantic HTML structure
- Alt text for all tutor photos and images
- Proper label-input associations
- Color contrast meeting WCAG AA standards