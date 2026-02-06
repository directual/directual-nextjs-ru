import "./globals.css";
import { Suspense } from "react";
import { AuthProvider } from "@/context/auth-provider";
import { DataProvider } from "@/context/data-provider";
import { ThemeProvider } from "@/context/theme-provider";
import { SocketListener } from "@/components/socket-listener";
import { GlobalAlerts } from "@/components/global-alerts";

export const metadata = {
  title: {
    default: "Next.js + Directual Template",
    template: "%s | App"
  },
  description: "Starter template with authentication, dashboard, and real-time updates powered by Directual and Next.js",
  applicationName: "Next.js Directual App",
  authors: [{ name: "Your Team" }],
  generator: "Next.js",
  keywords: ["Next.js", "Directual", "template", "starter", "authentication", "dashboard"],
  referrer: "origin-when-cross-origin",
  creator: "Your Team",
  publisher: "Your Company",
  
  // Open Graph (соцсети, превью)
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://your-app.com",
    siteName: "Next.js Directual App",
    title: "Next.js + Directual Template",
    description: "Starter template with authentication, dashboard, and real-time updates",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Next.js + Directual Template"
      }
    ]
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Next.js + Directual Template",
    description: "Starter template with authentication, dashboard, and real-time updates",
    images: ["/opengraph-image.png"]
  },
  
  // Apple Web App
  appleWebApp: {
    capable: true,
    title: "App",
    statusBarStyle: "default"
  },
  
  // Иконки (Next.js автоматом подхватит из app/)
  icons: {
    icon: [
      { url: "/icon.png", sizes: "any", type: "image/png" }
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  
  // Manifest для PWA (создадим отдельно)
  manifest: "/manifest.json",
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

// Viewport теперь отдельно (требование Next.js 14+)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <DataProvider>
                {/* Глобальный слушатель WebSocket */}
                <SocketListener />
                
                {/* Глобальные алерты */}
                <GlobalAlerts />
                
                {children}
              </DataProvider>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
