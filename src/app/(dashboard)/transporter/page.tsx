"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Truck, Package, TrendingUp, MapPin, ArrowRight,
  CheckCircle, Zap, Navigation, Star, FileText,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useSmartPoll } from "@/hooks/useSmartPoll";

type AvailableRequest = {
  id: string; fromCity: string; toCity: string;
  weight: number; goodsType: string;
  estimatedPrice: number | null;
  bids: { id: string }[];
};

type Order = { id: string; status: string };

export default function TransporterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang, tr } = useLanguage();
  const [requests, setRequests] = useState<AvailableRequest[]>([]);
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [reqRes, ordRes] = await Promise.all([
        fetch("/api/requests"),
        fetch("/api/orders"),
      ]);
      if (reqRes.ok) setRequests(await reqRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && session.user.role !== "TRANSPORTER") { router.push("/client"); return; }
    if (status === "authenticated") load();
  }, [status, session, router, load]);

  const activeOrders    = orders.filter(o => ["ACCEPTED", "IN_TRANSIT"].includes(o.status));
  const completedOrders = orders.filter(o => o.status === "DELIVERED");
  const hasActive       = activeOrders.length > 0;

  useSmartPoll(() => load(true), hasActive ? 3000 : 12000);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Hero banner */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 md:p-8"
          style={{ background: "linear-gradient(135deg, #0F1B2D 0%, #152944 50%, #0D2137 100%)" }}
        >
          {/* Dashed road line decoration */}
          <div className="absolute top-1/2 start-0 end-0 -translate-y-1/2 h-px opacity-[0.06]"
            style={{ backgroundImage: "repeating-linear-gradient(90deg, white 0, white 12px, transparent 12px, transparent 28px)" }} />
          <div className="absolute -end-10 -top-10 w-52 h-52 bg-orange-500/8 rounded-full blur-3xl" />
          <div className="absolute -start-6 -bottom-10 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">
                  {lang === "ar" ? "لوحة الناقل" : "Espace transporteur"}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{session?.user?.name}</h1>
              {hasActive && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/25 text-orange-300 text-xs font-semibold px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                    {lang === "ar" ? "في مهمة نشطة" : "En mission active"}
                  </span>
                </div>
              )}
            </div>
            <Link
              href="/transporter/browse"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-bold px-5 py-3 rounded-2xl transition-all shadow-lg shadow-orange-500/25 shrink-0"
            >
              <Navigation className="w-4 h-4" />
              {tr("browse_requests")}
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            loading={loading} value={requests.length}
            label={tr("available_requests")}
            icon={Package} gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            loading={loading} value={activeOrders.length}
            label={lang === "ar" ? "طلبات نشطة" : "En cours"}
            icon={Truck} gradient="from-orange-500 to-orange-600"
            highlight={hasActive}
          />
          <StatCard
            loading={loading} value={completedOrders.length}
            label={lang === "ar" ? "مكتملة" : "Terminées"}
            icon={CheckCircle} gradient="from-emerald-500 to-emerald-600"
          />
        </div>

        {/* Quick-access links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { href: "/transporter/orders",   icon: Truck,       label: tr("my_orders"),   color: "bg-orange-50 text-orange-600" },
            { href: "/transporter/earnings", icon: TrendingUp,  label: tr("my_earnings"), color: "bg-emerald-50 text-emerald-600" },
            { href: "/transporter/documents",icon: FileText,    label: tr("my_documents"),color: "bg-blue-50 text-blue-600" },
            { href: "/transporter/profile",  icon: MapPin,      label: tr("my_profile"),  color: "bg-purple-50 text-purple-600" },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href} href={href}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2.5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              </div>
              <span className="text-xs font-semibold text-gray-700 leading-tight">{label}</span>
            </Link>
          ))}
        </div>

        {/* Available requests preview */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center border border-blue-100">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">{tr("recent_available")}</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {lang === "ar" ? "تحديث تلقائي" : "Mise à jour auto"}
                </p>
              </div>
            </div>
            <Link
              href="/transporter/browse"
              className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-all"
            >
              {tr("view_all")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                    <div className="h-2.5 bg-gray-100 rounded-full w-1/3" />
                  </div>
                  <div className="w-20 h-7 bg-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Package className="w-7 h-7 text-gray-200" />
              </div>
              <p className="text-gray-400 text-sm font-medium">{tr("no_available_now")}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requests.slice(0, 5).map((req) => (
                <div key={req.id} className="px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50/60 transition-colors">
                  <div className="w-9 h-9 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center shrink-0 border border-orange-100">
                    <Package className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-gray-900 text-sm truncate">{req.fromCity}</span>
                      <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
                      <span className="font-semibold text-gray-900 text-sm truncate">{req.toCity}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-400">{req.weight} {tr("kg_suffix")}</span>
                      {req.estimatedPrice && (
                        <>
                          <span className="text-gray-200">·</span>
                          <span className="text-[11px] font-semibold text-orange-500">
                            {req.estimatedPrice.toLocaleString()} {tr("dz_suffix")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {req.bids.length > 0 ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full font-semibold shrink-0">
                      {tr("already_bid")}
                    </span>
                  ) : (
                    <Link
                      href="/transporter/browse"
                      className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-colors"
                    >
                      {tr("submit_bid_btn")}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active orders banner (if any) */}
        {!loading && activeOrders.length > 0 && (
          <Link
            href="/transporter/orders"
            className="flex items-center gap-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl px-5 py-4 shadow-lg shadow-orange-500/20 group"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">
                {lang === "ar"
                  ? `${activeOrders.length} طلب نشط — اضغط للمتابعة`
                  : `${activeOrders.length} commande(s) active(s) — Continuer`
                }
              </p>
              <p className="text-orange-100 text-xs mt-0.5">
                {lang === "ar" ? "تحديث تلقائي كل 3 ثواني" : "Mise à jour automatique toutes les 3s"}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
          </Link>
        )}

        {/* Ratings hint if no orders yet */}
        {!loading && completedOrders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-600 flex-1">
              {lang === "ar"
                ? "أكمل طلباتك لتحصل على تقييمات من العملاء وتزيد من ظهورك"
                : "Terminez des livraisons pour recevoir des avis et augmenter votre visibilité"
              }
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  value, label, icon: Icon, gradient, loading, highlight = false,
}: {
  value: number; label: string; icon: React.ElementType;
  gradient: string; loading: boolean; highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-4 flex flex-col gap-2.5 shadow-sm transition-all ${
      highlight ? "border-orange-200 shadow-orange-50" : "border-gray-100"
    }`}>
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      {loading ? (
        <div className="space-y-1.5 animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-1/2" />
          <div className="h-2.5 bg-gray-100 rounded w-3/4" />
        </div>
      ) : (
        <>
          <div className="text-2xl font-black text-gray-900">{value}</div>
          <div className="text-[11px] text-gray-500 leading-tight">{label}</div>
        </>
      )}
    </div>
  );
}
