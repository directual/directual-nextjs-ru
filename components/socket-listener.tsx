'use client';

import { useEffect } from 'react';
import { useSocket } from '@/hooks/use-socket';

// Глобальный слушатель WebSocket для всего приложения
export function SocketListener() {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Обработчик одиночного события
    const handleSingleEvent = (event: string, payload: unknown) => {
      if (event === 'alert') {
        let alertData: any = payload;
        
        // Если пришёл массив - берём первый элемент
        if (Array.isArray(alertData)) {
          alertData = alertData[0];
        }
        
        // Если пришла строка - парсим JSON
        if (typeof alertData === 'string') {
          try {
            alertData = JSON.parse(alertData);
          } catch (e) {
            console.error('[WebSocket] Ошибка парсинга alert:', e);
            return;
          }
        }
        
        if (window.__showGlobalAlert) {
          window.__showGlobalAlert(alertData);
        }
      } else if (event === 'refresh') {
        if (window.__refreshData) {
          window.__refreshData(payload);
        }
      }
    };

    const handleAnyEvent = (eventName: string, ...args: unknown[]) => {
      const payload = args[0];

      // Парсим комбинированные события через запятую
      // Пример: "alert,refresh,project_updated"
      const events = eventName.includes(',') 
        ? eventName.split(',').map(e => e.trim()) 
        : [eventName];

      // Обрабатываем каждое событие с одним и тем же payload
      events.forEach(event => {
        handleSingleEvent(event, payload);
      });
    };

    socket.onAny(handleAnyEvent);

    // Cleanup - отписываемся при размонтировании, чтобы не было множественных подписок
    return () => {
      socket.offAny(handleAnyEvent);
    };
  }, [socket]);

  // Компонент ничего не рендерит
  return null;
}

