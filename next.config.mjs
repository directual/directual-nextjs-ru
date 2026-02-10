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
    return [
      // SSE стриминг идёт на отдельный хост (alfa), ставим перед общим правилом
      {
        source: '/good/api/v5/stream/:path*',
        destination: 'https://api.alfa.directual.com/good/api/v5/stream/:path*',
      },
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
              "connect-src 'self' https://api.directual.com wss://api.directual.com", // Directual API + WebSocket
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
