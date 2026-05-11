"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Banknote, Copy, AlertTriangle, Clock, CheckCircle2, XCircle, Upload,
  X, FileImage, Loader2, ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Payment = {
  id: string;
  amount: number;
  status: "PENDING_PROOF" | "UNDER_REVIEW" | "PAID" | "REJECTED";
  periodYear: number;
  periodMonth: number;
  periodLabel: string;
  proofUrl: string | null;
  transactionRef: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  paidAt: string | null;
  overdue: boolean;
};

type Data = {
  bank: { rip: string; accountName: string; baridiMobNote: string };
  minPayment: number;
  totalDue: number;
  hasOverdue: boolean;
  payments: Payment[];
};

function fmt(n: number) { return Math.round(n).toLocaleString("fr-DZ"); }

function compressImage(file: File, maxWidth = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const c = document.createElement("canvas");
        c.width = img.width * scale; c.height = img.height * scale;
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CommissionPayments() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<Payment | null>(null);
  const [proofData, setProofData] = useState<string | null>(null);
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/transporter/payments");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function copyRip() {
    if (!data) return;
    navigator.clipboard.writeText(data.bank.rip);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 1500);
  }

  function openSubmit(p: Payment) {
    setPaying(p);
    setProofData(null);
    setRef("");
    setErr(null);
  }

  async function pickProof(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const compressed = await compressImage(f);
      setProofData(compressed);
    } catch {
      setErr(ar ? "تعذّر تحميل الصورة" : "Échec de l'image");
    }
  }

  async function submit() {
    if (!paying || !proofData || !ref.trim()) return;
    setBusy(true); setErr(null);
    try {
      const res = await fetch(`/api/transporter/payments/${paying.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof: proofData, transactionRef: ref.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(json.error || "فشل الإرسال"); setBusy(false); return; }
      setPaying(null);
      await load();
    } catch {
      setErr(ar ? "خطأ في الاتصال" : "Erreur réseau");
    } finally { setBusy(false); }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }
  if (!data) return null;

  const unpaid = data.payments.filter(p => p.status !== "PAID");
  const paid = data.payments.filter(p => p.status === "PAID");
  const dz = ar ? "دج" : "DA";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
          <Banknote className="w-4 h-4 text-orange-500" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-slate-900 text-sm">
            {ar ? "دفع عمولة المنصة" : "Règlement de la commission"}
          </h2>
          <p className="text-xs text-slate-400">
            {ar ? "حوّل العمولة شهرياً عبر BaridiMob / CCP" : "Versement mensuel via BaridiMob / CCP"}
          </p>
        </div>
      </div>

      {/* Bank info card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4">
        <p className="text-xs text-slate-300 mb-1">
          {ar ? "حسابنا (CCP)" : "Notre compte CCP"}
        </p>
        <div className="flex items-center gap-2">
          <code dir="ltr" className="text-base font-mono font-bold flex-1 tracking-wide">
            {data.bank.rip}
          </code>
          <button
            onClick={copyRip}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            {copyToast ? (ar ? "نُسخ ✓" : "Copié ✓") : (ar ? "نسخ" : "Copier")}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2.5">
          {ar ? "الإسم: " : "Au nom de : "} <strong className="text-white">{data.bank.accountName}</strong>
        </p>
        <p className="text-xs text-slate-400 mt-1">{ar ? data.bank.baridiMobNote : "BaridiMob accepte le même numéro"}</p>
      </div>

      {/* Total due banner */}
      {data.totalDue > 0 && (
        <div className={`rounded-2xl p-4 border ${
          data.hasOverdue ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
              data.hasOverdue ? "text-red-600" : "text-amber-600"
            }`} />
            <div>
              <p className={`font-bold text-sm ${data.hasOverdue ? "text-red-900" : "text-amber-900"}`}>
                {ar
                  ? `إجمالي مستحق: ${fmt(data.totalDue)} ${dz}`
                  : `Total dû : ${fmt(data.totalDue)} ${dz}`}
              </p>
              {data.hasOverdue && (
                <p className="text-xs text-red-700 mt-1">
                  {ar
                    ? "⛔ لديك دفعات متأخرة. لن تتمكن من تفعيل online حتى التسوية."
                    : "⛔ Vous avez des paiements en retard. Impossible de passer en ligne tant que ce n'est pas réglé."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unpaid list */}
      {unpaid.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">
            {ar ? "مستحقات بانتظار التسوية" : "À régler"}
          </h3>
          <div className="space-y-2">
            {unpaid.map(p => (
              <PaymentRow key={p.id} payment={p} ar={ar} onAction={() => openSubmit(p)} />
            ))}
          </div>
        </div>
      )}

      {/* Paid history (collapsed) */}
      {paid.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">
            {ar ? `سجل الدفعات السابقة (${paid.length})` : `Historique (${paid.length})`}
          </summary>
          <div className="space-y-2 mt-2">
            {paid.map(p => (
              <PaymentRow key={p.id} payment={p} ar={ar} />
            ))}
          </div>
        </details>
      )}

      {data.payments.length === 0 && (
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
          <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">
            {ar
              ? `لا توجد مستحقات حالياً (الحد الأدنى ${fmt(data.minPayment)} ${dz})`
              : `Aucune commission due (seuil ${fmt(data.minPayment)} ${dz})`}
          </p>
        </div>
      )}

      {/* Submit modal */}
      {paying && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                <Upload className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">
                  {ar ? "تأكيد دفع العمولة" : "Confirmer le paiement"}
                </h3>
                <p className="text-xs text-slate-500">
                  {paying.periodLabel} · <strong>{fmt(paying.amount)} {dz}</strong>
                </p>
              </div>
              <button onClick={() => setPaying(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {paying.rejectionReason && (
              <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                <strong>{ar ? "سبب الرفض السابق:" : "Refus précédent :"}</strong> {paying.rejectionReason}
              </div>
            )}

            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {ar ? "صورة التحويل" : "Capture du transfert"} <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={pickProof}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 hover:border-orange-400 rounded-xl py-4 px-3 flex flex-col items-center gap-1 transition-colors mb-3"
            >
              {proofData ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={proofData} alt="proof" className="max-h-40 rounded-lg" />
              ) : (
                <>
                  <FileImage className="w-6 h-6 text-slate-400" />
                  <span className="text-xs text-slate-500">
                    {ar ? "اضغط لاختيار صورة" : "Choisir une image"}
                  </span>
                </>
              )}
            </button>

            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {ar ? "رقم العملية / Référence" : "Numéro de référence"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={ref}
              onChange={e => setRef(e.target.value)}
              placeholder={ar ? "مثلاً: 12345678" : "Ex : 12345678"}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-orange-400 focus:outline-none text-sm"
            />

            {err && (
              <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>
            )}

            <button
              onClick={submit}
              disabled={!proofData || !ref.trim() || busy}
              className="w-full mt-4 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {ar ? "إرسال للتحقق" : "Envoyer pour vérification"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentRow({ payment, ar, onAction }: { payment: Payment; ar: boolean; onAction?: () => void }) {
  const dz = ar ? "دج" : "DA";
  const cfg: Record<Payment["status"], { label: string; color: string; bg: string; icon: typeof Clock }> = {
    PENDING_PROOF: { label: ar ? "بانتظار الدفع" : "À régler",       color: "text-amber-700",  bg: "bg-amber-50 border-amber-200",  icon: Clock },
    UNDER_REVIEW:  { label: ar ? "قيد التحقق"   : "En vérif.",       color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",    icon: Clock },
    PAID:          { label: ar ? "مدفوع"        : "Payé",            color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
    REJECTED:      { label: ar ? "مرفوض"        : "Refusé",          color: "text-red-700",    bg: "bg-red-50 border-red-200",      icon: XCircle },
  };
  const c = cfg[payment.status];
  const Icon = c.icon;
  const clickable = payment.status === "PENDING_PROOF" || payment.status === "REJECTED";

  const body = (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
        <Icon className={`w-4 h-4 ${c.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 text-sm truncate">{payment.periodLabel}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${c.bg} ${c.color}`}>
            {c.label}
          </span>
          {payment.overdue && (
            <span className="ms-2 text-red-600 font-bold">⛔ {ar ? "متأخر" : "En retard"}</span>
          )}
        </p>
      </div>
      <div className="text-end shrink-0">
        <p className="font-bold text-slate-900 text-sm">{Math.round(payment.amount).toLocaleString("fr-DZ")} {dz}</p>
      </div>
      {clickable && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
    </div>
  );

  if (clickable && onAction) {
    return (
      <button onClick={onAction} className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm text-start hover:border-orange-300 transition-colors">
        {body}
      </button>
    );
  }
  return <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">{body}</div>;
}
