'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    
    // Валидация на клиенте
    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = 'Заполни email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Введи нормальный email';
    }
    if (!password) {
      errors.password = 'Введи пароль';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Проверяем что redirect начинается с / (защита от open redirect)
      const destination = redirectTo && redirectTo.startsWith('/') 
        ? redirectTo 
        : '/dashboard';
      router.push(destination);
    } else {
      setError(result.error || 'Ошибка входа');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 w-full max-w-sm">
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

      <div className="space-y-2">
        <Input
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className={fieldErrors.password ? "border-destructive" : ""}
        />
        {fieldErrors.password && (
          <p className="text-sm text-destructive">{fieldErrors.password}</p>
        )}
      </div>

      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" variant="default" className="w-full" disabled={loading}>
        {loading ? 'Вход...' : 'Войти'}
      </Button>

      <div className="flex justify-center gap-4 text-sm">
        <Link href="/auth/magic" className="text-muted-foreground hover:text-primary">
          Войти по ссылке
        </Link>
        <Link href="/auth/reset-password" className="text-muted-foreground hover:text-primary">
          Сбросить пароль
        </Link>
      </div>
    </form>
  );
}


