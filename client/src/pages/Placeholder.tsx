import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Home } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description: string;
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold" data-testid="text-page-title">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="text-page-description">
            {description}
          </p>
        </div>
        
        <div className="pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            This feature is coming soon. Stay tuned!
          </p>
          <Link href="/">
            <Button size="lg" data-testid="button-go-home">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
