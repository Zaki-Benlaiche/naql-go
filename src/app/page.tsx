"use client";
import Link from "next/link";
import { Truck, Package, Clock, Star, ArrowLeft, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { lang, setLang, tr } = useLanguage();

  const steps = [
    { icon: Package, title: tr("step1_title"), desc: tr("step1_desc") },
    { icon: Star, title: tr("step2_title"), desc: tr("step2_desc") },
    { icon: Clock, title: tr("step3_title"), desc: tr("step3_desc") },
  ];

  const services = [
    { emoji: "📦", name: tr("srv1_name"), sub: tr("srv1_sub") },
    { emoji: "🛋️", name: tr("srv2_name"), sub: tr("srv2_sub") },
    { emoji: "🏗️", name: tr("srv3_name"), sub: tr("srv3_sub") },
    { emoji: "🌡️", name: tr("srv4_name"), sub: tr("srv4_sub") },
    { emoji: "🚛", name: tr("srv5_name"), sub: tr("srv5_sub") },
  ];

  const stats = [
    { value: "500+", label: tr("stat1_label") },
    { value: "48", label: tr("stat2_label") },
    { value: "2000+", label: tr("stat3_label") },
    { value: "4.8★", label: tr("stat4_label") },
  ];

  const features = [
    { title: tr("feat1_title"), desc: tr("feat1_desc") },
    { title: tr("feat2_title"), desc: tr("feat2_desc") },
    { title: tr("feat3_title"), desc: tr("feat3_desc") },
    { title: tr("feat4_title"), desc: tr("feat4_desc") },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">NaqlGo</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-colors"
          >
            {lang === "ar" ? "FR" : "AR"}
          </button>
          <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-2">
            {tr("btn_login")}
          </Link>
          <Link
            href="/register"
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-5 py-2 rounded-xl transition-colors"
          >
            {tr("btn_start")}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-medium px-4 py-2 rounded-full mb-6">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          {tr("tagline")}
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          {tr("hero_title")}
          <br />
          <span className="text-orange-500">{tr("hero_title2")}</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">{tr("hero_sub")}</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/register?role=CLIENT"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-colors flex items-center gap-2"
          >
            {tr("btn_client")}
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link
            href="/register?role=TRANSPORTER"
            className="border-2 border-gray-200 hover:border-orange-300 text-gray-700 font-semibold px-8 py-4 rounded-2xl text-lg transition-colors"
          >
            {tr("btn_transporter")}
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">{tr("how_title")}</h2>
          <p className="text-gray-500 text-center mb-14">{tr("how_sub")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-7 h-7 text-orange-500" />
                </div>
                <div className="text-4xl font-black text-orange-100 mb-2">{i + 1}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">{tr("services_title")}</h2>
        <p className="text-gray-500 text-center mb-14">{tr("services_sub")}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map((s, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-5 text-center hover:border-orange-200 hover:shadow-sm transition-all">
              <div className="text-3xl mb-3">{s.emoji}</div>
              <div className="font-semibold text-gray-800 text-sm">{s.name}</div>
              <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-orange-500 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="text-4xl font-black mb-1">{s.value}</div>
              <div className="text-orange-100 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why NaqlGo */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">{tr("why_title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50">
              <CheckCircle className="w-6 h-6 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-gray-900 mb-1">{f.title}</div>
                <div className="text-gray-500 text-sm">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{tr("cta_title")}</h2>
        <p className="text-gray-400 mb-8">{tr("cta_sub")}</p>
        <Link
          href="/register"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-2xl text-lg transition-colors inline-block"
        >
          {tr("btn_free")}
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
            <Truck className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-700">NaqlGo</span>
        </div>
        © 2025 NaqlGo. {tr("copyright")}
      </footer>
    </div>
  );
}
