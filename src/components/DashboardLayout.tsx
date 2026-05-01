"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut, LayoutDashboard, PlusCircle, List, Globe,
  Menu, X, Bell, Package, Wifi, WifiOff, TrendingUp, FileText,
  ChevronRight, UserCog, Sparkles, DollarSign, Users,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { NaqlGoLogo } from "@/components/NaqlGoLogo";

// Icon color mapping for each nav item
const iconColors: Record<string, string> = {
  "/client":             "#FF6B00",
  "/client/new-request": "#2563EB",
  "/client/requests":    "#8B5CF6",
  "/notifications":      "#F59E0B",
  "/transporter":            "#FF6B00",
  "/transporter/browse":     "#2563EB",
  "/transporter/orders":     "#8B5CF6",
  "/transporter/earnings":   "#10B981",
  "/transporter/documents":  "#64748B",
  "/transporter/profile":    "#06B6D4",
  "/admin/earnings":         "#F59E0B",
  "/admin/users":            "#8B5CF6",
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isClient      = session?.user?.role === "CLIENT";
  const isAdmin       = session?.user?.role === "ADMIN";
  const { lang, setLang, tr } = useLanguage();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [notifToast, setNotifToast] = useState<string | null>(null);
  const prevCountRef = useRef(-1);

  useEffect(() => {
    if (!isClient && !isAdmin) {
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
        if (res.ok) {
          const d = await res.json();
          const count = d.count ?? 0;
          if (prevCountRef.current >= 0 && count > prevCountRef.current) {
            setNotifToast(lang === "ar" ? "لديك إشعار جديد 🔔" : "Nouvelle notification 🔔");
            setTimeout(() => setNotifToast(null), 5000);
          }
          prevCountRef.current = count;
          setUnreadCount(count);
        }
      } catch {}
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [lang]);

  const links = isAdmin
    ? [
        { href: "/admin/earnings", label: lang === "ar" ? "عمولاتي"    : "Mes commissions", icon: DollarSign },
        { href: "/notifications",  label: tr("notifications"),                               icon: Bell },
      ]
    : isClient
    ? [
        { href: "/client",             label: tr("dashboard"),    icon: LayoutDashboard },
        { href: "/client/new-request", label: tr("new_request"),  icon: PlusCircle },
        { href: "/client/requests",    label: tr("my_requests"),  icon: Package },
        { href: "/notifications",      label: tr("notifications"), icon: Bell },
      ]
    : [
        { href: "/transporter",           label: tr("dashboard"),        icon: LayoutDashboard },
        { href: "/transporter/browse",    label: tr("browse_requests"),  icon: List },
        { href: "/transporter/orders",    label: tr("my_orders"),        icon: Package },
        { href: "/transporter/earnings",  label: tr("my_earnings"),      icon: TrendingUp },
        { href: "/transporter/documents", label: tr("my_documents"),     icon: FileText },
        { href: "/transporter/profile",   label: tr("my_profile"),       icon: UserCog },
        { href: "/notifications",         label: tr("notifications"),    icon: Bell },
      ];

  const initial = session?.user?.name?.[0]?.toUpperCase() ?? "U";
  const hiddenTransform = lang === "ar" ? "translate-x-full" : "-translate-x-full";

  return (
    <div className="min-h-screen md:flex" style={{ background: "var(--bg-page)" }}>

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
            <Link href="/" className="hover:opacity-90 transition-opacity" onClick={() => setOpen(false)}>
              <NaqlGoLogo size="md" dark />
            </Link>
            <button onClick={() => setOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User card */}
          <div className="mx-4 mb-5 shrink-0">
            <div className="card-glass px-4 py-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#E65100] flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-sm truncate">{session?.user?.name}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "rgba(255,107,0,0.8)" }}>
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
                const iconColor = iconColors[link.href] || "#FF6B00";
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
                      <link.icon
                        className="w-4 h-4"
                        style={active ? { color: "white" } : { color: iconColor }}
                      />
                      {isNotif && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -end-1.5 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
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
              <Globe className="w-4 h-4 shrink-0 text-[#06B6D4]" />
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

      {/* Global new-notification toast */}
      {notifToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-[#0F172A] text-white text-sm font-medium px-5 py-3 rounded-2xl min-w-[240px] max-w-xs animate-slide-up"
          style={{ boxShadow: "0 8px 32px rgba(15,23,42,0.3)" }}>
          <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/20 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <span className="flex-1">{notifToast}</span>
          <button onClick={() => setNotifToast(null)} className="text-white/40 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile header */}
        <header className="md:hidden bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-4 py-3 flex items-center justify-between sticky top-0 z-30"
          style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <NaqlGoLogo size="xs" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/notifications" onClick={() => setUnreadCount(0)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 end-1 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#E65100] flex items-center justify-center text-white font-bold text-xs shadow-sm">
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
