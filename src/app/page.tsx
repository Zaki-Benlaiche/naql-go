"use client";
import { useState } from "react";
import Link from "next/link";
import { Truck, Package, Clock, Star, ArrowLeft, ArrowRight, CheckCircle, Menu, X, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { lang, setLang, tr } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const ArrowIcon = lang === "ar" ? ArrowLeft : ArrowRight;

  const steps = [
    { icon: Package, title: tr("step1_title"), desc: tr("step1_desc") },
    { icon: Star,    title: tr("step2_title"), desc: tr("step2_desc") },
    { icon: Clock,   title: tr("step3_title"), desc: tr("step3_desc") },
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
    { value: "48",   label: tr("stat2_label") },
    { value: "2000+",label: tr("stat3_label") },
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

      {/* ── Navbar ── */}
      <nav className="border-b border-gray-100 px-4 md:px-6 py-3.5 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm">
              <Truck className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold text-gray-900">NaqlGo</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-colors">
              <Globe className="w-3.5 h-3.5" />
              {lang === "ar" ? "FR" : "AR"}
            </button>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
              {tr("btn_login")}
            </Link>
            <Link href="/register"
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-5 py-2 rounded-xl transition-colors shadow-sm">
              {tr("btn_start")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 end-0 w-72 h-full bg-white shadow-2xl flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">NaqlGo</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 flex-1">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                {tr("btn_login")}
              </Link>
              <Link href="/register?role=CLIENT" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                {tr("btn_client")}
              </Link>
              <Link href="/register?role=TRANSPORTER" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                {tr("btn_transporter")}
              </Link>
            </div>
            <button onClick={() => { setLang(lang === "ar" ? "fr" : "ar"); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-medium text-sm">
              <Globe className="w-4 h-4" />
              {lang === "ar" ? "Français" : "العربية"}
            </button>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pt-14 md:pt-20 pb-16 md:pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs md:text-sm font-medium px-4 py-2 rounded-full mb-6">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          {tr("tagline")}
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
          {tr("hero_title")}
          <br />
          <span className="text-orange-500">{tr("hero_title2")}</span>
        </h1>
        <p className="text-base md:text-xl text-gray-500 max-w-2xl mx-auto mb-8 md:mb-10 px-2">
          {tr("hero_sub")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
          <Link href="/register?role=CLIENT"
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3.5 md:py-4 rounded-2xl text-base md:text-lg transition-colors flex items-center justify-center gap-2 shadow-md">
            {tr("btn_client")}
            <ArrowIcon className="w-5 h-5" />
          </Link>
          <Link href="/register?role=TRANSPORTER"
            className="w-full sm:w-auto border-2 border-gray-200 hover:border-orange-300 text-gray-700 font-semibold px-7 py-3.5 md:py-4 rounded-2xl text-base md:text-lg transition-colors text-center">
            {tr("btn_transporter")}
          </Link>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-gray-50 py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">{tr("how_title")}</h2>
          <p className="text-gray-500 text-center mb-10 md:mb-14 text-sm md:text-base">{tr("how_sub")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {steps.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 md:w-7 md:h-7 text-orange-500" />
                </div>
                <div className="text-3xl md:text-4xl font-black text-orange-100 mb-2">{i + 1}</div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-14 md:py-20 max-w-6xl mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">{tr("services_title")}</h2>
        <p className="text-gray-500 text-center mb-10 md:mb-14 text-sm md:text-base">{tr("services_sub")}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {services.map((s, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-4 md:p-5 text-center hover:border-orange-200 hover:shadow-sm transition-all">
              <div className="text-2xl md:text-3xl mb-2 md:mb-3">{s.emoji}</div>
              <div className="font-semibold text-gray-800 text-xs md:text-sm">{s.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-orange-500 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center text-white">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="text-2xl md:text-4xl font-black mb-1">{s.value}</div>
              <div className="text-orange-100 text-xs md:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why NaqlGo ── */}
      <section className="py-14 md:py-20 max-w-6xl mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10 md:mb-14">{tr("why_title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-4 p-5 md:p-6 rounded-2xl bg-gray-50">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-gray-900 mb-1 text-sm md:text-base">{f.title}</div>
                <div className="text-gray-500 text-xs md:text-sm leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gray-900 py-16 md:py-20 text-center px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">{tr("cta_title")}</h2>
        <p className="text-gray-400 mb-7 md:mb-8 text-sm md:text-base">{tr("cta_sub")}</p>
        <Link href="/register"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 md:px-10 py-3.5 md:py-4 rounded-2xl text-base md:text-lg transition-colors inline-block shadow-lg">
          {tr("btn_free")}
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-7 text-center text-gray-400 text-sm px-4">
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
