"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const wilayas = [
  "أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار",
  "البليدة","البويرة","تمنراست","تبسة","تلمسان","تيارت","تيزي وزو","الجزائر",
  "الجلفة","جيجل","سطيف","سعيدة","سكيكدة","سيدي بلعباس","عنابة","قالمة",
  "قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة","وهران","البيض",
  "إليزي","برج بوعريريج","بومرداس","الطارف","تندوف","تيسمسيلت","الوادي",
  "خنشلة","سوق أهراس","تيبازة","ميلة","عين الدفلى","النعامة","عين تموشنت",
  "غرداية","غليزان","تيميمون","برج باجي مختار","أولاد جلال","بني عباس",
  "إن صالح","إن قزام","تقرت","جانت","المغير","المنيعة",
];

export default function NewRequestPage() {
  const router = useRouter();
  const { lang, tr } = useLanguage();
  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fromCity: "", toCity: "", fromAddress: "", toAddress: "",
    goodsType: "", vehicleType: "any", weight: "", description: "",
  });

  const goodsTypes = [
    { value: "packages", label: tr("goods_packages") },
    { value: "furniture", label: tr("goods_furniture") },
    { value: "electronics", label: tr("goods_electronics") },
    { value: "food", label: tr("goods_food") },
    { value: "building_material", label: tr("goods_building") },
    { value: "other", label: tr("goods_other") },
  ];

  const vehicleTypes = [
    { value: "any",         label: tr("vt_any"),         icon: "🚗" },
    { value: "pickup",      label: tr("vt_pickup"),      icon: "🛻" },
    { value: "van",         label: tr("vt_van"),         icon: "🚐" },
    { value: "light_truck", label: tr("vt_light_truck"), icon: "🚛" },
    { value: "heavy_truck", label: tr("vt_heavy_truck"), icon: "🚚" },
    { value: "refrigerated",label: tr("vt_refrigerated"),icon: "🧊" },
    { value: "flatbed",     label: tr("vt_flatbed"),     icon: "🏗️" },
    { value: "offroad",     label: tr("vt_offroad"),     icon: "🚙" },
    { value: "crane",       label: tr("vt_crane"),       icon: "🏗️" },
    { value: "taxi",        label: tr("vt_taxi"),        icon: "🚕" },
  ];

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || tr("error_occurred")); return; }
    router.push("/client/requests");
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent bg-white transition";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/client" className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <BackIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{tr("new_request_title")}</h1>
            <p className="text-gray-500 text-xs md:text-sm mt-0.5">{tr("new_request_sub")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Route section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-sm md:text-base">{tr("route_section")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{tr("from_city")}</label>
                <select value={form.fromCity} onChange={e => set("fromCity", e.target.value)} className={inputClass} required>
                  <option value="">{tr("select_wilaya")}</option>
                  {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{tr("to_city")}</label>
                <select value={form.toCity} onChange={e => set("toCity", e.target.value)} className={inputClass} required>
                  <option value="">{tr("select_wilaya")}</option>
                  {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{tr("from_address")}</label>
                <input value={form.fromAddress} onChange={e => set("fromAddress", e.target.value)}
                  placeholder={tr("address_placeholder")} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>{tr("to_address")}</label>
                <input value={form.toAddress} onChange={e => set("toAddress", e.target.value)}
                  placeholder={tr("address_placeholder")} className={inputClass} required />
              </div>
            </div>
          </div>

          {/* Vehicle type section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-sm md:text-base">{tr("vehicle_section")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
              {vehicleTypes.map(v => (
                <button key={v.value} type="button" onClick={() => set("vehicleType", v.value)}
                  className={`p-2.5 md:p-3 rounded-xl border-2 text-xs md:text-sm text-center transition-all font-medium flex flex-col items-center gap-1 ${
                    form.vehicleType === v.value
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <span className="text-lg leading-none">{v.icon}</span>
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Goods section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-sm md:text-base">{tr("goods_section")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 mb-4">
              {goodsTypes.map(g => (
                <button key={g.value} type="button" onClick={() => set("goodsType", g.value)}
                  className={`p-2.5 md:p-3 rounded-xl border-2 text-xs md:text-sm text-center transition-all font-medium ${
                    form.goodsType === g.value
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div className="mb-4">
              <label className={labelClass}>{tr("weight_label")}</label>
              <input type="number" value={form.weight} onChange={e => set("weight", e.target.value)}
                placeholder={tr("weight_placeholder")} min="1" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>
                {tr("description_label")} <span className="text-gray-400 font-normal">{tr("description_optional")}</span>
              </label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                placeholder={tr("description_placeholder")} rows={3}
                className={`${inputClass} resize-none`} />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>
          )}

          <button type="submit" disabled={loading || !form.goodsType}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3.5 rounded-2xl transition-colors shadow-sm text-sm md:text-base">
            {loading ? tr("publishing") : tr("publish_btn")}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
