"use client";
import { useState, useMemo, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ArrowRight, ArrowLeft, Calculator, Tag, CheckCircle, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { calcPrice } from "@/lib/pricing";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/MapPicker").then(m => ({ default: m.MapPicker })), { ssr: false, loading: () => <div className="h-48 bg-gray-100 rounded-xl animate-pulse" /> });

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
    goodsType: "", vehicleType: "any", size: "medium", weight: "", description: "",
    scheduledDate: "", scheduledTime: "", isScheduled: false,
  });
  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showFromMap, setShowFromMap] = useState(false);
  const [showToMap, setShowToMap] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{ discountPercent: number; code: string; couponId: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const goodsTypes = [
    { value: "packages", label: tr("goods_packages") },
    { value: "furniture", label: tr("goods_furniture") },
    { value: "electronics", label: tr("goods_electronics") },
    { value: "food", label: tr("goods_food") },
    { value: "building_material", label: tr("goods_building") },
    { value: "other", label: tr("goods_other") },
  ];

  const vehicleTypes = [
    { value: "any",          label: tr("vt_any"),          icon: "🚗" },
    { value: "pickup",       label: tr("vt_pickup"),       icon: "🛻" },
    { value: "van",          label: tr("vt_van"),          icon: "🚐" },
    { value: "light_truck",  label: tr("vt_light_truck"),  icon: "🚛" },
    { value: "heavy_truck",  label: tr("vt_heavy_truck"),  icon: "🚚" },
    { value: "refrigerated", label: tr("vt_refrigerated"), icon: "🧊" },
    { value: "flatbed",      label: tr("vt_flatbed"),      icon: "🏗️" },
    { value: "offroad",      label: tr("vt_offroad"),      icon: "🚙" },
    { value: "crane",        label: tr("vt_crane"),        icon: "🏗️" },
    { value: "taxi",         label: tr("vt_taxi"),         icon: "🚕" },
  ];

  const sizes = [
    { value: "small",       label: tr("size_small"),       icon: "📦" },
    { value: "medium",      label: tr("size_medium"),      icon: "📦" },
    { value: "large",       label: tr("size_large"),       icon: "📦" },
    { value: "extra_large", label: tr("size_extra_large"), icon: "📦" },
  ];

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true); setCouponError("");
    const res = await fetch("/api/coupons/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode }),
    });
    const data = await res.json();
    setCheckingCoupon(false);
    if (!res.ok) { setCouponError(data.error); setCoupon(null); }
    else setCoupon(data);
  }

  // Live price estimate
  const priceEstimate = useMemo(() => {
    const w = parseFloat(form.weight);
    if (!form.fromCity || !form.toCity || !w || w <= 0 || form.fromCity === form.toCity) return null;
    return calcPrice(form.fromCity, form.toCity, w, form.size);
  }, [form.fromCity, form.toCity, form.weight, form.size]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    let scheduledAt: string | null = null;
    if (form.isScheduled && form.scheduledDate) {
      scheduledAt = new Date(`${form.scheduledDate}T${form.scheduledTime || "08:00"}`).toISOString();
    }
    const basePrice = priceEstimate ? Math.round((priceEstimate.minPrice + priceEstimate.maxPrice) / 2) : null;
    const finalPrice = basePrice && coupon ? Math.round(basePrice * (1 - coupon.discountPercent / 100)) : basePrice;

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        scheduledAt,
        estimatedPrice: basePrice,
        discountPercent: coupon?.discountPercent ?? null,
        finalPrice,
        fromLat: fromCoords?.lat ?? null,
        fromLng: fromCoords?.lng ?? null,
        toLat: toCoords?.lat ?? null,
        toLng: toCoords?.lng ?? null,
      }),
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
                <button type="button" onClick={() => setShowFromMap(s => !s)}
                  className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 mt-1.5 font-medium transition-colors">
                  <MapPin className="w-3.5 h-3.5" />
                  {showFromMap ? tr("location_selected") : tr("pick_location")}
                  {fromCoords && " ✓"}
                </button>
                {showFromMap && (
                  <div className="mt-2">
                    <MapPicker lat={fromCoords?.lat ?? null} lng={fromCoords?.lng ?? null}
                      label={tr("pickup_location")}
                      onChange={(lat, lng, label) => {
                        setFromCoords({ lat, lng });
                        if (!form.fromAddress) set("fromAddress", label);
                      }} />
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>{tr("to_address")}</label>
                <input value={form.toAddress} onChange={e => set("toAddress", e.target.value)}
                  placeholder={tr("address_placeholder")} className={inputClass} required />
                <button type="button" onClick={() => setShowToMap(s => !s)}
                  className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 mt-1.5 font-medium transition-colors">
                  <MapPin className="w-3.5 h-3.5" />
                  {showToMap ? tr("location_selected") : tr("pick_location")}
                  {toCoords && " ✓"}
                </button>
                {showToMap && (
                  <div className="mt-2">
                    <MapPicker lat={toCoords?.lat ?? null} lng={toCoords?.lng ?? null}
                      label={tr("delivery_location")}
                      onChange={(lat, lng, label) => {
                        setToCoords({ lat, lng });
                        if (!form.toAddress) set("toAddress", label);
                      }} />
                  </div>
                )}
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

          {/* Goods + size + weight section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-sm md:text-base">{tr("goods_section")}</h2>

            {/* Goods type */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 mb-5">
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

            {/* Size */}
            <p className="text-sm font-medium text-gray-700 mb-2">{tr("size_section")}</p>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {sizes.map(s => (
                <button key={s.value} type="button" onClick={() => set("size", s.value)}
                  className={`py-2.5 px-2 rounded-xl border-2 text-xs text-center transition-all font-medium ${
                    form.size === s.value
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Weight */}
            <div className="mb-4">
              <label className={labelClass}>{tr("weight_label")}</label>
              <input type="number" value={form.weight} onChange={e => set("weight", e.target.value)}
                placeholder={tr("weight_placeholder")} min="1" className={inputClass} required />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>
                {tr("description_label")} <span className="text-gray-400 font-normal">{tr("description_optional")}</span>
              </label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                placeholder={tr("description_placeholder")} rows={3}
                className={`${inputClass} resize-none`} />
            </div>
          </div>

          {/* Schedule section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-sm md:text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              {tr("schedule_section")}
            </h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { value: false, label: tr("schedule_now"), icon: "⚡" },
                { value: true,  label: tr("schedule_later"), icon: "📅" },
              ].map(o => (
                <button key={String(o.value)} type="button"
                  onClick={() => setForm(p => ({ ...p, isScheduled: o.value }))}
                  className={`py-3 rounded-xl border-2 text-xs font-medium text-center transition-all ${
                    form.isScheduled === o.value
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="text-base block mb-0.5">{o.icon}</span>
                  {o.label}
                </button>
              ))}
            </div>
            {form.isScheduled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{tr("schedule_date")}</label>
                  <input type="date" value={form.scheduledDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))}
                    className={inputClass} required={form.isScheduled} />
                </div>
                <div>
                  <label className={labelClass}>{tr("schedule_time")}</label>
                  <input type="time" value={form.scheduledTime}
                    onChange={e => setForm(p => ({ ...p, scheduledTime: e.target.value }))}
                    className={inputClass} />
                </div>
              </div>
            )}
          </div>

          {/* Coupon section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3 text-sm md:text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-400" />
              {tr("coupon_section")}
            </h2>
            {coupon ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-700">{coupon.code} — {coupon.discountPercent}% {tr("coupon_discount")}</p>
                  <p className="text-xs text-green-600">{tr("coupon_applied")}</p>
                </div>
                <button type="button" onClick={() => { setCoupon(null); setCouponCode(""); }}
                  className="ms-auto text-xs text-gray-400 hover:text-red-500 transition-colors">✕</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder={tr("coupon_placeholder")}
                  className={`${inputClass} flex-1 uppercase tracking-widest font-mono`} />
                <button type="button" onClick={applyCoupon} disabled={checkingCoupon || !couponCode.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold text-sm px-4 rounded-xl transition-colors shrink-0">
                  {checkingCoupon
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin block" />
                    : tr("coupon_apply")
                  }
                </button>
              </div>
            )}
            {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
          </div>

          {/* Price estimate card */}
          {priceEstimate && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 md:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-orange-700 text-sm">{tr("price_estimate")}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl px-3 py-2.5">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">{tr("distance_label")}</p>
                  <p className="font-bold text-gray-900 text-sm">
                    {priceEstimate.distanceKm.toLocaleString()} {tr("km_suffix")}
                  </p>
                </div>
                <div className="bg-white rounded-xl px-3 py-2.5">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">{tr("price_range")}</p>
                  {coupon ? (
                    <div>
                      <p className="text-xs line-through text-gray-400">
                        {priceEstimate.minPrice.toLocaleString()} – {priceEstimate.maxPrice.toLocaleString()} {tr("dz_suffix")}
                      </p>
                      <p className="font-bold text-green-600 text-sm">
                        {Math.round(priceEstimate.minPrice * (1 - coupon.discountPercent / 100)).toLocaleString()} – {Math.round(priceEstimate.maxPrice * (1 - coupon.discountPercent / 100)).toLocaleString()} {tr("dz_suffix")}
                      </p>
                    </div>
                  ) : (
                    <p className="font-bold text-orange-600 text-sm">
                      {priceEstimate.minPrice.toLocaleString()} – {priceEstimate.maxPrice.toLocaleString()} {tr("dz_suffix")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

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
