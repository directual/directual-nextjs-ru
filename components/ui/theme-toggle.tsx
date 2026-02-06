'use client';

import { Moon, Sun, SunMoon } from 'lucide-react';
import { useTheme } from '@/context/theme-provider';
import { Button } from '@/components/ui/button';

// Переключатель темы с тремя состояниями: light -> dark -> system -> light
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleClick = () => {
    // Циклическое переключение: light -> dark -> system -> light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  // Определяем иконку в зависимости от текущей темы
  const getIcon = () => {
    if (theme === 'system') {
      return SunMoon;
    }
    if (theme === 'light') {
      return Sun;
    }
    return Moon;
  };

  const Icon = getIcon();

  return (
    <button
      onClick={handleClick}
      className="relative inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      aria-label="Переключить тему"
      type="button"
    >
      <Icon className="h-5 w-5 transition-all" />
    </button>
  );
}

// Выпадающий переключатель с выбором темы
export function ThemeToggleDropdown() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setTheme('light')}
        className={theme === 'light' ? 'bg-accent' : ''}
      >
        <Sun className="h-4 w-4 mr-2" />
        Светлая
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setTheme('dark')}
        className={theme === 'dark' ? 'bg-accent' : ''}
      >
        <Moon className="h-4 w-4 mr-2" />
        Тёмная
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setTheme('system')}
        className={theme === 'system' ? 'bg-accent' : ''}
      >
        <SunMoon className="h-4 w-4 mr-2" />
        Системная
      </Button>
    </div>
  );
}

