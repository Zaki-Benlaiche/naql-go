"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Truck, LogOut, LayoutDashboard, PlusCircle, List, Globe, Menu, X, Bell, Package } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isClient = session?.user?.role === "CLIENT";
  const { lang, setLang, tr } = useLanguage();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch("/api/notifications?unread=true");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count ?? 0);
        }
      } catch {}
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const links = isClient
    ? [
        { href: "/client", label: tr("dashboard"), icon: LayoutDashboard },
        { href: "/client/new-request", label: tr("new_request"), icon: PlusCircle },
        { href: "/client/requests", label: tr("my_requests"), icon: List },
        { href: "/notifications", label: tr("notifications"), icon: Bell },
      ]
    : [
        { href: "/transporter", label: tr("dashboard"), icon: LayoutDashboard },
        { href: "/transporter/browse", label: tr("browse_requests"), icon: List },
        { href: "/transporter/orders", label: tr("my_orders"), icon: Package },
        { href: "/notifications", label: tr("notifications"), icon: Bell },
      ];

  const initial = session?.user?.name?.[0]?.toUpperCase() ?? "U";
  // slide direction depends on reading direction
  const hiddenTransform = lang === "ar" ? "translate-x-full" : "-translate-x-full";

  return (
    <div className="min-h-screen bg-gray-50 md:flex">

      {/* ── Mobile backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 start-0 z-50 w-72 bg-white flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          md:sticky md:top-0 md:h-screen md:w-64 md:shadow-none
          md:border-e md:border-gray-100 md:shrink-0 md:translate-x-0
          ${open ? "translate-x-0" : hiddenTransform}
        `}
      >
        {/* Brand */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">NaqlGo</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User card */}
        <div className="px-4 py-3 border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-50">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
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

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">
            Menu
          </p>
          {links.map((link) => {
            const active = pathname === link.href;
            const isNotif = link.href === "/notifications";
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => { setOpen(false); if (isNotif) setUnreadCount(0); }}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="relative shrink-0">
                  <link.icon className="w-4 h-4" />
                  {isNotif && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -end-1.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-6 pt-3 border-t border-gray-100 space-y-0.5 shrink-0">
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

      {/* ── Content area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top header */}
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">NaqlGo</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              onClick={() => setUnreadCount(0)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 end-1.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {initial}
            </div>
            <button
              onClick={() => setOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
