import { NextRequest, NextResponse } from 'next/server';
import serverApi from '@/lib/directual/server-client';

// Magic-link логин: обмен временного токена на сессию
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Токен обязателен' },
        { status: 400 }
      );
    }

    // Вызываем magic эндпоинт без sessionID (публичный)
    const magicResult = await serverApi.structure('magic').setData('magic', { token }, {});

    // Проверяем что result === "ok" и есть token (который на самом деле session)
    if (magicResult && magicResult.result === 'ok' && magicResult.token) {
      const sessionID = magicResult.token;
      
      // Получаем данные пользователя через checkSession
      const checkResult = await serverApi.structure('WebUserSession').getData('checkSession', { sessionID });

      if (checkResult && checkResult.payload && Array.isArray(checkResult.payload) && checkResult.payload.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userData = checkResult.payload[0] as any;
        
        const response = NextResponse.json({
          success: true,
          user: {
            id: userData.id || userData.nid || '',
            username: userData.username || userData.email || '',
            email: userData.email || userData.username || '',
            role: userData.role || 'user',
            avatar: null,
          },
        });

        // Устанавливаем HTTP Only cookie с sessionID
        response.cookies.set('app_session', sessionID, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7, // 7 дней
          path: '/',
        });

        return response;
      } else {
        console.error('[auth/magic] Не удалось получить данные пользователя');
        return NextResponse.json(
          { success: false, error: 'Не удалось получить данные пользователя' },
          { status: 500 }
        );
      }
    } else {
      // Токен невалиден или истёк
      // Токен невалиден или истёк
      return NextResponse.json(
        { success: false, error: 'Ссылка недействительна или истекла' },
        { status: 401 }
      );
    }
  } catch (error: unknown) {
    console.error('[auth/magic]', error);
    const err = error as { response?: { data?: { msg?: string; message?: string } }; message?: string };
    const errorMessage = err.response?.data?.msg 
      || err.response?.data?.message 
      || err.message 
      || 'Ошибка авторизации';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

