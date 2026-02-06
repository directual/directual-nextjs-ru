import api from './client';
import { APP_ID } from './client';
import { ApiResponse, PageInfo, UserProfile } from '@/types';

interface GetResponse<T = unknown> extends ApiResponse<T[]> {
  pageInfo?: PageInfo | null;
}

interface PostResponse<T = unknown> extends ApiResponse<T> {
  status?: string | null;
}

// Универсальный Fetcher для работы с Directual API
// SessionID хранится в HTTP Only cookie, получаем через API endpoint
class Fetcher {
  private isCheckingSession: boolean = false; // Флаг для предотвращения рекурсии
  private sessionIDCache: string | null = null; // Кеш sessionID
  private sessionIDPromise: Promise<string | null> | null = null; // Промис для избежания параллельных запросов

  // Показываем ошибку через глобальный алерт
  private showError(message: string, statusCode?: number, endpoint?: string): void {
    if (typeof window !== 'undefined' && window.__showGlobalAlert) {
      const endpointText = endpoint ? `<br/><small><code>${endpoint}</code></small>` : '';
      window.__showGlobalAlert({
        variant: 'destructive',
        title: statusCode ? `Ошибка ${statusCode}` : 'Ошибка',
        description: `${message}${endpointText}`,
        icon: 'AlertCircle'
      });
    }
  }

