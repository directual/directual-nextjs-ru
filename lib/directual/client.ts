import Directual from 'directual-api';

// APP_ID из переменных окружения
export const APP_ID = process.env.NEXT_PUBLIC_DIRECTUAL_APP_ID;

// Проверка наличия APP_ID
if (!APP_ID) {
  console.warn('NEXT_PUBLIC_DIRECTUAL_APP_ID не установлен в переменных окружения');
}

// Инициализация Directual API клиента
// apiHost: '/' — для обычных запросов (axios + rewrites)
// streamApiHost: '/api' — библиотека конкатенирует как `/api` + `/good/api/v5/stream/...`
//   Итоговый путь: /api/good/api/v5/stream/... → Route Handler в app/api/good/api/v5/stream/
const api = new Directual({ 
  apiHost: '/',
  appID: APP_ID as string,
  streamApiHost: '/api',
});

export default api;







