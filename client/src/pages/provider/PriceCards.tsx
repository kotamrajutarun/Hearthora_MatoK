import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, DollarSign, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPriceCardSchema, type InsertPriceCard } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatMoney } from "@/lib/money";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";

type PriceCard = {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  basePrice: number;
  durationMinutes: number;
  addOns: Array<{ name: string; price: number }>;
  isActive: boolean;
};

type Category = {
  id: string;
  name: string;
};

const priceCardFormSchema = insertPriceCardSchema.omit({ providerId: true, serviceId: true }).extend({
  addOns: z.array(z.object({ name: z.string(), price: z.number() })).default([])
});

type PriceCardForm = z.infer<typeof priceCardFormSchema>;

export default function PriceCards() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PriceCard | null>(null);
  const [addOnInput, setAddOnInput] = useState({ name: '', price: '' });

  const { data: priceCards, isLoading } = useQuery<PriceCard[]>({
    queryKey: ['/api/price-cards/mine'],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<PriceCardForm>({
    resolver: zodResolver(priceCardFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      city: '',
      basePrice: 0,
      durationMinutes: 60,
      addOns: [],
      isActive: true
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: PriceCardForm) => {
      const res = await apiRequest('POST', '/api/price-cards', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/price-cards/mine'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Price card created",
        description: "Your service is now available for instant booking."
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PriceCardForm> }) => {
      const res = await apiRequest('PUT', `/api/price-cards/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/price-cards/mine'] });
      setEditingCard(null);
      form.reset();
      toast({
        title: "Price card updated",
        description: "Your changes have been saved."
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
      await apiRequest('DELETE', `/api/price-cards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/price-cards/mine'] });
      toast({
        title: "Price card deleted",
        description: "The service has been removed."
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

  const handleEdit = (card: PriceCard) => {
    setEditingCard(card);
    form.reset({
      title: card.title,
      description: card.description,
      category: card.category,
      city: card.city,
      basePrice: card.basePrice,
      durationMinutes: card.durationMinutes,
      addOns: card.addOns,
      isActive: card.isActive
    });
  };

  const handleAddAddOn = () => {
    const price = parseFloat(addOnInput.price);
    if (addOnInput.name && !isNaN(price)) {
      const currentAddOns = form.getValues('addOns') || [];
      form.setValue('addOns', [...currentAddOns, { name: addOnInput.name, price }]);
      setAddOnInput({ name: '', price: '' });
    }
  };

  const handleRemoveAddOn = (index: number) => {
    const currentAddOns = form.getValues('addOns') || [];
    form.setValue('addOns', currentAddOns.filter((_, i) => i !== index));
  };

  const handleSubmit = (data: PriceCardForm) => {
    if (editingCard) {
      updateMutation.mutate({ id: editingCard.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingCard(null);
    form.reset();
    setAddOnInput({ name: '', price: '' });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-price-cards">My Price Cards</h1>
          <p className="text-muted-foreground mt-2">
            Manage your fixed-price instant booking services
          </p>
        </div>
        <Dialog open={isCreateDialogOpen || !!editingCard} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-price-card">
              <Plus className="h-4 w-4 mr-2" />
              Create Price Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCard ? 'Edit Price Card' : 'Create Price Card'}</DialogTitle>
              <DialogDescription>
                Set up a fixed-price service for instant booking
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1-Hour Math Tutoring" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what's included in this service..." 
                          {...field} 
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., New York" {...field} value={field.value || ''} data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="60" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-duration"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <FormLabel>Add-ons (optional)</FormLabel>
                  {form.watch('addOns')?.map((addOn, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input value={addOn.name} disabled className="flex-1" />
                      <Input value={formatMoney(addOn.price)} disabled className="w-24" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveAddOn(idx)}
                        data-testid={`button-remove-addon-${idx}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Add-on name"
                        value={addOnInput.name}
                        onChange={(e) => setAddOnInput({ ...addOnInput, name: e.target.value })}
                        data-testid="input-addon-name"
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={addOnInput.price}
                        onChange={(e) => setAddOnInput({ ...addOnInput, price: e.target.value })}
                        data-testid="input-addon-price"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddAddOn}
                      data-testid="button-add-addon"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Make this service available for instant booking
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseDialog}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : editingCard ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading price cards...</div>
      ) : !priceCards || priceCards.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No price cards yet. Create your first one to start offering instant booking.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {priceCards.map((card) => (
            <Card key={card.id} data-testid={`card-price-${card.id}`}>
              <CardHeader className="gap-1 space-y-0 pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base" data-testid={`text-title-${card.id}`}>
                    {card.title}
                  </CardTitle>
                  <span className={`text-xs px-2 py-1 rounded ${card.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {card.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <CardDescription className="line-clamp-2">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatMoney(card.basePrice)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {card.durationMinutes}m
                  </div>
                </div>

                {card.addOns.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {card.addOns.length} add-on{card.addOns.length !== 1 ? 's' : ''} available
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(card)}
                    data-testid={`button-edit-${card.id}`}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-delete-${card.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Price Card</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this price card? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(card.id)}
                          data-testid={`button-confirm-delete-${card.id}`}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
