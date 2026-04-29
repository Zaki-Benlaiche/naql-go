"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck, LogOut, LayoutDashboard, PlusCircle, List, Globe,
  Menu, X, Bell, Package, Wifi, WifiOff, TrendingUp, FileText,
  ChevronRight, Zap,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isClient = session?.user?.role === "CLIENT";
  const { lang, setLang, tr } = useLanguage();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    if (!isClient) {
      fetch("/api/profile/status")
        .then(r => r.json())
        .then(d => { if (typeof d.isOnline === "boolean") setIsOnline(d.isOnline); })
        .catch(() => {});
    }
  }, [isClient]);

  async function toggleOnline() {
    setTogglingStatus(true);
    const next = !isOnline;
    try {
      const res = await fetch("/api/profile/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: next }),
      });
      if (res.ok) setIsOnline(next);
    } finally { setTogglingStatus(false); }
  }

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch("/api/notifications?unread=true");
        if (res.ok) { const d = await res.json(); setUnreadCount(d.count ?? 0); }
      } catch {}
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const links = isClient
    ? [
        { href: "/client",            label: tr("dashboard"),     icon: LayoutDashboard },
        { href: "/client/new-request", label: tr("new_request"),  icon: PlusCircle },
        { href: "/client/requests",   label: tr("my_requests"),   icon: Package },
        { href: "/notifications",     label: tr("notifications"),  icon: Bell },
      ]
    : [
        { href: "/transporter",         label: tr("dashboard"),        icon: LayoutDashboard },
        { href: "/transporter/browse",  label: tr("browse_requests"),  icon: List },
        { href: "/transporter/orders",  label: tr("my_orders"),        icon: Package },
        { href: "/transporter/earnings", label: tr("my_earnings"),     icon: TrendingUp },
        { href: "/transporter/documents", label: tr("my_documents"),   icon: FileText },
        { href: "/notifications",       label: tr("notifications"),     icon: Bell },
      ];

  const initial = session?.user?.name?.[0]?.toUpperCase() ?? "U";
  const hiddenTransform = lang === "ar" ? "translate-x-full" : "-translate-x-full";

  return (
    <div className="min-h-screen bg-[#F0F5FF] md:flex">

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 start-0 z-50 w-72 flex flex-col
        transition-transform duration-300 ease-in-out
        md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:translate-x-0
        ${open ? "translate-x-0" : hiddenTransform}
        animated-gradient
      `}>

        {/* Subtle dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative z-10 flex flex-col h-full">

          {/* Brand */}
          <div className="px-5 py-5 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
              <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg tracking-tight">NaqlGo</span>
                <div className="flex items-center gap-1 -mt-0.5">
                  <Zap className="w-2.5 h-2.5 text-orange-400" />
                  <span className="text-[10px] text-orange-400 font-medium tracking-wider uppercase">
                    {lang === "ar" ? "نقل سريع" : "Transport"}
                  </span>
                </div>
              </div>
            </Link>
            <button onClick={() => setOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User card */}
          <div className="mx-4 mb-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-sm truncate">{session?.user?.name}</p>
                <p className="text-xs text-orange-300 font-medium mt-0.5">
                  {isClient ? tr("client_label") : tr("transporter_label")}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 overflow-y-auto">
            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 mb-2">
              {lang === "ar" ? "القائمة" : "Navigation"}
            </p>
            <div className="space-y-0.5">
              {links.map((link) => {
                const active = pathname === link.href;
                const isNotif = link.href === "/notifications";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => { setOpen(false); if (isNotif) setUnreadCount(0); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "nav-active text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    <span className="relative shrink-0">
                      <link.icon className={`w-4 h-4 ${active ? "text-white" : ""}`} />
                      {isNotif && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -end-1.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </span>
                    <span>{link.label}</span>
                    {active && <div className="ms-auto w-1.5 h-1.5 bg-white/60 rounded-full" />}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom */}
          <div className="px-3 pb-5 pt-3 space-y-1 shrink-0 border-t border-white/8">

            {/* Online toggle — transporter */}
            {!isClient && (
              <button onClick={toggleOnline} disabled={togglingStatus}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all ${
                  isOnline
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/8"
                }`}>
                {isOnline ? <Wifi className="w-4 h-4 shrink-0" /> : <WifiOff className="w-4 h-4 shrink-0" />}
                {isOnline ? tr("go_offline") : tr("go_online")}
                {isOnline && (
                  <span className="ms-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400">{lang === "ar" ? "متصل" : "En ligne"}</span>
                  </span>
                )}
              </button>
            )}

            <button onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/8 w-full transition-all">
              <Globe className="w-4 h-4 shrink-0" />
              {lang === "ar" ? "Français" : "العربية"}
            </button>

            <button onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/8 w-full transition-all">
              <LogOut className="w-4 h-4 shrink-0" />
              {tr("logout")}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile header */}
        <header className="md:hidden bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">NaqlGo</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/notifications" onClick={() => setUnreadCount(0)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 end-1.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {initial}
            </div>
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
