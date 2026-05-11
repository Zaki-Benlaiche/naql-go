import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NaqlGoLogo } from "@/components/NaqlGoLogo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-700 hover:text-orange-600 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>الرئيسية</span>
          </Link>
          <Link href="/">
            <NaqlGoLogo size="sm" />
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10 prose prose-slate max-w-none">
          {children}
        </article>
      </main>
      <footer className="max-w-3xl mx-auto px-4 py-6 text-xs text-slate-400 text-center">
        © {new Date().getFullYear()} NaqlGo — منصة النقل والشحن في الجزائر
      </footer>
    </div>
  );
}
