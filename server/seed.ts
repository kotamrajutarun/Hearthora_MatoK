import { storage } from './storage';

export async function seedDatabase() {
  try {
    // Check if categories already exist
    const existingCategories = await storage.getAllCategories();
    if (existingCategories.length > 0) {
      console.log('Database already seeded');
      return;
    }

    const categories = [
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

    for (const category of categories) {
      await storage.createCategory(category);
    }

    console.log('Database seeded with 5 categories');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
