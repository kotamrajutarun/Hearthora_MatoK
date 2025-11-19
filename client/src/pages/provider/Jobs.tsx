import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney } from "@/lib/money";
import { Calendar, Clock, MapPin, User, FileText, DollarSign, TrendingUp, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Booking = {
  id: string;
  bookingRef: string;
  status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt: string;
  durationMinutes: number;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string | null;
  priceCard: {
    title: string;
    category: string;
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  address: {
    label: string;
    line1: string;
    line2?: string | null;
    city: string;
    postalCode: string;
  };
  addOns: Array<{ name: string; price: number }>;
};

export default function Jobs() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/mine', selectedTab !== 'all' ? { status: selectedTab } : {}],
    queryFn: async () => {
      const params = selectedTab !== 'all' ? `?status=${selectedTab}` : '';
      const res = await fetch(`/api/bookings/mine${params}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      const res = await apiRequest('PUT', `/api/bookings/${id}/provider-respond`, { accept });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/mine'] });
      toast({
        title: variables.accept ? "Booking accepted" : "Booking declined",
        description: variables.accept ? "The customer has been notified." : "The booking has been declined."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const startMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('PUT', `/api/bookings/${id}/start`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/mine'] });
      toast({
        title: "Booking started",
        description: "The job is now in progress."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('PUT', `/api/bookings/${id}/complete`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/mine'] });
      toast({
        title: "Job completed",
        description: "Great work! The booking is now complete."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const sortedBookings = bookings?.sort((a, b) => {
    const statusOrder: Record<string, number> = {
      'pending': 0,
      'accepted': 1,
      'in_progress': 2,
      'completed': 3,
      'declined': 4,
      'cancelled': 5
    };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  }) || [];

  // Calculate earnings summary
  const earningsSummary = useMemo(() => {
    if (!bookings) return { totalEarnings: 0, completedCount: 0, pendingEarnings: 0 };

    const completed = bookings.filter(b => b.status === 'completed');
    const totalEarnings = completed.reduce((sum, b) => sum + b.total, 0);
    
    const pending = bookings.filter(b => b.status === 'accepted' || b.status === 'in_progress');
    const pendingEarnings = pending.reduce((sum, b) => sum + b.total, 0);

    return {
      totalEarnings,
      completedCount: completed.length,
      pendingEarnings,
    };
  }, [bookings]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="heading-jobs">My Jobs</h1>
        <p className="text-muted-foreground mt-2">
          Manage your service bookings
        </p>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-total-earnings">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600 dark:text-green-500" data-testid="text-total-earnings">
              {formatMoney(earningsSummary.totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {earningsSummary.completedCount} completed {earningsSummary.completedCount === 1 ? 'booking' : 'bookings'}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-earnings">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-orange-600 dark:text-orange-500" data-testid="text-pending-earnings">
              {formatMoney(earningsSummary.pendingEarnings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From upcoming bookings
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-completed-jobs">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold" data-testid="text-completed-count">
              {earningsSummary.completedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted" data-testid="tab-accepted">Accepted</TabsTrigger>
          <TabsTrigger value="in_progress" data-testid="tab-in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading jobs...</div>
          ) : sortedBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No jobs {selectedTab !== 'all' ? `with status "${selectedTab}"` : 'yet'}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedBookings.map((booking) => (
                <Card 
                  key={booking.id} 
                  className="hover-elevate active-elevate-2 cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                  data-testid={`card-job-${booking.id}`}
                >
                  <CardHeader className="gap-1 space-y-0 pb-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex-1">
                        <CardTitle className="text-lg" data-testid={`text-title-${booking.id}`}>
                          {booking.priceCard.title}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground mt-1">
                          Booking #{booking.bookingRef}
                        </div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        {booking.customer?.firstName || 'Unknown'} {booking.customer?.lastName || ''}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(booking.scheduledAt), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {format(new Date(booking.scheduledAt), 'h:mm a')} ({booking.durationMinutes}m)
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {booking.address?.city || 'N/A'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-lg font-semibold" data-testid={`text-total-${booking.id}`}>
                        {formatMoney(booking.total)}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {booking.status === 'pending' && (
                          <>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                  data-testid={`button-decline-${booking.id}`}
                                >
                                  Decline
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Decline Booking</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to decline this booking?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => respondMutation.mutate({ id: booking.id, accept: false })}
                                    data-testid={`button-confirm-decline-${booking.id}`}
                                  >
                                    Decline
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                respondMutation.mutate({ id: booking.id, accept: true });
                              }}
                              disabled={respondMutation.isPending}
                              data-testid={`button-accept-${booking.id}`}
                            >
                              Accept
                            </Button>
                          </>
                        )}
                        {booking.status === 'accepted' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              startMutation.mutate(booking.id);
                            }}
                            disabled={startMutation.isPending}
                            data-testid={`button-start-${booking.id}`}
                          >
                            Start Job
                          </Button>
                        )}
                        {booking.status === 'in_progress' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              completeMutation.mutate(booking.id);
                            }}
                            disabled={completeMutation.isPending}
                            data-testid={`button-complete-${booking.id}`}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{selectedBooking.priceCard.title}</div>
                  <div className="text-sm text-muted-foreground">#{selectedBooking.bookingRef}</div>
                </div>
                <StatusBadge status={selectedBooking.status} />
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Customer</div>
                  <div>{selectedBooking.customer.firstName} {selectedBooking.customer.lastName}</div>
                  <div className="text-sm text-muted-foreground">{selectedBooking.customer.email}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Scheduled</div>
                  <div>{format(new Date(selectedBooking.scheduledAt), 'MMMM d, yyyy at h:mm a')}</div>
                  <div className="text-sm text-muted-foreground">Duration: {selectedBooking.durationMinutes} minutes</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Service Address</div>
                  <div>{selectedBooking.address.label}</div>
                  <div className="text-sm">{selectedBooking.address.line1}</div>
                  {selectedBooking.address.line2 && (
                    <div className="text-sm">{selectedBooking.address.line2}</div>
                  )}
                  <div className="text-sm">{selectedBooking.address.city}, {selectedBooking.address.postalCode}</div>
                </div>

                {selectedBooking.notes && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Special Instructions</div>
                    <div className="text-sm">{selectedBooking.notes}</div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatMoney(selectedBooking.subtotal)}</span>
                </div>
                {selectedBooking.addOns.map((addOn, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-muted-foreground">
                    <span>{addOn.name}</span>
                    <span>{formatMoney(addOn.price)}</span>
                  </div>
                ))}
                {selectedBooking.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatMoney(selectedBooking.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatMoney(selectedBooking.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
