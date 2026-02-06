'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { Logo } from '@/components/ui/logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import fetcher from '@/lib/directual/fetcher';
import Link from 'next/link';

export default function MagicLinkPage() {
  const router = useRouter();
  const params = useParams();
  const { loginWithSession } = useAuth();
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [error, setError] = useState<string>('');
  
  // Состояния для повторной отправки
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Функция повторной отправки magic link
  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError(null);
    
    if (!resendEmail.trim() || !/\S+@\S+\.\S+/.test(resendEmail)) {
      setResendError('Введи нормальный email');
      return;
    }
    
    setResendLoading(true);
    try {
      const result = await fetcher.magicLinkRequest({ user_id: resendEmail.trim() });
      if (result.success) {
        setResendSuccess(true);
      } else {
        setResendError(result.error || 'Ошибка отправки');
      }
    } catch {
      setResendError('Ошибка соединения');
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = params.token as string;
      
      if (!token) {
        setStatus('error');
        setError('Отсутствует токен');
        return;
      }

      try {
        const response = await fetch('/api/auth/magic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success && data.user) {
          // Логиним юзера (сессия уже в cookie)
          loginWithSession(data.user);
          setStatus('success');
          
          // Редиректим на дашборд
          setTimeout(() => {
            router.replace('/dashboard');
          }, 500);
        } else {
          setStatus('error');
          setError(data.error || 'Ссылка недействительна или истекла');
        }
      } catch (err) {
        console.error('Magic link verification error:', err);
        setStatus('error');
        setError('Ошибка соединения с сервером');
      }
    };

    verifyToken();
  }, [params.token, loginWithSession, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-xl border">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="space-y-4">
          {status === 'loading' && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Выполняется вход...</p>
            </div>
          )}

          {status === 'success' && (
            <Alert>
              <AlertDescription>
                Вход выполнен успешно! Перенаправление...
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              
              {!resendSuccess ? (
                <div className="space-y-4 pt-2">
                  {/* <div className="text-sm text-muted-foreground text-center">
                    Выслать свежую ссылку
                  </div> */}
                  <form onSubmit={handleResend} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Электронная почта"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      disabled={resendLoading}
                      className={resendError ? "border-destructive" : ""}
                    />
                    {resendError && (
                      <p className="text-sm text-destructive">{resendError}</p>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={resendLoading}
                    >
                      {resendLoading ? 'Отправка...' : 'Отправить свежую ссылку'}
                    </Button>
                  </form>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Письмо со ссылкой отправлено на <strong>{resendEmail}</strong>. Проверьте почту!
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-center">
                <Link 
                  href="/auth/magic" 
                  className="text-primary hover:underline text-sm"
                >
                  Вернуться ко входу
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

