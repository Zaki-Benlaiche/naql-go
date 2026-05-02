"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Package, TrendingUp, Star, Truck, BarChart3, ArrowUpRight,
  Clock, CheckCircle, XCircle, DollarSign, Activity, ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Stats = {
  totalUsers: number; totalClients: number; totalTransporters: number;
  totalRequests: number; openRequests: number; inTransit: number; delivered: number;
  totalBids: number; avgRating: number; totalRevenue: number;
  newUsersWeek: number; newRequestsWeek: number;
};

function fmt(n: number) { return n.toLocaleString("fr-DZ"); }

function StatCard({
  label, value, sub, icon: Icon, accent, trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent: string;
  trend?: { value: string; positive?: boolean };
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}15` }}>
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
            trend.positive !== false ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          }`}>
            <ArrowUpRight className="w-3 h-3" /> {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900 leading-tight">
        {typeof value === "number" ? fmt(value) : value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">
            {ar ? "لوحة التحكم" : "Tableau de bord"}
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            {ar ? "نظرة شاملة على منصة NaqlGo" : "Vue d'ensemble de la plateforme NaqlGo"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-1.5 rounded-xl shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-gray-700">{ar ? "مباشر" : "En direct"}</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : !stats ? (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl">
          {ar ? "خطأ في تحميل البيانات" : "Erreur de chargement"}
        </div>
      ) : (
        <>
          {/* ── Hero earnings card ── */}
          <div className="bg-gradient-to-br from-[#FF6B00] via-[#E05000] to-[#BF4000] rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-orange-200/50 relative overflow-hidden">
            <div className="absolute -top-10 -end-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -start-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider mb-2">
                  {ar ? "إجمالي الإيرادات" : "Revenus totaux"}
                </p>
                <p className="text-4xl md:text-5xl font-black leading-none">
                  {fmt(stats.totalRevenue)} <span className="text-2xl">{ar ? "دج" : "DA"}</span>
                </p>
                <p className="text-orange-100 text-sm mt-3">
                  {ar
                    ? `${fmt(stats.totalBids)} عرض إجمالاً • عمولة 10% = ${fmt(Math.round(stats.totalRevenue * 0.1))} دج`
                    : `${fmt(stats.totalBids)} offres au total • commission 10 % = ${fmt(Math.round(stats.totalRevenue * 0.1))} DA`}
                </p>
              </div>
              <Link href="/admin/earnings"
                className="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all">
                <DollarSign className="w-4 h-4" />
                {ar ? "تفاصيل العمولات" : "Détails commissions"}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* ── Users stats ── */}
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              {ar ? "المستخدمون" : "Utilisateurs"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard
                label={ar ? "إجمالي المستخدمين" : "Total utilisateurs"}
                value={stats.totalUsers}
                icon={Users} accent="#2563EB"
                trend={{ value: `+${stats.newUsersWeek}/${ar ? "أسبوع" : "sem"}` }}
              />
              <StatCard label={ar ? "العملاء" : "Clients"} value={stats.totalClients}     icon={Users} accent="#6366F1" />
              <StatCard label={ar ? "الناقلون" : "Transporteurs"} value={stats.totalTransporters} icon={Truck} accent="#FF6B00" />
              <StatCard
                label={ar ? "متوسط التقييم" : "Note moyenne"}
                value={stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ★` : "—"}
                icon={Star} accent="#F59E0B"
              />
            </div>
          </div>

          {/* ── Orders stats ── */}
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              {ar ? "الطلبات" : "Commandes"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard
                label={ar ? "إجمالي الطلبات" : "Total commandes"} value={stats.totalRequests}
                icon={Package} accent="#8B5CF6"
                trend={{ value: `+${stats.newRequestsWeek}/${ar ? "أسبوع" : "sem"}` }}
              />
              <StatCard label={ar ? "مفتوحة" : "Ouvertes"}    value={stats.openRequests} icon={Clock} accent="#0EA5E9" />
              <StatCard label={ar ? "في الطريق" : "En cours"} value={stats.inTransit}    icon={Truck} accent="#F97316" />
              <StatCard label={ar ? "مُسلَّمة" : "Livrées"}    value={stats.delivered}    icon={CheckCircle} accent="#10B981" />
            </div>
          </div>

          {/* ── Quick actions ── */}
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              {ar ? "الإجراءات السريعة" : "Actions rapides"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link href="/admin/users"
                className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{ar ? "إدارة المستخدمين" : "Utilisateurs"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ar ? `${stats.totalUsers} مستخدم • حظر، تفعيل، حذف` : `${stats.totalUsers} • bloquer, activer, supprimer`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>

              <Link href="/admin/orders"
                className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{ar ? "إدارة الطلبات" : "Commandes"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ar ? `${stats.totalRequests} طلب • مراقبة وحذف` : `${stats.totalRequests} • suivi et suppression`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>

              <Link href="/admin/earnings"
                className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{ar ? "العمولات" : "Commissions"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ar ? "تتبع عمولة كل ناقل" : "Suivi par transporteur"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
