'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Редирект на логин если не авторизован
  useEffect(() => {
    if (!authLoading && !user) {
      // Сохраняем текущий URL для возврата после логина
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar слева */}
      <DashboardSidebar />
      {/* Основной контент справа */}
      <div className="flex-1 flex flex-col">
        {/* Основной контент - здесь рендерятся дочерние страницы */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

