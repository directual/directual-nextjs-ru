import { NextRequest, NextResponse } from 'next/server';
import serverApi from '@/lib/directual/server-client';

// Выход — удаляем cookie
export async function POST(request: NextRequest) {
  try {
    // Получаем sessionID из cookie
    const sessionID = request.cookies.get('app_session')?.value;

    if (sessionID) {
      // Уведомляем Directual о выходе (используем серверный клиент)
      try {
        await serverApi.auth.logout(sessionID);
      } catch (err) {
        console.error('Ошибка при вызове Directual logout:', err);
        // Продолжаем даже при ошибке
      }
    }

    // Удаляем cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('app_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Удаляем cookie
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('API logout error:', error);
    // Даже при ошибке удаляем cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('app_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
    return response;
  }
}

