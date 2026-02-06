'use client';

import { RegisterForm } from '@/components/auth/register-form';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg shadow-xl border">
        <div className="flex justify-center">
          <Logo />
        </div>

        <RegisterForm />

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Уже есть аккаунт? </span>
          <Link href="/auth/login" className="text-primary hover:underline">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}





