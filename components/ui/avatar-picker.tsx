'use client';

import { useState, useRef } from 'react';
import { Upload, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import fetcher from '@/lib/directual/fetcher';

// Предустановленные аватарки (локальные, быстрые как ебать)
const PRESET_AVATARS = Array.from({ length: 24 }, (_, i) => `/avatars/${i + 2}.jpg`);

interface AvatarPickerProps {
  value?: string | null;
  onChange?: (url: string) => void;
  onError?: (error: string) => void;
}

/**
 * Компонент выбора аватарки с попапом
 * Первый элемент - загрузка своей, остальные 24 - предустановленные
 */
export function AvatarPicker({ value, onChange, onError }: AvatarPickerProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обработка загрузки своей аватарки
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа и размера файла
    if (!file.type.startsWith('image/')) {
      onError?.('Можно загружать только изображения');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError?.('Размер файла не должен превышать 5 МБ');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const result = await fetcher.uploadFile(file, (percent) => {
        setProgress(percent);
      });

      if (result.success && result.data) {
        onChange?.(result.data.urlLink);
        setOpen(false);
      } else {
        onError?.(result.error || 'Ошибка загрузки файла');
      }
    } catch (err) {
      onError?.('Ошибка загрузки аватарки');
    } finally {
      setUploading(false);
      setProgress(0);
      // Очищаем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Обработка выбора предустановленной аватарки
  const handlePresetSelect = (url: string) => {
    onChange?.(url);
    setOpen(false);
  };

  // Клик на кнопку загрузки
  const handleUploadClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "relative cursor-pointer group",
              uploading && "pointer-events-none opacity-50"
            )}
          >
            <Avatar className="h-24 w-24 ring-2 ring-offset-2 ring-offset-background transition-all group-hover:ring-accent group-hover:scale-105">
              {value ? (
                <AvatarImage src={value} alt="Profile" />
              ) : (
                <AvatarFallback>
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              )}
            </Avatar>

            {/* Прогресс при загрузке */}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
                <span className="text-white text-sm font-semibold">{Math.round(progress)}%</span>
              </div>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent 
          className="w-auto p-4" 
          align="center"
          side="right"
        >
          <div className="grid grid-cols-5 gap-3">
            {/* Первая ячейка - загрузка своей аватарки */}
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className={cn(
                "relative w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/50",
                "flex items-center justify-center",
                "hover:border-accent hover:scale-110 hover:bg-accent/10",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                uploading && "animate-pulse"
              )}
              title="Загрузить свою аватарку"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Остальные 24 предустановленные аватарки */}
            {PRESET_AVATARS.map((url, index) => {
              const isSelected = value === url;
              
              return (
                <button
                  key={index}
                  onClick={() => handlePresetSelect(url)}
                  disabled={uploading}
                  className={cn(
                    "relative rounded-full overflow-hidden",
                    "transition-all duration-200",
                    "hover:scale-110 hover:ring-2 hover:ring-accent hover:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isSelected && "ring-2 ring-primary ring-offset-2 scale-105"
                  )}
                  title={`Аватарка ${index + 2}`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={url} alt={`Avatar ${index + 2}`} />
                    <AvatarFallback>
                      <User className="h-6 w-6 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Скрытый input для выбора файла */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground text-center">
        Нажмите на аватар чтобы изменить фото
      </p>
    </div>
  );
}

