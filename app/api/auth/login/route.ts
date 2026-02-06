import { NextRequest, NextResponse } from 'next/server';
import serverApi from '@/lib/directual/server-client';

// Логин через HTTP Only cookie
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Логин в Directual (используем серверный клиент)
    const authResult = await serverApi.auth.login(email, password);
    
    if (authResult && authResult.sessionID) {
      const response = NextResponse.json({
        success: true,
        user: {
          id: authResult.nid || '',
          username: authResult.username,
          email: authResult.username, // В Directual username = email
          name: authResult.name || authResult.firstName || '',
          role: authResult.role,
          avatar: null,
        },
      });

      // Устанавливаем HTTP Only cookie с sessionID
      response.cookies.set('app_session', authResult.sessionID, {
        httpOnly: true,           // JS не может прочитать (защита от XSS)
        secure: process.env.NODE_ENV === 'production', // Только HTTPS в продакшене
        sameSite: 'strict',       // Защита от CSRF
        maxAge: 60 * 60 * 24 * 7, // 7 дней
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: 'Ошибка авторизации' },
        { status: 401 }
      );
    }
  } catch (error: unknown) {
    console.error('[auth/login]', error);
    const err = error as { response?: { data?: { msg?: string; message?: string } }; message?: string };
    const errorMessage = err.response?.data?.msg 
      || err.response?.data?.message 
      || err.message 
      || 'Ошибка авторизации';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 401 }
    );
  }
}

