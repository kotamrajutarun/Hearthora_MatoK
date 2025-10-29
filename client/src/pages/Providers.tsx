import { useState } from 'react';
import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Filter, DollarSign } from 'lucide-react';
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

export default function Providers() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [city, setCity] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 200]);

  const mockProviders = [
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      skills: ['Math', 'Physics', 'SAT Prep'],
      experienceYears: 8,
      hourlyRate: 60,
      city: 'New York',
      ratingAvg: 4.9,
      ratingCount: 127,
    },
    {
      id: '2',
      firstName: 'Michael',
      lastName: 'Chen',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      skills: ['Home Repair', 'Plumbing', 'Electrical'],
      experienceYears: 12,
      hourlyRate: 85,
      city: 'Los Angeles',
      ratingAvg: 4.8,
      ratingCount: 94,
    },
    {
      id: '3',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      skills: ['Yoga', 'Pilates', 'Personal Training'],
      experienceYears: 6,
      hourlyRate: 50,
      city: 'Chicago',
      ratingAvg: 5.0,
      ratingCount: 68,
    },
  ];

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
                    <SelectItem value="tutoring" data-testid="select-item-tutoring">Tutoring & Education</SelectItem>
                    <SelectItem value="home" data-testid="select-item-home">Home Services</SelectItem>
                    <SelectItem value="fitness" data-testid="select-item-fitness">Fitness & Wellness</SelectItem>
                    <SelectItem value="music" data-testid="select-item-music">Music & Arts</SelectItem>
                    <SelectItem value="tech" data-testid="select-item-tech">Technology</SelectItem>
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
                <Label>Service Mode</Label>
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger data-testid="select-mode">
                    <SelectValue placeholder="All modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" data-testid="select-item-all-modes">All Modes</SelectItem>
                    <SelectItem value="online" data-testid="select-item-online">Online</SelectItem>
                    <SelectItem value="in-person" data-testid="select-item-in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
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

              <Button className="w-full" variant="outline" data-testid="button-clear-filters">
                Clear Filters
              </Button>
            </Card>
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {mockProviders.length} providers
              </p>
              <Select defaultValue="relevance">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProviders.map((provider) => (
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
          </div>
        </div>
      </div>
    </div>
  );
}
