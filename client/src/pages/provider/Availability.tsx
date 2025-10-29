import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type TimeSlot = { start: string; end: string };
type WeeklySlot = { day: number; slots: TimeSlot[] };
type Availability = {
  weekly: WeeklySlot[];
  exceptions: Array<{ date: string; slots: TimeSlot[] }>;
};

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export default function AvailabilityPage() {
  const { toast } = useToast();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [daySlots, setDaySlots] = useState<Record<number, TimeSlot[]>>({});

  const { data: availability, isLoading } = useQuery<Availability>({
    queryKey: ['/api/availability/mine'],
  });

  useEffect(() => {
    if (availability && availability.weekly) {
      const days = availability.weekly.map((w: WeeklySlot) => w.day);
      setSelectedDays(days);
      const slotsMap: Record<number, TimeSlot[]> = {};
      availability.weekly.forEach((w: WeeklySlot) => {
        slotsMap[w.day] = w.slots;
      });
      setDaySlots(slotsMap);
    }
  }, [availability]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const weekly = selectedDays.map(day => ({
        day,
        slots: daySlots[day] || []
      }));

      const res = await apiRequest('POST', '/api/availability/weekly', {
        weekly,
        exceptions: []
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/availability/mine'] });
      toast({
        title: "Availability saved",
        description: "Your weekly schedule has been updated."
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

  const handleDayToggle = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
      const newSlots = { ...daySlots };
      delete newSlots[day];
      setDaySlots(newSlots);
    } else {
      setSelectedDays([...selectedDays, day]);
      setDaySlots({
        ...daySlots,
        [day]: [{ start: '09:00', end: '17:00' }]
      });
    }
  };

  const handleAddSlot = (day: number) => {
    setDaySlots({
      ...daySlots,
      [day]: [...(daySlots[day] || []), { start: '09:00', end: '17:00' }]
    });
  };

  const handleRemoveSlot = (day: number, index: number) => {
    const slots = daySlots[day] || [];
    setDaySlots({
      ...daySlots,
      [day]: slots.filter((_, i) => i !== index)
    });
  };

  const handleSlotChange = (day: number, index: number, field: 'start' | 'end', value: string) => {
    const slots = [...(daySlots[day] || [])];
    slots[index] = { ...slots[index], [field]: value };
    setDaySlots({
      ...daySlots,
      [day]: slots
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-availability">My Availability</h1>
          <p className="text-muted-foreground mt-2">
            Set your weekly availability for instant bookings
          </p>
        </div>
        <Button 
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || selectedDays.length === 0}
          data-testid="button-save-availability"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? 'Saving...' : 'Save Availability'}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading availability...</div>
      ) : (
        <div className="space-y-4">
          {DAYS.map((day) => {
            const isSelected = selectedDays.includes(day.value);
            const slots = daySlots[day.value] || [];

            return (
              <Card key={day.value} data-testid={`card-day-${day.value}`}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={isSelected}
                      onCheckedChange={() => handleDayToggle(day.value)}
                      data-testid={`checkbox-day-${day.value}`}
                    />
                    <label
                      htmlFor={`day-${day.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <CardTitle className="text-base">{day.label}</CardTitle>
                    </label>
                  </div>
                </CardHeader>
                {isSelected && (
                  <CardContent className="space-y-3">
                    {slots.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Start Time</Label>
                            <Input
                              type="time"
                              value={slot.start}
                              onChange={(e) => handleSlotChange(day.value, idx, 'start', e.target.value)}
                              data-testid={`input-start-${day.value}-${idx}`}
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">End Time</Label>
                            <Input
                              type="time"
                              value={slot.end}
                              onChange={(e) => handleSlotChange(day.value, idx, 'end', e.target.value)}
                              data-testid={`input-end-${day.value}-${idx}`}
                            />
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSlot(day.value, idx)}
                          disabled={slots.length === 1}
                          data-testid={`button-remove-slot-${day.value}-${idx}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSlot(day.value)}
                      data-testid={`button-add-slot-${day.value}`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Slot
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
