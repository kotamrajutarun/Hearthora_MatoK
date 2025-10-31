import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Category } from '@shared/schema';
import { useState, type KeyboardEvent } from 'react';
import heroImage from '@assets/generated_images/Marketplace_hero_with_service_providers_2fc3d64c.png';
// --- helpers just for icon path handling ---
function buildIconSrc(cat: Category): string {
  // Construct path using ID + name to match file naming convention (e.g., CAT001 Cleaning & Deep Clean.png)
  let raw = `/icons/categories/${cat.id} ${cat.name}.png`;
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
    // prevent refetch flicker when focusing the tab
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
                <Card key={i} className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-muted animate-pulse"></div>
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
                    <Card className="p-6 text-center hover-elevate active-elevate-2 transition-all cursor-pointer" data-testid={`card-category-${category.id}`}>
                      <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center overflow-hidden">
                          <img
                            src={firstTry}
                            alt={category.name}
                            className="h-12 w-12 object-contain"
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
                      <h3 className="font-medium text-sm md:text-base">{category.name}</h3>
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