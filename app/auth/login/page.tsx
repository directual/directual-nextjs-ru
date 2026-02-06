'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/ui/logo';
import { APP_VERSION } from '@/lib/version';
import Link from 'next/link';

export default function LoginPage() {
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

        <Suspense fallback={<div className="text-center text-muted-foreground">Загрузка...</div>}>
          <LoginForm />
        </Suspense>

        {/* <div className="text-center text-sm">
          <span className="text-muted-foreground">Нет аккаунта? </span>
          <Link href="/auth/register" className="text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </div> */}
      </div>
    </div>
  );
}






