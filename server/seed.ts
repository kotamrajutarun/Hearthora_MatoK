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
        {
          name: 'Tutoring & Education',
          description: 'Academic tutoring, test prep, language learning'
        },
        {
          name: 'Home Services',
          description: 'Plumbing, electrical, cleaning, repairs'
        },
        {
          name: 'Fitness & Wellness',
          description: 'Personal training, yoga, nutrition coaching'
        },
        {
          name: 'Music & Arts',
          description: 'Music lessons, art classes, creative workshops'
        },
        {
          name: 'Technology',
          description: 'Web development, IT support, software training'
        }
      ];

      categories = [];
      for (const category of categoryData) {
        const created = await storage.createCategory(category);
        categories.push(created);
      }

      console.log('Database seeded with 5 categories');
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
