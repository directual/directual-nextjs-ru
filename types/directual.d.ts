// Типы для directual-api библиотеки

declare module 'directual-api' {
  export interface DirectualConfig {
    apiHost: string;
    appID: string;
    streamApiHost?: string; // Хост для SSE стриминга, дефолт: https://api.alfa.directual.com
  }
  
  export interface DirectualResponse {
    payload?: unknown[];
    result?: unknown;
    pageInfo?: {
      page: number;
      pageSize: number;
      totalPages: number;
    };
    status?: string;
    token?: string; // sessionID при magic-link авторизации
  }

  // Коллбеки для SSE стриминга
  export interface StreamCallbacks {
    onData: (data: unknown, event: string) => void; // event: 'start' | 'chunk' | 'done'
    onError?: (error: Error) => void;
    onComplete?: () => void;
  }

  // Ответ стрим-запроса — управление потоком
  export interface StreamResponse {
    abort: () => void;       // Прервать стрим
    promise: Promise<void>;  // Ждать завершения
  }

  export interface DirectualStructure {
    getData(
      endpoint: string,
      params?: Record<string, unknown>
    ): Promise<DirectualResponse>;
    
    setData(
      endpoint: string,
      payload?: Record<string, unknown>,
      params?: Record<string, unknown>
    ): Promise<DirectualResponse>;

    // SSE стрим — POST через /good/api/v5/stream/{structure}/{endpoint}
    setStream(
      endpoint: string,
      payload: Record<string, unknown>,
      params: Record<string, unknown>,
      callbacks: StreamCallbacks
    ): StreamResponse;
  }

  export interface DirectualAuthToken {
    sessionID: string;
    username: string;
    role: string;
    nid?: string;
  }

  // Результат auth.check() — встроенная проверка сессии через /good/api/v4/auth/check
  export interface DirectualCheckResult {
    result: boolean;
    token?: string;
    username?: string;
    role?: string;
  }

  export interface DirectualAuth {
    login(email: string, password: string): Promise<DirectualAuthToken>;
    register(email: string, password: string, data?: Record<string, unknown>): Promise<DirectualAuthToken>;
    logout(sessionID: string): Promise<void>;
    check(sessionID: string): Promise<DirectualCheckResult>;
    isAuthorize(sid: string, cb: (isAuth: boolean, token?: DirectualAuthToken) => void): void;
  }

  export default class Directual {
    constructor(config: DirectualConfig);
    structure(name: string): DirectualStructure;
    auth: DirectualAuth;
  }
}







