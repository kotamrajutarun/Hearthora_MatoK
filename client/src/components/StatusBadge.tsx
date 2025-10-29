import { Badge } from "@/components/ui/badge";

type BookingStatus = 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';

const statusConfig: Record<BookingStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  accepted: { label: 'Accepted', variant: 'default' },
  declined: { label: 'Declined', variant: 'destructive' },
  in_progress: { label: 'In Progress', variant: 'default' },
  completed: { label: 'Completed', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' }
};

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={className} data-testid={`badge-status-${status}`}>
      {config.label}
    </Badge>
  );
}
