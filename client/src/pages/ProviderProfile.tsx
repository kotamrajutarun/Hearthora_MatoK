import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, DollarSign, Briefcase, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function ProviderProfile() {
  const [, params] = useRoute('/provider/:id');
  const { user, isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState('');

  const mockProvider = {
    id: params?.id || '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    email: 'sarah.johnson@example.com',
    bio: 'Experienced educator with a passion for helping students achieve their academic goals. Specializing in mathematics and science subjects with proven results in SAT/ACT preparation.',
    skills: ['Math', 'Physics', 'Chemistry', 'SAT Prep', 'ACT Prep'],
    experienceYears: 8,
    hourlyRate: 60,
    city: 'New York',
    ratingAvg: 4.9,
    ratingCount: 127,
    createdAt: new Date('2020-01-15'),
  };

  const mockServices = [
    {
      id: '1',
      title: 'High School Math Tutoring',
      description: 'Comprehensive tutoring for algebra, geometry, and calculus. Personalized lesson plans tailored to your learning style.',
      price: 60,
      mode: 'online' as const,
      ratingAvg: 4.9,
      ratingCount: 45,
    },
    {
      id: '2',
      title: 'SAT Preparation Course',
      description: 'Intensive SAT prep focusing on math and critical reading. Proven strategies to boost your score.',
      price: 75,
      mode: 'in-person' as const,
      city: 'New York',
      ratingAvg: 5.0,
      ratingCount: 38,
    },
  ];

  const mockReviews = [
    {
      id: '1',
      rating: 5,
      comment: 'Sarah is an amazing tutor! My son improved his math grade from C to A in just two months.',
      createdAt: new Date('2024-10-15'),
      raterName: 'Jennifer Martinez',
    },
    {
      id: '2',
      rating: 5,
      comment: 'Very patient and explains concepts clearly. Highly recommend for SAT prep!',
      createdAt: new Date('2024-09-22'),
      raterName: 'David Lee',
    },
    {
      id: '3',
      rating: 4,
      comment: 'Great tutor with excellent teaching methods. My daughter really enjoys the sessions.',
      createdAt: new Date('2024-08-10'),
      raterName: 'Amanda Brown',
    },
  ];

  const handleSendInquiry = () => {
    if (!isAuthenticated) {
      return;
    }
    console.log('Sending inquiry:', message);
    setIsDialogOpen(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-32 w-32 md:h-48 md:w-48 mx-auto md:mx-0">
                  <AvatarImage src={mockProvider.photoUrl} alt={`${mockProvider.firstName} ${mockProvider.lastName}`} />
                  <AvatarFallback className="text-4xl">{mockProvider.firstName[0]}{mockProvider.lastName[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-semibold mb-2">
                      {mockProvider.firstName} {mockProvider.lastName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {mockProvider.city}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {mockProvider.experienceYears} years experience
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Member since {mockProvider.createdAt.getFullYear()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      <span className="text-xl font-semibold" data-testid="text-provider-rating-avg">{mockProvider.ratingAvg}</span>
                    </div>
                    <span className="text-muted-foreground" data-testid="text-provider-rating-count">
                      ({mockProvider.ratingCount} reviews)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {mockProvider.skills.map((skill, index) => (
                      <Badge key={skill} variant="secondary" data-testid={`badge-skill-${index}`}>
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {mockProvider.bio}
                  </p>
                </div>
              </div>
            </Card>

            <Tabs defaultValue="services" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="services" data-testid="tab-services">Services</TabsTrigger>
                <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="space-y-4 mt-6">
                {mockServices.map((service) => (
                  <Card key={service.id} className="p-6" data-testid={`card-service-${service.id}`}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                          <p className="text-muted-foreground">{service.description}</p>
                        </div>
                        <Badge variant={service.mode === 'online' ? 'default' : 'secondary'} data-testid={`badge-service-mode-${service.id}`}>
                          {service.mode}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-2xl font-semibold text-primary">
                            <DollarSign className="h-6 w-6" />
                            <span data-testid={`text-service-price-${service.id}`}>{service.price}/hr</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span data-testid={`text-service-rating-avg-${service.id}`}>{service.ratingAvg}</span>
                            <span className="text-muted-foreground" data-testid={`text-service-rating-count-${service.id}`}>({service.ratingCount})</span>
                          </div>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button data-testid={`button-request-quote-${service.id}`}>
                              Request Quote
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Request a Quote</DialogTitle>
                              <DialogDescription>
                                Send a message to {mockProvider.firstName} about {service.title}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="message">Your Message</Label>
                                <Textarea
                                  id="message"
                                  placeholder="Describe your needs and ask any questions..."
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                  rows={6}
                                  data-testid="textarea-inquiry-message"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel-inquiry">
                                Cancel
                              </Button>
                              <Button onClick={handleSendInquiry} disabled={!message.trim()} data-testid="button-send-inquiry">
                                Send Inquiry
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 mt-6">
                {mockReviews.map((review) => (
                  <Card key={review.id} className="p-6" data-testid={`card-review-${review.id}`}>
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>{review.raterName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{review.raterName}</h4>
                          <span className="text-sm text-muted-foreground">
                            {review.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-2xl font-semibold text-primary">
                  <DollarSign className="h-7 w-7" />
                  {mockProvider.hourlyRate}/hr
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg" data-testid="button-request-quote-main">
                      Request Quote
                    </Button>
                  </DialogTrigger>
                </Dialog>

                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground text-center">
                    Please{' '}
                    <Link href="/login">
                      <a className="text-primary hover:underline">login</a>
                    </Link>
                    {' '}to send an inquiry
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
