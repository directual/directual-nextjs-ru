import { io, Socket } from 'socket.io-client';

// Берем APP_ID из переменных окружения
const APP_ID = process.env.NEXT_PUBLIC_DIRECTUAL_APP_ID;

// WebSocket клиент для Directual
class DirectualSocket {
  private socket: Socket;
  private isConnectedFlag: boolean = false;

  constructor() {
    // autoConnect = false, потому что сначала нужно получить sessionID
    this.socket = io('https://api.directual.com', { autoConnect: false });
  }

  // Получить sessionID из HTTP Only cookie через API endpoint
  async getSessionID(): Promise<string | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include', // Важно для отправки cookie
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.sessionID) {
          return data.sessionID;
        }
      }
      return null;
    } catch (error) {
      console.error('Ошибка получения sessionID для WebSocket:', error);
      return null;
    }
  }

  // Подключиться к вебсокету (теперь async)
  async connect(): Promise<boolean> {
    const sessionID = await this.getSessionID();
    
    if (!sessionID) {
      console.error('WebSocket: sessionID не найден. Авторизуйтесь сначала.');
      return false;
    }

    if (!APP_ID) {
      console.error('WebSocket: NEXT_PUBLIC_DIRECTUAL_APP_ID не установлен.');
      return false;
    }

    // Устанавливаем auth данные
    this.socket.auth = {
      app_id: APP_ID,
      session_id: sessionID,
    };

    // Подключаемся
    this.socket.connect();
    
    // Слушаем системные события
    this.socket.on('connect', () => {
      console.log('WebSocket подключен:', this.socket.id);
      this.isConnectedFlag = true;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket отключен:', reason);
      this.isConnectedFlag = false;
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket ошибка подключения:', error.message);
    });

    return true;
  }

  // Отключиться
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnectedFlag = false;
    }
  }

  // Подписаться на конкретное событие
  on(eventName: string, callback: (...args: unknown[]) => void): void {
    if (!this.socket) {
      console.error('WebSocket не инициализирован');
      return;
    }
    this.socket.on(eventName, callback);
  }

  // Отписаться от события
  off(eventName: string, callback?: (...args: unknown[]) => void): void {
    if (!this.socket) return;
    this.socket.off(eventName, callback);
  }

  // Подписаться на ВСЕ события (для дебага)
  onAny(callback: (eventName: string, args: unknown[]) => void): void {
    if (!this.socket) {
      console.error('WebSocket не инициализирован');
      return;
    }
    this.socket.onAny((eventName: string, ...args: unknown[]) => {
      callback(eventName, args);
    });
  }

  // Отписаться от ВСЕХ событий
  offAny(callback?: (eventName: string, args: unknown[]) => void): void {
    if (!this.socket) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.socket.offAny(callback as any);
  }

  // Отправить событие на сервер
  emit(eventName: string, data?: unknown): boolean {
    if (!this.socket || !this.isConnectedFlag) {
      console.error('WebSocket не подключен');
      return false;
    }
    this.socket.emit(eventName, data);
    return true;
  }

  // Проверка статуса подключения
  getStatus(): { isConnected: boolean; socketId: string | null } {
    return {
      isConnected: this.isConnectedFlag,
      socketId: this.socket.id || null,
    };
  }

  // Getter для isConnected
  get isConnected(): boolean {
    return this.isConnectedFlag;
  }
}

// Создаем синглтон
let socketInstance: DirectualSocket | null = null;

export const getSocket = (): DirectualSocket => {
  if (!socketInstance) {
    socketInstance = new DirectualSocket();
  }
  return socketInstance;
};

export default getSocket;

