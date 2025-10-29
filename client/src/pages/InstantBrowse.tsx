import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriceCardTile } from "@/components/PriceCardTile";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SlotPicker } from "@/components/SlotPicker";
import { AddressPicker } from "@/components/AddressPicker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { formatMoney } from "@/lib/money";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type PriceCard = {
  id: string;
  providerId: string;
  title: string;
  description: string;
  category: string;
  city: string;
  basePrice: number;
  durationMinutes: number;
  addOns: Array<{ name: string; price: number }>;
  provider?: {
    firstName: string;
    lastName: string;
  };
};

type Category = {
  id: string;
  name: string;
};

export default function InstantBrowse() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PriceCard | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);
  const [notes, setNotes] = useState('');

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: priceCards, isLoading } = useQuery<PriceCard[]>({
    queryKey: ['/api/price-cards/public'],
  });

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCard || !selectedDateTime || !selectedAddressId) {
        throw new Error('Missing required booking information');
      }

      const selectedAddOnsList = selectedCard.addOns.filter((_, idx) => selectedAddOns.includes(idx));
      const addOnNames = selectedAddOnsList.map(addon => addon.name);
      
      const previewRes = await apiRequest('POST', '/api/bookings/preview', {
        priceCardId: selectedCard.id,
        addOnNames
      });
      const preview = await previewRes.json();

      const res = await apiRequest('POST', '/api/bookings', {
        priceCardId: selectedCard.id,
        addressId: selectedAddressId,
        scheduledAt: selectedDateTime.toISOString(),
        addOnNames,
        notes
      });
      return await res.json();
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/mine'] });
      setBookingDialogOpen(false);
      resetBookingForm();
      toast({
        title: "Booking created!",
        description: `Your booking (${booking.bookingRef}) has been sent to the provider.`
      });
      setLocation('/my-bookings');
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetBookingForm = () => {
    setSelectedCard(null);
    setSelectedDateTime(null);
    setSelectedAddressId(null);
    setSelectedAddOns([]);
    setNotes('');
  };

  const filteredCards = priceCards?.filter(card => {
    if (categoryFilter !== 'all' && card.category !== categoryFilter) return false;
    if (cityFilter !== 'all' && card.city !== cityFilter) return false;
    if (search && !card.title.toLowerCase().includes(search.toLowerCase()) &&
        !card.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) || [];

  const cities = Array.from(new Set(priceCards?.map(c => c.city) || [])).sort();

  const calculateTotal = () => {
    if (!selectedCard) return 0;
    const addOnsTotal = selectedCard.addOns
      .filter((_, idx) => selectedAddOns.includes(idx))
      .reduce((sum, addOn) => sum + addOn.price, 0);
    return selectedCard.basePrice + addOnsTotal;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="heading-instant-browse">Instant Book Services</h1>
        <p className="text-muted-foreground mt-2">
          Browse fixed-price services and book instantly
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-category">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-city">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading services...</div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No services found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => (
            <PriceCardTile
              key={card.id}
              {...card}
              providerName={card.provider ? `${card.provider.firstName} ${card.provider.lastName}` : undefined}
              onClick={() => {
                setSelectedCard(card);
                setBookingDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <Dialog open={bookingDialogOpen} onOpenChange={(open) => {
        setBookingDialogOpen(open);
        if (!open) resetBookingForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="heading-book-service">Book Service</DialogTitle>
            <DialogDescription>
              {selectedCard?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedCard && (
            <div className="space-y-6">
              <SlotPicker
                providerId={selectedCard.providerId}
                durationMinutes={selectedCard.durationMinutes}
                selectedDateTime={selectedDateTime}
                onSelect={setSelectedDateTime}
              />

              <AddressPicker
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
              />

              {selectedCard.addOns.length > 0 && (
                <div className="space-y-2">
                  <Label>Add-ons (optional)</Label>
                  {selectedCard.addOns.map((addOn, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Checkbox
                        id={`addon-${idx}`}
                        checked={selectedAddOns.includes(idx)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAddOns([...selectedAddOns, idx]);
                          } else {
                            setSelectedAddOns(selectedAddOns.filter(i => i !== idx));
                          }
                        }}
                        data-testid={`checkbox-addon-${idx}`}
                      />
                      <label
                        htmlFor={`addon-${idx}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                      >
                        {addOn.name} - {formatMoney(addOn.price)}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Special Instructions (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  data-testid="textarea-notes"
                />
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Price</span>
                  <span>{formatMoney(selectedCard.basePrice)}</span>
                </div>
                {selectedAddOns.map(idx => (
                  <div key={idx} className="flex justify-between text-sm text-muted-foreground">
                    <span>{selectedCard.addOns[idx].name}</span>
                    <span>{formatMoney(selectedCard.addOns[idx].price)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span data-testid="text-total">{formatMoney(calculateTotal())}</span>
                </div>
              </div>

              {selectedDateTime && (
                <div className="text-sm text-muted-foreground">
                  Scheduled for: {format(selectedDateTime, 'MMMM d, yyyy at h:mm a')}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBookingDialogOpen(false);
                    resetBookingForm();
                  }}
                  data-testid="button-cancel-booking"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => bookingMutation.mutate()}
                  disabled={!selectedDateTime || !selectedAddressId || bookingMutation.isPending}
                  data-testid="button-confirm-booking"
                >
                  {bookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