  // Получить sessionID из HTTP Only cookie через API endpoint
  async getSessionID(): Promise<string | null> {
    // Если уже есть в кеше - возвращаем
    if (this.sessionIDCache) {
      return this.sessionIDCache;
    }

    // Если уже идет запрос - ждем его
    if (this.sessionIDPromise) {
      return this.sessionIDPromise;
    }

    // Делаем запрос
    this.sessionIDPromise = (async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.sessionID) {
            this.sessionIDCache = data.sessionID;
            return data.sessionID;
          }
        }
        return null;
      } catch (error) {
        console.error('Ошибка получения sessionID:', error);
        return null;
      } finally {
        this.sessionIDPromise = null;
      }
    })();

    return this.sessionIDPromise;
  }

  // Очистить кеш sessionID (при логауте)
  clearSessionCache(): void {
    this.sessionIDCache = null;
  }

  // Проверка сессии при 403 ошибке
  async handle403Error(): Promise<boolean> {
    // Предотвращаем рекурсию
    if (this.isCheckingSession) {
      return false;
    }

    this.isCheckingSession = true;
    try {
      // Сначала проверяем что sessionID вообще есть
      const sessionID = await this.getSessionID();
      if (!sessionID) {
        return false;
      }

      const checkResult = await this.checkSessionInternal();
      
      // Если checkSession вернул пустой массив - сессия протухла
      if (checkResult.success && Array.isArray(checkResult.data) && checkResult.data.length === 0) {
        console.warn('[Fetcher] ⚠️ Сессия протухла, отправляем событие session-expired');
        // Отправляем событие для разлогинивания
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('session-expired'));
        }
        return true; // Сессия протухла
      }
      return false; // Сессия валидна
    } catch (err) {
      console.error('[Fetcher] ✗ Ошибка при проверке сессии:', err);
      return false;
    } finally {
      this.isCheckingSession = false;
    }
  }

  // Внутренний метод проверки сессии без обработки 403
  async checkSessionInternal(queryParams: Record<string, unknown> = {}): Promise<GetResponse> {
    try {
      const sessionID = await this.getSessionID();
      const response = await api.structure('WebUserSession').getData('checkSession', { sessionID, ...queryParams });
      return {
        success: true,
        data: response.payload || [],
        pageInfo: response.pageInfo || null,
      };
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { msg?: string } }; message?: string };
      console.error('Fetcher checkSessionInternal error:', error);
      return {
        success: false,
        error: err.response?.data?.msg || err.message || 'Ошибка запроса',
      };
    }
  }

  // GET запрос
  async get<T = unknown>(structure: string, endpoint: string, params: Record<string, unknown> = {}, silent = false): Promise<GetResponse<T>> {
    try {
      const sessionID = await this.getSessionID();
      const response = await api.structure(structure).getData(endpoint, { sessionID, ...params });
      return {
        success: true,
        data: (response.payload || []) as T[],
        pageInfo: response.pageInfo || null,
      };
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { msg?: string } }; message?: string };
      const statusCode = err.response?.status;
      
      // Проверяем 403 ошибку
      if (statusCode === 403) {
        const sessionExpired = await this.handle403Error();
        if (sessionExpired) {
          return {
            success: false,
            error: 'Сессия истекла',
            sessionExpired: true,
          };
        }
      }
      
      // Показываем ошибку если 4xx или 5xx и не silent
      if (!silent && statusCode && statusCode >= 400) {
        const errorMsg = err.response?.data?.msg || err.message || 'Ошибка запроса';
        this.showError(errorMsg, statusCode, `${structure}.${endpoint}`);
      }
      
      console.error(`Fetcher GET error [${structure}.${endpoint}]:`, error);
      return {
        success: false,
        error: err.response?.data?.msg || err.message || 'Ошибка запроса',
      };
    }
  }

  // POST запрос
  async post<T = unknown>(
    structure: string,
    endpoint: string,
    payload: Record<string, unknown> = {},
    params: Record<string, unknown> = {},
    silent = false
  ): Promise<PostResponse<T>> {
    try {
      const sessionID = await this.getSessionID();
      const response = await api.structure(structure).setData(endpoint, payload, { sessionID, ...params });
      return {
        success: true,
        data: (response.result || response) as T,
        status: response.status || null,
      };
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { msg?: string } }; message?: string };
      const statusCode = err.response?.status;
      
      // Проверяем 403 ошибку
      if (statusCode === 403) {
        const sessionExpired = await this.handle403Error();
        if (sessionExpired) {
          return {
            success: false,
            error: 'Сессия истекла',
            sessionExpired: true,
          };
        }
      }
      
      // Показываем ошибку если 4xx или 5xx и не silent
      if (!silent && statusCode && statusCode >= 400) {
        const errorMsg = err.response?.data?.msg || err.message || 'Ошибка запроса';
        this.showError(errorMsg, statusCode, `${structure}.${endpoint}`);
      }
      
      console.error(`Fetcher POST error [${structure}.${endpoint}]:`, error);
      return {
        success: false,
        error: err.response?.data?.msg || err.message || 'Ошибка запроса',
      };
    }
  }

  // ================================
  // AUTH METHODS
  // ================================

  // Проверка сессии (публичный метод)
  async checkSession(queryParams: Record<string, unknown> = {}): Promise<GetResponse> {
    return this.get('WebUserSession', 'checkSession', queryParams, true);
  }

  // Запросить magic-link
  async magicLinkRequest(payload: Record<string, unknown> = {}, queryParams: Record<string, unknown> = {}): Promise<PostResponse> {
    return this.post('magic_link_link_request', 'magicLinkRequest', payload, queryParams);
  }

  // Сбросить пароль (запрос ссылки)
  async resetPassword(payload: Record<string, unknown> = {}, queryParams: Record<string, unknown> = {}): Promise<PostResponse> {
    return this.post('ResetPasswordRequest', 'resetPass', payload, queryParams);
  }

  // Установить новый пароль (с токеном из письма)
  async newPassword(payload: Record<string, unknown> = {}, queryParams: Record<string, unknown> = {}): Promise<PostResponse> {
    return this.post('reset_password_inputs', 'resetPassword', payload, queryParams);
  }

  // ================================
  // PROFILE METHODS
  // ================================

  // Прочитать профиль пользователя
  async readProfile(queryParams: Record<string, unknown> = {}): Promise<GetResponse<UserProfile>> {
    return this.get<UserProfile>('WebUser', 'profile', queryParams);
  }

  // Обновить профиль пользователя
  async updateProfile(payload: Record<string, unknown> = {}, queryParams: Record<string, unknown> = {}): Promise<PostResponse> {
    return this.post('WebUser', 'profile', payload, queryParams);
  }

  // ================================
  // FILE UPLOAD
  // ================================

  // Загрузить файл на сервер
  async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<PostResponse<{ urlLink: string }>> {
    try {
      const sessionID = await this.getSessionID();
      
      // FormData для multipart/form-data
      const formData = new FormData();
      formData.append('file', file);

      // Используем прокси через Next.js rewrites чтобы обойти CORS
      const uploadUrl = `/good/api/v5/data/file_links/uploadFiles?appID=${APP_ID}&sessionID=${sessionID}`;

      // XMLHttpRequest для отслеживания прогресса (если нужен onProgress)
      if (onProgress && typeof XMLHttpRequest !== 'undefined') {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          // Отслеживаем прогресс
          xhr.upload.addEventListener('progress', (e: ProgressEvent) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100;
              onProgress(percentComplete);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const result = JSON.parse(xhr.responseText);
                // Directual возвращает result: [{file: {urlLink: ...}}]
                const fileData = result.result && result.result[0] && result.result[0].file;
                resolve({
                  success: true,
                  data: fileData || null,
                  status: result.status,
                });
              } catch (parseError) {
                reject(new Error('Ошибка парсинга ответа'));
              }
            } else if (xhr.status === 403) {
              // Проверяем сессию при 403
              this.handle403Error().then((sessionExpired: boolean) => {
                if (sessionExpired) {
                  resolve({
                    success: false,
                    error: 'Сессия истекла',
                    sessionExpired: true,
                  });
                } else {
                  this.showError(`HTTP ошибка ${xhr.status}`, xhr.status, 'file_links.uploadFiles');
                  reject(new Error(`HTTP ошибка ${xhr.status}`));
                }
              });
            } else if (xhr.status >= 400) {
              // Показываем ошибку для 4xx/5xx
              this.showError(`Ошибка загрузки файла`, xhr.status, 'file_links.uploadFiles');
              reject(new Error(`HTTP ошибка ${xhr.status}`));
            } else {
              reject(new Error(`HTTP ошибка ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Ошибка сети'));
          });

          xhr.open('POST', uploadUrl);
          xhr.send(formData);
        });
      }

      // Обычный fetch без прогресса
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 403) {
          const sessionExpired = await this.handle403Error();
          if (sessionExpired) {
            return {
              success: false,
              error: 'Сессия истекла',
              sessionExpired: true,
            };
          }
        }
        if (response.status >= 400) {
          this.showError(`Ошибка загрузки файла`, response.status, 'file_links.uploadFiles');
        }
        throw new Error(`HTTP ошибка ${response.status}`);
      }

      const result = await response.json();
      const fileData = result.result && result.result[0] && result.result[0].file;
      return {
        success: true,
        data: fileData || null,
        status: result.status,
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Fetcher uploadFile error:', error);
      return {
        success: false,
        error: err.message || 'Ошибка загрузки файла',
      };
    }
  }

  // ================================
  // CRUD EXAMPLES
  // Это примеры - замените на свои эндпоинты
  // ================================

  // Пример: Получить список items
  // Замените 'items' и 'getItems' на ваши структуру и эндпоинт
  async getItems(queryParams: Record<string, unknown> = {}): Promise<GetResponse> {
    return this.get('items', 'getItems', queryParams);
  }

  // Пример: Создать/обновить item
  // Замените 'item_actions' и 'postItem' на ваши структуру и эндпоинт
  async postItem(payload: Record<string, unknown> = {}, queryParams: Record<string, unknown> = {}): Promise<PostResponse> {
    return this.post('item_actions', 'postItem', payload, queryParams);
  }
}

export const fetcher = new Fetcher();
export default fetcher;
