import { Logo } from "@/components/ui/logo";

export const metadata = {
  title: "Браузер не поддерживается",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnsupportedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 md:p-12">
        {/* Лого */}
        <div className="flex justify-center mb-8">
          <Logo className="h-12" />
        </div>

        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            Ваш браузер не поддерживается
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            К сожалению, ваш браузер не поддерживает технологии, необходимые для работы приложения.
          </p>
        </div>

        {/* Требования */}
        <div className="mb-8 p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Почему это важно?
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-4">
            приложения использует современные веб-технологии для обеспечения быстрой и надёжной работы:
          </p>
          <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✗</span>
              <span><strong>IndexedDB</strong> — для локального кэширования файлов</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✗</span>
              <span><strong>WebSocket</strong> — для синхронизации в реальном времени</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✗</span>
              <span><strong>Современные JS API</strong> — для производительности редактора</span>
            </li>
          </ul>
        </div>

        {/* Поддерживаемые браузеры */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Рекомендуемые браузеры
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Для работы с приложения используйте один из следующих браузеров:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Chrome */}
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8">
                  <circle cx="12" cy="12" r="10" fill="#4285F4"/>
                  <circle cx="12" cy="12" r="7" fill="white"/>
                  <circle cx="12" cy="12" r="4.5" fill="#4285F4"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">Google Chrome</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">версия 90+</div>
              </div>
            </div>

            {/* Firefox */}
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8">
                  <circle cx="12" cy="12" r="10" fill="#FF7139"/>
                  <circle cx="12" cy="12" r="7" fill="white"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">Mozilla Firefox</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">версия 90+</div>
              </div>
            </div>

            {/* Safari */}
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8">
                  <circle cx="12" cy="12" r="10" fill="#006CFF"/>
                  <circle cx="12" cy="12" r="7" fill="white"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">Safari</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">версия 15+</div>
              </div>
            </div>

            {/* Edge */}
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8">
                  <circle cx="12" cy="12" r="10" fill="#0078D7"/>
                  <circle cx="12" cy="12" r="7" fill="white"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">Microsoft Edge</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">версия 90+</div>
              </div>
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="text-center pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            После установки современного браузера вернитесь на эту страницу
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Попробовать снова
          </a>
        </div>
      </div>
    </div>
  );
}


