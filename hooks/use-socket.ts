import { useEffect, useRef, useState } from 'react';
import getSocket from '@/lib/directual/socket';

interface UseSocketResult {
  socket: ReturnType<typeof getSocket> | null;
  isConnected: boolean;
}

// Хук для работы с WebSocket в React компонентах
export function useSocket(): UseSocketResult {
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Получаем инстанс сокета
    socketRef.current = getSocket();

    // Подключаемся (теперь async)
    socketRef.current.connect().then((connected) => {
      if (connected) {
        // Подписываемся на события подключения/отключения
        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        if (socketRef.current) {
          socketRef.current.on('connect', handleConnect);
          socketRef.current.on('disconnect', handleDisconnect);
        }
      }
    });

    // Cleanup при размонтировании компонента
    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
      }
      // НЕ вызываем disconnect(), потому что это синглтон
      // и может использоваться в других компонентах
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
  };
}

// Хук для подписки на конкретное событие
export function useSocketEvent(eventName: string, callback: (...args: unknown[]) => void): ReturnType<typeof getSocket> | null {
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  // Сохраняем callback в ref, чтобы избежать повторных подписок
  const callbackRef = useRef(callback);

  // Обновляем ref при изменении callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    socketRef.current = getSocket();

    // Создаем стабильный обработчик, который вызывает актуальный callback из ref
    const handler = (...args: unknown[]) => {
      callbackRef.current(...args);
    };

    // Подключаемся, если еще не подключены (теперь async)
    if (!socketRef.current.isConnected) {
      socketRef.current.connect().then(() => {
        // Подписываемся на событие после подключения
        if (socketRef.current) {
          socketRef.current.on(eventName, handler);
        }
      });
    } else {
      // Уже подключены, просто подписываемся
      socketRef.current.on(eventName, handler);
    }

    // Отписываемся при размонтировании
    return () => {
      if (socketRef.current) {
        socketRef.current.off(eventName, handler);
      }
    };
  }, [eventName]); // Убираем callback из зависимостей

  return socketRef.current;
}

// Хук для отправки событий
export function useSocketEmit(): (eventName: string, data?: unknown) => boolean {
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  useEffect(() => {
    socketRef.current = getSocket();
  }, []);

  const emit = (eventName: string, data?: unknown): boolean => {
    if (socketRef.current) {
      return socketRef.current.emit(eventName, data);
    }
    return false;
  };

  return emit;
}

export default useSocket;

