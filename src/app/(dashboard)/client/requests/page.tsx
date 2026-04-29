"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Package, ChevronDown, ChevronUp, Phone, CheckCircle, AlertCircle, Star, XCircle, Trash2 } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { useLanguage } from "@/context/LanguageContext";

// Dynamically import LiveMap (Leaflet requires browser APIs — no SSR)
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-44 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center">
      <span className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

type Bid = {
  id: string; price: number; estimatedTime: string;
  note: string | null; status: string;
  transporter: { name: string; phone: string };
};
type Request = {
  id: string; fromCity: string; toCity: string;
  fromAddress: string; toAddress: string;
  goodsType: string; weight: number;
  description: string | null; status: string;
  createdAt: string; bids: Bid[];
  rating: { score: number } | null;
  fromLat: number | null; fromLng: number | null;
  toLat: number | null;   toLng: number | null;
};

const statusColors: Record<string, string> = {
  OPEN:       "bg-blue-100 text-blue-700",
  ACCEPTED:   "bg-green-100 text-green-700",
  IN_TRANSIT: "bg-orange-100 text-orange-700",
  DELIVERED:  "bg-gray-100 text-gray-600",
  CANCELLED:  "bg-red-100 text-red-600",
};

function StarRating({
  requestId, existingScore, onRated,
}: { requestId: string; existingScore: number | null; onRated: () => void }) {
  const { lang, tr } = useLanguage();
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(existingScore ?? 0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(!!existingScore);

  if (done) {
    return (
      <div className="flex items-center gap-1.5 mt-3">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-4 h-4 ${i <= selected ? "fill-orange-400 text-orange-400" : "text-gray-200"}`} />
        ))}
        <span className="text-xs text-gray-500 ms-1">{tr("rating_submitted")}</span>
      </div>
    );
  }

  async function submit() {
    if (!selected) return;
    setSubmitting(true);
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, score: selected, comment }),
    });
    setSubmitting(false);
    if (res.ok) { setDone(true); onRated(); }
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-600 mb-2">{tr("rate_transporter")}</p>
      <div className="flex items-center gap-1 mb-2">
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(i)}
            className="p-0.5"
          >
            <Star className={`w-7 h-7 transition-colors ${
              i <= (hovered || selected)
                ? "fill-orange-400 text-orange-400"
                : "text-gray-200 hover:text-orange-300"
            }`} />
          </button>
        ))}
      </div>
      {selected > 0 && (
        <>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={tr("rating_comment_placeholder")}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 mb-2"
          />
          <button
            onClick={submit}
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
          >
            {submitting
              ? <span className="flex items-center justify-center gap-1.5"><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /></span>
              : tr("submit_rating")
            }
          </button>
        </>
      )}
    </div>
  );
}

export default function RequestsPage() {
  const { lang, tr } = useLanguage();
  const [requests, setRequests]   = useState<Request[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [toast, setToast]         = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const statusDescLabel = (s: string) => {
    if (s === "OPEN")     return tr("status_open_waiting");
    if (s === "ACCEPTED") return tr("status_accepted_bid");
    return tr(`status_${s}` as Parameters<typeof tr>[0]);
  };

  async function load() {
    const res = await fetch("/api/requests");
    setRequests(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function cancelRequest(requestId: string) {
    if (!confirm(tr("cancel_confirm"))) return;
    setCancelling(requestId);
    try {
      const res = await fetch(`/api/requests/${requestId}`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) { showToast("success", tr("request_cancelled")); await load(); }
      else showToast("error", data.error || tr("error_occurred"));
    } catch { showToast("error", tr("error_occurred")); }
    finally { setCancelling(null); }
  }

  async function deleteRequest(requestId: string) {
    if (!confirm(tr("delete_confirm"))) return;
    setDeleting(requestId);
    try {
      const res = await fetch(`/api/requests/${requestId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) { showToast("success", tr("request_deleted")); await load(); setExpanded(null); }
      else showToast("error", data.error || tr("error_occurred"));
    } catch { showToast("error", tr("error_occurred")); }
    finally { setDeleting(null); }
  }

  async function acceptBid(bidId: string, requestId: string) {
    setAccepting(bidId);
    try {
      const res = await fetch("/api/bids/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId, requestId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || tr("error_occurred"));
      } else {
        showToast("success", lang === "ar" ? "✅ تم قبول العرض بنجاح!" : "✅ Offre acceptée avec succès !");
        await load();
        setExpanded(requestId);
      }
    } catch {
      showToast("error", tr("error_occurred"));
    } finally {
      setAccepting(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">

        {/* Toast notification */}
        {toast && (
          <div className={`fixed top-4 start-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium min-w-[260px] max-w-sm ${
            toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}>
            {toast.type === "success"
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />
            }
            {toast.msg}
          </div>
        )}

        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{tr("requests_title")}</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">{tr("loading")}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm">{tr("no_requests")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

                {/* Request header */}
                <div className="px-4 md:px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {req.fromCity} ← {req.toCity}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {req.weight} {tr("kg_suffix")} · {req.bids.length} {tr("bids_count")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full hidden sm:inline-flex ${statusColors[req.status]}`}>
                        {statusDescLabel(req.status)}
                      </span>
                      {expanded === req.id
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />
                      }
                    </div>
                  </div>
                  <div className="mt-2 sm:hidden">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[req.status]}`}>
                      {statusDescLabel(req.status)}
                    </span>
                  </div>
                </div>

                {/* Expanded panel */}
                {expanded === req.id && (
                  <div className="border-t border-gray-100 px-4 md:px-5 py-4">

                    {/* Route details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm mb-5">
                      <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                        <span className="text-gray-400 text-xs font-medium block mb-0.5">{tr("from_label")}</span>
                        <span className="text-gray-900 font-medium text-sm">{req.fromAddress}، {req.fromCity}</span>
                      </div>
                      <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                        <span className="text-gray-400 text-xs font-medium block mb-0.5">{tr("to_label")}</span>
                        <span className="text-gray-900 font-medium text-sm">{req.toAddress}، {req.toCity}</span>
                      </div>
                      {req.description && (
                        <div className="sm:col-span-2 bg-gray-50 rounded-xl px-3 py-2.5">
                          <span className="text-gray-400 text-xs font-medium block mb-0.5">{tr("note_label")}</span>
                          <span className="text-gray-700 text-sm">{req.description}</span>
                        </div>
                      )}
                    </div>

                    {/* Chat — for accepted/in-transit orders */}
                    {(req.status === "ACCEPTED" || req.status === "IN_TRANSIT") && (
                      <div className="mb-4">
                        <ChatPanel requestId={req.id} myRole="CLIENT" />
                      </div>
                    )}

                    {/* Live map — only when transporter is in transit */}
                    {req.status === "IN_TRANSIT" && (
                      <div className="mb-5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                          {lang === "ar" ? "تتبع الناقل على الخريطة" : "Suivre le transporteur sur la carte"}
                        </p>
                        <LiveMap
                          requestId={req.id}
                          fromLat={req.fromLat}
                          fromLng={req.fromLng}
                          toLat={req.toLat}
                          toLng={req.toLng}
                        />
                      </div>
                    )}

                    {/* Cancel / Delete actions */}
                    {(req.status === "OPEN" || req.status === "CANCELLED") && (
                      <div className="flex gap-2 mb-5">
                        {req.status === "OPEN" && (
                          <button
                            onClick={() => cancelRequest(req.id)}
                            disabled={cancelling === req.id}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
                          >
                            {cancelling === req.id
                              ? <span className="w-3 h-3 border-2 border-orange-400/40 border-t-orange-500 rounded-full animate-spin" />
                              : <XCircle className="w-3.5 h-3.5" />
                            }
                            {tr("cancel_request")}
                          </button>
                        )}
                        <button
                          onClick={() => deleteRequest(req.id)}
                          disabled={deleting === req.id}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deleting === req.id
                            ? <span className="w-3 h-3 border-2 border-red-400/40 border-t-red-500 rounded-full animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                          {tr("delete_request")}
                        </button>
                      </div>
                    )}

                    {/* Bids */}
                    {req.bids.length === 0 ? (
                      <div className="text-center py-5 text-gray-400 text-sm bg-gray-50 rounded-xl">
                        {tr("waiting_bids")}
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                          {tr("bids_received")} ({req.bids.length})
                        </h3>
                        <div className="space-y-2.5">
                          {req.bids.map((bid) => {
                            const isAccepted = bid.status === "ACCEPTED";
                            return (
                              <div key={bid.id} className={`rounded-xl border transition-all ${
                                isAccepted ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"
                              }`}>
                                {isAccepted && (
                                  <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500 rounded-t-xl">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                    <span className="text-white font-semibold text-sm">
                                      {lang === "ar" ? "تم قبول هذا العرض" : "Offre acceptée"}
                                    </span>
                                  </div>
                                )}

                                <div className="p-3 md:p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold text-gray-900 text-sm">{bid.transporter.name}</p>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {bid.estimatedTime}
                                        {bid.note ? ` — ${bid.note}` : ""}
                                      </p>

                                      <a href={`tel:${bid.transporter.phone}`}
                                        className={`inline-flex items-center gap-1.5 text-xs font-medium mt-2 px-3 py-1.5 rounded-lg transition-colors ${
                                          isAccepted
                                            ? "bg-green-500 text-white hover:bg-green-600"
                                            : "text-gray-400 hover:text-orange-500"
                                        }`}>
                                        <Phone className="w-3 h-3" />
                                        {bid.transporter.phone}
                                      </a>

                                      {/* Star rating — only for DELIVERED + accepted bid */}
                                      {req.status === "DELIVERED" && isAccepted && (
                                        <StarRating
                                          requestId={req.id}
                                          existingScore={req.rating?.score ?? null}
                                          onRated={load}
                                        />
                                      )}
                                    </div>

                                    <div className="text-end shrink-0">
                                      <p className="text-lg font-bold text-orange-500">
                                        {bid.price.toLocaleString()} {tr("dz_suffix")}
                                      </p>
                                      <div className="mt-2">
                                        {req.status === "OPEN" && bid.status === "PENDING" && (
                                          <button
                                            onClick={() => acceptBid(bid.id, req.id)}
                                            disabled={accepting === bid.id}
                                            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:bg-orange-300 shadow-sm min-w-[80px]"
                                          >
                                            {accepting === bid.id
                                              ? <span className="flex items-center justify-center gap-1.5">
                                                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                </span>
                                              : tr("accept_btn")
                                            }
                                          </button>
                                        )}
                                        {isAccepted && req.status !== "OPEN" && (
                                          <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl inline-block">
                                            {tr("accepted_badge")}
                                          </span>
                                        )}
                                        {bid.status === "REJECTED" && (
                                          <span className="text-gray-400 text-xs">
                                            {lang === "ar" ? "مرفوض" : "Refusé"}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
