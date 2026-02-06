import Directual from 'directual-api';

// APP_ID из переменных окружения
export const APP_ID = process.env.NEXT_PUBLIC_DIRECTUAL_APP_ID;

// Проверка наличия APP_ID
if (!APP_ID) {
  console.warn('NEXT_PUBLIC_DIRECTUAL_APP_ID не установлен в переменных окружения');
}

// Инициализация Directual API клиента
// apiHost: '/' использует Next.js rewrites для проксирования к https://api.directual.com
const api = new Directual({ 
  apiHost: '/',
  appID: APP_ID as string
});

export default api;







