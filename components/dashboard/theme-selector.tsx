'use client';

import { useState } from 'react';
import { Sun, Moon, SunMoon } from 'lucide-react';
import { useTheme } from '@/context/theme-provider';
import { Theme } from '@/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

/**
 * Выбор темы через попровер
 */
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  // Иконка и текст в зависимости от темы
  const getThemeInfo = () => {
    if (theme === 'system') {
      return { icon: SunMoon, label: 'Системная тема' };
    }
    if (theme === 'light') {
      return { icon: Sun, label: 'Светлая тема' };
    }
    return { icon: Moon, label: 'Тёмная тема' };
  };

  const themeInfo = getThemeInfo();
  const Icon = themeInfo.icon;

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-3 p-3 mx-6 rounded-lg transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <Icon size={20} className="flex-shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">
            {themeInfo.label}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-51 p-1" 
        align="start"
        side="right"
        sideOffset={8}
      >
        <div className="flex flex-col">
          <button
            onClick={() => handleThemeChange('light')}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200
              ${theme === 'light'
                ? 'bg-accent text-accent-foreground font-medium'
                : 'hover:bg-accent/50'
              }
            `}
          >
            <Sun size={16} className="flex-shrink-0" />
            <span className="text-sm whitespace-nowrap">Светлая</span>
          </button>
          
          <button
            onClick={() => handleThemeChange('dark')}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200
              ${theme === 'dark'
                ? 'bg-accent text-accent-foreground font-medium'
                : 'hover:bg-accent/50'
              }
            `}
          >
            <Moon size={16} className="flex-shrink-0" />
            <span className="text-sm whitespace-nowrap">Тёмная</span>
          </button>
          
          <button
            onClick={() => handleThemeChange('system')}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200
              ${theme === 'system'
                ? 'bg-accent text-accent-foreground font-medium'
                : 'hover:bg-accent/50'
              }
            `}
          >
            <SunMoon size={16} className="flex-shrink-0" />
            <span className="text-sm whitespace-nowrap">Как в системе</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
