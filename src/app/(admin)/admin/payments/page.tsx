"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Banknote, Phone, MapPin, Clock, CheckCircle2, XCircle, X,
  Inbox, Loader2, ExternalLink, Filter,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Payment = {
  id: string;
  amount: number;
  status: "PENDING_PROOF" | "UNDER_REVIEW" | "PAID" | "REJECTED";
  periodYear: number;
  periodMonth: number;
  periodLabel: string;
  overdue: boolean;
  proofUrl: string | null;
  transactionRef: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  paidAt: string | null;
  transporter: { id: string; name: string; phone: string; wilaya: string | null };
};

const STATUS_FILTERS = [
  { value: "UNDER_REVIEW",  ar: "بانتظار التحقق",  fr: "À vérifier" },
  { value: "PENDING_PROOF", ar: "بانتظار الدفع",   fr: "Non payé"   },
  { value: "REJECTED",      ar: "مرفوض",           fr: "Refusé"     },
  { value: "PAID",          ar: "مدفوع",           fr: "Payé"       },
  { value: "",              ar: "الكل",            fr: "Tout"       },
];

function fmt(n: number) { return Math.round(n).toLocaleString("fr-DZ"); }

export default function AdminPaymentsPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("UNDER_REVIEW");
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<Payment | null>(null);
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const url = filter ? `/api/admin/payments?status=${filter}` : "/api/admin/payments";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setItems(data.payments);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function approve(id: string) {
    setBusy(id);
    const res = await fetch(`/api/admin/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    setBusy(null);
    if (res.ok) await load();
  }

  async function confirmReject() {
    if (!rejecting || !reason.trim()) return;
    setBusy(rejecting.id);
    const res = await fetch(`/api/admin/payments/${rejecting.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason: reason.trim() }),
    });
    setBusy(null);
    if (res.ok) {
      setRejecting(null);
      setReason("");
      await load();
    }
  }

  const dz = ar ? "دج" : "DA";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
          <Banknote className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {ar ? "تحقق الدفعات" : "Vérification des paiements"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {ar
              ? "راجع إثباتات تحويل العمولة من السائقين"
              : "Vérifiez les preuves de virement des commissions."}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value || "all"}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              filter === f.value
                ? "bg-orange-500 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-orange-300"
            }`}
          >
            <Filter className="w-3 h-3 inline -mt-0.5 me-1" />
            {ar ? f.ar : f.fr}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          {ar ? "جاري التحميل…" : "Chargement…"}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">
            {ar ? "لا توجد دفعات في هذه الحالة" : "Aucun paiement dans ce statut"}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {p.transporter.name[0]?.toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h2 className="font-bold text-slate-900">{p.transporter.name}</h2>
                  {p.overdue && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      {ar ? "متأخر" : "EN RETARD"}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {p.transporter.phone}</span>
                  {p.transporter.wilaya && (
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.transporter.wilaya}</span>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">{ar ? "الفترة" : "Période"}</p>
                    <p className="font-bold text-slate-800 text-sm">{p.periodLabel}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">{ar ? "المبلغ" : "Montant"}</p>
                    <p className="font-bold text-orange-600 text-sm">{fmt(p.amount)} {dz}</p>
                  </div>
                  {p.transactionRef && (
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">{ar ? "رقم العملية" : "Référence"}</p>
                      <p className="font-mono text-xs text-slate-700">{p.transactionRef}</p>
                    </div>
                  )}
                  {p.submittedAt && (
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">{ar ? "أُرسل في" : "Soumis"}</p>
                      <p className="text-xs text-slate-700">{new Date(p.submittedAt).toLocaleDateString(ar ? "ar-DZ" : "fr-DZ")}</p>
                    </div>
                  )}
                </div>

                {p.rejectionReason && (
                  <div className="mt-2 text-xs px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700">
                    <strong>{ar ? "سبب الرفض:" : "Refus :"}</strong> {p.rejectionReason}
                  </div>
                )}
              </div>

              <div className="flex gap-2 shrink-0 flex-wrap">
                {p.proofUrl && (
                  <button
                    onClick={() => setPreview(p.proofUrl)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {ar ? "عرض الإثبات" : "Voir preuve"}
                  </button>
                )}
                {p.status === "UNDER_REVIEW" && (
                  <>
                    <button
                      onClick={() => approve(p.id)}
                      disabled={busy === p.id}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {ar ? "تأكيد" : "Approuver"}
                    </button>
                    <button
                      onClick={() => { setRejecting(p); setReason(""); }}
                      disabled={busy === p.id}
                      className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      {ar ? "رفض" : "Refuser"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reject modal */}
      {rejecting && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{ar ? "رفض الدفعة" : "Refuser le paiement"}</h3>
                <p className="text-xs text-slate-500">{rejecting.transporter.name} · {rejecting.periodLabel}</p>
              </div>
              <button onClick={() => setRejecting(null)} className="ms-auto p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={4}
              placeholder={ar ? "مثلاً: رقم العملية خاطئ، الصورة غير واضحة…" : "Ex : numéro incorrect, image illisible…"}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-none text-sm resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setRejecting(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
              >
                {ar ? "إلغاء" : "Annuler"}
              </button>
              <button
                onClick={confirmReject}
                disabled={!reason.trim() || busy === rejecting.id}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {ar ? "تأكيد الرفض" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof preview */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="proof"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
