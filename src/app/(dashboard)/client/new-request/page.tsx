"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useLanguage } from "@/context/LanguageContext";
import { WILAYAS } from "@/lib/constants";
import {
  ArrowRight, ArrowLeft, MapPin, Star,
  CheckCircle, ChevronDown, WifiOff, RefreshCw, Truck,
  CarTaxiFront,
} from "lucide-react";

type ServiceCategory = "LIVREUR" | "FRODEUR" | "TRANSPORTEUR";

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
  vehicleType: string | null;
  vehicleColor: string | null;
  isLivreur?: boolean; isFrodeur?: boolean; isTransporteur?: boolean;
  avgRating: number | null;
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
  const ar = lang === "ar";

  // Steps:
  //  1 = INTRA / INTER
  //  2 = service category (livreur / frodeur / transporteur)
  //  3 = wilaya (+ vehicle type only for transporteur)  OR  from/to for INTER
  //  4 = drivers list (INTRA only)
  //  5 = details form
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [transportType, setTransportType]     = useState<"INTER" | "INTRA" | "">("");
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory | "">("");

  // INTRA
  const [selectedWilaya,  setSelectedWilaya]  = useState("");
  const [drivers,         setDrivers]         = useState<Transporter[]>([]);
  const [loadingDrivers,  setLoadingDrivers]  = useState(false);
  const [selectedDriver,  setSelectedDriver]  = useState<Transporter | null>(null);

  // INTER
  const [fromCity, setFromCity] = useState("");
  const [toCity,   setToCity]   = useState("");

  // Step 5 — details
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress,   setToAddress]   = useState("");
  const [goodsType,   setGoodsType]   = useState("");
  const [weight,      setWeight]      = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const isTransporteur = serviceCategory === "TRANSPORTEUR";
  const isFrodeur      = serviceCategory === "FRODEUR";

  async function fetchDrivers() {
    if (!selectedWilaya || !serviceCategory) return;
    setLoadingDrivers(true); setDrivers([]); setSelectedDriver(null);
    try {
      const params = new URLSearchParams({
        wilaya: selectedWilaya,
        service: serviceCategory,
      });
      const res = await fetch(`/api/transporters?${params}`);
      if (res.ok) setDrivers(await res.json());
    } finally { setLoadingDrivers(false); }
  }

  async function handleSubmit() {
    // Frodeur (taxi): no goods, just route. Livreur: goodsType optional. Transporteur: goods required.
    if (isTransporteur && (!goodsType || !weight)) return;

    setSubmitting(true);
    try {
      const isIntra = transportType === "INTRA";
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromCity:    isIntra ? selectedWilaya : fromCity,
          toCity:      isIntra ? selectedWilaya : toCity,
          fromAddress, toAddress,
          goodsType:   isFrodeur ? null : (goodsType || null),
          weight:      isFrodeur ? null : (weight   || null),
          vehicleType: "any",
          size: "medium",
          description: description || null,
          transportType,
          assignedTransporterId: isIntra ? selectedDriver?.id : null,
          serviceCategory,
        }),
      });
      if (res.ok) {
        setToast(ar ? "✅ تم إرسال الطلب بنجاح!" : "✅ Demande envoyée !");
        setTimeout(() => router.push("/client/requests"), 1500);
      }
    } finally { setSubmitting(false); }
  }

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition";


  const services = [
    {
      key: "LIVREUR" as const, emoji: "🛵", accent: "purple",
      titleAr: "موصِّل", titleFr: "Livreur",
      descAr: "توصيل طرود ومشتريات سريعة", descFr: "Livraison rapide de colis",
      gradFrom: "from-violet-500", gradTo: "to-purple-700",
      tagAr: "سريع",  tagFr: "Rapide",
    },
    {
      key: "FRODEUR" as const, emoji: "🚖", accent: "yellow",
      titleAr: "أجرة", titleFr: "Taxi (Frodeur)",
      descAr: "نقل الأشخاص — السائق يحدد السعر", descFr: "Transport de personnes",
      gradFrom: "from-amber-400", gradTo: "to-orange-600",
      tagAr: "للأشخاص", tagFr: "Personnes",
    },
    {
      key: "TRANSPORTEUR" as const, emoji: "🚚", accent: "orange",
      titleAr: "ناقل", titleFr: "Transporteur",
      descAr: "نقل البضائع والأثاث — وزن وحجم", descFr: "Marchandises & meubles",
      gradFrom: "from-orange-500", gradTo: "to-red-600",
      tagAr: "للبضائع", tagFr: "Marchandises",
    },
  ];

  // Step labels for progress
  const stepLabels = ar
    ? ["نوع النقل", "الخدمة", transportType === "INTRA" ? "الموقع" : "المسار",
       transportType === "INTRA" ? "السائق" : "التفاصيل", "التفاصيل"]
    : ["Type", "Service", transportType === "INTRA" ? "Lieu" : "Trajet",
       transportType === "INTRA" ? "Chauffeur" : "Détails", "Détails"];

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
          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4,5].map(s => (
              <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                  step > s  ? "bg-emerald-500 text-white" :
                  step === s ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" :
                  "bg-white border-2 border-slate-200 text-slate-400"
                }`}>
                  {step > s ? <CheckCircle className="w-3.5 h-3.5" /> : s}
                </div>
                {s < 5 && <div className={`h-1 flex-1 rounded-full transition-all ${step > s ? "bg-emerald-400" : "bg-slate-200"}`} />}
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
              {ar ? "داخل ولايتك أو بين الولايات" : "Dans votre wilaya ou entre wilayas"}
            </p>

            <div className="space-y-4">
              <button onClick={() => { setTransportType("INTRA"); setStep(2); }}
                className="group w-full relative overflow-hidden rounded-3xl border-2 border-slate-100 bg-white p-5 text-start hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/10 transition-all">
                <div className="absolute -end-6 -top-6 w-32 h-32 bg-orange-500/5 rounded-full group-hover:scale-150 transition-all duration-300" />
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/30 shrink-0">📦</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-base">{ar ? "داخل الولاية" : "Dans la wilaya"}</p>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                      {ar ? "اختر سائقاً متاحاً في ولايتك مباشرة" : "Choisissez un chauffeur disponible dans votre wilaya"}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors shrink-0" />
                </div>
              </button>

              <button onClick={() => { setTransportType("INTER"); setStep(2); }}
                className="group w-full relative overflow-hidden rounded-3xl border-2 border-slate-100 bg-white p-5 text-start hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
                <div className="absolute -end-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full group-hover:scale-150 transition-all duration-300" />
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30 shrink-0">🚛</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-base">{ar ? "بين الولايات" : "Entre wilayas"}</p>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                      {ar ? "الناقلون يتنافسون بعروضهم — اختر أفضل سعر" : "Les transporteurs font leurs offres"}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Service category ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {ar ? "ماذا تحتاج؟" : "De quoi avez-vous besoin ?"}
              </h1>
              <p className="text-slate-500 text-sm">{ar ? "اختر نوع الخدمة" : "Choisissez le type de service"}</p>
            </div>

            <div className="space-y-3">
              {services.map(s => {
                const sel = serviceCategory === s.key;
                return (
                  <button key={s.key} type="button"
                    onClick={() => setServiceCategory(s.key)}
                    className={`group w-full relative overflow-hidden rounded-3xl border-2 bg-white p-5 text-start transition-all hover:scale-[1.02] active:scale-[0.99] ${
                      sel ? "border-orange-500 shadow-2xl shadow-orange-500/20" : "border-slate-100 hover:border-slate-300 hover:shadow-lg"
                    }`}>
                    {/* Decorative gradient blob */}
                    <div className={`absolute -end-8 -top-8 w-36 h-36 rounded-full bg-gradient-to-br ${s.gradFrom} ${s.gradTo} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity blur-2xl`} />
                    <div className="relative flex items-center gap-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${s.gradFrom} ${s.gradTo} rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                        {s.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-black text-slate-900 text-base">{ar ? s.titleAr : s.titleFr}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${s.gradFrom} ${s.gradTo} text-white shadow-sm`}>
                            {ar ? s.tagAr : s.tagFr}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">{ar ? s.descAr : s.descFr}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        sel ? "bg-orange-500 border-orange-500 scale-110" : "border-slate-200"
                      }`}>
                        {sel && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setStep(3)} disabled={!serviceCategory}
                className="flex-1 btn-primary disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {ar ? "التالي" : "Suivant"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 — INTRA: wilaya only ── */}
        {step === 3 && transportType === "INTRA" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {ar ? "أين أنت؟" : "Où êtes-vous ?"}
              </h1>
              <p className="text-slate-500 text-sm">{ar ? "اختر ولايتك" : "Sélectionnez votre wilaya"}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{ar ? "الولاية" : "Wilaya"}</label>
              <WilayaDropdown value={selectedWilaya} onChange={setSelectedWilaya}
                placeholder={ar ? "اختر الولاية..." : "Choisir la wilaya..."} accentColor="orange" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => { fetchDrivers(); setStep(4); }}
                disabled={!selectedWilaya}
                className="flex-1 btn-primary disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {ar ? "عرض السائقين المتاحين" : "Voir les chauffeurs"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 — INTER: from/to ── */}
        {step === 3 && transportType === "INTER" && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{ar ? "من أين إلى أين؟" : "D'où vers où ?"}</h1>
              <p className="text-slate-500 text-sm">{ar ? "حدد ولاية الانطلاق والوصول" : "Wilayas de départ et d'arrivée"}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{ar ? "ولاية الانطلاق" : "Wilaya de départ"}</label>
              <WilayaDropdown value={fromCity} onChange={setFromCity}
                placeholder={ar ? "اختر..." : "Choisir..."} accentColor="blue" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{ar ? "ولاية الوصول" : "Wilaya d'arrivée"}</label>
              <WilayaDropdown value={toCity} onChange={setToCity}
                placeholder={ar ? "اختر..." : "Choisir..."} accentColor="orange" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setStep(5)} disabled={!fromCity || !toCity}
                className="flex-1 btn-primary disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {ar ? "التالي — تفاصيل الطلب" : "Suivant — Détails"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Drivers (INTRA only) ── */}
        {step === 4 && transportType === "INTRA" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{ar ? "السائقون المتاحون" : "Chauffeurs disponibles"}</h1>
                <p className="text-sm text-slate-500 mt-0.5">{selectedWilaya}</p>
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
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded-full w-1/2" />
                      <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : drivers.length === 0 ? (
              <div className="card-premium p-12 text-center">
                <div className="text-5xl mb-3">😔</div>
                <p className="font-bold text-slate-700">{ar ? "لا يوجد سائقون متاحون" : "Aucun chauffeur disponible"}</p>
                <p className="text-sm text-slate-400 mt-1">{ar ? "حاول لاحقاً" : "Réessayez plus tard"}</p>
                <button onClick={() => setStep(3)} className="mt-4 text-orange-500 text-sm font-semibold hover:text-orange-600">
                  {ar ? "← تعديل الاختيار" : "← Modifier"}
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-slate-400">
                  {drivers.length} {ar ? "سائق متاح" : "chauffeur(s)"}
                </p>
                <div className="space-y-3">
                  {drivers.map(d => (
                    <button key={d.id} type="button"
                      onClick={() => setSelectedDriver(selectedDriver?.id === d.id ? null : d)}
                      className={`w-full card-premium p-4 flex items-center gap-4 text-start transition-all ${
                        selectedDriver?.id === d.id ? "border-2 border-orange-500 shadow-lg shadow-orange-500/10" : "hover:shadow-md"
                      }`}>
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-slate-100">
                        🚗
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-slate-900 text-sm">{d.name}</p>
                          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            d.isOnline ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                          }`}>
                            {d.isOnline
                              ? <><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />{ar ? "متاح" : "En ligne"}</>
                              : <><WifiOff className="w-2.5 h-2.5" />{ar ? "غير متاح" : "Hors ligne"}</>
                            }
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stars n={d.avgRating} />
                          {d.avgRating != null && <span className="text-xs font-semibold text-slate-600">{d.avgRating.toFixed(1)}</span>}
                          {d.totalRatings > 0 && <span className="text-xs text-slate-400">({d.totalRatings})</span>}
                        </div>
                        {/* Vehicle (free text) + colour text */}
                        {(d.vehicleType || d.vehicleColor) && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 flex-wrap">
                            {d.vehicleType && <span>🚗 {d.vehicleType}</span>}
                            {d.vehicleColor && (
                              <span className="text-slate-400">· {d.vehicleColor}</span>
                            )}
                          </div>
                        )}
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
              <button onClick={() => setStep(3)} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setStep(5)} disabled={!selectedDriver}
                className="flex-1 btn-primary disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {ar ? "التالي" : "Suivant"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Details ── */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {isFrodeur
                  ? (ar ? "تفاصيل الرحلة" : "Détails de la course")
                  : (ar ? "تفاصيل الطلب" : "Détails de la commande")}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-[#0A1628] text-white font-semibold px-3 py-1 rounded-full">
                  {transportType === "INTRA" ? selectedWilaya : `${fromCity} → ${toCity}`}
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-full">
                  {ar ? services.find(s => s.key === serviceCategory)?.titleAr : services.find(s => s.key === serviceCategory)?.titleFr}
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
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {isFrodeur ? (ar ? "نقطة الانطلاق" : "Point de départ") : (ar ? "عنوان الاستلام" : "Adresse de ramassage")}
                </label>
                <input value={fromAddress} onChange={e => setFromAddress(e.target.value)}
                  placeholder={ar ? "الحي، الشارع..." : "Quartier, rue..."} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {isFrodeur ? (ar ? "الوجهة" : "Destination") : (ar ? "عنوان التسليم" : "Adresse de livraison")}
                </label>
                <input value={toAddress} onChange={e => setToAddress(e.target.value)}
                  placeholder={ar ? "الحي، الشارع..." : "Quartier, rue..."} className={inputCls} />
              </div>
            </div>

            {/* Goods type + weight only for transporteur (and optional livreur) */}
            {!isFrodeur && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {ar ? "نوع البضاعة" : "Type"}{!isTransporteur && <span className="text-slate-400 font-normal ms-1">({ar ? "اختياري" : "facultatif"})</span>}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {GOODS_TYPES.map(g => (
                      <button key={g.value} type="button" onClick={() => setGoodsType(g.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                          goodsType === g.value ? "border-orange-500 bg-orange-50" : "border-slate-100 bg-white hover:border-orange-200"
                        }`}>
                        <span className="text-xl">{g.icon}</span>
                        <span className="text-xs font-semibold text-slate-700 leading-tight text-center">{ar ? g.labelAr : g.labelFr}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {ar ? "الوزن التقريبي (كغ)" : "Poids approximatif (kg)"}
                    {!isTransporteur && <span className="text-slate-400 font-normal ms-1">({ar ? "اختياري" : "facultatif"})</span>}
                  </label>
                  <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                    placeholder="ex: 200" min="1" className={inputCls} />
                </div>
              </>
            )}

            {isFrodeur && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                <CarTaxiFront className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  {ar
                    ? "السائق سيقترح السعر بعد قبول الرحلة. الأدمين يأخذ 10% من كل رحلة."
                    : "Le chauffeur proposera le prix après acceptation. L'admin prend 10% de chaque course."}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {ar ? "ملاحظات (اختياري)" : "Notes (facultatif)"}
              </label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder={ar ? "تفاصيل إضافية..." : "Détails supplémentaires..."} rows={3}
                className={`${inputCls} resize-none`} />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setStep(transportType === "INTRA" ? 4 : 3)}
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={handleSubmit}
                disabled={submitting || (isTransporteur && (!goodsType || !weight))}
                className="flex-1 btn-primary disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {ar ? "إرسال الطلب" : "Envoyer la demande"}
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
