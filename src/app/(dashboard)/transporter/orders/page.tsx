"use client";
import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Package, Phone, Truck, CheckCircle, MapPin, Camera, Zap } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { GpsShareButton } from "@/components/GpsShare";
import { useLanguage } from "@/context/LanguageContext";
import { TranslationKey } from "@/lib/translations";

type Order = {
  id: string;
  fromCity: string; toCity: string;
  fromAddress: string; toAddress: string;
  goodsType: string; weight: number;
  status: string; updatedAt: string;
  proofOfDelivery: string | null;
  transportType: string;
  assignedTransporterId: string | null;
  client: { name: string; phone: string };
  bids: { price: number; estimatedTime: string; note: string | null }[];
};

const statusConfig: Record<string, { color: string; bg: string }> = {
  OPEN:       { color: "text-purple-700",  bg: "bg-purple-50"  },
  ACCEPTED:   { color: "text-blue-700",    bg: "bg-blue-50"    },
  IN_TRANSIT: { color: "text-orange-700",  bg: "bg-orange-50"  },
  DELIVERED:  { color: "text-green-700",   bg: "bg-green-50"   },
};

function compressImage(file: File, maxWidth = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TransporterOrdersPage() {
  const { lang, tr } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [proofTarget, setProofTarget] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/orders");
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function updateStatus(orderId: string, status: "ACCEPTED" | "IN_TRANSIT" | "DELIVERED") {
    setUpdating(orderId + status);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    if (res.ok) {
      const msgs: Record<string, string> = {
        ACCEPTED:   lang === "ar" ? "✅ تم قبول الطلب"           : "✅ Demande acceptée",
        IN_TRANSIT: lang === "ar" ? "✅ تم تحديث الحالة: في الطريق" : "✅ En route",
        DELIVERED:  lang === "ar" ? "✅ تم تحديث الحالة: تم التسليم" : "✅ Livraison confirmée",
      };
      showToast(msgs[status]);
      await load();
    }
  }

  async function handleProofUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !proofTarget) return;
    setUploading(proofTarget);
    try {
      const base64 = await compressImage(file);
      const res = await fetch(`/api/orders/${proofTarget}/proof`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof: base64 }),
      });
      if (res.ok) {
        showToast(tr("proof_uploaded"));
        await load();
      }
    } finally {
      setUploading(null);
      setProofTarget(null);
      e.target.value = "";
    }
  }

  const statusLabel = (s: string) => {
    if (s === "OPEN")       return lang === "ar" ? "⏳ في انتظار قبولك" : "⏳ En attente";
    if (s === "ACCEPTED")   return lang === "ar" ? "مقبول — في الانتظار" : "Accepté — En attente";
    if (s === "IN_TRANSIT") return lang === "ar" ? "🚚 في الطريق"        : "🚚 En route";
    if (s === "DELIVERED")  return lang === "ar" ? "✅ تم التسليم"       : "✅ Livré";
    return s;
  };

  const pendingDirect = orders.filter(o => o.status === "OPEN" && o.transportType === "INTRA");
  const activeOrders  = orders.filter(o => o.status !== "OPEN");

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleProofUpload}
        />

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 start-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
            {toast}
          </div>
        )}

        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{tr("my_orders")}</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">{tr("loading")}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">{tr("no_orders")}</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Pending direct requests ── */}
            {pendingDirect.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <h2 className="text-sm font-bold text-purple-700">{tr("pending_direct_title")}</h2>
                  <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingDirect.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {pendingDirect.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      lang={lang}
                      tr={tr}
                      statusLabel={statusLabel}
                      updating={updating}
                      uploading={uploading}
                      fileInputRef={fileInputRef}
                      setProofTarget={setProofTarget}
                      updateStatus={updateStatus}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Active & completed orders ── */}
            {activeOrders.length > 0 && (
              <div className="space-y-4">
                {pendingDirect.length > 0 && (
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                    {lang === "ar" ? "الطلبات النشطة" : "Commandes actives"}
                  </h2>
                )}
                {activeOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    lang={lang}
                    tr={tr}
                    statusLabel={statusLabel}
                    updating={updating}
                    uploading={uploading}
                    fileInputRef={fileInputRef}
                    setProofTarget={setProofTarget}
                    updateStatus={updateStatus}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

type OrderCardProps = {
  order: Order;
  lang: string;
  tr: (key: TranslationKey) => string;
  statusLabel: (s: string) => string;
  updating: string | null;
  uploading: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setProofTarget: (id: string) => void;
  updateStatus: (id: string, status: "ACCEPTED" | "IN_TRANSIT" | "DELIVERED") => void;
};

function OrderCard({ order, lang, tr, statusLabel, updating, uploading, fileInputRef, setProofTarget, updateStatus }: OrderCardProps) {
  const bid = order.bids[0];
  const cfg = statusConfig[order.status] ?? { color: "text-gray-600", bg: "bg-gray-50" };
  const isOpen      = order.status === "OPEN";
  const isDelivered = order.status === "DELIVERED";
  const isInTransit = order.status === "IN_TRANSIT";
  const isAccepted  = order.status === "ACCEPTED";
  const isDirect    = order.transportType === "INTRA";

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isOpen ? "border-purple-200 shadow-purple-100" : "border-gray-100"}`}>

      {/* Status bar */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${cfg.bg}`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${cfg.color}`}>
            {statusLabel(order.status)}
          </span>
          {isDirect && (
            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              {tr("intra_badge")}
            </span>
          )}
        </div>
        {bid && (
          <span className="text-orange-600 font-bold text-sm">
            {bid.price.toLocaleString()} {tr("dz_suffix")}
          </span>
        )}
      </div>

      <div className="p-4 md:p-5">
        {/* Route */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{order.fromCity} → {order.toCity}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {order.weight} {tr("kg_suffix")}
              {bid?.estimatedTime ? ` · ${bid.estimatedTime}` : ""}
            </p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 rounded-xl px-3 py-2.5">
            <p className="text-xs text-gray-400 font-medium mb-0.5">{tr("from_label")}</p>
            <p className="text-sm text-gray-900 font-medium">{order.fromAddress}، {order.fromCity}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-3 py-2.5">
            <p className="text-xs text-gray-400 font-medium mb-0.5">{tr("to_label")}</p>
            <p className="text-sm text-gray-900 font-medium">{order.toAddress}، {order.toCity}</p>
          </div>
        </div>

        {/* Client contact */}
        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
          <div>
            <p className="text-xs text-blue-500 font-medium mb-0.5">{tr("call_client")}</p>
            <p className="font-semibold text-gray-900 text-sm">{order.client.name}</p>
          </div>
          <a
            href={`tel:${order.client.phone}`}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <Phone className="w-4 h-4" />
            {order.client.phone}
          </a>
        </div>

        {/* Chat + GPS — for active (non-open, non-delivered) orders */}
        {!isOpen && !isDelivered && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <ChatPanel requestId={order.id} myRole="TRANSPORTER" />
            {isInTransit && <GpsShareButton requestId={order.id} />}
          </div>
        )}

        {/* Action buttons */}
        {isOpen ? (
          /* Direct INTRA pending accept */
          <button
            onClick={() => updateStatus(order.id, "ACCEPTED")}
            disabled={updating === order.id + "ACCEPTED"}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-sm shadow-purple-200"
          >
            {updating === order.id + "ACCEPTED"
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><CheckCircle className="w-4 h-4" /> {tr("accept_request")}</>
            }
          </button>
        ) : isDelivered ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
              <CheckCircle className="w-5 h-5" />
              {tr("order_delivered")}
            </div>
            {order.proofOfDelivery ? (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">{tr("proof_of_delivery")}</p>
                <img
                  src={order.proofOfDelivery}
                  alt="proof"
                  className="w-full max-h-48 object-cover rounded-xl border border-gray-100"
                />
              </div>
            ) : (
              <button
                onClick={() => { setProofTarget(order.id); fileInputRef.current?.click(); }}
                disabled={uploading === order.id}
                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium text-sm px-4 py-2.5 rounded-xl transition-colors w-full justify-center"
              >
                {uploading === order.id
                  ? <span className="w-4 h-4 border-2 border-gray-400/40 border-t-gray-600 rounded-full animate-spin" />
                  : <><Camera className="w-4 h-4" /> {tr("upload_proof")}</>
                }
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-3">
            {isAccepted && (
              <button
                onClick={() => updateStatus(order.id, "IN_TRANSIT")}
                disabled={updating === order.id + "IN_TRANSIT"}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm"
              >
                {updating === order.id + "IN_TRANSIT"
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <><MapPin className="w-4 h-4" /> {tr("start_trip")}</>
                }
              </button>
            )}
            {isInTransit && (
              <button
                onClick={() => updateStatus(order.id, "DELIVERED")}
                disabled={updating === order.id + "DELIVERED"}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm"
              >
                {updating === order.id + "DELIVERED"
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <><CheckCircle className="w-4 h-4" /> {tr("mark_delivered")}</>
                }
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
