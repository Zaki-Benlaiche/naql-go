"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  TrendingUp, Truck, DollarSign, BarChart3,
  AlertCircle, CheckCircle2, ChevronDown, ChevronUp,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type EarningsData = {
  totalGross: number;
  totalNet: number;
  totalAdminFee: number;
  thisMonthGross: number;
  thisMonthNet: number;
  thisMonthAdminFee: number;
  completedTrips: number;
  avgNetPerTrip: number;
  commissionRate: number;
  history: {
    id: string;
    grossPrice: number;
    netPrice: number;
    adminFee: number;
    fromCity: string;
    toCity: string;
    deliveredAt: string;
  }[];
};

function fmt(n: number) { return Math.round(n).toLocaleString("fr-DZ"); }

function timeAgo(dateStr: string, lang: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 86400)      return lang === "ar" ? "اليوم"                               : "Aujourd'hui";
  if (diff < 86400 * 7)  return lang === "ar" ? `${Math.floor(diff / 86400)} أيام`   : `Il y a ${Math.floor(diff / 86400)} j`;
  return new Date(dateStr).toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ");
}

export default function EarningsPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [data,    setData]    = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/transporter/earnings")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  const dz = ar ? "دج" : "DA";

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{ar ? "أرباحي" : "Mes gains"}</h1>
            <p className="text-xs text-gray-400">
              {ar ? "عمولة الإدارة 10% لكل طلبية" : "Commission admin 10 % par livraison"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
            ))}
          </div>
        ) : !data ? (
          <p className="text-red-500 text-sm">{ar ? "حدث خطأ" : "Erreur"}</p>
        ) : (
          <>
            {/* ── Stats grid ── */}
            <div className="grid grid-cols-2 gap-3">
              {/* Net earnings (green) */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-lg font-bold text-gray-900 leading-tight">
                  {fmt(data.totalNet)} {dz}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{ar ? "حصتك الصافية (90%)" : "Votre part nette (90%)"}</p>
              </div>

              {/* Admin commission (orange/red) */}
              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4">
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center mb-2.5">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-lg font-bold text-orange-600 leading-tight">
                  {fmt(data.totalAdminFee)} {dz}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{ar ? "عمولة الإدارة (10%)" : "Commission admin (10%)"}</p>
              </div>

              {/* Completed trips */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-2.5">
                  <Truck className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-lg font-bold text-gray-900 leading-tight">{data.completedTrips}</p>
                <p className="text-xs text-gray-500 mt-0.5">{ar ? "رحلات مكتملة" : "Trajets effectués"}</p>
              </div>

              {/* Avg per trip (net) */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center mb-2.5">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-lg font-bold text-gray-900 leading-tight">
                  {fmt(data.avgNetPerTrip)} {dz}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{ar ? "متوسط الرحلة (صافي)" : "Moy. par trajet (net)"}</p>
              </div>
            </div>

            {/* ── Monthly summary card ── */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              {/* Green top — net this month */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 text-white">
                <p className="text-emerald-100 text-xs font-medium mb-0.5">
                  {ar ? "حصتك الصافية هذا الشهر" : "Votre gain net ce mois"}
                </p>
                <p className="text-2xl font-bold">{fmt(data.thisMonthNet)} {dz}</p>
                <p className="text-emerald-100 text-xs mt-1">
                  {ar
                    ? `إجمالي هذا الشهر: ${fmt(data.thisMonthGross)} دج`
                    : `Brut ce mois : ${fmt(data.thisMonthGross)} DA`}
                </p>
              </div>

              {/* Orange bottom — commission due */}
              <div className="bg-orange-50 border-t border-orange-100 px-5 py-3 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-orange-700">
                    {ar
                      ? `${fmt(data.thisMonthAdminFee)} دج مستحقة للإدارة هذا الشهر`
                      : `${fmt(data.thisMonthAdminFee)} DA dus à l'admin ce mois`}
                  </p>
                  <p className="text-xs text-orange-500 mt-0.5">
                    {ar ? "تُدفع في نهاية الشهر" : "À régler en fin de mois"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── History ── */}
            <div>
              <h2 className="font-bold text-gray-900 mb-3 text-sm">
                {ar ? "سجل الطلبيات" : "Historique des livraisons"}
              </h2>

              {data.history.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <Truck className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">{ar ? "لا توجد أرباح بعد" : "Aucun gain pour l'instant"}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.history.map(item => {
                    const open = expanded === item.id;
                    return (
                      <div key={item.id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Row */}
                        <button
                          className="w-full flex items-center gap-3 px-4 py-3.5 text-start"
                          onClick={() => setExpanded(open ? null : item.id)}
                        >
                          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                            <Truck className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {item.fromCity} → {item.toCity}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{timeAgo(item.deliveredAt, lang)}</p>
                          </div>
                          <div className="text-end shrink-0">
                            <p className="font-bold text-emerald-600 text-sm">
                              +{fmt(item.netPrice)} {dz}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {ar ? "صافي" : "net"}
                            </p>
                          </div>
                          {open
                            ? <ChevronUp  className="w-4 h-4 text-gray-300 shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-gray-300 shrink-0" />
                          }
                        </button>

                        {/* Expanded breakdown */}
                        {open && (
                          <div className="border-t border-gray-50 bg-gray-50/50 px-4 py-3 grid grid-cols-3 gap-2 text-center text-xs">
                            <div>
                              <p className="text-gray-400">{ar ? "الإجمالي" : "Brut"}</p>
                              <p className="font-bold text-gray-800 mt-0.5">{fmt(item.grossPrice)} {dz}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">{ar ? "حصتك (90%)" : "Votre part"}</p>
                              <p className="font-bold text-emerald-600 mt-0.5">{fmt(item.netPrice)} {dz}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">{ar ? "عمولة (10%)" : "Commission"}</p>
                              <p className="font-bold text-orange-500 mt-0.5">{fmt(item.adminFee)} {dz}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
