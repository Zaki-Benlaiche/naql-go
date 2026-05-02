"use client";
import { useEffect, useState } from "react";
import {
  TrendingUp, DollarSign, Truck, Users, Phone, Activity,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type TransporterRow = {
  id: string; name: string; phone: string;
  deliveries: number;
  totalGross: number; totalCommission: number;
  thisMonthGross: number; thisMonthCommission: number;
};

type AdminData = {
  totalCommission: number;
  thisMonthCommission: number;
  totalDeliveries: number;
  totalGross: number;
  commissionRate: number;
  transporters: TransporterRow[];
};

function fmt(n: number) { return Math.round(n).toLocaleString("fr-DZ"); }

export default function AdminEarningsPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/earnings")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  const dz = ar ? "دج" : "DA";

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-orange-500" />
            {ar ? "العمولات" : "Commissions"}
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            {ar ? "10% من كل طلبية يؤديها الناقل" : "10% de chaque livraison effectuée"}
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
          {/* Hero card */}
          <div className="bg-gradient-to-br from-[#FF6B00] via-[#E05000] to-[#BF4000] rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-orange-200/50 relative overflow-hidden">
            <div className="absolute -top-10 -end-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10">
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider mb-2">
                {ar ? "إجمالي عمولاتك" : "Vos commissions totales"}
              </p>
              <p className="text-4xl md:text-5xl font-black leading-none">
                {fmt(data.totalCommission)} <span className="text-2xl">{dz}</span>
              </p>
              <p className="text-orange-100 text-sm mt-3">
                {ar
                  ? `من ${fmt(data.totalGross)} دج إجمالي طلبيات • ${data.totalDeliveries} توصيلة منجزة`
                  : `sur ${fmt(data.totalGross)} DA de livraisons • ${data.totalDeliveries} livraisons effectuées`}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-gray-900 leading-tight">
                {fmt(data.thisMonthCommission)} {dz}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {ar ? "عمولة هذا الشهر" : "Commission ce mois"}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                <Truck className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-gray-900 leading-tight">{data.totalDeliveries}</p>
              <p className="text-xs text-gray-500 mt-1">
                {ar ? "توصيلات منجزة" : "Livraisons effectuées"}
              </p>
            </div>
          </div>

          {/* Per-transporter list */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gray-400" />
              <h2 className="font-bold text-gray-900 text-sm">
                {ar ? "عمولة كل ناقل" : "Commission par transporteur"}
              </h2>
              <span className="ms-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-semibold">
                {data.transporters.length}
              </span>
            </div>

            {data.transporters.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <Truck className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">
                  {ar ? "لا توجد توصيلات منجزة بعد" : "Aucune livraison pour l'instant"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.transporters.map((t) => (
                  <div key={t.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 px-4 pt-3.5 pb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                        {t.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{t.name}</p>
                        <a href={`tel:${t.phone}`}
                          className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /><span dir="ltr">{t.phone}</span>
                        </a>
                      </div>
                      <div className="text-end shrink-0">
                        <p className="font-black text-orange-600 text-base">
                          {fmt(t.thisMonthCommission)} {dz}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                          {ar ? "هذا الشهر" : "ce mois"}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-50 bg-gray-50/60 px-4 py-2.5 grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <p className="text-gray-400">{ar ? "التوصيلات" : "Livraisons"}</p>
                        <p className="font-bold text-gray-800 mt-0.5">{t.deliveries}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">{ar ? "إجمالي" : "Total brut"}</p>
                        <p className="font-bold text-gray-800 mt-0.5">{fmt(t.totalGross)} {dz}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">{ar ? "العمولة" : "Commission"}</p>
                        <p className="font-bold text-orange-500 mt-0.5">{fmt(t.totalCommission)} {dz}</p>
                      </div>
                    </div>

                    {t.thisMonthCommission > 0 && (
                      <div className="bg-orange-50 border-t border-orange-100 px-4 py-2 text-xs text-orange-700 font-semibold flex items-center justify-between">
                        <span>
                          {ar
                            ? `مستحق هذا الشهر من ${t.name.split(" ")[0]}`
                            : `Dû ce mois par ${t.name.split(" ")[0]}`}
                        </span>
                        <span className="font-black text-orange-600">
                          {fmt(t.thisMonthCommission)} {dz}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
