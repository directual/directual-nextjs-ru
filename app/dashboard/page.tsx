'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Home, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import fetcher from '@/lib/directual/fetcher';

export default function DashboardPage() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);

  // Тестовая отправка user action
  async function handleSendAction() {
    setSending(true);
    try {
      const result = await fetcher.postUserAction('test_message', {});
      console.log('postUserAction result:', result);
    } finally {
      setSending(false);
    }
  }

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

      <div className="mt-6">
        <Button onClick={handleSendAction} disabled={sending}>
          <Send size={16} />
          {sending ? 'Отправка...' : 'Отправить действие'}
        </Button>
      </div>
    </div>
  );
}
