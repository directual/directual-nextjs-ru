'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import fetcher from '@/lib/directual/fetcher';
import { UserProfile, ApiResponse } from '@/types';

// Интерфейс контекста данных
interface DataContextValue {
  // Данные
  userProfile: UserProfile | null;
  
  // Состояния
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  
  // Методы обновления
  refreshProfile: (silent?: boolean) => Promise<void>;
  refreshAll: (silent?: boolean) => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<ApiResponse<void>>;
}

// Контекст данных
const DataContext = createContext<DataContextValue | null>(null);

// Хук для использования data контекста
export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData должен использоваться внутри DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: ReactNode;
}

// Провайдер данных - глобальный кеш для дашборда
export function DataProvider({ children }: DataProviderProps) {
  const { user } = useAuth();
  
  // Стейт данных
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Стейт загрузки
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref для отслеживания первой инициализации
  const isInitializedRef = useRef<boolean>(false);

  // Загрузка профиля
  const refreshProfile = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    
    try {
      const result = await fetcher.readProfile();
      
      if (result.success && result.data) {
        // readProfile вернет массив с одним объектом
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profileData = result.data[0] as any;
        
        // Нормализуем поля (Directual может возвращать snake_case)
        const normalizedProfile: UserProfile = {
          id: profileData.id || profileData.user_id || '',
          firstName: profileData.firstName || profileData.first_name || '',
          lastName: profileData.lastName || profileData.last_name || '',
          userpic: profileData.userpic || profileData.avatar || '',
          balance: profileData.balance ?? 0,
        };
        
        setUserProfile(normalizedProfile);
        setError(null);
      } else {
        console.error('Ошибка загрузки профиля:', result.error);
        setError(result.error || 'Не удалось загрузить профиль');
      }
    } catch (err) {
      console.error('Ошибка при загрузке профиля:', err);
      setError('Не удалось загрузить профиль');
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, []);

  // Загрузка всех данных
  const refreshAll = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    
    try {
      await refreshProfile(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshProfile]);

  // Очистка всех данных (при логауте)
  const clearData = useCallback(() => {
    setUserProfile(null);
    setError(null);
    setLoading(false);
    setRefreshing(false);
  }, []);

  // Первоначальная загрузка при монтировании
  useEffect(() => {
    if (user && !isInitializedRef.current) {
      isInitializedRef.current = true;
      refreshAll(false);
    } else if (!user) {
      isInitializedRef.current = false;
      clearData();
    }
  }, [user, refreshAll, clearData]);

  // Обновление при возврате на вкладку браузера
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        refreshAll(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, refreshAll]);

  // Регистрируем глобальные хэндлеры для сокетов
  useEffect(() => {
    // Хэндлер для refresh события
    window.__refreshData = () => {
      refreshAll(true);
    };

    // Очистка при размонтировании
    return () => {
      delete window.__refreshData;
    };
  }, [refreshAll]);

  // Обновление профиля
  const updateProfile = useCallback(async (profileData: Partial<UserProfile>): Promise<ApiResponse<void>> => {
    try {
      // Добавляем id из текущего профиля
      const payload = {
        id: userProfile?.id,
        ...profileData,
      };
      
      const result = await fetcher.updateProfile(payload);
      
      if (result.success) {
        await refreshProfile(true);
        return { success: true };
      } else {
        console.error('Ошибка обновления профиля:', result.error);
        return { success: false, error: result.error || 'Не удалось обновить профиль' };
      }
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      return { success: false, error: 'Не удалось обновить профиль' };
    }
  }, [refreshProfile, userProfile?.id]);

  const value = {
    // Данные
    userProfile,
    
    // Состояния
    loading,
    refreshing,
    error,
    
    // Методы обновления
    refreshProfile,
    refreshAll,
    updateProfile,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
