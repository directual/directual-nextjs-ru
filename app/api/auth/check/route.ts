import { NextRequest, NextResponse } from 'next/server';
import serverApi from '@/lib/directual/server-client';

// Проверка текущей сессии
export async function GET(request: NextRequest) {
  try {
    // Получаем sessionID из cookie
    const sessionID = request.cookies.get('app_session')?.value;

    if (!sessionID) {
      return NextResponse.json(
        { success: false, error: 'Сессия не найдена' },
        { status: 401 }
      );
    }

    // Проверяем сессию в Directual через структуру WebUserSession
    const checkResult = await serverApi.structure('WebUserSession').getData('checkSession', { sessionID });

    // checkSession возвращает только sessionId — подтверждение валидности сессии
    if (checkResult && checkResult.payload && Array.isArray(checkResult.payload) && checkResult.payload.length > 0) {
      // Дёргаем профиль чтобы получить данные юзера (email, имя и т.д.)
      let profileData: Record<string, unknown> = {};
      try {
        const profileResult = await serverApi.structure('WebUser').getData('profile', { sessionID });
        if (profileResult && profileResult.payload && Array.isArray(profileResult.payload) && profileResult.payload.length > 0) {
          profileData = profileResult.payload[0] as Record<string, unknown>;
        }
      } catch (profileErr) {
        console.error('[auth/check] Ошибка получения профиля:', profileErr);
      }
      
      // id в Directual = email юзера
      const userId = (profileData.id || profileData.user_id || profileData.email || '') as string;
      const user = {
        id: userId,
        username: (profileData.username || userId || '') as string,
        email: (profileData.email || userId || '') as string,
        name: (profileData.name || profileData.firstName || profileData.first_name || '') as string,
        role: (profileData.role || 'user') as string,
        avatar: (profileData.userpic || profileData.avatar || null) as string | null,
      };
      
      return NextResponse.json({
        success: true,
        user,
      });
    } else {
      // Сессия истекла (пустой массив) — удаляем cookie
      const response = NextResponse.json(
        { success: false, error: 'Сессия истекла' },
        { status: 401 }
      );
      response.cookies.set('app_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      });
      return response;
    }
  } catch (error: unknown) {
    console.error('[auth/check]', error);
    // При сетевой ошибке или ошибке API НЕ удаляем cookie — может быть временная проблема
    // Пользователь останется "залогинен" и сможет повторить попытку
    return NextResponse.json(
      { success: false, error: 'Ошибка проверки сессии' },
      { status: 500 }
    );
  }
}

