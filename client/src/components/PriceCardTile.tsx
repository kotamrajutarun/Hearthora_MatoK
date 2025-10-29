import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Plus } from "lucide-react";
import { formatMoney } from "@/lib/money";

type AddOn = { name: string; price: number };

interface PriceCardTileProps {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  basePrice: number;
  durationMinutes: number;
  addOns: AddOn[];
  providerName?: string;
  onClick?: () => void;
}

export function PriceCardTile({
  id,
  title,
  description,
  category,
  city,
  basePrice,
  durationMinutes,
  addOns,
  providerName,
  onClick
}: PriceCardTileProps) {
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const durationText = hours > 0 
    ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
    : `${mins}m`;

  return (
    <Card 
      className="hover-elevate active-elevate-2 cursor-pointer" 
      onClick={onClick}
      data-testid={`card-price-${id}`}
    >
      <CardHeader className="gap-1 space-y-0 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base" data-testid={`text-title-${id}`}>
            {title}
          </CardTitle>
          <Badge variant="secondary" className="shrink-0" data-testid={`badge-category-${id}`}>
            {category}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2" data-testid={`text-description-${id}`}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1" data-testid={`text-city-${id}`}>
            <MapPin className="h-4 w-4" />
            {city}
          </div>
          <div className="flex items-center gap-1" data-testid={`text-duration-${id}`}>
            <Clock className="h-4 w-4" />
            {durationText}
          </div>
        </div>

        {providerName && (
          <div className="text-sm text-muted-foreground" data-testid={`text-provider-${id}`}>
            by {providerName}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <div className="text-2xl font-semibold" data-testid={`text-price-${id}`}>
              {formatMoney(basePrice)}
            </div>
            {addOns.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Plus className="h-3 w-3" />
                {addOns.length} add-on{addOns.length !== 1 ? 's' : ''} available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
