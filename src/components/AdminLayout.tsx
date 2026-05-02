"use client";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Package, DollarSign, LogOut,
  Menu, X, Globe, ShieldCheck, ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { NaqlGoLogo } from "@/components/NaqlGoLogo";

const iconColors: Record<string, string> = {
  "/admin":          "#FF6B00",
  "/admin/users":    "#2563EB",
  "/admin/orders":   "#8B5CF6",
  "/admin/earnings": "#10B981",
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);

  const ar = lang === "ar";

  const links = [
    { href: "/admin",          label: ar ? "الإحصائيات"  : "Statistiques", icon: LayoutDashboard },
    { href: "/admin/users",    label: ar ? "المستخدمون"  : "Utilisateurs", icon: Users },
    { href: "/admin/orders",   label: ar ? "الطلبات"     : "Commandes",    icon: Package },
    { href: "/admin/earnings", label: ar ? "العمولات"    : "Commissions",  icon: DollarSign },
  ];

  const initial = session?.user?.name?.[0]?.toUpperCase() ?? "A";
  const hiddenTransform = ar ? "translate-x-full" : "-translate-x-full";

  return (
    <div className="min-h-screen md:flex" style={{ background: "var(--bg-page)" }}>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 start-0 z-50 w-72 flex flex-col
        transition-transform duration-300 ease-in-out
        md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:translate-x-0
        ${open ? "translate-x-0" : hiddenTransform}
        animated-gradient
      `}>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative z-10 flex flex-col h-full">

          <div className="px-5 py-5 flex items-center justify-between shrink-0">
            <Link href="/admin" className="hover:opacity-90 transition-opacity" onClick={() => setOpen(false)}>
              <NaqlGoLogo size="md" dark />
            </Link>
            <button onClick={() => setOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mx-4 mb-5 shrink-0">
            <div className="card-glass px-4 py-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-sm truncate">{session?.user?.name}</p>
                <p className="text-xs font-medium mt-0.5 flex items-center gap-1" style={{ color: "rgba(139,92,246,0.85)" }}>
                  <ShieldCheck className="w-3 h-3" />
                  {ar ? "مدير النظام" : "Admin"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
            </div>
          </div>

          <nav className="flex-1 px-3 overflow-y-auto">
            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 mb-2">
              {ar ? "لوحة التحكم" : "Console"}
            </p>
            <div className="space-y-0.5">
              {links.map((link) => {
                const active = pathname === link.href;
                const iconColor = iconColors[link.href] || "#FF6B00";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "nav-active text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    <link.icon className="w-4 h-4 shrink-0"
                      style={active ? { color: "white" } : { color: iconColor }} />
                    <span>{link.label}</span>
                    {active && <div className="ms-auto w-1.5 h-1.5 bg-white/60 rounded-full" />}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="px-3 pb-5 pt-3 space-y-1 shrink-0 border-t border-white/8">
            <button onClick={() => setLang(ar ? "fr" : "ar")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/8 w-full transition-all">
              <Globe className="w-4 h-4 shrink-0 text-[#06B6D4]" />
              {ar ? "Français" : "العربية"}
            </button>

            <button onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/8 w-full transition-all">
              <LogOut className="w-4 h-4 shrink-0" />
              {ar ? "تسجيل الخروج" : "Déconnexion"}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">

        <header className="md:hidden bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-4 py-3 flex items-center justify-between sticky top-0 z-30"
          style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <Link href="/admin" className="hover:opacity-90 transition-opacity">
            <NaqlGoLogo size="xs" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              <ShieldCheck className="w-3 h-3" />
              {ar ? "مدير" : "Admin"}
            </span>
            <button onClick={() => setOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
