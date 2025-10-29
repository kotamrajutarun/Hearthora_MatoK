import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertAddressSchema, type InsertAddress } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type Address = {
  id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  postalCode: string;
  isDefault: boolean;
};

interface AddressPickerProps {
  selectedId: string | null;
  onSelect: (addressId: string) => void;
}

export function AddressPicker({ selectedId, onSelect }: AddressPickerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: addresses, isLoading } = useQuery<Address[]>({
    queryKey: ['/api/addresses'],
  });

  const form = useForm<InsertAddress>({
    resolver: zodResolver(insertAddressSchema),
    defaultValues: {
      label: '',
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      lat: 0,
      lng: 0
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAddress) => {
      const res = await apiRequest('POST', '/api/addresses', data);
      return await res.json();
    },
    onSuccess: (newAddress: Address) => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      onSelect(newAddress.id);
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Address added",
        description: "Your new address has been saved."
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

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading addresses...</div>;
  }

  const sortedAddresses = addresses?.sort((a, b) => {
    if (a.isDefault) return -1;
    if (b.isDefault) return 1;
    return 0;
  }) || [];

  return (
    <div className="space-y-3">
      <Label>Service Address</Label>
      <div className="grid gap-2">
        {sortedAddresses.map((address) => (
          <Card
            key={address.id}
            className={`p-3 cursor-pointer hover-elevate active-elevate-2 ${
              selectedId === address.id ? 'border-primary' : ''
            }`}
            onClick={() => onSelect(address.id)}
            data-testid={`card-address-${address.id}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium" data-testid={`text-label-${address.id}`}>
                      {address.label}
                    </div>
                    {address.isDefault && (
                      <span className="text-xs text-muted-foreground">(Default)</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {address.line1}
                    {address.line2 && `, ${address.line2}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {address.city}, {address.postalCode}
                  </div>
                </div>
              </div>
              {selectedId === address.id && (
                <Check className="h-5 w-5 text-primary shrink-0" data-testid={`icon-selected-${address.id}`} />
              )}
            </div>
          </Card>
        ))}

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="justify-start gap-2" data-testid="button-add-address">
              <Plus className="h-4 w-4" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
              <DialogDescription>
                Add a new service address for your bookings.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Home, Office, etc." {...field} data-testid="input-label" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} data-testid="input-line1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apt, Suite, etc. (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Apt 4B" {...field} value={field.value || ''} data-testid="input-line2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} data-testid="input-postal" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    data-testid="button-save-address"
                  >
                    {createMutation.isPending ? 'Saving...' : 'Save Address'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
