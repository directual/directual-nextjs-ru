/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output для Docker
  output: 'standalone',
  
  // Настройка для Next.js Image с внешними доменами
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Разрешаем все HTTPS домены (Directual и др.)
      },
    ],
  },
  
  async rewrites() {
    // Стрим-запросы обрабатывает middleware → Route Handler в app/api/stream-proxy/
    // Обычные API-запросы — rewrite на directual.com
    return [
      {
        source: '/good/:path*',
        destination: 'https://api.directual.com/good/:path*',
      },
    ];
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Защита от clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Предотвращение MIME sniffing
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // Включаем XSS фильтр браузера
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Контроль referrer
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()', // Ограничиваем доступ к API
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval нужен для CodeMirror
              "style-src 'self' 'unsafe-inline'", // unsafe-inline для динамических стилей
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.directual.com https://api.alfa.directual.com wss://api.directual.com", // Directual API + SSE стриминг + WebSocket
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
