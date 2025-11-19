import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Loader2, Calendar, MessageSquare, Package, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { formatMoney } from "@/lib/money";
import { Link } from "wouter";

type Booking = {
  id: string;
  bookingRef: string;
  status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt: string;
  durationMinutes: number;
  total: number;
  notes?: string | null;
  priceCard: {
    title: string;
    category: string;
  };
  provider: {
    firstName: string;
    lastName: string;
  };
  address: {
    label: string;
    line1: string;
    line2?: string | null;
    city: string;
    postalCode: string;
  };
};

type Inquiry = {
  id: string;
  providerId: string;
  serviceId: string;
  message: string;
  status: 'new' | 'replied' | 'closed';
  createdAt: string;
  provider?: {
    firstName: string;
    lastName: string;
  };
  service?: {
    title: string;
  };
};

export default function CustomerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setLocation('/login');
      } else if (user.role !== 'customer') {
        setLocation('/');
      }
    }
  }, [user, authLoading, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" data-testid="loader-auth" />
      </div>
    );
  }

  if (!user || user.role !== 'customer') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" data-testid="loader-redirect" />
      </div>
    );
  }

  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/mine'],
    enabled: !!user && user.role === 'customer',
  });

  const { data: inquiries, isLoading: inquiriesLoading } = useQuery<Inquiry[]>({
    queryKey: ['/api/inquiries'],
    enabled: !!user && user.role === 'customer',
  });

  const upcomingBookings = bookings?.filter(b => 
    ['pending', 'accepted', 'in_progress'].includes(b.status) &&
    new Date(b.scheduledAt) > new Date()
  ) || [];

  const pastBookings = bookings?.filter(b => 
    ['completed', 'cancelled', 'declined'].includes(b.status) ||
    (b.status !== 'completed' && new Date(b.scheduledAt) <= new Date())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2" data-testid="heading-customer-dashboard">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your bookings, inquiries, and messages
          </p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="bookings" data-testid="tab-bookings">
              <Calendar className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="inquiries" data-testid="tab-inquiries">
              <MessageSquare className="h-4 w-4 mr-2" />
              Inquiries
            </TabsTrigger>
            <TabsTrigger value="addresses" data-testid="tab-addresses">
              <MapPin className="h-4 w-4 mr-2" />
              Addresses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Upcoming Bookings</h2>
              {bookingsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : upcomingBookings.length === 0 ? (
                <Card className="p-8">
                  <div className="text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No upcoming bookings</p>
                    <Link href="/instant-browse">
                      <Button variant="outline" className="mt-4" data-testid="button-browse-services">
                        Browse Services
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id} data-testid={`card-booking-${booking.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <CardTitle className="text-xl">{booking.priceCard.title}</CardTitle>
                            <CardDescription>
                              with {booking.provider.firstName} {booking.provider.lastName}
                            </CardDescription>
                          </div>
                          <StatusBadge status={booking.status} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(new Date(booking.scheduledAt), 'PPP')} at {format(new Date(booking.scheduledAt), 'p')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.address.label} - {booking.address.city}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="font-semibold text-lg">{formatMoney(booking.total)}</span>
                          <div className="flex gap-2">
                            <Link href="/my-bookings">
                              <Button variant="outline" size="sm" data-testid={`button-view-${booking.id}`}>
                                View All Bookings
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Past Bookings</h2>
              {pastBookings.length === 0 ? (
                <Card className="p-8">
                  <p className="text-center text-muted-foreground">No past bookings</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id} data-testid={`card-past-booking-${booking.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <CardTitle className="text-lg">{booking.priceCard.title}</CardTitle>
                            <CardDescription>
                              with {booking.provider.firstName} {booking.provider.lastName}
                            </CardDescription>
                          </div>
                          <StatusBadge status={booking.status} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(booking.scheduledAt), 'PP')}
                          </span>
                          <span className="font-medium">{formatMoney(booking.total)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-6">
            {inquiriesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : inquiries && inquiries.length === 0 ? (
              <Card className="p-8">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No inquiries yet</p>
                  <Link href="/providers">
                    <Button variant="outline" data-testid="button-browse-providers">
                      Browse Providers
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4">
                {inquiries?.map((inquiry) => (
                  <Card key={inquiry.id} data-testid={`card-inquiry-${inquiry.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <CardTitle className="text-lg">
                            {inquiry.service?.title || 'Inquiry'}
                          </CardTitle>
                          <CardDescription>
                            to {inquiry.provider?.firstName} {inquiry.provider?.lastName}
                          </CardDescription>
                        </div>
                        <Badge variant={inquiry.status === 'new' ? 'default' : 'secondary'}>
                          {inquiry.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {inquiry.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(inquiry.createdAt), 'PP')}
                        </span>
                        <Link href={`/inquiries/${inquiry.id}`}>
                          <Button variant="outline" size="sm" data-testid={`button-view-inquiry-${inquiry.id}`}>
                            View Conversation
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="addresses">
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Manage your saved addresses</p>
              <Link href="/my-addresses">
                <Button data-testid="button-manage-addresses">
                  Go to Addresses
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
