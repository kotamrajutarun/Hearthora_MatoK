import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Clock } from "lucide-react";
import { format, addMinutes, startOfDay, addDays, isSameDay, parseISO } from "date-fns";

type TimeSlot = { start: string; end: string };
type WeeklySlot = { day: number; slots: TimeSlot[] };
type Availability = {
  weekly: WeeklySlot[];
  exceptions: Array<{ date: string; slots: TimeSlot[] }>;
};

interface SlotPickerProps {
  providerId: string;
  durationMinutes: number;
  selectedDateTime: Date | null;
  onSelect: (dateTime: Date) => void;
}

function generateTimeSlots(weeklySlot: WeeklySlot | undefined, durationMinutes: number, date: Date): Date[] {
  if (!weeklySlot) return [];
  
  const slots: Date[] = [];
  const dayStart = startOfDay(date);
  
  for (const slot of weeklySlot.slots) {
    const [startHour, startMin] = slot.start.split(':').map(Number);
    const [endHour, endMin] = slot.end.split(':').map(Number);
    
    const slotStart = new Date(dayStart);
    slotStart.setHours(startHour, startMin, 0, 0);
    
    const slotEnd = new Date(dayStart);
    slotEnd.setHours(endHour, endMin, 0, 0);
    
    let current = slotStart;
    while (current < slotEnd) {
      const potentialEnd = addMinutes(current, durationMinutes);
      if (potentialEnd <= slotEnd) {
        slots.push(new Date(current));
      }
      current = addMinutes(current, 30);
    }
  }
  
  return slots;
}

export function SlotPicker({ providerId, durationMinutes, selectedDateTime, onSelect }: SlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(selectedDateTime || addDays(new Date(), 1));

  const { data: availability, isLoading } = useQuery<Availability>({
    queryKey: ['/api/availability/public', providerId],
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading availability...</div>;
  }

  if (!availability) {
    return <div className="text-sm text-muted-foreground">No availability found</div>;
  }

  const dayOfWeek = selectedDate.getDay();
  const weeklySlot = availability.weekly.find(w => w.day === dayOfWeek);
  const timeSlots = generateTimeSlots(weeklySlot, durationMinutes, selectedDate);

  const isDateAvailable = (date: Date) => {
    const day = date.getDay();
    return availability.weekly.some(w => w.day === day && w.slots.length > 0);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Select Date</Label>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          disabled={(date) => {
            const today = startOfDay(new Date());
            if (date < today) return true;
            return !isDateAvailable(date);
          }}
          className="rounded-md border"
          data-testid="calendar-slot-picker"
        />
      </div>

      <div>
        <Label>Select Time</Label>
        {timeSlots.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4 text-center border rounded-md">
            No available slots for {format(selectedDate, 'MMM d, yyyy')}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {timeSlots.map((slot, idx) => {
              const isSelected = selectedDateTime && isSameDay(selectedDateTime, slot) && 
                                 selectedDateTime.getTime() === slot.getTime();
              return (
                <Button
                  key={idx}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSelect(slot)}
                  data-testid={`button-slot-${format(slot, 'HH:mm')}`}
                  className="gap-1"
                >
                  <Clock className="h-3 w-3" />
                  {format(slot, 'h:mm a')}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
