'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { X } from 'lucide-react';
import { toKebab } from '@/lib/utils';

interface AlertData {
  id?: string | number;
  type?: 'success' | 'error' | 'default';
  variant?: 'success' | 'destructive' | 'default';
  title?: string;
  message?: string;
  description?: string;
  icon?: string;
}

interface AlertItem extends AlertData {
  id: string | number;
}

// Компонент для отображения глобальных алертов из WebSocket
export function GlobalAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // Добавить новый алерт
  const addAlert = useCallback((data: unknown) => {
    const alertData = data as AlertData;
    
    // Дедупликация
    setAlerts(prev => {
      const isDuplicate = prev.some(a => 
        a.title === alertData.title && 
        a.description === alertData.description
      );
      
      if (isDuplicate) return prev;
      
      const id = Date.now() + Math.random();
      const newAlert = { ...alertData, id };
      
      // Автоматически убираем через 5 секунд
      setTimeout(() => {
        setAlerts(current => current.filter(a => a.id !== id));
      }, 5000);
      
      return [...prev, newAlert];
    });
  }, []);

  // Закрыть алерт вручную
  const closeAlert = (id: string | number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Экспортируем функцию добавления алерта глобально
  useEffect(() => {
    window.__showGlobalAlert = addAlert;
    return () => {
      delete window.__showGlobalAlert;
    };
  }, [addAlert]);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md pointer-events-none">
      {alerts.map((alert) => (
        <Alert 
          key={alert.id} 
          variant={alert.variant || 'default'}
          className="relative shadow-lg animate-in slide-in-from-top-2 pointer-events-auto"
        >
          {/* Кнопка закрытия */}
          <button
            onClick={() => closeAlert(alert.id)}
            className="absolute top-2 right-2 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Иконка — lazy-загрузка по имени */}
          {alert.icon && (
            <Suspense fallback={<span className="h-4 w-4" />}>
              <DynamicIcon name={toKebab(alert.icon) as IconName} className="h-4 w-4" />
            </Suspense>
          )}

          {/* Заголовок */}
          {alert.title && <AlertTitle>{alert.title}</AlertTitle>}

          {/* Описание */}
          {alert.description && (
            <AlertDescription>{alert.description}</AlertDescription>
          )}
        </Alert>
      ))}
    </div>
  );
}

