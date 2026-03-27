import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { PanicButton } from "@/components/layout/panic-button";
import { ClientLayout } from "@/components/providers/client-layout";
import { KeyboardShortcuts } from "@/components/ui/keyboard-shortcuts";
import { SkipLink } from "@/components/ui/skip-link";
import { ServiceWorkerRegistration } from "@/components/ui/service-worker-registration";
import { getPlausibleDomain } from "@/lib/analytics/plausible";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lawyer Free",
  description: "Organize your legal situation with calm, structured guidance",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lawyer Free",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Lawyer Free",
    title: "Lawyer Free",
    description: "Organize your legal situation with calm, structured guidance",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const plausibleDomain = getPlausibleDomain();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366F1" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
        {/* Enable plausible() calls before the script loads (queues events) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.plausible = window.plausible || function(){(window.plausible.q = window.plausible.q || []).push(arguments)}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-warm-bg`}
      >
        <SkipLink />
        <ServiceWorkerRegistration />
        <ClientLayout>
          {children}
        </ClientLayout>
        <Toaster />
        <PanicButton />
        <KeyboardShortcuts />
      </body>
    </html>
  );
}
