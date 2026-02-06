'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/ui/logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import fetcher from '@/lib/directual/fetcher';

export default function MagicRequestPage() {
  const [email, setEmail] = useState('');
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
      const result = await fetcher.magicLinkRequest({
        user_id: email.trim(),
      });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Ошибка отправки ссылки');
      }
    } catch (err) {
      console.error('Magic link request error:', err);
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

      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-xl border">
        <div className="flex justify-center">
          <Logo />
        </div>

        {success ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Письмо со ссылкой для входа отправлено на <strong>{email}</strong>. Если нет — проверьте спам!
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <Link 
                href="/auth/login" 
                className="text-primary hover:underline text-sm"
              >
                Войти по паролю
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-2">
                {/* <label htmlFor="email" className="text-sm font-medium text-center block">
                  Войти или зарегистрироваться
                </label> */}
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

              {error && (
                <div className="text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" variant="default" className="w-full" disabled={loading}>
                {loading ? 'Отправка...' : 'Отправить ссылку для входа'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <Link href="/auth/login" className="text-muted-foreground hover:text-primary">
                Войти по паролю
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

