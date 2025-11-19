import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Quote, Briefcase, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Category } from '@shared/schema';
import { useState, type KeyboardEvent } from 'react';
import heroImage from '@assets/generated_images/Marketplace_hero_with_service_providers_2fc3d64c.png';

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  skills: string[];
  experienceYears: number;
  hourlyRate: number;
  city: string;
  ratingAvg: number;
  ratingCount: number;
  bio: string;
}
// --- helpers just for icon path handling ---
function buildIconSrc(cat: Category): string {
  // Use iconUrl from database if available, otherwise construct path using category name
  // Files are named like "Music & Dance Classes.png" (without ID prefix)
  let raw = cat.iconUrl || `/icons/categories/${cat.name}.png`;
  // ensure it starts at public root
  if (!raw.startsWith('/')) raw = '/' + raw;
  // encode spaces & special chars
  const encoded = encodeURI(raw);
  return encoded;
}
export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: featuredProviders, isLoading: providersLoading } = useQuery<Provider[]>({
    queryKey: ['/api/providers?limit=6&sort=rating'],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (locationQuery.trim()) params.set('city', locationQuery.trim());
    setLocation(`/providers${params.toString() ? '?' + params.toString() : ''}`);
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };
  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative min-h-[500px] md:min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Service providers at work"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              Find Trusted Local Service Providers
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Connect with verified professionals for tutoring, home services, fitness training, and more
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto backdrop-blur-sm bg-white/95 p-4 rounded-lg shadow-lg">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="What service do you need?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-12 pl-10 pr-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  data-testid="input-hero-search"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="City or location"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-12 pl-10 pr-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  data-testid="input-hero-location"
                />
              </div>
              <Button
                size="lg"
                onClick={handleSearch}
                className="w-full sm:w-auto h-12 px-8"
                data-testid="button-hero-search"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
            Browse by Category
          </h2>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-4 text-center h-[180px] flex flex-col items-center">
                  <div className="flex justify-center mb-3 flex-shrink-0">
                    <div className="h-20 w-20 rounded-full bg-muted animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-muted rounded animate-pulse mx-auto w-24"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {categories?.map((category) => {
                const firstTry = buildIconSrc(category); // ID + name-based path
                return (
                  <Link key={category.id} href={`/providers?category=${category.id}`} className="block">
                    <Card className="p-4 text-center hover-elevate active-elevate-2 transition-all cursor-pointer h-[180px] flex flex-col items-center" data-testid={`card-category-${category.id}`}>
                      <div className="flex justify-center mb-3 flex-shrink-0">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                          <img
                            src={firstTry}
                            alt={category.name}
                            className="h-14 w-14 object-contain"
                            onError={(e) => {
                              // Progressive fallbacks for case sensitivity and naming issues
                              const img = e.currentTarget as HTMLImageElement;
                              let src = img.src;
                              const tried = img.dataset.tried ?? '0';
                              if (tried === '0') {
                                img.dataset.tried = '1';
                                // Try capitalized folder paths
                                img.src = src.replace('/icons/categories/', '/Icons/Categories/');
                                return;
                              }
                              if (tried === '1') {
                                img.dataset.tried = '2';
                                // Try mixed case (capital C only)
                                img.src = src.replace('/icons/categories/', '/icons/Categories/');
                                return;
                              }
                              if (tried === '2') {
                                img.dataset.tried = '3';
                                // Fallback to ID-only filename
                                img.src = encodeURI(`/icons/categories/${category.id}.png`);
                                return;
                              }
                              // Final fallback to placeholder
                              img.src = '/icons/categories/placeholder.png';
                            }}
                          />
                        </div>
                      </div>
                      <h3 className="font-medium text-sm md:text-base line-clamp-2 px-2">{category.name}</h3>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get connected with the right professional in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Find a Provider</h3>
              <p className="text-muted-foreground">
                Browse through our verified professionals and find the perfect match for your needs
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Request a Quote</h3>
              <p className="text-muted-foreground">
                Send a message with your requirements and discuss details directly with the provider
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Get Started</h3>
              <p className="text-muted-foreground">
                Accept the quote and begin working with your chosen professional
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Featured Providers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with our top-rated professionals trusted by hundreds of customers
            </p>
          </div>
          {providersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-muted animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded animate-pulse w-32"></div>
                      <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProviders?.slice(0, 6).map((provider) => (
                <Link key={provider.id} href={`/provider/${provider.id}`}>
                  <Card className="p-6 hover-elevate active-elevate-2 cursor-pointer h-full" data-testid={`card-provider-${provider.id}`}>
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={provider.photoUrl || undefined} alt={`${provider.firstName} ${provider.lastName}`} />
                        <AvatarFallback>{provider.firstName[0]}{provider.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 truncate">
                          {provider.firstName} {provider.lastName}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{provider.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{provider.ratingAvg.toFixed(1)}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({provider.ratingCount} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {provider.bio}
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{provider.experienceYears} years exp</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold">
                        <DollarSign className="h-4 w-4" />
                        <span>${provider.hourlyRate}/hr</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {provider.skills.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/providers">
              <Button variant="outline" size="lg" data-testid="button-view-all-providers">
                View All Providers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from satisfied customers who found the perfect professionals for their needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 relative" data-testid="card-testimonial-1">
              <Quote className="h-10 w-10 text-primary/20 absolute top-4 right-4" />
              <div className="mb-4">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "Found an amazing math tutor for my daughter through MatoK. Her grades improved significantly, and the booking process was incredibly smooth. Highly recommend!"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Avatar>
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah Thompson" />
                  <AvatarFallback>ST</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">Sarah Thompson</div>
                  <div className="text-sm text-muted-foreground">Parent, Toronto</div>
                </div>
              </div>
            </Card>
            <Card className="p-6 relative" data-testid="card-testimonial-2">
              <Quote className="h-10 w-10 text-primary/20 absolute top-4 right-4" />
              <div className="mb-4">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "As a busy professional, I needed a reliable cleaning service. MatoK connected me with a trustworthy cleaner who's been fantastic. The platform makes everything so easy!"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Avatar>
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" alt="Michael Chen" />
                  <AvatarFallback>MC</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">Michael Chen</div>
                  <div className="text-sm text-muted-foreground">Software Engineer, Vancouver</div>
                </div>
              </div>
            </Card>
            <Card className="p-6 relative" data-testid="card-testimonial-3">
              <Quote className="h-10 w-10 text-primary/20 absolute top-4 right-4" />
              <div className="mb-4">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "The personal trainer I found through MatoK has helped me achieve my fitness goals. The messaging system made communication simple, and the service quality is excellent."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Avatar>
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" alt="Emma Rodriguez" />
                  <AvatarFallback>ER</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">Emma Rodriguez</div>
                  <div className="text-sm text-muted-foreground">Marketing Manager, Montreal</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Ready to Find Your Perfect Provider?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of satisfied customers who found the right professional for their needs
            </p>
            <Link href="/providers">
              <Button size="lg" variant="secondary" className="h-12 px-8" data-testid="button-cta-browse">
                Browse Providers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}