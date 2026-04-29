"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { User, MapPin, Truck, Save, CheckCircle, Info } from "lucide-react";
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

export default function TransporterProfilePage() {
  const { lang, tr } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wilaya, setWilaya] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [wilayaSearch, setWilayaSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

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
    w.includes(wilayaSearch) ||
    w.toLowerCase().includes(wilayaSearch.toLowerCase())
  );

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent bg-white transition";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-16 text-gray-400 text-sm">{tr("loading")}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{tr("my_profile")}</h1>
            <p className="text-sm text-gray-500">{profile?.name}</p>
          </div>
        </div>

        {/* Rating card */}
        {profile && (profile.avgRating > 0 || profile.totalRatings > 0) && (
          <div className="card-premium rounded-2xl p-4 mb-4 flex items-center gap-4">
            <div className="text-3xl font-black text-orange-500">
              {profile.avgRating.toFixed(1)}
            </div>
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-base ${s <= Math.round(profile.avgRating) ? "text-orange-400" : "text-gray-200"}`}>★</span>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {profile.totalRatings} {lang === "ar" ? "تقييم" : "avis"}
              </p>
            </div>
            <div className={`ms-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${profile.isOnline ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
              <span className={`w-2 h-2 rounded-full ${profile.isOnline ? "bg-emerald-400 animate-pulse" : "bg-gray-300"}`} />
              {profile.isOnline ? (lang === "ar" ? "متصل" : "En ligne") : (lang === "ar" ? "غير متصل" : "Hors ligne")}
            </div>
          </div>
        )}

        {/* Info tip */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">{tr("profile_tip")}</p>
        </div>

        <div className="card-premium rounded-2xl p-5 md:p-6 space-y-6">

          {/* Wilaya */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <MapPin className="w-4 h-4 text-orange-400" />
              {tr("profile_wilaya")}
            </label>

            {/* Search */}
            <input
              type="text"
              value={wilayaSearch}
              onChange={e => setWilayaSearch(e.target.value)}
              placeholder={lang === "ar" ? "ابحث عن ولايتك..." : "Rechercher votre wilaya..."}
              className={`${inputClass} mb-2`}
            />

            {/* Grid of wilayas */}
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

            {wilaya && (
              <div className="mt-2 flex items-center gap-2 text-sm text-orange-600 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                {lang === "ar" ? "الولاية المختارة:" : "Wilaya choisie :"} {wilaya}
              </div>
            )}
          </div>

          {/* Vehicle type */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Truck className="w-4 h-4 text-orange-400" />
              {tr("profile_vehicle")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VEHICLE_TYPES.map(vt => (
                <button
                  key={vt.value}
                  type="button"
                  onClick={() => setVehicleType(vt.value)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    vehicleType === vt.value
                      ? "border-orange-400 bg-orange-50 text-orange-700 shadow-sm"
                      : "border-gray-100 bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50/50"
                  }`}
                >
                  <span className="text-xl">{vt.icon}</span>
                  <span>{lang === "ar" ? vt.labelAr : vt.labelFr}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={save}
            disabled={saving || (!wilaya && !vehicleType)}
            className="w-full flex items-center justify-center gap-2 btn-primary text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </DashboardLayout>
  );
}
