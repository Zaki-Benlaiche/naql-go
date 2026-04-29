"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Package, ChevronDown, ChevronUp, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

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
};

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-green-100 text-green-700",
  IN_TRANSIT: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
};

export default function RequestsPage() {
  const { tr } = useLanguage();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);

  const statusDescLabel = (s: string) => {
    if (s === "OPEN") return tr("status_open_waiting");
    if (s === "ACCEPTED") return tr("status_accepted_bid");
    return tr(`status_${s}` as Parameters<typeof tr>[0]);
  };

  async function load() {
    const res = await fetch("/api/requests");
    setRequests(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function acceptBid(bidId: string, requestId: string) {
    setAccepting(bidId);
    await fetch("/api/bids/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bidId, requestId }),
    });
    setAccepting(null);
    load();
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
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
                {/* Request header row */}
                <div
                  className="px-4 md:px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                >
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
                  {/* Status badge visible on mobile below */}
                  <div className="mt-2 sm:hidden">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[req.status]}`}>
                      {statusDescLabel(req.status)}
                    </span>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded === req.id && (
                  <div className="border-t border-gray-100 px-4 md:px-5 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-5">
                      <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                        <span className="text-gray-400 text-xs font-medium block mb-0.5">{tr("from_label")}</span>
                        <span className="text-gray-900 font-medium">{req.fromAddress}، {req.fromCity}</span>
                      </div>
                      <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                        <span className="text-gray-400 text-xs font-medium block mb-0.5">{tr("to_label")}</span>
                        <span className="text-gray-900 font-medium">{req.toAddress}، {req.toCity}</span>
                      </div>
                      {req.description && (
                        <div className="sm:col-span-2 bg-gray-50 rounded-xl px-3 py-2.5">
                          <span className="text-gray-400 text-xs font-medium block mb-0.5">{tr("note_label")}</span>
                          <span className="text-gray-700">{req.description}</span>
                        </div>
                      )}
                    </div>

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
                          {req.bids.map((bid) => (
                            <div key={bid.id}
                              className={`rounded-xl p-3 md:p-4 border ${
                                bid.status === "ACCEPTED"
                                  ? "border-green-200 bg-green-50"
                                  : "border-gray-100 bg-gray-50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm">{bid.transporter.name}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {bid.estimatedTime} — {bid.note || tr("no_notes")}
                                  </p>
                                  <a href={`tel:${bid.transporter.phone}`}
                                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 mt-1 transition-colors">
                                    <Phone className="w-3 h-3" />
                                    {bid.transporter.phone}
                                  </a>
                                </div>
                                <div className="text-end shrink-0">
                                  <p className="text-lg font-bold text-orange-500">
                                    {bid.price.toLocaleString()} {tr("dz_suffix")}
                                  </p>
                                  <div className="mt-1.5">
                                    {req.status === "OPEN" && bid.status === "PENDING" && (
                                      <button onClick={() => acceptBid(bid.id, req.id)} disabled={accepting === bid.id}
                                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:bg-orange-300">
                                        {accepting === bid.id ? "..." : tr("accept_btn")}
                                      </button>
                                    )}
                                    {bid.status === "ACCEPTED" && (
                                      <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg inline-block">
                                        {tr("accepted_badge")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
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
