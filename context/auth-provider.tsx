'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import fetcher from '@/lib/directual/fetcher';
import { User, AuthContextValue, ApiResponse } from '@/types';

// Контекст авторизации
const AuthContext = createContext<AuthContextValue | null>(null);

// Хук для использования auth контекста
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Провайдер авторизации
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Проверка сессии при загрузке (из HTTP Only cookie)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Проверяем есть ли валидная сессия в cookie
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include', // Важно для отправки cookie
          cache: 'no-store', // Отключаем кэширование для свежих данных
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('[AuthProvider] Ошибка проверки сессии:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Выход
  const logout = useCallback(async () => {
    // Удаляем cookie через API
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('[AuthProvider] Ошибка при вызове API logout:', err);
    }
    
    // Очищаем кеш sessionID в fetcher
    fetcher.clearSessionCache();
    
    // Очищаем localStorage (кроме темы)
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme');
      localStorage.clear(); // Чистим все
      if (theme) {
        localStorage.setItem('theme', theme); // Восстанавливаем тему
      }
    }
    
    // Устанавливаем user в null (триггерит очистку в DataProvider)
    setUser(null);
  }, []);

  // Обработка события истекшей сессии
  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
    };

    window.addEventListener('session-expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [logout]);

  // Вход
  const login = async (email: string, password: string): Promise<ApiResponse<User>> => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Важно для получения cookie
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        setUser(data.user);
        setLoading(false);
        return { success: true, data: data.user };
      } else {
        setError(data.error || 'Ошибка входа');
        setLoading(false);
        return { success: false, error: data.error || 'Ошибка входа' };
      }
    } catch (err) {
      const errorMessage = 'Ошибка соединения с сервером';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Регистрация
  const register = async (email: string, password: string, username: string): Promise<ApiResponse<User>> => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Важно для получения cookie
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        setUser(data.user);
        setLoading(false);
        return { success: true, data: data.user };
      } else {
        setError(data.error || 'Ошибка регистрации');
        setLoading(false);
        return { success: false, error: data.error || 'Ошибка регистрации' };
      }
    } catch (err) {
      const errorMessage = 'Ошибка соединения с сервером';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Логин через magic-link (сессия уже установлена на сервере)
  const loginWithSession = useCallback((user: User) => {
    setUser(user);
    setError(null);
  }, []);

  // Проверка авторизации (мемоизирована для предотвращения лишних рендеров)
  const isAuthorized = useCallback((): boolean => {
    return !!user;
  }, [user]);

  // Проверка роли пользователя (для RBAC)
  const hasRole = useCallback((role: string): boolean => {
    if (!user || !user.role) return false;
    return user.role === role;
  }, [user]);

  // Обновление данных пользователя
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error('[AuthProvider] Ошибка обновления пользователя:', err);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    sessionID: null, // Больше не нужен на клиенте, он в HTTP Only cookie
    loading,
    error,
    login,
    register,
    loginWithSession,
    logout,
    isAuthorized,
    hasRole,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

