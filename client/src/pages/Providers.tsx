import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Filter, DollarSign, Loader2, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useQuery } from '@tanstack/react-query';
import type { SelectCategory } from '@shared/schema';
import { getRecommendedProviders } from '@/lib/smartMatching';

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
}

export default function Providers() {
  const searchParams = useSearch();
  const [, setLocation] = useLocation();
  
  const params = useMemo(() => new URLSearchParams(searchParams), [searchParams]);
  const urlCategory = params.get('category') || '';
  const urlSearch = params.get('search') || '';
  const urlCity = params.get('city') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory || 'all');
  const [city, setCity] = useState(urlCity);
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
    if (urlCity) setCity(urlCity);
  }, [urlCategory, urlCity]);

  const { data: categories } = useQuery<SelectCategory[]>({
    queryKey: ['/api/categories'],
  });

  const providersQueryString = useMemo(() => {
    const params = new URLSearchParams();
    
    if (selectedCategory && selectedCategory !== 'all') params.set('categoryId', selectedCategory);
    if (city) params.set('city', city);
    if (minRating > 0) params.set('minRating', minRating.toString());
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < 200) params.set('maxPrice', priceRange[1].toString());
    if (urlSearch) params.set('search', urlSearch);
    if (sortBy && sortBy !== 'relevance') params.set('sortBy', sortBy);
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }, [selectedCategory, city, minRating, priceRange, urlSearch, sortBy]);

  const { data: providers, isLoading, error } = useQuery<Provider[]>({
    queryKey: ['/api/providers' + providersQueryString],
  });

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setCity('');
    setMinRating(0);
    setPriceRange([0, 200]);
    setSortBy('relevance');
    setLocation('/providers');
  };

  // Smart matching: Get recommended providers when filters are applied
  const recommendedProviders = useMemo(() => {
    if (!providers || providers.length === 0) return [];
    
    // Only show recommendations if user has applied some filters
    const hasFilters = selectedCategory !== 'all' || city || minRating > 0 || urlSearch;
    if (!hasFilters) return [];

    return getRecommendedProviders(providers, {
      city: city || undefined,
      categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
      maxProviders: 6,
    });
  }, [providers, selectedCategory, city, minRating, urlSearch]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">Find Service Providers</h1>
          <p className="text-muted-foreground">
            Browse through our verified professionals and find the perfect match for your needs
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <Card className="p-6 space-y-6 sticky top-24">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" data-testid="select-item-all-categories">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id.toString()} 
                        data-testid={`select-item-category-${category.id}`}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  data-testid="input-city"
                />
              </div>

              <div className="space-y-2">
                <Label>Minimum Rating</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`p-1 ${minRating >= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                      data-testid={`button-rating-${rating}`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Hourly Rate</Label>
                <Slider
                  min={0}
                  max={200}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="my-4"
                  data-testid="slider-price"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}+</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                variant="outline" 
                onClick={handleClearFilters}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </Card>
          </aside>

          <div className="flex-1">
            {/* Recommended Providers Section */}
            {!isLoading && recommendedProviders.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-semibold">Recommended for You</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Based on your search criteria, we think you'll love these providers
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedProviders.slice(0, 3).map((provider) => (
                    <Link key={provider.id} href={`/provider/${provider.id}`}>
                      <a>
                        <Card className="p-6 hover-elevate active-elevate-2 transition-all h-full border-primary/20" data-testid={`card-recommended-${provider.id}`}>
                          <div className="flex flex-col items-center text-center space-y-4">
                            <Badge variant="default" className="absolute top-4 right-4">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Recommended
                            </Badge>
                            <Avatar className="h-24 w-24">
                              <AvatarImage src={provider.photoUrl} alt={`${provider.firstName} ${provider.lastName}`} />
                              <AvatarFallback>{provider.firstName[0]}{provider.lastName[0]}</AvatarFallback>
                            </Avatar>

                            <div className="space-y-2 w-full">
                              <h3 className="text-xl font-semibold">
                                {provider.firstName} {provider.lastName}
                              </h3>

                              <div className="flex flex-wrap gap-2 justify-center">
                                {provider.skills.slice(0, 3).map((skill, index) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center justify-center gap-1 text-sm">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span className="font-semibold">{provider.ratingAvg}</span>
                                <span className="text-muted-foreground">({provider.ratingCount})</span>
                              </div>

                              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{provider.city}</span>
                              </div>

                              <div className="flex items-center justify-center gap-1 text-lg font-semibold text-primary">
                                <DollarSign className="h-5 w-5" />
                                <span>{provider.hourlyRate}/hr</span>
                              </div>

                              <p className="text-xs text-muted-foreground">
                                {provider.experienceYears} years experience
                              </p>
                            </div>

                            <Button className="w-full">
                              View Profile
                            </Button>
                          </div>
                        </Card>
                      </a>
                    </Link>
                  ))}
                </div>
                <div className="mt-8 border-t pt-8">
                  <h3 className="text-xl font-semibold mb-4">All Providers</h3>
                </div>
              </div>
            )}

            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground" data-testid="text-provider-count">
                {isLoading ? 'Loading...' : `Showing ${providers?.length || 0} ${providers?.length === 1 ? 'provider' : 'providers'}`}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance" data-testid="select-item-relevance">Most Relevant</SelectItem>
                  <SelectItem value="rating" data-testid="select-item-rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low" data-testid="select-item-price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" data-testid="select-item-price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-6 h-full">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="h-24 w-24 rounded-full bg-muted animate-pulse"></div>
                      <div className="space-y-2 w-full">
                        <div className="h-6 bg-muted rounded animate-pulse mx-auto w-32"></div>
                        <div className="h-4 bg-muted rounded animate-pulse mx-auto w-24"></div>
                        <div className="h-4 bg-muted rounded animate-pulse mx-auto w-20"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-2">Failed to load providers</p>
                <p className="text-sm text-muted-foreground">Please try again later</p>
              </div>
            ) : !providers || providers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg mb-2">No providers found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                <Link key={provider.id} href={`/provider/${provider.id}`}>
                  <a>
                    <Card className="p-6 hover-elevate active-elevate-2 transition-all h-full" data-testid={`card-provider-${provider.id}`}>
                      <div className="flex flex-col items-center text-center space-y-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={provider.photoUrl} alt={`${provider.firstName} ${provider.lastName}`} />
                          <AvatarFallback>{provider.firstName[0]}{provider.lastName[0]}</AvatarFallback>
                        </Avatar>

                        <div className="space-y-2 w-full">
                          <h3 className="text-xl font-semibold">
                            {provider.firstName} {provider.lastName}
                          </h3>

                          <div className="flex flex-wrap gap-2 justify-center">
                            {provider.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={skill} variant="secondary" className="text-xs" data-testid={`badge-skill-${provider.id}-${index}`}>
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span className="font-semibold" data-testid={`text-rating-avg-${provider.id}`}>{provider.ratingAvg}</span>
                            <span className="text-muted-foreground" data-testid={`text-rating-count-${provider.id}`}>({provider.ratingCount})</span>
                          </div>

                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span data-testid={`text-city-${provider.id}`}>{provider.city}</span>
                          </div>

                          <div className="flex items-center justify-center gap-1 text-lg font-semibold text-primary">
                            <DollarSign className="h-5 w-5" />
                            <span data-testid={`text-hourly-rate-${provider.id}`}>{provider.hourlyRate}/hr</span>
                          </div>

                          <p className="text-xs text-muted-foreground" data-testid={`text-experience-${provider.id}`}>
                            {provider.experienceYears} years experience
                          </p>
                        </div>

                        <Button className="w-full" data-testid={`button-view-profile-${provider.id}`}>
                          View Profile
                        </Button>
                      </div>
                    </Card>
                  </a>
                </Link>
              ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
