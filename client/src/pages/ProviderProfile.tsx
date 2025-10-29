import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, DollarSign, Briefcase, Calendar, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { SelectProvider, SelectService, SelectReview } from '@shared/schema';

export default function ProviderProfile() {
  const [, params] = useRoute('/provider/:id');
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const providerId = params?.id;

  const { data: provider, isLoading: providerLoading, error: providerError } = useQuery<SelectProvider>({
    queryKey: [`/api/providers/${providerId}`],
    enabled: !!providerId,
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<SelectService[]>({
    queryKey: [`/api/services?providerId=${providerId}`],
    enabled: !!providerId,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<SelectReview[]>({
    queryKey: [`/api/reviews/provider/${providerId}`],
    enabled: !!providerId,
  });

  const createInquiryMutation = useMutation({
    mutationFn: async (data: { providerId: string; serviceId: string | null; message: string }) => {
      return await apiRequest('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: 'Inquiry sent!',
        description: 'The provider will respond to your request soon.',
      });
      setIsDialogOpen(false);
      setMessage('');
      setSelectedServiceId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send inquiry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSendInquiry = () => {
    if (!isAuthenticated || !providerId) {
      return;
    }
    createInquiryMutation.mutate({
      providerId,
      serviceId: selectedServiceId,
      message: message.trim(),
    });
  };

  const openQuoteDialog = (serviceId: string | null = null) => {
    if (!isAuthenticated) {
      return;
    }
    setSelectedServiceId(serviceId);
    setIsDialogOpen(true);
  };

  if (providerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading provider...</span>
        </div>
      </div>
    );
  }

  if (providerError || !provider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Provider not found</h2>
          <p className="text-muted-foreground">The provider you're looking for doesn't exist.</p>
          <Link href="/providers">
            <a>
              <Button>Browse Providers</Button>
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-32 w-32 md:h-48 md:w-48 mx-auto md:mx-0">
                  <AvatarImage src={provider.photoUrl || undefined} alt={`${provider.firstName} ${provider.lastName}`} />
                  <AvatarFallback className="text-4xl">{provider.firstName[0]}{provider.lastName[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-semibold mb-2">
                      {provider.firstName} {provider.lastName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {provider.city}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {provider.experienceYears} years experience
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Member since {new Date(provider.createdAt).getFullYear()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      <span className="text-xl font-semibold" data-testid="text-provider-rating-avg">{provider.ratingAvg.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground" data-testid="text-provider-rating-count">
                      ({provider.ratingCount} reviews)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {provider.skills.map((skill, index) => (
                      <Badge key={skill} variant="secondary" data-testid={`badge-skill-${index}`}>
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {provider.bio}
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
                {servicesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No services available yet
                  </div>
                ) : (
                  services.map((service) => (
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
                          </div>

                          <Button 
                            onClick={() => openQuoteDialog(service.id)} 
                            disabled={!isAuthenticated}
                            data-testid={`button-request-quote-${service.id}`}
                          >
                            Request Quote
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 mt-6">
                {reviewsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No reviews yet
                  </div>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id} className="p-6" data-testid={`card-review-${review.id}`}>
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback>{review.raterName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{review.raterName}</h4>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
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
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-2xl font-semibold text-primary">
                  <DollarSign className="h-7 w-7" />
                  {provider.hourlyRate}/hr
                </div>

                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={() => openQuoteDialog(null)}
                  disabled={!isAuthenticated}
                  data-testid="button-request-quote-main"
                >
                  Request Quote
                </Button>

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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request a Quote</DialogTitle>
              <DialogDescription>
                Send a message to {provider.firstName} about their services
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
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)} 
                data-testid="button-cancel-inquiry"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendInquiry} 
                disabled={!message.trim() || createInquiryMutation.isPending} 
                data-testid="button-send-inquiry"
              >
                {createInquiryMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Inquiry'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
