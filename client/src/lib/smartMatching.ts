/**
 * Smart Matching Algorithm for Provider Recommendations
 * 
 * This function implements a local scoring algorithm to recommend providers
 * based on user criteria. It's designed to be easily replaceable with an 
 * LLM-based recommendation system in the future.
 * 
 * Scoring criteria:
 * - Same city/area: +50 points
 * - Matching category: Already filtered by category
 * - Higher rating: +10 points per star (max 50)
 * - Lower price: Inverse relationship (cheaper = higher score)
 */

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  hourlyRate: number;
  ratingAvg: number;
  ratingCount: number;
  categoryId?: string;
  photoUrl: string | null;
  skills: string[];
  experienceYears: number;
}

interface RecommendationCriteria {
  city?: string;
  categoryId?: string;
  maxProviders?: number;
}

interface ScoredProvider extends Provider {
  matchScore: number;
}

/**
 * Calculate recommendation score for a provider based on criteria
 */
function calculateMatchScore(
  provider: Provider,
  criteria: RecommendationCriteria,
  allProviders: Provider[]
): number {
  let score = 0;

  // City match: +50 points
  if (criteria.city && provider.city.toLowerCase().includes(criteria.city.toLowerCase())) {
    score += 50;
  }

  // Rating score: +10 points per star (0-50 points)
  score += provider.ratingAvg * 10;

  // Price score: Inverse relationship (lower price = higher score)
  // Find max and min prices to normalize
  const prices = allProviders.map(p => p.hourlyRate);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice;
  
  if (priceRange > 0) {
    // Normalize to 0-30 points, inverted (lower price = higher score)
    const normalizedPrice = 30 * (1 - (provider.hourlyRate - minPrice) / priceRange);
    score += normalizedPrice;
  }

  // Boost for providers with more reviews (social proof): 0-20 points
  const maxReviews = Math.max(...allProviders.map(p => p.ratingCount));
  if (maxReviews > 0) {
    score += (provider.ratingCount / maxReviews) * 20;
  }

  return score;
}

/**
 * Get recommended providers based on smart matching algorithm
 * 
 * This function is abstracted so it can be easily replaced with an 
 * LLM-based recommendation system in the future. Simply modify the 
 * implementation while keeping the same function signature.
 * 
 * @param providers - List of all available providers
 * @param criteria - Recommendation criteria (city, category, etc.)
 * @returns Array of recommended providers, sorted by match score
 */
export function getRecommendedProviders(
  providers: Provider[],
  criteria: RecommendationCriteria
): ScoredProvider[] {
  if (!providers || providers.length === 0) {
    return [];
  }

  // Score each provider
  const scoredProviders: ScoredProvider[] = providers.map(provider => ({
    ...provider,
    matchScore: calculateMatchScore(provider, criteria, providers)
  }));

  // Sort by score (highest first)
  scoredProviders.sort((a, b) => b.matchScore - a.matchScore);

  // Return top N providers
  const maxProviders = criteria.maxProviders || 6;
  return scoredProviders.slice(0, maxProviders);
}

/**
 * Future enhancement hook: This is where you would integrate an LLM
 * 
 * Example future implementation:
 * 
 * export async function getRecommendedProvidersWithAI(
 *   providers: Provider[],
 *   criteria: RecommendationCriteria,
 *   userPreferences?: string
 * ): Promise<ScoredProvider[]> {
 *   // Call LLM API with provider data and user preferences
 *   // const response = await llmAPI.recommend({ providers, criteria, userPreferences });
 *   // return response.recommendations;
 * }
 */
