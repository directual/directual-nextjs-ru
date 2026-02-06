'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '@/types';

interface ThemeContextValue {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

// Контекст темы
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Хук для использования темы
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme должен использоваться внутри ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// Провайдер темы
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // Применение темы к документу
  const applyTheme = (themeToApply: 'light' | 'dark') => {
    // Проверяем что мы на клиенте
    if (typeof document === 'undefined') return;
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(themeToApply);
  };

  // Получение актуальной темы (если system - то системная)
  const getActualTheme = (): 'light' | 'dark' => {
    // На сервере возвращаем дефолтную тему
    if (typeof window === 'undefined') {
      return theme === 'system' ? 'light' : (theme as 'light' | 'dark');
    }
    
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme as 'light' | 'dark';
  };

  // Загрузка темы из localStorage при монтировании
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
    setThemeState(savedTheme);
    
    // Применяем тему к документу
    const actualTheme = savedTheme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : savedTheme as 'light' | 'dark';
    applyTheme(actualTheme);
    
    setMounted(true);
  }, []);

  // Слушаем изменения системной темы
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const currentTheme = (localStorage.getItem('theme') as Theme) || 'system';
      if (currentTheme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [mounted]);

  // Обновление темы при изменении выбранной темы
  useEffect(() => {
    if (!mounted) return;
    
    const actualTheme = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme as 'light' | 'dark';
    applyTheme(actualTheme);
  }, [theme, mounted]);

  // Переключение темы
  const toggleTheme = () => {
    const currentActual = getActualTheme();
    const newTheme = currentActual === 'light' ? 'dark' : 'light';
    setThemeValue(newTheme);
  };

  // Установка конкретной темы
  const setThemeValue = (newTheme: Theme) => {
    if (newTheme !== 'light' && newTheme !== 'dark' && newTheme !== 'system') {
      return;
    }
    
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const actualTheme = newTheme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : newTheme as 'light' | 'dark';
    applyTheme(actualTheme);
  };

  const actualTheme = getActualTheme();

  const value: ThemeContextValue = {
    theme, // 'light' | 'dark' | 'system'
    actualTheme, // 'light' | 'dark' - реальная применяемая тема
    toggleTheme,
    setTheme: setThemeValue,
    isDark: actualTheme === 'dark',
    isLight: actualTheme === 'light',
    isSystem: theme === 'system',
  };

  // Всегда возвращаем Provider, чтобы useTheme работал
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
