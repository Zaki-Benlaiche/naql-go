"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useLanguage } from "@/context/LanguageContext";
import { WILAYAS, VEHICLE_TYPES } from "@/lib/constants";
import {
  ArrowRight, ArrowLeft, MapPin, Star,
  CheckCircle, ChevronDown, WifiOff, RefreshCw, Truck,
} from "lucide-react";

const GOODS_TYPES = [
  { value: "furniture",         labelAr: "أثاث",        labelFr: "Mobilier",    icon: "🛋️" },
  { value: "electronics",       labelAr: "إلكترونيات",  labelFr: "Électronique",icon: "💻" },
  { value: "food",              labelAr: "مواد غذائية", labelFr: "Alimentaire", icon: "🍎" },
  { value: "building_material", labelAr: "مواد بناء",   labelFr: "Matériaux",   icon: "🧱" },
  { value: "packages",          labelAr: "طرود",        labelFr: "Colis",       icon: "📦" },
  { value: "other",             labelAr: "أخرى",        labelFr: "Autre",       icon: "📋" },
];

type Transporter = {
  id: string; name: string; phone: string;
  vehicleType: string | null; avgRating: number | null;
  totalRatings: number; isOnline: boolean; wilaya: string | null;
};

function Stars({ n }: { n: number | null }) {
  const v = Math.round(n ?? 0);
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= v ? "fill-orange-400 text-orange-400" : "text-slate-200"}`} />
      ))}
    </span>
  );
}

function WilayaDropdown({
  value, onChange, placeholder, accentColor,
}: { value: string; onChange: (v: string) => void; placeholder: string; accentColor: "blue" | "orange" }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => WILAYAS.filter(w => w.includes(search)), [search]);
  const accent = accentColor === "blue"
    ? { border: "border-blue-400", bg: "bg-blue-50", icon: "text-blue-500", ring: "focus:ring-blue-300", item: "hover:bg-blue-50", active: "bg-blue-50 text-blue-600" }
    : { border: "border-orange-400", bg: "bg-orange-50", icon: "text-orange-500", ring: "focus:ring-orange-300", item: "hover:bg-orange-50", active: "bg-orange-50 text-orange-600" };

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between border rounded-xl px-4 py-3 text-sm transition ${
          value ? `${accent.border} ${accent.bg} font-semibold text-slate-900` : "border-slate-200 bg-slate-50/50 text-slate-400"
        }`}>
        <span className="flex items-center gap-2">
          <MapPin className={`w-4 h-4 ${value ? accent.icon : "text-slate-400"}`} />
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 w-full mt-1 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-50">
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث... / Rechercher..."
              className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ${accent.ring}`} />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(w => (
              <button key={w} type="button"
                onClick={() => { onChange(w); setSearch(""); setOpen(false); }}
                className={`w-full text-start px-4 py-2.5 text-sm transition-colors ${
                  value === w ? `${accent.active} font-semibold` : `text-slate-700 ${accent.item}`
                }`}>
                {w}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────
export default function NewRequestPage() {
  const { lang } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [transportType, setTransportType] = useState<"INTER" | "INTRA" | "">("");

  // INTRA
  const [selectedWilaya,  setSelectedWilaya]  = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [drivers,         setDrivers]         = useState<Transporter[]>([]);
  const [loadingDrivers,  setLoadingDrivers]  = useState(false);
  const [selectedDriver,  setSelectedDriver]  = useState<Transporter | null>(null);

  // INTER
  const [fromCity, setFromCity] = useState("");
  const [toCity,   setToCity]   = useState("");

  // Step 4 — details
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress,   setToAddress]   = useState("");
  const [goodsType,   setGoodsType]   = useState("");
  const [weight,      setWeight]      = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const ar = lang === "ar";

  async function fetchDrivers() {
    if (!selectedWilaya || !selectedVehicle) return;
    setLoadingDrivers(true); setDrivers([]); setSelectedDriver(null);
    try {
      const res = await fetch(`/api/transporters?wilaya=${encodeURIComponent(selectedWilaya)}&vehicleType=${selectedVehicle}`);
      if (res.ok) setDrivers(await res.json());
    } finally { setLoadingDrivers(false); }
  }

  async function handleSubmit() {
    if (!goodsType || !weight) return;
    setSubmitting(true);
    try {
      const isIntra = transportType === "INTRA";
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromCity:    isIntra ? selectedWilaya : fromCity,
          toCity:      isIntra ? selectedWilaya : toCity,
          fromAddress, toAddress, goodsType, weight,
          vehicleType: isIntra ? selectedVehicle : "any",
          size: "medium",
          description: description || null,
          transportType,
          assignedTransporterId: isIntra ? selectedDriver?.id : null,
        }),
      });
      if (res.ok) {
        setToast(ar ? "✅ تم إرسال الطلب بنجاح!" : "✅ Demande envoyée !");
        setTimeout(() => router.push("/client/requests"), 1500);
      }
    } finally { setSubmitting(false); }
  }

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition";

  const vLabel = (v: string) => {
    const found = VEHICLE_TYPES.find(x => x.value === v);
    return found ? (ar ? found.labelAr : found.labelFr) : v;
  };

  // Step labels
  const stepLabels = ar
    ? ["نوع النقل", "تفاصيل الرحلة", ar && transportType === "INTRA" ? "اختر السائق" : "المسار", "تفاصيل الطلب"]
    : ["Type", "Trajet", transportType === "INTRA" ? "Chauffeur" : "Trajet", "Détails"];

  return (
    <DashboardLayout>
      {toast && (
        <div className="fixed top-4 start-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white text-sm font-semibold px-6 py-3 rounded-2xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="max-w-xl mx-auto">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {[1,2,3,4].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                  step > s  ? "bg-emerald-500 text-white" :
                  step === s ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" :
                  "bg-white border-2 border-slate-200 text-slate-400"
                }`}>
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < 4 && <div className={`h-1 flex-1 rounded-full transition-all ${step > s ? "bg-emerald-400" : "bg-slate-200"}`} />}
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {stepLabels[step - 1]}
          </p>
        </div>

        {/* ── STEP 1: Type ── */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {ar ? "نوع النقل" : "Type de transport"}
            </h1>
            <p className="text-slate-500 text-sm mb-7">
              {ar ? "اختر الخدمة المناسبة لاحتياجك" : "Choisissez le service adapté"}
            </p>

            <div className="space-y-4">
              <button onClick={() => { setTransportType("INTER"); setStep(3); }}
                className="group w-full relative overflow-hidden rounded-3xl border-2 border-slate-100 bg-white p-5 text-start hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-200">
                <div className="absolute -end-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full group-hover:scale-150 transition-all duration-300" />
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30 shrink-0">
                    🚛
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-base">
                      {ar ? "نقل عبر الولايات" : "Transport inter-wilayas"}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                      {ar ? "الناقلون يتنافسون بعروضهم — اختر أفضل سعر" : "Les transporteurs font leurs offres — choisissez le meilleur prix"}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      {ar ? "نظام المزايدة" : "Système d'enchères"}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                </div>
              </button>

              <button onClick={() => { setTransportType("INTRA"); setStep(2); }}
                className="group w-full relative overflow-hidden rounded-3xl border-2 border-slate-100 bg-white p-5 text-start hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-200">
                <div className="absolute -end-6 -top-6 w-32 h-32 bg-orange-500/5 rounded-full group-hover:scale-150 transition-all duration-300" />
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/30 shrink-0">
                    📦
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-base">
                      {ar ? "نقل داخل الولاية" : "Transport intra-wilaya"}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                      {ar ? "اختر سائقاً متاحاً في ولايتك مباشرة" : "Choisissez directement un chauffeur disponible dans votre wilaya"}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                      {ar ? "اختيار مباشر" : "Sélection directe"}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors shrink-0" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: INTRA — wilaya + vehicle ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {ar ? "أين تريد النقل؟" : "Où souhaitez-vous livrer ?"}
              </h1>
              <p className="text-slate-500 text-sm">{ar ? "اختر ولايتك ونوع المركبة" : "Sélectionnez votre wilaya et le type de véhicule"}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{ar ? "الولاية" : "Wilaya"}</label>
              <WilayaDropdown value={selectedWilaya} onChange={setSelectedWilaya}
                placeholder={ar ? "اختر الولاية..." : "Choisir la wilaya..."} accentColor="orange" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">{ar ? "نوع المركبة" : "Type de véhicule"}</label>
              <div className="grid grid-cols-2 gap-3">
                {VEHICLE_TYPES.map(v => (
                  <button key={v.value} type="button" onClick={() => setSelectedVehicle(v.value)}
                    className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-start ${
                      selectedVehicle === v.value
                        ? "border-orange-500 bg-orange-50 shadow-md shadow-orange-500/10"
                        : "border-slate-100 bg-white hover:border-orange-200 hover:shadow-sm"
                    }`}>
                    <span className="text-2xl mb-2">{v.icon}</span>
                    <p className="font-bold text-slate-900 text-sm">{ar ? v.labelAr : v.labelFr}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{ar ? v.descAr : v.descFr}</p>
                    {selectedVehicle === v.value && <CheckCircle className="w-4 h-4 text-orange-500 mt-2" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => { fetchDrivers(); setStep(3); }} disabled={!selectedWilaya || !selectedVehicle}
                className="flex-1 btn-primary disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {ar ? "عرض السائقين المتاحين" : "Voir les chauffeurs disponibles"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Drivers (INTRA) ── */}
        {step === 3 && transportType === "INTRA" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{ar ? "السائقون المتاحون" : "Chauffeurs disponibles"}</h1>
                <p className="text-sm text-slate-500 mt-0.5">{selectedWilaya} · {vLabel(selectedVehicle)}</p>
              </div>
              <button onClick={fetchDrivers} disabled={loadingDrivers}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition">
                <RefreshCw className={`w-4 h-4 ${loadingDrivers ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loadingDrivers ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="card-premium p-4 flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2"><div className="h-4 bg-slate-100 rounded-full w-1/2" /><div className="h-3 bg-slate-100 rounded-full w-1/3" /></div>
                    <div className="w-20 h-9 bg-slate-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : drivers.length === 0 ? (
              <div className="card-premium p-12 text-center">
                <div className="text-5xl mb-3">😔</div>
                <p className="font-bold text-slate-700">{ar ? "لا يوجد سائقون متاحون الآن" : "Aucun chauffeur disponible"}</p>
                <p className="text-sm text-slate-400 mt-1">{ar ? "حاول لاحقاً أو عدّل اختيارك" : "Réessayez plus tard"}</p>
                <button onClick={() => setStep(2)} className="mt-4 text-orange-500 text-sm font-semibold hover:text-orange-600">
                  {ar ? "← تعديل الاختيار" : "← Modifier"}
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-slate-400">{drivers.length} {ar ? "سائق متاح" : "chauffeur(s)"}</p>
                <div className="space-y-3">
                  {drivers.map(d => (
                    <button key={d.id} type="button"
                      onClick={() => setSelectedDriver(selectedDriver?.id === d.id ? null : d)}
                      className={`w-full card-premium p-4 flex items-center gap-4 text-start transition-all ${
                        selectedDriver?.id === d.id ? "border-2 border-orange-500 shadow-lg shadow-orange-500/10" : "hover:shadow-md"
                      }`}>
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-slate-100">
                        {VEHICLE_TYPES.find(v => v.value === d.vehicleType)?.icon ?? "🚗"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-slate-900 text-sm">{d.name}</p>
                          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            d.isOnline ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                          }`}>
                            {d.isOnline
                              ? <><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />{ar ? "متاح الآن" : "En ligne"}</>
                              : <><WifiOff className="w-2.5 h-2.5" />{ar ? "غير متاح" : "Hors ligne"}</>
                            }
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stars n={d.avgRating} />
                          {d.avgRating != null && <span className="text-xs font-semibold text-slate-600">{d.avgRating.toFixed(1)}</span>}
                          {d.totalRatings > 0 && <span className="text-xs text-slate-400">({d.totalRatings} {ar ? "تقييم" : "avis"})</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{vLabel(d.vehicleType ?? "")}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        selectedDriver?.id === d.id ? "bg-orange-500 border-orange-500" : "border-slate-200"
                      }`}>
                        {selectedDriver?.id === d.id && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setStep(4)} disabled={!selectedDriver}
                className="flex-1 btn-primary disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {ar ? "التالي — تفاصيل الطلب" : "Suivant — Détails"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: INTER — from/to ── */}
        {step === 3 && transportType === "INTER" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{ar ? "من أين إلى أين؟" : "D'où vers où ?"}</h1>
              <p className="text-slate-500 text-sm">{ar ? "حدد مدينة الانطلاق والوصول" : "Sélectionnez les wilayas de départ et d'arrivée"}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{ar ? "ولاية الانطلاق" : "Wilaya de départ"}</label>
              <WilayaDropdown value={fromCity} onChange={setFromCity}
                placeholder={ar ? "اختر ولاية الانطلاق..." : "Choisir la wilaya de départ..."} accentColor="blue" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{ar ? "ولاية الوصول" : "Wilaya d'arrivée"}</label>
              <WilayaDropdown value={toCity} onChange={setToCity}
                placeholder={ar ? "اختر ولاية الوصول..." : "Choisir la wilaya d'arrivée..."} accentColor="orange" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setStep(4)} disabled={!fromCity || !toCity}
                className="flex-1 btn-primary disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {ar ? "التالي — تفاصيل الطلب" : "Suivant — Détails"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Details ── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{ar ? "تفاصيل الطلب" : "Détails de la commande"}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-[#0A1628] text-white font-semibold px-3 py-1 rounded-full">
                  {transportType === "INTRA" ? selectedWilaya : `${fromCity} → ${toCity}`}
                </span>
                {transportType === "INTRA" && selectedDriver && (
                  <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Truck className="w-3 h-3" /> {selectedDriver.name}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{ar ? "عنوان الاستلام" : "Adresse de ramassage"}</label>
                <input value={fromAddress} onChange={e => setFromAddress(e.target.value)}
                  placeholder={ar ? "الحي، الشارع..." : "Quartier, rue..."} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{ar ? "عنوان التسليم" : "Adresse de livraison"}</label>
                <input value={toAddress} onChange={e => setToAddress(e.target.value)}
                  placeholder={ar ? "الحي، الشارع..." : "Quartier, rue..."} className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{ar ? "نوع البضاعة" : "Type de marchandise"}</label>
              <div className="grid grid-cols-3 gap-2">
                {GOODS_TYPES.map(g => (
                  <button key={g.value} type="button" onClick={() => setGoodsType(g.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                      goodsType === g.value ? "border-orange-500 bg-orange-50 shadow-sm" : "border-slate-100 bg-white hover:border-orange-200"
                    }`}>
                    <span className="text-xl">{g.icon}</span>
                    <span className="text-xs font-semibold text-slate-700 leading-tight text-center">{ar ? g.labelAr : g.labelFr}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{ar ? "الوزن التقريبي (كغ)" : "Poids approximatif (kg)"}</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                placeholder="ex: 200" min="1" className={inputCls} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{ar ? "ملاحظات (اختياري)" : "Notes (facultatif)"}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder={ar ? "تفاصيل إضافية..." : "Détails supplémentaires..."} rows={3}
                className={`${inputCls} resize-none`} />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setStep(3)} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={handleSubmit} disabled={submitting || !goodsType || !weight}
                className="flex-1 btn-primary disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{ar ? "جارٍ الإرسال..." : "Envoi..."}</>
                  : <>{ar ? "إرسال الطلب 🚀" : "Envoyer la demande 🚀"}</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
