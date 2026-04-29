"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TrendingUp, Truck, DollarSign, BarChart3 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type EarningsData = {
  totalEarned: number;
  thisMonthEarned: number;
  completedTrips: number;
  avgPerTrip: number;
  history: { id: string; price: number; fromCity: string; toCity: string; deliveredAt: string }[];
};

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function timeAgo(dateStr: string, lang: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 86400) return lang === "ar" ? "اليوم" : "Aujourd'hui";
  if (diff < 86400 * 7) return lang === "ar" ? `${Math.floor(diff / 86400)} أيام` : `Il y a ${Math.floor(diff / 86400)} j`;
  return new Date(dateStr).toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ");
}

export default function EarningsPage() {
  const { lang, tr } = useLanguage();
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transporter/earnings")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{tr("my_earnings")}</h1>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-28 animate-pulse" />
            ))}
          </div>
        ) : !data ? (
          <p className="text-red-500 text-sm">{tr("error_occurred")}</p>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard
                label={tr("total_earned")}
                value={`${data.totalEarned.toLocaleString()} ${tr("dz_suffix")}`}
                icon={TrendingUp}
                color="bg-orange-500"
              />
              <StatCard
                label={tr("this_month")}
                value={`${data.thisMonthEarned.toLocaleString()} ${tr("dz_suffix")}`}
                icon={BarChart3}
                color="bg-blue-500"
              />
              <StatCard
                label={tr("completed_trips")}
                value={String(data.completedTrips)}
                icon={Truck}
                color="bg-green-500"
              />
              <StatCard
                label={tr("avg_per_trip")}
                value={`${Math.round(data.avgPerTrip).toLocaleString()} ${tr("dz_suffix")}`}
                icon={DollarSign}
                color="bg-purple-500"
              />
            </div>

            {/* Revenue highlight bar */}
            {data.totalEarned > 0 && (
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 text-white mb-6 shadow-sm">
                <p className="text-orange-100 text-xs font-medium mb-1">
                  {lang === "ar" ? "إجمالي ما كسبته حتى الآن" : "Total gagné jusqu'à présent"}
                </p>
                <p className="text-3xl font-bold">{data.totalEarned.toLocaleString()} {tr("dz_suffix")}</p>
                <p className="text-orange-100 text-sm mt-1">
                  {data.completedTrips} {lang === "ar" ? "رحلة مكتملة" : "trajet(s) effectué(s)"}
                </p>
              </div>
            )}

            {/* History */}
            <h2 className="font-bold text-gray-900 mb-3 text-sm">{tr("earnings_history")}</h2>
            {data.history.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Truck className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">{tr("no_earnings")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.history.map(item => (
                  <div key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-center gap-4 shadow-sm">
                    <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {item.fromCity} → {item.toCity}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{timeAgo(item.deliveredAt, lang)}</p>
                    </div>
                    <p className="font-bold text-green-600 text-sm shrink-0">
                      +{item.price.toLocaleString()} {tr("dz_suffix")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
