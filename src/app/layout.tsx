import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NaqlGo — منصة النقل والشحن في الجزائر",
  description: "منصة النقل والشحن الرائدة في الجزائر. اطلب نقل بضائعك بسهولة وتنافس على أفضل سعر مع أفضل الناقلين.",
  keywords: ["نقل بضائع", "شحن", "الجزائر", "ناقل", "NaqlGo"],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/logo-icon.svg",
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
      <body className="min-h-screen font-sans antialiased" style={{ background: "var(--bg-page)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
