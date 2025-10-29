import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney } from "@/lib/money";
import { Calendar, Clock, MapPin, User, FileText } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

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
  addOns: Array<{ name: string; price: number }>;
};

export default function MyBookings() {
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/mine'],
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('PUT', `/api/bookings/${id}/cancel`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/mine'] });
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled."
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
        title: "Booking completed",
        description: "Thank you! You can now leave a review."
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
    return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
  }) || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="heading-my-bookings">My Bookings</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your service bookings
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading bookings...</div>
      ) : sortedBookings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No bookings yet. Browse services to make your first booking.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBookings.map((booking) => (
            <Card 
              key={booking.id} 
              className="hover-elevate active-elevate-2 cursor-pointer"
              onClick={() => setSelectedBooking(booking)}
              data-testid={`card-booking-${booking.id}`}
            >
              <CardHeader className="gap-1 space-y-0 pb-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex-1">
                    <CardTitle className="text-lg" data-testid={`text-title-${booking.id}`}>
                      {booking.priceCard.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Booking #{booking.bookingRef}
                    </CardDescription>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    {booking.provider.firstName} {booking.provider.lastName}
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
                    {booking.address.city}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-lg font-semibold" data-testid={`text-total-${booking.id}`}>
                    {formatMoney(booking.total)}
                  </div>
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            data-testid={`button-cancel-${booking.id}`}
                          >
                            Cancel Booking
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this booking? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => cancelMutation.mutate(booking.id)}
                              data-testid={`button-confirm-cancel-${booking.id}`}
                            >
                              Cancel Booking
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
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
                  <div className="text-sm font-medium text-muted-foreground">Provider</div>
                  <div>{selectedBooking.provider.firstName} {selectedBooking.provider.lastName}</div>
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
