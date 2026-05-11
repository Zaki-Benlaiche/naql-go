"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  BadgeCheck, Phone, Mail, MapPin, Truck, Calendar,
  CheckCircle, XCircle, X, Inbox, Loader2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Doc = {
  id: string;
  type: string;
  fileData: string; // public Blob URL (or base64 if pre-Blob era)
  status: string;
  createdAt: string;
};

type Pending = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  wilaya: string | null;
  vehicleType: string | null;
  vehicleColor: string | null;
  isLivreur: boolean;
  isFrodeur: boolean;
  isTransporteur: boolean;
  createdAt: string;
  documents: Doc[];
};

const DOC_LABELS: Record<string, { ar: string; fr: string; icon: string }> = {
  license:     { ar: "رخصة السياقة",   fr: "Permis de conduire",    icon: "🪪" },
  vehicle_reg: { ar: "بطاقة الرمادية", fr: "Carte grise",            icon: "📋" },
  insurance:   { ar: "التأمين",        fr: "Assurance",              icon: "🛡️" },
  other:       { ar: "وثيقة أخرى",     fr: "Autre document",         icon: "📄" },
};

export default function KycPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [items, setItems] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<Pending | null>(null);
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/kyc");
    if (res.ok) {
      const data = await res.json();
      setItems(data.pending);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function approve(id: string) {
    setBusy(id);
    const res = await fetch(`/api/admin/kyc/${id}`, {
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
    const res = await fetch(`/api/admin/kyc/${rejecting.id}`, {
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

  function services(p: Pending) {
    const tags = [];
    if (p.isLivreur)      tags.push(ar ? "موصِّل"   : "Livreur");
    if (p.isFrodeur)      tags.push(ar ? "تاكسي"   : "Taxi");
    if (p.isTransporteur) tags.push(ar ? "نقل"      : "Transport");
    return tags.length ? tags.join(" · ") : "—";
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
          <BadgeCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {ar ? "طلبات موافقة السائقين" : "Validation des chauffeurs"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {ar
              ? "راجع الوثائق ووافق على السائقين قبل أن يبدأوا العمل"
              : "Examinez les pièces et approuvez chaque chauffeur avant qu'il puisse opérer."}
          </p>
        </div>
        <span className="ms-auto px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
          {items.length} {ar ? "في الانتظار" : "en attente"}
        </span>
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
            {ar ? "لا توجد طلبات قيد المراجعة" : "Aucune demande en attente"}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {items.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {p.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-slate-800 truncate">{p.name}</h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {p.phone}</span>
                    {p.email && <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /> {p.email}</span>}
                    {p.wilaya && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.wilaya}</span>}
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(p.createdAt).toLocaleDateString(ar ? "ar-DZ" : "fr-DZ")}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
                    {(p.vehicleType || p.vehicleColor) && (
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <Truck className="w-3 h-3" />
                        {[p.vehicleType, p.vehicleColor].filter(Boolean).join(" · ")}
                      </span>
                    )}
                    <span className="text-orange-600 font-medium">{services(p)}</span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => approve(p.id)}
                    disabled={busy === p.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {ar ? "موافقة" : "Approuver"}
                  </button>
                  <button
                    onClick={() => { setRejecting(p); setReason(""); }}
                    disabled={busy === p.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    {ar ? "رفض" : "Refuser"}
                  </button>
                </div>
              </div>

              {p.documents.length === 0 ? (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  ⚠️ {ar ? "لم يرفع السائق أي وثيقة بعد" : "Aucun document soumis"}
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {p.documents.map(d => {
                    const lbl = DOC_LABELS[d.type] || DOC_LABELS.other;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setPreview(d.fileData)}
                        className="group relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 hover:border-orange-400 transition-colors bg-slate-50"
                      >
                        {d.fileData.startsWith("http") ? (
                          <Image
                            src={d.fileData}
                            alt={lbl[ar ? "ar" : "fr"]}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          /* legacy base64 — render as <img> since next/image rejects data URLs */
                          <img
                            src={d.fileData}
                            alt={lbl[ar ? "ar" : "fr"]}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
                          <p className="text-xs font-semibold flex items-center gap-1">
                            <span>{lbl.icon}</span>
                            <span className="truncate">{lbl[ar ? "ar" : "fr"]}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
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
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{ar ? "رفض السائق" : "Refuser le chauffeur"}</h3>
                <p className="text-xs text-slate-500">{rejecting.name}</p>
              </div>
              <button onClick={() => setRejecting(null)} className="ms-auto p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {ar ? "سبب الرفض" : "Motif du refus"}
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={4}
              placeholder={ar ? "مثلاً: الوثائق غير واضحة، رخصة منتهية…" : "Ex : pièces illisibles, permis expiré…"}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-400 focus:outline-none text-sm resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              {ar ? "سيُعرض السبب على السائق ليصحح وثائقه." : "Le motif sera communiqué au chauffeur."}
            </p>

            <div className="flex gap-2 mt-5">
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
                {ar ? "تأكيد الرفض" : "Confirmer le refus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document preview */}
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
            alt="document"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
