"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Package, ChevronDown, ChevronUp, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Bid = {
  id: string;
  price: number;
  estimatedTime: string;
  note: string | null;
  status: string;
  transporter: { name: string; phone: string };
};

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
  bids: Bid[];
};

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-green-100 text-green-700",
  IN_TRANSIT: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
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
    const key = `status_${s}` as Parameters<typeof tr>[0];
    return tr(key);
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
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{tr("requests_title")}</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-400">{tr("loading")}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">{tr("no_requests")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {req.fromCity} ← {req.toCity}
                        </div>
                        <div className="text-sm text-gray-400 mt-0.5">
                          {req.weight} {tr("kg_suffix")} • {req.bids.length} {tr("bids_count")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[req.status]}`}>
                        {statusDescLabel(req.status)}
                      </span>
                      {expanded === req.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expanded === req.id && (
                  <div className="border-t border-gray-100 p-5">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                      <div><span className="text-gray-400">{tr("from_label")}</span> {req.fromAddress}، {req.fromCity}</div>
                      <div><span className="text-gray-400">{tr("to_label")}</span> {req.toAddress}، {req.toCity}</div>
                      {req.description && (
                        <div className="col-span-2"><span className="text-gray-400">{tr("note_label")}</span> {req.description}</div>
                      )}
                    </div>

                    {req.bids.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-xl">
                        {tr("waiting_bids")}
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          {tr("bids_received")} ({req.bids.length})
                        </h3>
                        <div className="space-y-3">
                          {req.bids.map((bid) => (
                            <div
                              key={bid.id}
                              className={`rounded-xl p-4 border ${
                                bid.status === "ACCEPTED"
                                  ? "border-green-300 bg-green-50"
                                  : "border-gray-100 bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-gray-900">{bid.transporter.name}</div>
                                  <div className="text-sm text-gray-500 mt-0.5">
                                    {bid.estimatedTime} — {bid.note || tr("no_notes")}
                                  </div>
                                </div>
                                <div className="text-left">
                                  <div className="text-xl font-bold text-orange-500">
                                    {bid.price.toLocaleString()} {tr("dz_suffix")}
                                  </div>
                                  <div className="flex items-center gap-2 mt-2 justify-end">
                                    <a
                                      href={`tel:${bid.transporter.phone}`}
                                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                                    >
                                      <Phone className="w-3 h-3" />
                                      {bid.transporter.phone}
                                    </a>
                                    {req.status === "OPEN" && bid.status === "PENDING" && (
                                      <button
                                        onClick={() => acceptBid(bid.id, req.id)}
                                        disabled={accepting === bid.id}
                                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:bg-orange-300"
                                      >
                                        {accepting === bid.id ? "..." : tr("accept_btn")}
                                      </button>
                                    )}
                                    {bid.status === "ACCEPTED" && (
                                      <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                                        {tr("accepted_badge")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
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
