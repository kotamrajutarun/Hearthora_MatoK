import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Trash2, Star } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAddressSchema, type InsertAddress } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Address = {
  id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  postalCode: string;
  lat?: number | null;
  lng?: number | null;
  isDefault: boolean;
};

export default function Addresses() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      toast({
        title: "Address deleted",
        description: "The address has been removed."
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

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('PUT', `/api/addresses/${id}/default`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      toast({
        title: "Default address updated",
        description: "This address is now your default."
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

  const sortedAddresses = addresses?.sort((a, b) => {
    if (a.isDefault) return -1;
    if (b.isDefault) return 1;
    return 0;
  }) || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-addresses">My Addresses</h1>
          <p className="text-muted-foreground mt-2">
            Manage your service addresses
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-address">
              <Plus className="h-4 w-4 mr-2" />
              Add Address
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

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading addresses...</div>
      ) : sortedAddresses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No addresses yet. Add your first address to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAddresses.map((address) => (
            <Card key={address.id} data-testid={`card-address-${address.id}`}>
              <CardHeader className="gap-1 space-y-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base" data-testid={`text-label-${address.id}`}>
                      {address.label}
                    </CardTitle>
                  </div>
                  {address.isDefault && (
                    <Star className="h-4 w-4 fill-primary text-primary" data-testid={`icon-default-${address.id}`} />
                  )}
                </div>
                <CardDescription>
                  {address.line1}
                  {address.line2 && `, ${address.line2}`}
                </CardDescription>
                <CardDescription>
                  {address.city}, {address.postalCode}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDefaultMutation.mutate(address.id)}
                    disabled={setDefaultMutation.isPending}
                    data-testid={`button-set-default-${address.id}`}
                  >
                    Set as Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteMutation.mutate(address.id)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-${address.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
