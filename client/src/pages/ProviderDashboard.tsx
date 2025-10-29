import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Star, Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const mockServices = [
    {
      id: '1',
      title: 'High School Math Tutoring',
      description: 'Comprehensive tutoring for algebra, geometry, and calculus.',
      price: 60,
      mode: 'online' as const,
      active: true,
      ratingAvg: 4.9,
      ratingCount: 45,
    },
    {
      id: '2',
      title: 'SAT Preparation Course',
      description: 'Intensive SAT prep focusing on math and critical reading.',
      price: 75,
      mode: 'in-person' as const,
      active: true,
      ratingAvg: 5.0,
      ratingCount: 38,
    },
  ];

  const mockInquiries = [
    {
      id: '1',
      customerName: 'Jennifer Martinez',
      customerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
      serviceTitle: 'High School Math Tutoring',
      message: 'Hi! I need help with calculus for my daughter who is in 11th grade. Are you available on weekends?',
      status: 'new' as const,
      createdAt: new Date('2024-10-27'),
    },
    {
      id: '2',
      customerName: 'David Lee',
      customerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      serviceTitle: 'SAT Preparation Course',
      message: 'Looking for intensive SAT prep starting next month. What is your availability?',
      status: 'replied' as const,
      createdAt: new Date('2024-10-25'),
    },
  ];

  const mockReviews = [
    {
      id: '1',
      rating: 5,
      comment: 'Sarah is an amazing tutor! My son improved his math grade from C to A.',
      customerName: 'Jennifer Martinez',
      serviceTitle: 'High School Math Tutoring',
      createdAt: new Date('2024-10-15'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">Provider Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your profile, services, and inquiries
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">Services</TabsTrigger>
            <TabsTrigger value="inquiries" data-testid="tab-inquiries">
              Inquiries
              {mockInquiries.filter(i => i.status === 'new').length > 0 && (
                <Badge className="ml-2" variant="destructive" data-testid="badge-inquiry-count">
                  {mockInquiries.filter(i => i.status === 'new').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      defaultValue={user?.firstName}
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      defaultValue={user?.lastName}
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell customers about yourself and your expertise..."
                    rows={4}
                    data-testid="textarea-bio"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      data-testid="input-profile-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="60"
                      data-testid="input-profile-hourly-rate"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    placeholder="Math, Physics, SAT Prep"
                    data-testid="input-profile-skills"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="5"
                    data-testid="input-profile-experience"
                  />
                </div>

                <Button type="submit" data-testid="button-save-profile">
                  Save Changes
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Services</h2>
              <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedService(null)} data-testid="button-add-service">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{selectedService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                    <DialogDescription>
                      Provide details about the service you offer
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="serviceTitle">Service Title</Label>
                      <Input
                        id="serviceTitle"
                        placeholder="e.g., Math Tutoring"
                        data-testid="input-service-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceDescription">Description</Label>
                      <Textarea
                        id="serviceDescription"
                        placeholder="Describe your service..."
                        rows={4}
                        data-testid="textarea-service-description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="servicePrice">Price ($)</Label>
                        <Input
                          id="servicePrice"
                          type="number"
                          placeholder="60"
                          data-testid="input-service-price"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serviceMode">Mode</Label>
                        <Select>
                          <SelectTrigger data-testid="select-service-mode">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online" data-testid="select-item-service-online">Online</SelectItem>
                            <SelectItem value="in-person" data-testid="select-item-service-in-person">In-Person</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" type="button" onClick={() => setIsServiceDialogOpen(false)} data-testid="button-cancel-service">
                        Cancel
                      </Button>
                      <Button type="submit" data-testid="button-save-service">
                        {selectedService ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockServices.map((service) => (
                <Card key={service.id} className="p-6" data-testid={`card-service-${service.id}`}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                        <p className="text-muted-foreground text-sm">{service.description}</p>
                      </div>
                      <Badge variant={service.active ? 'default' : 'secondary'} data-testid={`badge-service-status-${service.id}`}>
                        {service.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span data-testid={`text-service-rating-avg-${service.id}`}>{service.ratingAvg}</span>
                        <span className="text-muted-foreground" data-testid={`text-service-rating-count-${service.id}`}>({service.ratingCount})</span>
                      </div>
                      <Badge variant="outline" data-testid={`badge-service-mode-${service.id}`}>{service.mode}</Badge>
                      <span className="font-semibold text-primary" data-testid={`text-service-price-${service.id}`}>${service.price}/hr</span>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" className="flex-1" data-testid={`button-edit-service-${service.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" data-testid={`button-delete-service-${service.id}`}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Customer Inquiries</h2>
            
            {mockInquiries.map((inquiry) => (
              <Card key={inquiry.id} className="p-6" data-testid={`card-inquiry-${inquiry.id}`}>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={inquiry.customerAvatar} alt={inquiry.customerName} />
                      <AvatarFallback>{inquiry.customerName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{inquiry.customerName}</h3>
                          <p className="text-sm text-muted-foreground">{inquiry.serviceTitle}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={inquiry.status === 'new' ? 'destructive' : 'secondary'} data-testid={`badge-inquiry-status-${inquiry.id}`}>
                            {inquiry.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {inquiry.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">{inquiry.message}</p>
                      <div className="flex gap-2">
                        <Button size="sm" data-testid={`button-reply-${inquiry.id}`}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                        {inquiry.status === 'new' && (
                          <Button size="sm" variant="outline" data-testid={`button-mark-replied-${inquiry.id}`}>
                            Mark as Replied
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
            
            {mockReviews.map((review) => (
              <Card key={review.id} className="p-6" data-testid={`card-review-${review.id}`}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{review.customerName}</h4>
                      <p className="text-sm text-muted-foreground">{review.serviceTitle}</p>
                    </div>
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
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
