"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ArrowRight } from "lucide-react";
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
  const { tr } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fromCity: "",
    toCity: "",
    fromAddress: "",
    toAddress: "",
    goodsType: "",
    weight: "",
    description: "",
  });

  const goodsTypes = [
    { value: "packages", label: tr("goods_packages") },
    { value: "furniture", label: tr("goods_furniture") },
    { value: "electronics", label: tr("goods_electronics") },
    { value: "food", label: tr("goods_food") },
    { value: "building_material", label: tr("goods_building") },
    { value: "other", label: tr("goods_other") },
  ];

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

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

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/client" className="text-gray-400 hover:text-gray-600">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tr("new_request_title")}</h1>
            <p className="text-gray-500 text-sm">{tr("new_request_sub")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Route */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">{tr("route_section")}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tr("from_city")}</label>
                <select
                  value={form.fromCity}
                  onChange={(e) => set("fromCity", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  required
                >
                  <option value="">{tr("select_wilaya")}</option>
                  {wilayas.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tr("to_city")}</label>
                <select
                  value={form.toCity}
                  onChange={(e) => set("toCity", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  required
                >
                  <option value="">{tr("select_wilaya")}</option>
                  {wilayas.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tr("from_address")}</label>
                <input
                  value={form.fromAddress}
                  onChange={(e) => set("fromAddress", e.target.value)}
                  placeholder={tr("address_placeholder")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tr("to_address")}</label>
                <input
                  value={form.toAddress}
                  onChange={(e) => set("toAddress", e.target.value)}
                  placeholder={tr("address_placeholder")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                />
              </div>
            </div>
          </div>

          {/* Goods */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">{tr("goods_section")}</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {goodsTypes.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => set("goodsType", g.value)}
                  className={`p-3 rounded-xl border-2 text-sm text-center transition-all ${
                    form.goodsType === g.value
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tr("weight_label")}</label>
              <input
                type="number"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
                placeholder={tr("weight_placeholder")}
                min="1"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tr("description_label")} <span className="text-gray-400 font-normal">{tr("description_optional")}</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder={tr("description_placeholder")}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <button
            type="submit"
            disabled={loading || !form.goodsType}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 rounded-2xl transition-colors"
          >
            {loading ? tr("publishing") : tr("publish_btn")}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
