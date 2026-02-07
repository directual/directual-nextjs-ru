'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/ui/logo';
import * as LucideIcons from 'lucide-react';
import menuConfig from '@/config/dashboard-menu.json';
import { ThemeSelector } from '@/components/dashboard/theme-selector';

interface MenuItemConfig {
  id: string;
  label: string;
  icon: string;
  href?: string;
  route?: string;
  type?: string;
}

interface MenuItemProps {
  item: MenuItemConfig;
  isSelected: boolean;
  onClick: (id: string) => void;
}

// Пункт меню
function MenuItem({ item, isSelected, onClick }: MenuItemProps) {
  // @ts-ignore - динамический доступ к иконкам
  const Icon = LucideIcons[item.icon];
  
  const handleClick = () => {
    if (item.type === 'external') {
      window.open(item.route, '_blank', 'noopener,noreferrer');
      return;
    }
    onClick(item.id);
  };
  
  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center gap-3 p-3 mx-6 rounded-lg transition-colors
        ${isSelected 
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold' 
          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
        }
      `}
    >
      {Icon && <Icon size={20} className="flex-shrink-0" />}
      <span className="text-sm font-medium whitespace-nowrap">
        {item.label}
      </span>
    </button>
  );
}

// Основной компонент sidebar — всегда развёрнут
export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [selectedItem, setSelectedItem] = useState('home');

  // Определяем активный элемент по текущему пути
  useEffect(() => {
    const allItems = [...menuConfig.topItems, ...menuConfig.bottomItems];
    const currentItem = allItems.find(item => {
      if (item.type === 'route' && item.route) {
        if (item.route === '/dashboard') {
          return pathname === '/dashboard';
        }
        return pathname.startsWith(item.route);
      }
      return false;
    });
    
    if (currentItem) {
      setSelectedItem(currentItem.id);
    }
  }, [pathname]);

  const handleItemClick = (itemId: string) => {
    const allItems = [...menuConfig.topItems, ...menuConfig.bottomItems] as MenuItemConfig[];
    const item = allItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    // Логаут
    if (itemId === 'logout') {
      logout();
      router.push('/auth/login');
      return;
    }
    
    if (item.type === 'route' && item.route) {
      setSelectedItem(itemId);
      router.push(item.route);
    }
  };

  return (
    <div className="h-full w-[240px] bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Логотип */}
      <div className="p-7">
        <Logo isSmall />
      </div>

      {/* Верхние пункты меню */}
      <div className="flex-1 flex flex-col gap-1 py-2 overflow-y-auto">
        {menuConfig.topItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            isSelected={selectedItem === item.id}
            onClick={handleItemClick}
          />
        ))}
      </div>

      {/* Нижние пункты меню */}
      <div className="py-4 flex flex-col gap-1">
        {menuConfig.bottomItems.map((item) => {
          // Тема
          if (item.type === 'theme') {
            return <ThemeSelector key={item.id} />;
          }
          
          return (
            <MenuItem
              key={item.id}
              item={item}
              isSelected={selectedItem === item.id}
              onClick={handleItemClick}
            />
          );
        })}
      </div>
    </div>
  );
}
