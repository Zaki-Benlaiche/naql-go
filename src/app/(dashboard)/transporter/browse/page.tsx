"use client";
import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Package, X, RefreshCw, Calculator } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Request = {
  id: string; fromCity: string; toCity: string;
  fromAddress: string; toAddress: string;
  goodsType: string; vehicleType: string; size: string;
  weight: number; estimatedPrice: number | null;
  description: string | null; status: string;
  createdAt: string;
  client: { name: string; phone: string };
  bids: { id: string; price: number; status: string }[];
};

const goodsKeyMap: Record<string, string> = {
  furniture: "goods_furniture", electronics: "goods_electronics",
  food: "goods_food", building_material: "goods_building",
  packages: "goods_packages", other: "goods_other",
};

const AUTO_REFRESH = 30;

const sizeKeyMap: Record<string, string> = {
  small: "size_small", medium: "size_medium",
  large: "size_large", extra_large: "size_extra_large",
};

export default function BrowsePage() {
  const { tr } = useLanguage();
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
  const [bidError, setBidError] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch("/api/requests", { cache: "no-store" });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
      setCountdown(AUTO_REFRESH);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const i = setInterval(() => load(true), AUTO_REFRESH * 1000);
    return () => clearInterval(i);
  }, [load]);
  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c <= 1 ? AUTO_REFRESH : c - 1), 1000);
    return () => clearInterval(t);
  }, []);

  async function submitBid() {
    if (!bidModal) return;
    setBidError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: bidModal.id, price, estimatedTime, note }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(tr("bid_success"));
        setBidModal(null); setPrice(""); setEstimatedTime(""); setNote("");
        load();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setBidError(data.error || "حدث خطأ، حاول مجدداً");
      }
    } catch {
      setBidError("تعذر الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  }

  const goodsLabel = (type: string) => {
    const key = goodsKeyMap[type] as Parameters<typeof tr>[0] | undefined;
    return key ? tr(key) : type;
  };

  const sizeLabel = (size: string) => {
    const key = sizeKeyMap[size] as Parameters<typeof tr>[0] | undefined;
    return key ? tr(key) : size;
  };

  const timeOptions = [
    tr("time_less_day"), tr("time_one_day"), tr("time_two_days"),
    tr("time_three_days"), tr("time_more"),
  ];

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent bg-white transition";

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{tr("browse_title")}</h1>
            {lastUpdated && (
              <p className="text-xs text-gray-400 mt-0.5">
                {tr("last_updated")} {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              {tr("auto_refresh")} {countdown}s
            </div>
            <button onClick={() => load()} disabled={refreshing}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {tr("refresh_btn")}
            </button>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-5">{tr("browse_sub")}</p>

        {success && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 border border-green-100">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">{tr("loading")}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-sm">{tr("no_available")}</p>
            <p className="text-gray-400 text-xs mt-1">{tr("auto_refresh_note")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const alreadyBid = req.bids.length > 0;
              return (
                <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-orange-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm md:text-base truncate">
                          {req.fromCity} ← {req.toCity}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {goodsLabel(req.goodsType)} · {req.weight} {tr("kg_suffix")} · {sizeLabel(req.size || "medium")}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {req.fromAddress} ← {req.toAddress}
                        </p>
                        {req.estimatedPrice && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <Calculator className="w-3 h-3 text-orange-400" />
                            <span className="text-xs text-orange-600 font-semibold">
                              ~{req.estimatedPrice.toLocaleString()} {tr("dz_suffix")}
                            </span>
                          </div>
                        )}
                        {req.description && (
                          <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 line-clamp-2">
                            {req.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1.5">
                          {tr("client_label2")} {req.client.name}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {alreadyBid ? (
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1.5 rounded-xl block text-center whitespace-nowrap">
                          {tr("already_bid")}
                        </span>
                      ) : (
                        <button onClick={() => { setBidModal(req); setBidError(""); }}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs md:text-sm px-3 md:px-5 py-2 md:py-2.5 rounded-xl transition-colors whitespace-nowrap">
                          {tr("submit_bid_btn")}
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
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-lg">{tr("bid_title")}</h2>
              <button onClick={() => setBidModal(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drag handle for mobile sheet */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full sm:hidden" />

            <div className="bg-orange-50 rounded-xl p-4 mb-5 border border-orange-100">
              <p className="font-semibold text-gray-900 text-sm">{bidModal.fromCity} ← {bidModal.toCity}</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {bidModal.weight} {tr("kg_suffix")} · {goodsLabel(bidModal.goodsType)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{tr("price_label")}</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                  placeholder={tr("price_placeholder")} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{tr("time_label")}</label>
                <select value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} className={inputClass}>
                  <option value="">{tr("select_time")}</option>
                  {timeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {tr("note_optional")} <span className="text-gray-400 font-normal">{tr("email_optional")}</span>
                </label>
                <textarea value={note} onChange={e => setNote(e.target.value)}
                  placeholder={tr("notes_placeholder")} rows={2}
                  className={`${inputClass} resize-none`} />
              </div>
            </div>

            {bidError && (
              <div className="mt-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                {bidError}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setBidModal(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                {tr("cancel_btn")}
              </button>
              <button onClick={submitBid} disabled={submitting || !price || !estimatedTime}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm">
                {submitting ? tr("sending") : tr("send_bid")}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
