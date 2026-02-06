'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useData } from '@/context/data-provider';
import fetcher from '@/lib/directual/fetcher';
import { User, Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const { user } = useAuth();
  const { userProfile, updateProfile, refreshProfile } = useData();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  // Аватарка
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // URL загруженного файла, ещё не сохранённый в профиль
  const [pendingUserpic, setPendingUserpic] = useState<string | null>(null);

  // Загружаем данные из профиля
  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      // Сбрасываем pending при обновлении профиля (после сохранения)
      setPendingUserpic(null);
      setPreviewUrl(null);
    }
  }, [userProfile]);

  // Текущий URL аватарки: pending (загруженный но не сохранённый) > сохранённый userpic > null
  const currentUserpic = pendingUserpic || previewUrl || (userProfile && userProfile.userpic) || null;

  // Проверяем есть ли изменения (включая userpic)
  const profileUserpic = (userProfile && userProfile.userpic) || '';
  const hasChanges =
    firstName !== ((userProfile && userProfile.firstName) || '') ||
    lastName !== ((userProfile && userProfile.lastName) || '') ||
    (pendingUserpic !== null && pendingUserpic !== profileUserpic);

  // Клик по аватарке — открываем выбор файла
  const handleAvatarClick = useCallback(() => {
    if (uploadProgress !== null) return; // не кликаем пока грузится
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [uploadProgress]);

  // Обработка выбора файла
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Сбрасываем input чтобы можно было повторно выбрать тот же файл
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Валидация: только картинки
    if (!file.type.startsWith('image/')) {
      console.error('Можно загружать только изображения');
      return;
    }

    // Локальный превью пока грузим
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploadProgress(0);

    try {
      // Загружаем файл с отслеживанием прогресса
      const result = await fetcher.uploadFile(file, (percent) => {
        setUploadProgress(percent);
      });

      if (result.success && result.data && result.data.urlLink) {
        // Сохраняем URL в pending — не пишем в профиль, ждём "Сохранить"
        setPendingUserpic(result.data.urlLink);
        setPreviewUrl(null);
        URL.revokeObjectURL(localPreview);
      } else {
        // Ошибка загрузки — откатываем превью
        setPreviewUrl(null);
        setPendingUserpic(null);
        URL.revokeObjectURL(localPreview);
        console.error('Ошибка загрузки файла:', result.error);
      }
    } catch (err) {
      setPreviewUrl(null);
      setPendingUserpic(null);
      URL.revokeObjectURL(localPreview);
      console.error('Ошибка при загрузке аватарки:', err);
    } finally {
      setUploadProgress(null);
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Собираем все изменённые поля разом
      const payload: Record<string, string> = { firstName, lastName };
      if (pendingUserpic !== null) {
        payload.userpic = pendingUserpic;
      }
      const result = await updateProfile(payload);
      if (result.success) {
        await refreshProfile(true);
        // pending сбросится в useEffect при обновлении userProfile
      }
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
    } finally {
      setLoading(false);
    }
  };

  // Процент для кругового прогресса (SVG)
  const isUploading = uploadProgress !== null;
  const progressClamped = isUploading ? Math.min(uploadProgress, 100) : 0;
  // Окружность круга r=46
  const circumference = 2 * Math.PI * 46;
  const strokeOffset = circumference - (progressClamped / 100) * circumference;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold flex items-center gap-3 mb-6">
        <User size={28} className="flex-shrink-0" />
        Профиль
      </h1>
      
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Информация о пользователе</CardTitle>
            <CardDescription>Просмотр и редактирование данных профиля</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Аватарка */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="relative w-28 h-28 rounded-full cursor-pointer group"
                onClick={handleAvatarClick}
              >
                {/* Сама картинка или заглушка */}
                {currentUserpic ? (
                  <img
                    src={currentUserpic}
                    alt="Аватар"
                    className="w-full h-full rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-muted border-2 border-border flex items-center justify-center">
                    <User size={40} className="text-muted-foreground" />
                  </div>
                )}

                {/* Оверлей с иконкой камеры */}
                {!isUploading && (
                  <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Camera
                      size={24}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}

                {/* Прогресс загрузки */}
                {isUploading && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    {/* Круговой прогресс-бар */}
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                      {/* Фон круга */}
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="6"
                      />
                      {/* Прогресс */}
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="white"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeOffset}
                        className="transition-[stroke-dashoffset] duration-200 ease-linear"
                      />
                    </svg>
                    {/* Процент в центре */}
                    <span className="absolute text-white text-sm font-medium">
                      {Math.round(progressClamped)}%
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isUploading ? 'Загрузка...' : 'Нажмите для смены аватарки'}
              </p>

              {/* Скрытый input для выбора файла */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input 
                value={(user && user.email) || ''} 
                disabled 
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">Email нельзя изменить</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Имя</Label>
                <Input 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Введите имя"
                  className="mt-1.5"
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label>Фамилия</Label>
                <Input 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Введите фамилию"
                  className="mt-1.5"
                  disabled={loading}
                />
              </div>
            </div>
            
            {hasChanges && (
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
