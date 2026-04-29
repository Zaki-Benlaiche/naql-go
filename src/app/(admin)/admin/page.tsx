"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Users, Package, TrendingUp, Star, LogOut,
  Truck, BarChart3, ArrowUpRight, Clock,
} from "lucide-react";

type Stats = {
  totalUsers: number; totalClients: number; totalTransporters: number;
  totalRequests: number; openRequests: number; inTransit: number; delivered: number;
  totalBids: number; avgRating: number; totalRevenue: number;
  newUsersWeek: number; newRequestsWeek: number;
};

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {sub && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
            <ArrowUpRight className="w-3 h-3" /> {sub}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">NaqlGo Admin</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/admin", label: "الإحصائيات", icon: BarChart3 },
            { href: "/admin/users", label: "المستخدمون", icon: Users },
            { href: "/admin/orders", label: "الطلبات", icon: Package },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">لوحة الإدارة</h1>
          <p className="text-gray-500 text-sm mt-1">نظرة عامة على منصة NaqlGo</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-28 animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Main stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="إجمالي المستخدمين"   value={stats.totalUsers}       sub={`+${stats.newUsersWeek} هذا الأسبوع`} icon={Users}      color="bg-blue-500" />
              <StatCard label="العملاء"              value={stats.totalClients}                                                    icon={Users}      color="bg-indigo-500" />
              <StatCard label="الناقلون"             value={stats.totalTransporters}                                               icon={Truck}      color="bg-orange-500" />
              <StatCard label="متوسط التقييم"        value={stats.avgRating.toFixed(1) + " ⭐"}                                    icon={Star}       color="bg-yellow-500" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="إجمالي الطلبات"  value={stats.totalRequests}    sub={`+${stats.newRequestsWeek} هذا الأسبوع`} icon={Package}     color="bg-purple-500" />
              <StatCard label="طلبات مفتوحة"   value={stats.openRequests}                                                      icon={Clock}       color="bg-blue-400" />
              <StatCard label="في الطريق"       value={stats.inTransit}                                                         icon={Truck}       color="bg-orange-400" />
              <StatCard label="تم التسليم"      value={stats.delivered}                                                         icon={TrendingUp}  color="bg-green-500" />
            </div>

            {/* Revenue highlight */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">الإيرادات التقديرية (الطلبات المكتملة)</p>
                  <p className="text-3xl font-bold">{stats.totalRevenue.toLocaleString()} دج</p>
                  <p className="text-orange-100 text-sm mt-1">{stats.totalBids.toLocaleString()} عرض مقدَّم إجمالاً</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Link href="/admin/users"
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-orange-200 hover:shadow-md transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">إدارة المستخدمين</p>
                  <p className="text-sm text-gray-500">{stats.totalUsers} مستخدم — حظر / تفعيل</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 ms-auto" />
              </Link>
              <Link href="/admin/orders"
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-orange-200 hover:shadow-md transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">إدارة الطلبات</p>
                  <p className="text-sm text-gray-500">{stats.totalRequests} طلب — مراقبة مباشرة</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 ms-auto" />
              </Link>
            </div>
          </>
        ) : (
          <p className="text-red-500 text-sm">خطأ في تحميل البيانات</p>
        )}
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex z-30">
        {[
          { href: "/admin", label: "الإحصائيات", icon: BarChart3 },
          { href: "/admin/users", label: "المستخدمون", icon: Users },
          { href: "/admin/orders", label: "الطلبات", icon: Package },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 hover:text-orange-500 transition-colors">
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
