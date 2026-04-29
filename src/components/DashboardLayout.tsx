"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Truck, LogOut, LayoutDashboard, PlusCircle, List, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isClient = session?.user?.role === "CLIENT";
  const { lang, setLang, tr } = useLanguage();

  const links = isClient
    ? [
        { href: "/client", label: tr("dashboard"), icon: LayoutDashboard },
        { href: "/client/new-request", label: tr("new_request"), icon: PlusCircle },
        { href: "/client/requests", label: tr("my_requests"), icon: List },
      ]
    : [
        { href: "/transporter", label: tr("dashboard"), icon: LayoutDashboard },
        { href: "/transporter/browse", label: tr("browse_requests"), icon: List },
      ];

  const initial = session?.user?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ── sticky, in flex flow → no RTL/LTR overlap */}
      <aside className="w-64 shrink-0 bg-white border-e border-gray-100 sticky top-0 h-screen flex flex-col overflow-y-auto">

        {/* Brand */}
        <div className="px-5 py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-base">NaqlGo</span>
          </Link>
        </div>

        {/* User card */}
        <div className="px-4 py-3 border-b border-gray-50">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-50">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-sm">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 text-sm truncate leading-tight">
                {session?.user?.name}
              </p>
              <p className="text-xs text-orange-500 font-medium mt-0.5">
                {isClient ? tr("client_label") : tr("transporter_label")}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
            Menu
          </p>
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <link.icon className="w-4 h-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-4 pt-3 border-t border-gray-100 space-y-0.5">
          <button
            onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 w-full transition-colors"
          >
            <Globe className="w-4 h-4 shrink-0" />
            {lang === "ar" ? "Français" : "العربية"}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 w-full transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {tr("logout")}
          </button>
        </div>
      </aside>

      {/* ── Page content ── */}
      <main className="flex-1 min-w-0 p-8">
        {children}
      </main>
    </div>
  );
}
