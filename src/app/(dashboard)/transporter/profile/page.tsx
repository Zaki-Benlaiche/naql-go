"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MapPin, Save, CheckCircle, Info, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { WILAYAS, VEHICLE_TYPES } from "@/lib/constants";

type Profile = {
  id: string;
  name: string;
  phone: string;
  wilaya: string | null;
  vehicleType: string | null;
  avgRating: number;
  totalRatings: number;
  isOnline: boolean;
};

const vehicleColors: Record<string, {
  selected: string; icon_bg: string; border: string; text: string; dot: string;
}> = {
  car:        { selected: "border-blue-400 bg-blue-50",    icon_bg: "bg-blue-100",   border: "border-blue-100",   text: "text-blue-700",   dot: "bg-blue-400"   },
  van:        { selected: "border-green-400 bg-green-50",  icon_bg: "bg-green-100",  border: "border-green-100",  text: "text-green-700",  dot: "bg-green-400"  },
  truck:      { selected: "border-orange-400 bg-orange-50",icon_bg: "bg-orange-100", border: "border-orange-100", text: "text-orange-700", dot: "bg-orange-400" },
  motorcycle: { selected: "border-purple-400 bg-purple-50",icon_bg: "bg-purple-100", border: "border-purple-100", text: "text-purple-700", dot: "bg-purple-400" },
};

export default function TransporterProfilePage() {
  const { lang, tr } = useLanguage();
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [wilaya, setWilaya]           = useState("");
  const [vehicleType, setVehicleType] = useState("");
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
        body: JSON.stringify({ wilaya: wilaya || null, vehicleType: vehicleType || null }),
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
                  ? (lang === "ar" ? "متصل" : "En ligne")
                  : (lang === "ar" ? "غير متصل" : "Hors ligne")}
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

        {/* Wilaya section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
            <MapPin className="w-4 h-4 text-orange-400" />
            {tr("profile_wilaya")}
          </label>

          {/* Selected badge */}
          {wilaya && (
            <div className="flex items-center gap-2 mb-3 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-sm font-semibold text-orange-700">{wilaya}</span>
              <button
                type="button"
                onClick={() => setWilaya("")}
                className="ms-auto text-orange-400 hover:text-orange-600 text-xs font-medium transition-colors"
              >
                {lang === "ar" ? "تغيير" : "Changer"}
              </button>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={wilayaSearch}
              onChange={e => setWilayaSearch(e.target.value)}
              placeholder={lang === "ar" ? "ابحث عن ولايتك..." : "Rechercher votre wilaya..."}
              className="w-full border border-gray-200 rounded-xl ps-8 pe-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent bg-white transition"
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-52 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-2">
            {filteredWilayas.map(w => (
              <button
                key={w}
                type="button"
                onClick={() => { setWilaya(w); setWilayaSearch(""); }}
                className={`text-xs px-3 py-2 rounded-lg font-medium text-start transition-all ${
                  wilaya === w
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-100"
                }`}
              >
                {w}
              </button>
            ))}
            {filteredWilayas.length === 0 && (
              <p className="col-span-3 text-center text-xs text-gray-400 py-4">
                {lang === "ar" ? "لا توجد نتائج" : "Aucun résultat"}
              </p>
            )}
          </div>
        </div>

        {/* Vehicle type section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
            <span className="text-lg">🚛</span>
            {tr("profile_vehicle")}
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {VEHICLE_TYPES.map(vt => {
              const isSelected = vehicleType === vt.value;
              const colors = vehicleColors[vt.value] ?? {
                selected: "border-orange-400 bg-orange-50",
                icon_bg: "bg-orange-100",
                border: "border-gray-100",
                text: "text-orange-700",
                dot: "bg-orange-400",
              };
              return (
                <button
                  key={vt.value}
                  type="button"
                  onClick={() => setVehicleType(vt.value)}
                  className={`relative flex flex-col gap-2 p-4 rounded-2xl border-2 text-start transition-all ${
                    isSelected
                      ? `${colors.selected} shadow-sm`
                      : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {isSelected && (
                    <span className={`absolute top-2 end-2 w-2 h-2 rounded-full ${colors.dot}`} />
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    isSelected ? colors.icon_bg : "bg-gray-50"
                  }`}>
                    {vt.icon}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isSelected ? colors.text : "text-gray-800"}`}>
                      {lang === "ar" ? vt.labelAr : vt.labelFr}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${isSelected ? colors.text : "text-gray-400"} opacity-80`}>
                      {lang === "ar" ? vt.descAr : vt.descFr}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={save}
          disabled={saving || (!wilaya && !vehicleType)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20 disabled:shadow-none"
        >
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
