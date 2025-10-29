import { storage } from './storage';

export async function seedDatabase() {
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

  console.log('Database seeded with categories');
}
