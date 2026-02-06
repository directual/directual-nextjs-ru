'use client';

import { useTheme } from '@/context/theme-provider';

// Демонстрация цветовой палитры из Figma
export function ColorDemo() {
  const { theme } = useTheme();

  const colors = [
    { name: 'Background', class: 'bg-background text-foreground', desc: 'Основной фон' },
    { name: 'Card', class: 'bg-card text-card-foreground', desc: 'Карточки и панели' },
    { name: 'Primary', class: 'bg-primary text-primary-foreground', desc: 'Синий для ссылок (#6c7cff)' },
    { name: 'Secondary', class: 'bg-secondary text-secondary-foreground', desc: 'Серый для UI' },
    { name: 'Accent', class: 'bg-accent text-accent-foreground', desc: 'Желтый акцент (#ffdf90)' },
    { name: 'Muted', class: 'bg-muted text-muted-foreground', desc: 'Приглушённые элементы' },
    { name: 'Destructive', class: 'bg-destructive text-destructive-foreground', desc: 'Ошибки (#ff5a5a)' },
  ];

  return (
    <div className="p-8 space-y-6 bg-background">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Цветовая палитра Figma</h2>
        <p className="text-muted-foreground">
          9 переменных из Figma • Тема: <span className="font-semibold text-accent">{theme}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {colors.map((color) => (
          <div key={color.name} className={`${color.class} p-6 rounded-lg border`}>
            <h3 className="text-lg font-semibold">{color.name}</h3>
            <p className="text-sm opacity-80 mt-1">{color.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">Семантические цвета</h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded bg-primary" />
            <div>
              <p className="font-semibold text-primary">Primary (#6c7cff)</p>
              <p className="text-sm text-muted-foreground">Ссылки и основные действия</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded bg-destructive" />
            <div>
              <p className="font-semibold text-destructive">Error (#ff5a5a)</p>
              <p className="text-sm text-muted-foreground">Ошибки и предупреждения</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded" style={{ backgroundColor: '#3ecf8e' }} />
            <div>
              <p className="font-semibold" style={{ color: '#3ecf8e' }}>Success (#3ecf8e)</p>
              <p className="text-sm text-muted-foreground">Успешные операции</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded bg-accent" />
            <div>
              <p className="font-semibold text-accent-foreground">Accent (#ffdf90)</p>
              <p className="text-sm text-muted-foreground">Акцентные элементы</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">Примеры использования</h3>
        
        <div className="space-y-2">
          <p className="text-foreground">Основной текст (foreground)</p>
          <p className="text-muted-foreground">Второстепенный текст (muted-foreground)</p>
          <a href="#" className="text-primary hover:underline">Ссылка (primary)</a>
          <p className="text-destructive">Текст ошибки (destructive)</p>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90">
            Primary кнопка
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:opacity-90">
            Secondary кнопка
          </button>
          <button className="px-4 py-2 bg-accent text-accent-foreground rounded hover:opacity-90">
            Accent кнопка
          </button>
        </div>
      </div>
    </div>
  );
}






