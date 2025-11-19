import { storage } from './storage';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    // Check if basic data (categories) exists
    const existingCategories = await storage.getAllCategories();
    const shouldSeedBasicData = existingCategories.length === 0;

    let categories = existingCategories;
    let users: any[] = [];
    let createdProviders: any[] = [];

    if (shouldSeedBasicData) {
      const categoryData = [
        { name: 'Tutoring & Education', description: 'Academic tutoring, test prep, language learning', icon_url: '/icons/categories/Tutoring & Education.png' },
        { name: 'Music & Dance Classes', description: 'Music lessons, dance training, performance arts', icon_url: '/icons/categories/Music & Dance Classes.png' },
        { name: 'Language Classes', description: 'English, foreign languages, conversation practice', icon_url: '/icons/categories/Language Classes.png' },
        { name: 'Art & Craft Classes', description: 'Painting, drawing, crafts, creative workshops', icon_url: '/icons/categories/Art & Craft Classes.png' },
        { name: 'Yoga & Fitness Training', description: 'Yoga, personal training, fitness coaching', icon_url: '/icons/categories/Yoga & Fitness Training.png' },
        { name: 'Health & Wellness Therapies', description: 'Massage, physiotherapy, wellness treatments', icon_url: '/icons/categories/Health & Wellness Therapies.png' },
        { name: 'Personal Coaching & Life Skills', description: 'Life coaching, career guidance, skill development', icon_url: '/icons/categories/Personal Coaching & Life Skills.png' },
        { name: 'Plumbing', description: 'Pipe repair, leak fixing, bathroom & kitchen plumbing', icon_url: '/icons/categories/Plumbing.png' },
        { name: 'Electrical Work', description: 'Wiring, fixture installation, electrical repairs', icon_url: '/icons/categories/Electrical Work.png' },
        { name: 'Cleaning & Deep Cleaning', description: 'House cleaning, deep cleaning, sanitization', icon_url: '/icons/categories/Cleaning & Deep Cleaning.png' },
        { name: 'Home Repairs & Handyman', description: 'General repairs, maintenance, odd jobs', icon_url: '/icons/categories/Home Repairs & Handyman.png' },
        { name: 'Carpentry & Furniture Assembly', description: 'Furniture making, repairs, assembly services', icon_url: '/icons/categories/Carpentry & Furniture Assembly.png' },
        { name: 'Painting & Polishing', description: 'Interior/exterior painting, wall finishing, polishing', icon_url: '/icons/categories/Painting & Polishing.png' },
        { name: 'Pest Control', description: 'Termite treatment, pest removal, fumigation', icon_url: '/icons/categories/Pest Control.png' },
        { name: 'Appliance Repair', description: 'Washing machine, refrigerator, AC repair', icon_url: '/icons/categories/Appliance Repair.png' },
        { name: 'AC Installation & Maintenance', description: 'Air conditioner installation, repair, servicing', icon_url: '/icons/categories/AC Installation & Maintenance.png' },
        { name: 'Gardening & Lawn Care', description: 'Garden maintenance, landscaping, lawn mowing', icon_url: '/icons/categories/Gardening & Lawn Care.png' },
        { name: 'Home Security & CCTV Installation', description: 'Security systems, CCTV setup, smart locks', icon_url: '/icons/categories/Home Security & CCTV Installation.png' },
        { name: 'Home Sanitization & Disinfection', description: 'Deep sanitization, disinfection services', icon_url: '/icons/categories/Home Sanitization & Disinfection.png' },
        { name: 'IT Support & Computer Repair', description: 'Computer repair, software installation, tech support', icon_url: '/icons/categories/IT Support & Computer Repair.png' },
        { name: 'Tech & Digital Services', description: 'Web development, app development, digital marketing', icon_url: '/icons/categories/Tech & Digital Services.png' },
        { name: 'Mobile & Gadget Repair', description: 'Phone repair, tablet repair, gadget servicing', icon_url: '/icons/categories/Mobile & Gadget Repair.png' },
        { name: 'Beauty & Makeup', description: 'Makeup services, hair styling, beauty treatments', icon_url: '/icons/categories/Beauty & Makeup.png' },
        { name: 'Mehndi & Henna Art', description: 'Bridal mehndi, henna design, traditional art', icon_url: '/icons/categories/Mehndi & Henna Art.png' },
        { name: 'Photography & Videography', description: 'Event photography, video production, photo editing', icon_url: '/icons/categories/Photography & Videography.png' },
        { name: 'Event Planning & Decoration', description: 'Party planning, decoration, event management', icon_url: '/icons/categories/Event Planning & Decoration.png' },
        { name: 'Catering & Baking', description: 'Catering services, cake making, custom baking', icon_url: '/icons/categories/Catering & Baking.png' },
        { name: 'Home Cook & Tiffin Service', description: 'Home-cooked meals, tiffin delivery, meal prep', icon_url: '/icons/categories/Home Cook & Tiffin Service.png' },
        { name: 'Child & Elder Care', description: 'Babysitting, nanny services, elder care', icon_url: '/icons/categories/Child & Elder Care.png' },
        { name: 'Pet Care & Grooming', description: 'Dog walking, pet grooming, pet sitting', icon_url: '/icons/categories/Pet Care & Grooming.png' },
        { name: 'Laundry & Ironing', description: 'Laundry services, dry cleaning, ironing', icon_url: '/icons/categories/Laundry & Ironing.png' },
        { name: 'Tailoring & Alterations', description: 'Clothing alterations, stitching, custom tailoring', icon_url: '/icons/categories/Tailoring & Alterations.png' },
        { name: 'Driving & Vehicle Services', description: 'Driver services, car wash, vehicle maintenance', icon_url: '/icons/categories/Driving & Vehicle Services.png' },
        { name: 'Moving & Packing', description: 'Relocation services, packing, moving assistance', icon_url: '/icons/categories/Moving & Packing.png' },
        { name: 'Legal & Immigration', description: 'Legal consultation, immigration services, documentation', icon_url: '/icons/categories/Legal & Immigration.png' },
        { name: 'Accounting & Tax Services', description: 'Bookkeeping, tax filing, financial consulting', icon_url: '/icons/categories/Accounting & Tax Services.png' },
        { name: 'Real Estate & Interior', description: 'Property consulting, interior design, home staging', icon_url: '/icons/categories/Real Estate & Interior.png' },
        { name: 'Workshops & Community Classes', description: 'Skill workshops, community learning, group classes', icon_url: '/icons/categories/Workshops & Community Classes.png' },
        { name: 'Others', description: 'Other services not listed in categories', icon_url: '/icons/categories/Others.png' }
      ];

      categories = [];
      for (const category of categoryData) {
        const created = await storage.createCategory(category);
        categories.push(created);
      }

      console.log('Database seeded with 39 categories');
    }

    const hashedPassword = await bcrypt.hash('provider123', 10);

    if (shouldSeedBasicData) {

      const providerUsers = [
        {
          username: 'sarah_johnson',
          email: 'sarah.johnson@example.com',
          password: hashedPassword,
          role: 'provider' as const,
          firstName: 'Sarah',
          lastName: 'Johnson'
        },
        {
          username: 'michael_chen',
          email: 'michael.chen@example.com',
          password: hashedPassword,
          role: 'provider' as const,
          firstName: 'Michael',
          lastName: 'Chen'
        },
        {
          username: 'emily_rodriguez',
          email: 'emily.rodriguez@example.com',
          password: hashedPassword,
          role: 'provider' as const,
          firstName: 'Emily',
          lastName: 'Rodriguez'
        },
        {
          username: 'david_kim',
          email: 'david.kim@example.com',
          password: hashedPassword,
          role: 'provider' as const,
          firstName: 'David',
          lastName: 'Kim'
        },
        {
          username: 'lisa_patel',
          email: 'lisa.patel@example.com',
          password: hashedPassword,
          role: 'provider' as const,
          firstName: 'Lisa',
          lastName: 'Patel'
        }
      ];

      for (const userData of providerUsers) {
        const user = await storage.createUser(userData);
        users.push(user);
      }

      const providers = [
        {
          userId: users[0].id,
          categoryId: categories[0].id,
          firstName: 'Sarah',
          lastName: 'Johnson',
          city: 'New York',
          hourlyRate: 60,
          experienceYears: 8,
          skills: ['Math', 'Physics', 'SAT Prep'],
          bio: 'Experienced math and physics tutor with 8 years of helping students achieve their academic goals. Specializing in SAT prep and advanced mathematics.',
          photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
        },
      {
        userId: users[1].id,
        categoryId: categories[1].id,
        firstName: 'Michael',
        lastName: 'Chen',
        city: 'Los Angeles',
        hourlyRate: 85,
        experienceYears: 12,
        skills: ['Home Repair', 'Plumbing', 'Electrical'],
        bio: 'Licensed contractor with 12 years of experience in home repairs, plumbing, and electrical work. Committed to quality craftsmanship.',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
      },
      {
        userId: users[2].id,
        categoryId: categories[2].id,
        firstName: 'Emily',
        lastName: 'Rodriguez',
        city: 'Chicago',
        hourlyRate: 50,
        experienceYears: 6,
        skills: ['Yoga', 'Pilates', 'Personal Training'],
        bio: 'Certified yoga instructor and personal trainer passionate about helping clients achieve their fitness goals through mindful movement.',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
      },
      {
        userId: users[3].id,
        categoryId: categories[3].id,
        firstName: 'David',
        lastName: 'Kim',
        city: 'Austin',
        hourlyRate: 55,
        experienceYears: 10,
        skills: ['Piano', 'Music Theory', 'Guitar'],
        bio: 'Professional musician and music educator with 10 years of teaching experience. Specializing in piano, guitar, and music theory.',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
      },
      {
        userId: users[4].id,
        categoryId: categories[4].id,
        firstName: 'Lisa',
        lastName: 'Patel',
        city: 'San Francisco',
        hourlyRate: 95,
        experienceYears: 7,
        skills: ['Web Development', 'React', 'Node.js'],
        bio: 'Full-stack developer with 7 years of experience building modern web applications. Specializing in React, Node.js, and cloud technologies.',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa'
        }
      ];

      for (const providerData of providers) {
        const created = await storage.createProvider(providerData);
        createdProviders.push(created);
      }

      const seedRatings = [4.9, 4.8, 5.0, 4.7, 4.6];
      const seedRatingCounts = [127, 94, 68, 52, 38];
      
      for (let i = 0; i < createdProviders.length; i++) {
        await storage.updateProvider(createdProviders[i].id, {
          ratingAvg: seedRatings[i],
          ratingCount: seedRatingCounts[i]
        });
      }

      const services = [
        {
          title: 'High School Math Tutoring',
        description: 'Comprehensive tutoring for algebra, geometry, and calculus. Personalized lesson plans tailored to your learning style.',
        categoryId: categories[0].id,
        providerId: createdProviders[0].id,
        price: 60,
        mode: 'online' as const,
        active: true,
      },
      {
        title: 'SAT/ACT Preparation',
        description: 'Intensive test prep focusing on math and critical reading sections. Proven strategies to boost your score.',
        categoryId: categories[0].id,
        providerId: createdProviders[0].id,
        price: 75,
        mode: 'in-person' as const,
        city: 'New York',
        active: true,
      },
      {
        title: 'Residential Plumbing Services',
        description: 'Expert plumbing services for your home. From leaks to installations, we handle it all.',
        categoryId: categories[1].id,
        providerId: createdProviders[1].id,
        price: 95,
        mode: 'in-person' as const,
        city: 'Los Angeles',
        active: true,
      },
      {
        title: 'Personal Training Sessions',
        description: 'One-on-one fitness training tailored to your goals. Strength, cardio, and nutrition guidance included.',
        categoryId: categories[2].id,
        providerId: createdProviders[2].id,
        price: 70,
        mode: 'in-person' as const,
        city: 'Chicago',
        active: true,
      },
      {
        title: 'Online Yoga Classes',
        description: 'Live online yoga sessions for all levels. Flexibility, strength, and mindfulness combined.',
        categoryId: categories[2].id,
        providerId: createdProviders[2].id,
        price: 50,
        mode: 'online' as const,
        active: true,
      },
      {
        title: 'Piano Lessons',
        description: 'Learn piano from beginner to advanced. Classical and contemporary styles covered.',
        categoryId: categories[3].id,
        providerId: createdProviders[3].id,
        price: 65,
        mode: 'in-person' as const,
        city: 'Houston',
        active: true,
      },
      {
        title: 'Web Development Course',
        description: 'Complete web development training. HTML, CSS, JavaScript, React, and Node.js.',
        categoryId: categories[4].id,
        providerId: createdProviders[4].id,
        price: 85,
        mode: 'online' as const,
          active: true,
        },
      ];

      for (const service of services) {
        await storage.createService(service);
      }

      console.log('Database seeded with 5 providers, ratings, and 7 services');
    } else {
      // If basic data exists, fetch providers for Jiffy seeding
      const allProviders = await storage.getAllProviders({});
      createdProviders = allProviders.slice(0, 5);
    }

    // ===== JIFFY-STYLE DATA =====
    // Check if Jiffy data already exists
    const existingPriceCards = await storage.getPublicPriceCards({});
    if (existingPriceCards.length > 0) {
      console.log('Jiffy data already seeded');
      return;
    }
    
    // Create Price Cards (fixed-price instant booking tasks)
    const priceCards = [
      {
        providerId: createdProviders[0].id,
        serviceId: null,
        title: '1-Hour Math Tutoring Session',
        category: 'Tutoring & Education',
        city: 'New York',
        description: 'One-on-one math tutoring session covering algebra, geometry, or calculus. Perfect for homework help or test prep.',
        basePrice: 60,
        addOns: [
          { name: 'Extra 30 minutes', price: 25 },
          { name: 'Practice materials', price: 10 }
        ],
        durationMinutes: 60,
        isActive: true
      },
      {
        providerId: createdProviders[1].id,
        serviceId: null,
        title: 'Leaky Faucet Repair',
        category: 'Home Services',
        city: 'Los Angeles',
        description: 'Quick fix for dripping or leaking faucets. Includes diagnosis and repair of common faucet issues.',
        basePrice: 95,
        addOns: [
          { name: 'Parts replacement', price: 40 },
          { name: 'Same-day service', price: 25 }
        ],
        durationMinutes: 45,
        isActive: true
      },
      {
        providerId: createdProviders[1].id,
        serviceId: null,
        title: 'Toilet Repair Service',
        category: 'Home Services',
        city: 'Los Angeles',
        description: 'Repair running toilets, replace flappers, fix fill valves, and resolve other common toilet issues.',
        basePrice: 85,
        addOns: [
          { name: 'Flapper replacement', price: 15 },
          { name: 'Fill valve replacement', price: 30 }
        ],
        durationMinutes: 60,
        isActive: true
      },
      {
        providerId: createdProviders[2].id,
        serviceId: null,
        title: '45-Min Personal Training',
        category: 'Fitness & Wellness',
        city: 'Chicago',
        description: 'Personalized training session focused on your fitness goals. Includes warm-up, workout, and cool-down.',
        basePrice: 65,
        addOns: [
          { name: 'Nutrition consultation', price: 20 },
          { name: 'Progress tracking app', price: 15 }
        ],
        durationMinutes: 45,
        isActive: true
      },
      {
        providerId: createdProviders[3].id,
        serviceId: null,
        title: 'Beginner Piano Lesson',
        category: 'Music & Arts',
        city: 'Austin',
        description: 'Introduction to piano for beginners. Learn basic techniques, reading music, and simple songs.',
        basePrice: 55,
        addOns: [
          { name: 'Music book', price: 18 },
          { name: 'Extended to 60 min', price: 20 }
        ],
        durationMinutes: 45,
        isActive: true
      },
      {
        providerId: createdProviders[4].id,
        serviceId: null,
        title: 'Website Bug Fix (1 Hour)',
        category: 'Technology',
        city: 'San Francisco',
        description: 'Quick debugging and fixes for your website. HTML, CSS, JavaScript issues resolved.',
        basePrice: 95,
        addOns: [
          { name: 'Additional hour', price: 90 },
          { name: 'Urgent priority', price: 50 }
        ],
        durationMinutes: 60,
        isActive: true
      }
    ];

    const createdPriceCards = [];
    for (const priceCard of priceCards) {
      const created = await storage.createPriceCard(priceCard);
      createdPriceCards.push(created);
    }

    console.log('Created 6 price cards for instant booking');

    // Create Availability Schedules for providers
    const availabilities = [
      {
        providerId: createdProviders[0].id,
        weekly: [
          { day: 1, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
          { day: 2, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
          { day: 3, slots: [{ start: '09:00', end: '12:00' }] },
          { day: 4, slots: [{ start: '14:00', end: '20:00' }] },
          { day: 5, slots: [{ start: '10:00', end: '16:00' }] }
        ],
        exceptions: []
      },
      {
        providerId: createdProviders[1].id,
        weekly: [
          { day: 0, slots: [{ start: '08:00', end: '17:00' }] },
          { day: 1, slots: [{ start: '08:00', end: '17:00' }] },
          { day: 2, slots: [{ start: '08:00', end: '17:00' }] },
          { day: 3, slots: [{ start: '08:00', end: '17:00' }] },
          { day: 4, slots: [{ start: '08:00', end: '17:00' }] },
          { day: 5, slots: [{ start: '09:00', end: '14:00' }] }
        ],
        exceptions: []
      },
      {
        providerId: createdProviders[2].id,
        weekly: [
          { day: 1, slots: [{ start: '06:00', end: '11:00' }, { start: '17:00', end: '20:00' }] },
          { day: 2, slots: [{ start: '06:00', end: '11:00' }, { start: '17:00', end: '20:00' }] },
          { day: 3, slots: [{ start: '06:00', end: '11:00' }, { start: '17:00', end: '20:00' }] },
          { day: 4, slots: [{ start: '06:00', end: '11:00' }, { start: '17:00', end: '20:00' }] },
          { day: 6, slots: [{ start: '08:00', end: '14:00' }] }
        ],
        exceptions: []
      },
      {
        providerId: createdProviders[3].id,
        weekly: [
          { day: 1, slots: [{ start: '14:00', end: '21:00' }] },
          { day: 2, slots: [{ start: '14:00', end: '21:00' }] },
          { day: 3, slots: [{ start: '14:00', end: '21:00' }] },
          { day: 5, slots: [{ start: '10:00', end: '18:00' }] },
          { day: 6, slots: [{ start: '10:00', end: '16:00' }] }
        ],
        exceptions: []
      },
      {
        providerId: createdProviders[4].id,
        weekly: [
          { day: 1, slots: [{ start: '09:00', end: '18:00' }] },
          { day: 2, slots: [{ start: '09:00', end: '18:00' }] },
          { day: 3, slots: [{ start: '09:00', end: '18:00' }] },
          { day: 4, slots: [{ start: '09:00', end: '18:00' }] },
          { day: 5, slots: [{ start: '10:00', end: '15:00' }] }
        ],
        exceptions: []
      }
    ];

    for (const availability of availabilities) {
      await storage.setAvailability(availability);
    }

    console.log('Created availability schedules for 5 providers');

    // Create demo customer user
    const customerUser = await storage.createUser({
      username: 'john_customer',
      email: 'john.customer@example.com',
      password: hashedPassword,
      role: 'customer',
      firstName: 'John',
      lastName: 'Customer'
    });

    // Create addresses for demo customer
    const addresses = [
      {
        userId: customerUser.id,
        label: 'Home',
        line1: '123 Main Street',
        line2: 'Apt 4B',
        city: 'New York',
        postalCode: '10001',
        lat: 40.7484,
        lng: -73.9857,
        isDefault: true
      },
      {
        userId: customerUser.id,
        label: 'Office',
        line1: '456 Business Ave',
        line2: 'Suite 200',
        city: 'New York',
        postalCode: '10002',
        lat: 40.7589,
        lng: -73.9851,
        isDefault: false
      }
    ];

    const createdAddresses = [];
    for (const address of addresses) {
      const created = await storage.createAddress(address);
      createdAddresses.push(created);
    }

    console.log('Created demo customer with 2 addresses');

    // Create demo bookings
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(10, 0, 0, 0);

    const bookings = [
      {
        customerId: customerUser.id,
        providerId: createdProviders[0].id,
        priceCardId: createdPriceCards[0].id,
        addressId: createdAddresses[0].id,
        scheduledAt: tomorrow,
        durationMinutes: 60,
        addOns: [{ name: 'Practice materials', price: 10 }],
        bookingRef: 'DEMO0001',
        subtotal: 70,
        tax: 0,
        total: 70,
        notes: 'Please focus on algebra equations'
      },
      {
        customerId: customerUser.id,
        providerId: createdProviders[1].id,
        priceCardId: createdPriceCards[1].id,
        addressId: createdAddresses[0].id,
        scheduledAt: nextWeek,
        durationMinutes: 45,
        addOns: [],
        bookingRef: 'DEMO0002',
        subtotal: 95,
        tax: 0,
        total: 95,
        notes: 'Kitchen sink is dripping'
      }
    ];

    for (const booking of bookings) {
      await storage.createBooking(booking);
    }

    console.log('Created 2 demo bookings (1 for tomorrow, 1 for next week)');
    console.log('=== JIFFY-STYLE SEEDING COMPLETE ===');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
