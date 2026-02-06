import { NextRequest, NextResponse } from 'next/server';
import serverApi from '@/lib/directual/server-client';

// Регистрация через HTTP Only cookie
export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { success: false, error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    // Регистрация в Directual (используем серверный клиент)
    const authResult = await serverApi.auth.register(email, password, { username });
    
    if (authResult && authResult.sessionID) {
      const response = NextResponse.json({
        success: true,
        user: {
          id: authResult.nid || '',
          username: authResult.username,
          email: authResult.username, // В Directual username = email
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
        { success: false, error: 'Ошибка регистрации' },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.error('API register error:', error);
    const err = error as { response?: { data?: { msg?: string; message?: string } }; message?: string };
    const errorMessage = err.response?.data?.msg 
      || err.response?.data?.message 
      || err.message 
      || 'Ошибка регистрации';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}

