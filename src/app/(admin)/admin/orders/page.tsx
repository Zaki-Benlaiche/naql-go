"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Package, Truck, Phone, Trash2, AlertTriangle, X,
  MapPin, Calendar, Filter, Activity,
} from "lucide-react";
import { useSmartPoll } from "@/hooks/useSmartPoll";
import { useLanguage } from "@/context/LanguageContext";

type Order = {
  id: string; fromCity: string; toCity: string;
  goodsType: string; weight: number; size: string;
  status: string; createdAt: string;
  estimatedPrice: number | null;
  client: { name: string; phone: string };
  acceptedBid: { price: number; transporter: { name: string; phone: string } } | null;
  _count: { bids: number };
};

const statusColors: Record<string, string> = {
  OPEN:       "bg-blue-100 text-blue-700",
  ACCEPTED:   "bg-emerald-100 text-emerald-700",
  IN_TRANSIT: "bg-orange-100 text-orange-700",
  DELIVERED:  "bg-gray-100 text-gray-600",
  CANCELLED:  "bg-red-100 text-red-600",
};

function fmt(n: number) { return n.toLocaleString("fr-DZ"); }

export default function AdminOrdersPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const statusAr: Record<string, string> = ar
    ? { OPEN: "مفتوح", ACCEPTED: "مقبول", IN_TRANSIT: "في الطريق", DELIVERED: "مُسلَّم", CANCELLED: "ملغي" }
    : { OPEN: "Ouvert", ACCEPTED: "Accepté", IN_TRANSIT: "En route", DELIVERED: "Livré", CANCELLED: "Annulé" };

  const load = useCallback(async (status: string, silent = false) => {
    if (!silent) setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    try {
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        // API now returns { orders, total, page, pageSize } — fall back if legacy.
        setOrders(Array.isArray(data) ? data : (data.orders ?? []));
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);
  useSmartPoll(() => load(filter, true), 15000);

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError(null);
    const res = await fetch(`/api/admin/orders/${deleting.id}`, { method: "DELETE" });
    if (res.ok) {
      setOrders(prev => prev.filter(o => o.id !== deleting.id));
      setDeleting(null);
    } else {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error || (ar ? "خطأ في الحذف" : "Erreur de suppression"));
    }
    setDeleteBusy(false);
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
            <Package className="w-7 h-7 text-purple-500" />
            {ar ? "الطلبات" : "Commandes"}
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            {ar ? `${orders.length} طلب • تحديث مباشر` : `${orders.length} commandes • mise à jour live`}
          </p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
        <div className="flex gap-2 items-center overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {[
            { value: "", label: ar ? "الكل" : "Tous" },
            { value: "OPEN", label: statusAr.OPEN },
            { value: "ACCEPTED", label: statusAr.ACCEPTED },
            { value: "IN_TRANSIT", label: statusAr.IN_TRANSIT },
            { value: "DELIVERED", label: statusAr.DELIVERED },
            { value: "CANCELLED", label: statusAr.CANCELLED },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                filter === f.value
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-32 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{ar ? "لا توجد طلبات" : "Aucune commande"}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">

              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {order.fromCity} → {order.toCity}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
                      <span>{order.weight} {ar ? "كغ" : "kg"}</span>
                      <span>· {order._count.bids} {ar ? "عرض" : "offres"}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString(ar ? "ar-DZ" : "fr-DZ")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                    {statusAr[order.status]}
                  </span>
                  <button
                    onClick={() => { setDeleteError(null); setDeleting(order); }}
                    title={ar ? "حذف الطلب" : "Supprimer"}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-blue-50/60 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                      {ar ? "العميل" : "Client"}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{order.client.name}</p>
                  </div>
                  <a href={`tel:${order.client.phone}`}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-white px-2 py-1.5 rounded-lg font-medium shrink-0">
                    <Phone className="w-3 h-3" />
                    <span dir="ltr">{order.client.phone}</span>
                  </a>
                </div>

                {order.acceptedBid ? (
                  <div className="bg-orange-50/60 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">
                        {ar ? "الناقل" : "Transporteur"} · {fmt(order.acceptedBid.price)} {ar ? "دج" : "DA"}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{order.acceptedBid.transporter.name}</p>
                    </div>
                    <a href={`tel:${order.acceptedBid.transporter.phone}`}
                      className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 bg-white px-2 py-1.5 rounded-lg font-medium shrink-0">
                      <Phone className="w-3 h-3" />
                      <span dir="ltr">{order.acceptedBid.transporter.phone}</span>
                    </a>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-300" />
                    <p className="text-xs text-gray-400">
                      {ar ? "في انتظار قبول ناقل" : "En attente d'un transporteur"}
                    </p>
                  </div>
                )}
              </div>

              {order.estimatedPrice && (
                <p className="text-xs text-gray-400 mt-2.5">
                  {ar ? "السعر التقديري:" : "Prix estimé :"}{" "}
                  <span className="text-orange-500 font-bold">{fmt(order.estimatedPrice)} {ar ? "دج" : "DA"}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete modal */}
      {deleting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-black text-gray-900 text-lg mb-2">
                {ar ? "حذف الطلب نهائياً؟" : "Supprimer la commande ?"}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {ar
                  ? `سيُحذف الطلب من ${deleting.fromCity} إلى ${deleting.toCity} مع كل العروض والرسائل والتقييمات. لا يمكن التراجع.`
                  : `La commande ${deleting.fromCity} → ${deleting.toCity} sera supprimée avec toutes les offres, messages et évaluations. Action irréversible.`}
              </p>
              {deleteError && (
                <div className="mt-4 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {deleteError}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 border-t border-gray-100">
              <button onClick={() => setDeleting(null)} disabled={deleteBusy}
                className="py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <X className="w-4 h-4" />
                {ar ? "إلغاء" : "Annuler"}
              </button>
              <button onClick={confirmDelete} disabled={deleteBusy}
                className="py-3.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                {deleteBusy
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Trash2 className="w-4 h-4" />}
                {ar ? "حذف نهائي" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
