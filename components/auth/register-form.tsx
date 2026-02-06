'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    
    // Кастомная валидация
    const errors: Record<string, string> = {};
    if (!username.trim()) {
      errors.username = 'Введи имя';
    }
    if (!email.trim()) {
      errors.email = 'Заполни email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Введи нормальный email';
    }
    if (!password) {
      errors.password = 'Введи пароль';
    } else if (password.length < 6) {
      errors.password = 'Минимум 6 символов';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setLoading(true);

    const result = await register(email, password, username);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Ошибка регистрации');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium">
          Имя пользователя
        </label>
        <Input
          id="username"
          type="text"
          placeholder="Иван"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          className={fieldErrors.username ? "border-destructive" : ""}
        />
        {fieldErrors.username && (
          <p className="text-sm text-destructive">{fieldErrors.username}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
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
        <label htmlFor="password" className="text-sm font-medium">
          Пароль
        </label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>
    </form>
  );
}





