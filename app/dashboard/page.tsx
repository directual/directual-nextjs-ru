'use client';

import { useAuth } from '@/hooks/use-auth';
import { Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold flex items-center gap-3 mb-6">
        <Home size={28} className="flex-shrink-0" />
        Главная
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Добро пожаловать!</CardTitle>
            <CardDescription>
              {user ? `Привет, ${user.name || user.email}!` : 'Загрузка...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Это стартовая страница вашего шаблона. Добавьте сюда нужный контент.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Начало работы</CardTitle>
            <CardDescription>Быстрый старт</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Настройте страницы, добавьте эндпоинты в fetcher и подключите WebSocket события.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Документация</CardTitle>
            <CardDescription>Полезные ссылки</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Проверьте README.md для инструкций по настройке Directual.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
