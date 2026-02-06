'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const { isAuthorized, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthorized()) {
        router.push('/dashboard');
      } else {
        // Не авторизован — на вход
        router.push('/auth/login');
      }
    }
  }, [loading, isAuthorized, router]);

  // Всегда показываем загрузку — редирект произойдёт в useEffect
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="text-xl text-foreground">Загрузка...</div>
      </div>
    </div>
  );
}
