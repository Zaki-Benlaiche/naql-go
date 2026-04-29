"use client";
import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Package, X, RefreshCw } from "lucide-react";

type Request = {
  id: string;
  fromCity: string;
  toCity: string;
  fromAddress: string;
  toAddress: string;
  goodsType: string;
  weight: number;
  description: string | null;
  status: string;
  createdAt: string;
  client: { name: string; phone: string };
  bids: { id: string; price: number; status: string }[];
};

const goodsMap: Record<string, string> = {
  furniture: "🛋️ أثاث",
  electronics: "💻 إلكترونيات",
  food: "🥦 مواد غذائية",
  building_material: "🏗️ مواد بناء",
  packages: "📦 طرود",
  other: "📁 أخرى",
};

const AUTO_REFRESH = 30; // seconds

export default function BrowsePage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_REFRESH);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [bidModal, setBidModal] = useState<Request | null>(null);
  const [price, setPrice] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch("/api/requests", { cache: "no-store" });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
      setCountdown(AUTO_REFRESH);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => load(true), AUTO_REFRESH * 1000);
    return () => clearInterval(interval);
  }, [load]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c <= 1 ? AUTO_REFRESH : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  async function submitBid() {
    if (!bidModal) return;
    setSubmitting(true);
    const res = await fetch("/api/bids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: bidModal.id, price, estimatedTime, note }),
    });
    setSubmitting(false);
    if (res.ok) {
      setSuccess("تم تقديم عرضك بنجاح!");
      setBidModal(null);
      setPrice(""); setEstimatedTime(""); setNote("");
      load();
      setTimeout(() => setSuccess(""), 3000);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الطلبات المتاحة</h1>
            {lastUpdated && (
              <p className="text-xs text-gray-400 mt-1">
                آخر تحديث: {lastUpdated.toLocaleTimeString("ar-DZ")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Countdown badge */}
            <div className="flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              تحديث تلقائي خلال {countdown}ث
            </div>
            {/* Manual refresh button */}
            <button
              onClick={() => load()}
              disabled={refreshing}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              تحديث
            </button>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-6">اختر طلباً وقدّم عرض سعرك</p>

        {success && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">جارٍ التحميل...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">لا توجد طلبات متاحة حالياً</p>
            <p className="text-gray-400 text-sm mt-1">سيتم التحديث تلقائياً كل {AUTO_REFRESH} ثانية</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const alreadyBid = req.bids.length > 0;
              return (
                <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">
                          {req.fromCity} ← {req.toCity}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {goodsMap[req.goodsType] || req.goodsType} • {req.weight} كغ
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {req.fromAddress}، {req.fromCity} ← {req.toAddress}، {req.toCity}
                        </div>
                        {req.description && (
                          <div className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                            {req.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          العميل: {req.client.name}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {alreadyBid ? (
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-2 rounded-xl block text-center">
                          قدّمت عرضاً ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => setBidModal(req)}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
                        >
                          قدّم عرضاً
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bid Modal */}
      {bidModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-lg">تقديم عرض سعر</h2>
              <button onClick={() => setBidModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 mb-5 text-sm">
              <div className="font-semibold text-gray-900">{bidModal.fromCity} ← {bidModal.toCity}</div>
              <div className="text-gray-500 mt-1">{bidModal.weight} كغ • {goodsMap[bidModal.goodsType]}</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السعر المقترح (دج)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="مثال: 5000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">وقت التسليم المتوقع</label>
                <select
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                >
                  <option value="">اختر...</option>
                  <option value="أقل من يوم">أقل من يوم</option>
                  <option value="يوم واحد">يوم واحد</option>
                  <option value="يومان">يومان</option>
                  <option value="3 أيام">3 أيام</option>
                  <option value="أكثر من 3 أيام">أكثر من 3 أيام</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظة <span className="text-gray-400 font-normal">(اختياري)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="أي تفاصيل إضافية..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setBidModal(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={submitBid}
                disabled={submitting || !price || !estimatedTime}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {submitting ? "جارٍ الإرسال..." : "إرسال العرض"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
