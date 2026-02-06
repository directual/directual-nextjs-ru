'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/ui/logo';
import { APP_VERSION } from '@/lib/version';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import fetcher from '@/lib/directual/fetcher';

export default function NewPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    
    // Валидация
    const errors: Record<string, string> = {};
    
    if (!password) {
      errors.password = 'Введи новый пароль';
    } else if (password.length < 3) {
      errors.password = 'Пароль должен быть минимум 3 символов';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Подтверди пароль';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setLoading(true);

    try {
      const result = await fetcher.newPassword({
        password: password,
        secret: token,
      });

      if (result.success) {
        setSuccess(true);
        // Через 2 секунды редиректим на логин
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setError(result.error || 'Ошибка установки пароля. Возможно, ссылка устарела.');
      }
    } catch (err) {
      console.error('New password error:', err);
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="absolute bottom-4 left-4">
        <span className="text-xs text-muted-foreground/50 opacity-20 font-mono">v.{APP_VERSION}</span>
      </div>

      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-xl border">
        <div className="flex justify-center">
          <Logo />
        </div>

        {success ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Пароль успешно изменён! Перенаправление на страницу входа...
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-6">
            {/* <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Новый пароль</h2>
              <p className="text-sm text-muted-foreground">
                Введите новый пароль для вашего аккаунта
              </p>
            </div> */}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Новый пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className={fieldErrors.password ? "border-destructive" : ""}
                />
                {fieldErrors.password && (
                  <p className="text-sm text-destructive">{fieldErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Подтверждение пароля"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className={fieldErrors.confirmPassword ? "border-destructive" : ""}
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {error && (
                <div className="text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" variant="default" className="w-full" disabled={loading}>
                {loading ? 'Сохранение...' : 'Установить новый пароль'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <Link href="/auth/login" className="text-muted-foreground hover:text-primary">
                Вернуться ко входу
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

