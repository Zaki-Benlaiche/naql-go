import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PwaRegister } from "@/components/PwaRegister";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#FF6B00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "NaqlGo — منصة النقل والشحن في الجزائر",
  description: "منصة النقل والشحن الرائدة في الجزائر. اطلب نقل بضائعك بسهولة وتنافس على أفضل سعر مع أفضل الناقلين.",
  keywords: ["نقل بضائع", "شحن", "الجزائر", "ناقل", "NaqlGo"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NaqlGo",
  },
  icons: {
    icon: [
      { url: "/logo2.png", type: "image/png", sizes: "1254x1254" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/logo2.png",
  },
  openGraph: {
    title: "NaqlGo — منصة النقل والشحن في الجزائر",
    description: "اطلب نقل بضائعك بسهولة وتنافس على أفضل سعر",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={geist.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NaqlGo" />
      </head>
      <body className="min-h-screen font-sans antialiased" style={{ background: "var(--bg-page)" }}>
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}
