import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-foreground">404</h1>
          <h2 className="text-3xl font-bold text-foreground">
            Страница не найдена
          </h2>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Похоже, что страница, которую вы ищете, не существует или была перемещена.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button size="lg" variant="default">
              На главную
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

