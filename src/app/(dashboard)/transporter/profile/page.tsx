"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MapPin, Save, CheckCircle, Info, Search, Bike, CarTaxiFront, Truck as TruckIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { WILAYAS } from "@/lib/constants";

type Profile = {
  id: string;
  name: string;
  phone: string;
  wilaya: string | null;
  vehicleType: string | null;
  vehicleColor: string | null;
  isLivreur: boolean;
  isFrodeur: boolean;
  isTransporteur: boolean;
  avgRating: number;
  totalRatings: number;
  isOnline: boolean;
};

export default function TransporterProfilePage() {
  const { lang, tr } = useLanguage();
  const ar = lang === "ar";

  const [profile, setProfile]         = useState<Profile | null>(null);
  const [wilaya, setWilaya]           = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [isLivreur, setIsLivreur]     = useState(false);
  const [isFrodeur, setIsFrodeur]     = useState(false);
  const [isTransporteur, setIsTransporteur] = useState(true);
  const [wilayaSearch, setWilayaSearch] = useState("");
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then((d: Profile) => {
        setProfile(d);
        setWilaya(d.wilaya ?? "");
        setVehicleType(d.vehicleType ?? "");
        setVehicleColor(d.vehicleColor ?? "");
        setIsLivreur(!!d.isLivreur);
        setIsFrodeur(!!d.isFrodeur);
        setIsTransporteur(d.isTransporteur ?? true);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wilaya: wilaya || null,
          vehicleType: vehicleType || null,
          vehicleColor: vehicleColor || null,
          isLivreur,
          isFrodeur,
          isTransporteur,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally { setSaving(false); }
  }

  const filteredWilayas = WILAYAS.filter(w =>
    w.includes(wilayaSearch) || w.toLowerCase().includes(wilayaSearch.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-16 text-gray-400 text-sm">{tr("loading")}</div>
      </DashboardLayout>
    );
  }

  const accentMap: Record<"purple" | "yellow" | "orange", { active: string; icon: string; text: string }> = {
    purple: { active: "border-purple-400 bg-purple-50", icon: "text-purple-600", text: "text-purple-700" },
    yellow: { active: "border-yellow-400 bg-yellow-50", icon: "text-yellow-600", text: "text-yellow-700" },
    orange: { active: "border-orange-400 bg-orange-50", icon: "text-orange-600", text: "text-orange-700" },
  };

  const services: Array<{
    key: string; value: boolean; set: (v: boolean) => void;
    icon: typeof Bike; accent: "purple" | "yellow" | "orange";
    titleAr: string; titleFr: string; descAr: string; descFr: string;
  }> = [
    {
      key: "isLivreur", value: isLivreur, set: setIsLivreur,
      icon: Bike, accent: "purple",
      titleAr: "موصِّل (Livreur)", titleFr: "Livreur",
      descAr: "توصيل طرود ومشتريات صغيرة", descFr: "Livraison de petits colis",
    },
    {
      key: "isFrodeur", value: isFrodeur, set: setIsFrodeur,
      icon: CarTaxiFront, accent: "yellow",
      titleAr: "أجرة (Frodeur)", titleFr: "Frodeur (Taxi)",
      descAr: "نقل الأشخاص — السائق يحدد السعر", descFr: "Transport de personnes — vous fixez le prix",
    },
    {
      key: "isTransporteur", value: isTransporteur, set: setIsTransporteur,
      icon: TruckIcon, accent: "orange",
      titleAr: "ناقل (Transporteur)", titleFr: "Transporteur",
      descAr: "نقل البضائع والأثاث", descFr: "Transport de marchandises",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-4">

        {/* Header card */}
        <div className="bg-gradient-to-br from-[#0F1B2D] to-[#1A2E4A] rounded-3xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 text-white font-black text-xl shrink-0">
            {profile?.name?.[0]?.toUpperCase() ?? "N"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-lg truncate">{profile?.name}</p>
            <p className="text-slate-400 text-xs mt-0.5">{profile?.phone}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                profile?.isOnline ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${profile?.isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                {profile?.isOnline
                  ? (ar ? "متصل" : "En ligne")
                  : (ar ? "غير متصل" : "Hors ligne")}
              </span>
              {profile && profile.totalRatings > 0 && (
                <span className="flex items-center gap-1 text-xs text-yellow-300 font-semibold">
                  ★ {profile.avgRating.toFixed(1)}
                  <span className="text-slate-400 font-normal">({profile.totalRatings})</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info tip */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">{tr("profile_tip")}</p>
        </div>

        {/* ── Services ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            {ar ? "الخدمات التي تقدمها" : "Services que vous offrez"}
          </label>
          <p className="text-xs text-gray-500 mb-3">
            {ar ? "يمكنك تفعيل أكثر من خدمة" : "Vous pouvez activer plusieurs services"}
          </p>
          <div className="space-y-2">
            {services.map(s => {
              const a = accentMap[s.accent];
              return (
                <button key={s.key} type="button" onClick={() => s.set(!s.value)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-start transition-all ${
                    s.value ? `${a.active} shadow-sm` : "border-gray-100 bg-white hover:bg-gray-50"
                  }`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    s.value ? "bg-white" : "bg-gray-50"
                  }`}>
                    <s.icon className={`w-5 h-5 ${s.value ? a.icon : "text-gray-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${s.value ? a.text : "text-gray-800"}`}>
                      {ar ? s.titleAr : s.titleFr}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${s.value ? a.text : "text-gray-500"} opacity-80`}>
                      {ar ? s.descAr : s.descFr}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    s.value ? "bg-emerald-500 border-emerald-500" : "border-gray-300"
                  }`}>
                    {s.value && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wilaya section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
            <MapPin className="w-4 h-4 text-orange-400" />
            {tr("profile_wilaya")}
          </label>

          {wilaya && (
            <div className="flex items-center gap-2 mb-3 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-sm font-semibold text-orange-700">{wilaya}</span>
              <button type="button" onClick={() => setWilaya("")}
                className="ms-auto text-orange-400 hover:text-orange-600 text-xs font-medium transition-colors">
                {ar ? "تغيير" : "Changer"}
              </button>
            </div>
          )}

          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={wilayaSearch} onChange={e => setWilayaSearch(e.target.value)}
              placeholder={ar ? "ابحث عن ولايتك..." : "Rechercher votre wilaya..."}
              className="w-full border border-gray-200 rounded-xl ps-8 pe-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-52 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-2">
            {filteredWilayas.map(w => (
              <button key={w} type="button"
                onClick={() => { setWilaya(w); setWilayaSearch(""); }}
                className={`text-xs px-3 py-2 rounded-lg font-medium text-start transition-all ${
                  wilaya === w
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-100"
                }`}>
                {w}
              </button>
            ))}
            {filteredWilayas.length === 0 && (
              <p className="col-span-3 text-center text-xs text-gray-400 py-4">
                {ar ? "لا توجد نتائج" : "Aucun résultat"}
              </p>
            )}
          </div>
        </div>

        {/* Vehicle (free text — type & colour) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-1">
              <span className="text-lg">🚛</span>
              {ar ? "نوع المركبة (موديل، علامة...)" : "Véhicule (modèle, marque...)"}
            </label>
            <p className="text-xs text-gray-500 mb-2">
              {ar ? "اكتب نوع مركبتك بالتفصيل ليتعرف عليها العميل" : "Décrivez votre véhicule pour aider le client à le reconnaître"}
            </p>
            <input
              type="text"
              value={vehicleType}
              onChange={e => setVehicleType(e.target.value)}
              placeholder={ar ? "مثال: Hyundai i10 — شاحنة Hino 300" : "ex: Hyundai i10 — Camion Hino 300"}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              {ar ? "لون المركبة" : "Couleur du véhicule"}
            </label>
            <p className="text-xs text-gray-500 mb-2">
              {ar ? "اكتب اللون بأي شكل تراه مناسباً" : "Écrivez la couleur comme vous le souhaitez"}
            </p>
            <input
              type="text"
              value={vehicleColor}
              onChange={e => setVehicleColor(e.target.value)}
              placeholder={ar ? "مثال: أبيض، أزرق غامق..." : "ex: Blanc, Bleu marine..."}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
            />
          </div>
        </div>

        {/* Save */}
        <button onClick={save} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20">
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" /> {tr("profile_saved")}</>
          ) : (
            <><Save className="w-4 h-4" /> {tr("profile_save")}</>
          )}
        </button>
      </div>
    </DashboardLayout>
  );
}
