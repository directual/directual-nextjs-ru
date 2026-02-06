'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/ui/logo';
import { APP_VERSION } from '@/lib/version';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import fetcher from '@/lib/directual/fetcher';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    
    // Валидация
    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = 'Введи email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Введи нормальный email';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setLoading(true);

    try {
      // Отправляем запрос на сброс пароля
      await fetcher.resetPassword({
        login: email.trim(),
      });
      
      // Не ждём ответа, сразу показываем успех
      setSuccess(true);
    } catch (err) {
      console.error('Password reset request error:', err);
      // Всё равно показываем успех (безопасность)
      setSuccess(true);
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
                Если аккаунт с таким email есть, вы получите ссылку для сброса пароля. Если письма нет — проверьте спам!
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <Link 
                href="/auth/login" 
                className="text-primary hover:underline text-sm"
              >
                Вернуться ко входу
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Сброс пароля</h2>
              <p className="text-sm text-muted-foreground">
                Введите email для восстановления доступа
              </p>
            </div> */}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Электронная почта"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className={fieldErrors.email ? "border-destructive" : ""}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <Button type="submit" variant="default" className="w-full" disabled={loading}>
                {loading ? 'Отправка...' : 'Отправить ссылку для сброса пароля'}
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

