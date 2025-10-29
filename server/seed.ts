import { storage } from './storage';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    // Check if categories already exist
    const existingCategories = await storage.getAllCategories();
    if (existingCategories.length > 0) {
      console.log('Database already seeded');
      return;
    }

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

    const categories = [];
    for (const category of categoryData) {
      const created = await storage.createCategory(category);
      categories.push(created);
    }

    console.log('Database seeded with 5 categories');

    const hashedPassword = await bcrypt.hash('provider123', 10);

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

    const users = [];
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

    const createdProviders = [];
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

    console.log('Database seeded with 5 providers and ratings');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
