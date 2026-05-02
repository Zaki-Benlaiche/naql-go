"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Package, Clock, Star, ArrowLeft, ArrowRight, CheckCircle, Menu, X, Globe,
  Truck, Sofa, HardHat, Thermometer, Container, Shield, MapPin, Zap,
  Phone, Mail, ChevronRight, Sparkles, Download, Smartphone, Apple,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { NaqlGoLogo } from "@/components/NaqlGoLogo";

export default function Home() {
  const { lang, setLang, tr } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const ArrowIcon = lang === "ar" ? ArrowLeft : ArrowRight;

  const steps = [
    { icon: Package, title: tr("step1_title"), desc: tr("step1_desc"), color: "service-icon-orange" },
    { icon: Star,    title: tr("step2_title"), desc: tr("step2_desc"), color: "service-icon-blue" },
    { icon: Clock,   title: tr("step3_title"), desc: tr("step3_desc"), color: "service-icon-green" },
  ];

  const services = [
    { icon: Package,     name: tr("srv1_name"), sub: tr("srv1_sub"), color: "service-icon-orange" },
    { icon: Sofa,        name: tr("srv2_name"), sub: tr("srv2_sub"), color: "service-icon-blue" },
    { icon: HardHat,     name: tr("srv3_name"), sub: tr("srv3_sub"), color: "service-icon-yellow" },
    { icon: Thermometer, name: tr("srv4_name"), sub: tr("srv4_sub"), color: "service-icon-red" },
    { icon: Container,   name: tr("srv5_name"), sub: tr("srv5_sub"), color: "service-icon-navy" },
  ];

  const stats = [
    { value: "500+", label: tr("stat1_label"), icon: Truck },
    { value: "48",   label: tr("stat2_label"), icon: MapPin },
    { value: "2000+",label: tr("stat3_label"), icon: Package },
    { value: "4.8★", label: tr("stat4_label"), icon: Star },
  ];

  const features = [
    { title: tr("feat1_title"), desc: tr("feat1_desc"), icon: Shield },
    { title: tr("feat2_title"), desc: tr("feat2_desc"), icon: Zap },
    { title: tr("feat3_title"), desc: tr("feat3_desc"), icon: MapPin },
    { title: tr("feat4_title"), desc: tr("feat4_desc"), icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="border-b border-gray-100/80 px-4 md:px-6 py-3.5 sticky top-0 bg-white/90 backdrop-blur-xl z-50"
        style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.03)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <NaqlGoLogo size="sm" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all">
              <Globe className="w-3.5 h-3.5" />
              {lang === "ar" ? "FR" : "AR"}
            </button>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">
              {tr("btn_login")}
            </Link>
            <Link href="/register"
              className="btn-primary text-white font-medium text-sm px-5 py-2 rounded-xl inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
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

      {/* ── Mobile menu overlay ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 end-0 w-72 h-full bg-white shadow-2xl flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
              <NaqlGoLogo size="sm" />
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1 flex-1">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                {tr("btn_login")}
              </Link>
              <Link href="/register?role=CLIENT" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-[#FFF7ED] hover:text-[#FF6B00] font-medium transition-colors">
                <Package className="w-4 h-4" />
                {tr("btn_client")}
              </Link>
              <Link href="/register?role=TRANSPORTER" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-[#EFF6FF] hover:text-[#2563EB] font-medium transition-colors">
                <Truck className="w-4 h-4" />
                {tr("btn_transporter")}
              </Link>
            </div>
            <button onClick={() => { setLang(lang === "ar" ? "fr" : "ar"); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-medium text-sm transition-colors">
              <Globe className="w-4 h-4" />
              {lang === "ar" ? "Français" : "العربية"}
            </button>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="hero-bg">
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-20 md:pb-32 text-center relative">
          {/* Tagline badge */}
          <div className="inline-flex items-center gap-2 bg-white text-[#FF6B00] text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full mb-7 animate-slide-up"
            style={{ boxShadow: "0 2px 12px rgba(255,107,0,0.12), 0 0 0 1px rgba(255,107,0,0.08)" }}>
            <span className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse-glow" />
            {tr("tagline")}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-[3.5rem] font-bold text-[#0F172A] leading-[1.15] mb-6 animate-slide-up delay-100">
            {tr("hero_title")}
            <br />
            <span className="gradient-text">{tr("hero_title2")}</span>
          </h1>

          <p className="text-base md:text-xl text-[#64748B] max-w-2xl mx-auto mb-10 md:mb-12 px-2 animate-slide-up delay-200 leading-relaxed">
            {tr("hero_sub")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 animate-slide-up delay-300">
            <Link href="/register?role=CLIENT"
              className="w-full sm:w-auto btn-primary text-white font-semibold px-8 py-4 rounded-2xl text-base md:text-lg flex items-center justify-center gap-2.5">
              <Package className="w-5 h-5" />
              {tr("btn_client")}
              <ArrowIcon className="w-5 h-5" />
            </Link>
            <Link href="/register?role=TRANSPORTER"
              className="w-full sm:w-auto btn-secondary text-[#0F172A] font-semibold px-8 py-4 rounded-2xl text-base md:text-lg flex items-center justify-center gap-2.5">
              <Truck className="w-5 h-5 text-[#FF6B00]" />
              {tr("btn_transporter")}
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-10 animate-slide-up delay-400">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Shield className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{lang === "ar" ? "آمن 100%" : "100% Sécurisé"}</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Zap className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>{lang === "ar" ? "تسجيل مجاني" : "Inscription gratuite"}</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#64748B]">
              <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{lang === "ar" ? "كل الولايات" : "Toutes les wilayas"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="badge badge-orange mb-4 inline-flex">
              <Sparkles className="w-3 h-3" />
              {lang === "ar" ? "سهل وبسيط" : "Simple et facile"}
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#0F172A] mb-3">{tr("how_title")}</h2>
            <p className="text-[#64748B] text-sm md:text-base max-w-lg mx-auto">{tr("how_sub")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            {steps.map((step, i) => (
              <div key={i} className="card-premium p-7 md:p-8 text-center group">
                <div className={`service-icon ${step.color} mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="text-5xl font-black mb-3"
                  style={{ color: "rgba(255,107,0,0.08)" }}>
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">{step.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-16 md:py-24" style={{ background: "var(--bg-page)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="badge badge-blue mb-4 inline-flex">
              <Truck className="w-3 h-3" />
              {lang === "ar" ? "خدماتنا" : "Nos services"}
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#0F172A] mb-3">{tr("services_title")}</h2>
            <p className="text-[#64748B] text-sm md:text-base max-w-lg mx-auto">{tr("services_sub")}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {services.map((s, i) => (
              <div key={i}
                className="card-premium p-5 md:p-6 text-center group cursor-pointer"
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`service-icon ${s.color} mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="font-semibold text-[#0F172A] text-xs md:text-sm">{s.name}</div>
                <div className="text-xs text-[#94A3B8] mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-gradient py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center text-white relative z-10">
          {stats.map((s, i) => (
            <div key={i} className="group">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-black mb-1">{s.value}</div>
              <div className="text-orange-100 text-xs md:text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why NaqlGo ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="badge badge-green mb-4 inline-flex">
              <CheckCircle className="w-3 h-3" />
              {lang === "ar" ? "لماذا نحن؟" : "Pourquoi nous?"}
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#0F172A]">{tr("why_title")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {features.map((f, i) => (
              <div key={i}
                className="flex items-start gap-4 p-6 rounded-2xl transition-all hover:shadow-md group"
                style={{ background: "var(--bg-page)" }}>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-[#FF6B00]" />
                </div>
                <div>
                  <div className="font-bold text-[#0F172A] mb-1 text-sm md:text-base">{f.title}</div>
                  <div className="text-[#64748B] text-xs md:text-sm leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Download App ── */}
      <section className="py-16 md:py-24" style={{ background: "var(--bg-page)" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <span className="badge badge-orange mb-4 inline-flex">
              <Smartphone className="w-3 h-3" />
              {lang === "ar" ? "حمّل التطبيق" : "Télécharger l'app"}
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#0F172A] mb-3">
              {lang === "ar" ? "حمّل تطبيق NaqlGo على هاتفك" : "Téléchargez NaqlGo sur votre téléphone"}
            </h2>
            <p className="text-[#64748B] text-sm md:text-base max-w-lg mx-auto">
              {lang === "ar"
                ? "استمتع بتجربة أسرع وأسهل عبر التطبيق المخصص لهاتفك"
                : "Profitez d'une expérience plus rapide et plus fluide avec l'app dédiée"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Android — active */}
            <a href="/naqlgo.apk" download="NaqlGo.apk"
              className="group card-premium p-6 md:p-8 flex items-center gap-5 hover:border-[#FF6B00] hover:shadow-xl transition-all">
              <div className="w-16 h-16 md:w-18 md:h-18 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#E05000] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0 text-start">
                <div className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-widest mb-1">
                  {lang === "ar" ? "متوفر الآن" : "Disponible maintenant"}
                </div>
                <div className="text-lg md:text-xl font-bold text-[#0F172A] mb-0.5">
                  {lang === "ar" ? "تنزيل لـ Android" : "Télécharger pour Android"}
                </div>
                <div className="text-xs md:text-sm text-[#64748B]">
                  {lang === "ar" ? "ملف APK • v1.3.0 • 33 ميجابايت" : "APK • v1.3.0 • 33 Mo"}
                </div>
              </div>
              <Download className="w-6 h-6 text-[#FF6B00] group-hover:scale-125 transition-transform shrink-0" />
            </a>

            {/* iOS — coming soon */}
            <div className="card-premium p-6 md:p-8 flex items-center gap-5 opacity-60 cursor-not-allowed">
              <div className="w-16 h-16 md:w-18 md:h-18 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shrink-0">
                <Apple className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0 text-start">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {lang === "ar" ? "قريباً" : "Bientôt"}
                </div>
                <div className="text-lg md:text-xl font-bold text-[#0F172A] mb-0.5">
                  {lang === "ar" ? "تنزيل لـ iPhone" : "Télécharger pour iPhone"}
                </div>
                <div className="text-xs md:text-sm text-[#64748B]">
                  {lang === "ar" ? "App Store — قيد التطوير" : "App Store — en développement"}
                </div>
              </div>
            </div>
          </div>

          {/* Install hint */}
          <div className="mt-8 max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xs md:text-sm text-amber-900 leading-relaxed">
              <span className="font-bold">{lang === "ar" ? "تنبيه: " : "Note : "}</span>
              {lang === "ar"
                ? "بعد التنزيل، فعّل خيار «السماح بالتثبيت من مصادر غير معروفة» في إعدادات هاتفك ثم اضغط على الملف لبدء التثبيت."
                : "Après le téléchargement, activez « Autoriser les sources inconnues » dans les paramètres de votre téléphone, puis appuyez sur le fichier pour l'installer."}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="animated-gradient py-20 md:py-28 text-center px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-10 start-10 w-20 h-20 rounded-full bg-[#FF6B00] opacity-10 blur-3xl" />
        <div className="absolute bottom-10 end-10 w-32 h-32 rounded-full bg-[#2563EB] opacity-10 blur-3xl" />

        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#E65100] flex items-center justify-center shadow-2xl animate-float">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">{tr("cta_title")}</h2>
          <p className="text-slate-400 mb-8 text-sm md:text-lg max-w-md mx-auto">{tr("cta_sub")}</p>
          <Link href="/register"
            className="btn-primary text-white font-bold px-10 py-4 rounded-2xl text-base md:text-lg inline-flex items-center gap-2.5">
            <Sparkles className="w-5 h-5" />
            {tr("btn_free")}
            <ArrowIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0A1628] py-10 md:py-14 text-center px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <NaqlGoLogo size="sm" dark />
          </div>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            {lang === "ar"
              ? "منصة النقل والشحن الرائدة في الجزائر — اربط بضائعك بأفضل الناقلين."
              : "La plateforme leader de transport en Algérie — connectez vos marchandises aux meilleurs transporteurs."}
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <a href="tel:+213000000000" className="flex items-center gap-2 text-slate-400 hover:text-[#FF6B00] text-sm transition-colors">
              <Phone className="w-4 h-4" />
              <span>+213 000 000 000</span>
            </a>
            <span className="text-slate-700">|</span>
            <a href="mailto:contact@naqlgo.com" className="flex items-center gap-2 text-slate-400 hover:text-[#FF6B00] text-sm transition-colors">
              <Mail className="w-4 h-4" />
              <span>contact@naqlgo.com</span>
            </a>
          </div>
          <div className="border-t border-slate-800 pt-6">
            <p className="text-slate-600 text-xs">
              © 2025 NaqlGo. {tr("copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
