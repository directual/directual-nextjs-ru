import Directual from 'directual-api';

// APP_ID из переменных окружения
export const APP_ID = process.env.NEXT_PUBLIC_DIRECTUAL_APP_ID;

// Проверка наличия APP_ID
if (!APP_ID) {
  console.warn('NEXT_PUBLIC_DIRECTUAL_APP_ID не установлен в переменных окружения');
}

// Серверный клиент для API routes - использует прямое подключение к Directual API
const serverApi = new Directual({ 
  apiHost: 'https://api.directual.com', // Прямое подключение на сервере
  appID: APP_ID as string
});

export default serverApi;







