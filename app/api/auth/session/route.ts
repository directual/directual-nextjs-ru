import { NextRequest, NextResponse } from 'next/server';

// Endpoint для получения sessionID из HTTP Only cookie (используется WebSocket)
// Это безопаснее чем хранить sessionID в localStorage
export async function GET(request: NextRequest) {
  try {
    const sessionID = request.cookies.get('app_session')?.value;

    if (!sessionID) {
      return NextResponse.json(
        { success: false, error: 'Сессия не найдена' },
        { status: 401 }
      );
    }

    // Возвращаем sessionID для использования в WebSocket
    return NextResponse.json({
      success: true,
      sessionID: sessionID,
    });
  } catch (error) {
    console.error('API get session error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка получения сессии' },
      { status: 500 }
    );
  }
}







