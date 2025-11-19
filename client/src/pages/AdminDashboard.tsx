import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Loader2, Users, Briefcase, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { formatMoney } from "@/lib/money";

type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'provider' | 'admin';
  createdAt: string;
};

type AdminProvider = {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  hourlyRate: number;
  experienceYears: number;
  ratingAvg: number;
  ratingCount: number;
};

type AdminBooking = {
  id: string;
  bookingRef: string;
  status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt: string;
  total: number;
  priceCard?: {
    title: string;
  };
  customer?: {
    firstName: string;
    lastName: string;
  };
  provider?: {
    firstName: string;
    lastName: string;
  };
};

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" data-testid="loader-auth" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    setLocation('/');
    return null;
  }

  const { data: users, isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: providers, isLoading: providersLoading } = useQuery<AdminProvider[]>({
    queryKey: ['/api/admin/providers'],
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<AdminBooking[]>({
    queryKey: ['/api/admin/bookings'],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, providers, and bookings across the platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="card-stats-users">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" data-testid="text-total-users">
                {users?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stats-providers">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" data-testid="text-total-providers">
                {providers?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stats-bookings">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" data-testid="text-total-bookings">
                {bookings?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="providers" data-testid="tab-providers">Providers</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : users && users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Name</th>
                          <th className="text-left py-3 px-4 font-medium">Email</th>
                          <th className="text-left py-3 px-4 font-medium">Role</th>
                          <th className="text-left py-3 px-4 font-medium">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b" data-testid={`row-user-${user.id}`}>
                            <td className="py-3 px-4">{user.firstName} {user.lastName}</td>
                            <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                            <td className="py-3 px-4">
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} data-testid={`badge-role-${user.id}`}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {format(new Date(user.createdAt), 'MMM d, yyyy')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No users found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Providers</CardTitle>
                <CardDescription>View and manage service providers</CardDescription>
              </CardHeader>
              <CardContent>
                {providersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : providers && providers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Name</th>
                          <th className="text-left py-3 px-4 font-medium">City</th>
                          <th className="text-left py-3 px-4 font-medium">Hourly Rate</th>
                          <th className="text-left py-3 px-4 font-medium">Experience</th>
                          <th className="text-left py-3 px-4 font-medium">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {providers.map((provider) => (
                          <tr key={provider.id} className="border-b" data-testid={`row-provider-${provider.id}`}>
                            <td className="py-3 px-4">{provider.firstName} {provider.lastName}</td>
                            <td className="py-3 px-4 text-muted-foreground">{provider.city}</td>
                            <td className="py-3 px-4">{formatMoney(provider.hourlyRate)}/hr</td>
                            <td className="py-3 px-4 text-muted-foreground">{provider.experienceYears} years</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{provider.ratingAvg.toFixed(1)}</span>
                                <span className="text-muted-foreground text-sm">({provider.ratingCount})</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No providers found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>View and monitor all platform bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Ref</th>
                          <th className="text-left py-3 px-4 font-medium">Service</th>
                          <th className="text-left py-3 px-4 font-medium">Customer</th>
                          <th className="text-left py-3 px-4 font-medium">Provider</th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-left py-3 px-4 font-medium">Amount</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="border-b" data-testid={`row-booking-${booking.id}`}>
                            <td className="py-3 px-4 font-mono text-sm">{booking.bookingRef}</td>
                            <td className="py-3 px-4">{booking.priceCard?.title || 'N/A'}</td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName}` : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {booking.provider ? `${booking.provider.firstName} ${booking.provider.lastName}` : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {format(new Date(booking.scheduledAt), 'MMM d, yyyy')}
                            </td>
                            <td className="py-3 px-4">{formatMoney(booking.total)}</td>
                            <td className="py-3 px-4">
                              <StatusBadge status={booking.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No bookings found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
