"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package, Clock, Star, ArrowLeft, ArrowRight, CheckCircle, Menu, X, Globe,
  Truck, Sofa, HardHat, Thermometer, Container, Shield, MapPin, Zap,
  Phone, Mail, Sparkles, Download, Smartphone, Apple,
  TrendingUp, ChevronRight, ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { NaqlGoLogo } from "@/components/NaqlGoLogo";

export default function Home() {
  const { lang, setLang, tr } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const ArrowIcon = lang === "ar" ? ArrowLeft : ArrowRight;
  const isRTL = lang === "ar";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!registerOpen) return;
    const close = () => setRegisterOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [registerOpen]);

  const navLinks = [
    { href: "#how",       label: isRTL ? "كيف يعمل"  : "Comment ça marche" },
    { href: "#services",  label: isRTL ? "الخدمات"   : "Services" },
    { href: "#platform",  label: isRTL ? "المنصة"    : "Plateforme" },
    { href: "#download",  label: isRTL ? "التطبيق"   : "Application" },
  ];

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

  const features = [
    { title: tr("feat1_title"), desc: tr("feat1_desc"), icon: Shield },
    { title: tr("feat2_title"), desc: tr("feat2_desc"), icon: Zap },
    { title: tr("feat3_title"), desc: tr("feat3_desc"), icon: MapPin },
    { title: tr("feat4_title"), desc: tr("feat4_desc"), icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/85 backdrop-blur-2xl border-b border-gray-200/60 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)]"
            : "bg-white/60 backdrop-blur-xl border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14" : "h-16 md:h-[68px]"}`}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="transition-transform group-hover:scale-[1.03]">
                <NaqlGoLogo size="sm" />
              </div>
            </Link>

            {/* Desktop nav links — pill style */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-50/80 border border-gray-100 rounded-full px-1.5 py-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium text-gray-600 hover:text-[#0F172A] hover:bg-white hover:shadow-sm px-4 py-2 rounded-full transition-all"
                >
                  {l.label}
                </a>
              ))}
            </div>

            {/* Desktop right actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Language pill */}
              <button
                onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
                className="group relative flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-[#FF6B00]/40 hover:text-[#FF6B00] hover:bg-orange-50/50 transition-all"
                aria-label={lang === "ar" ? "Switch to French" : "التبديل إلى العربية"}
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="tracking-wider">{lang === "ar" ? "FR" : "AR"}</span>
              </button>

              {/* Login */}
              <Link
                href="/login"
                className="text-gray-700 hover:text-[#0F172A] font-semibold text-sm px-4 py-2 rounded-xl hover:bg-gray-100/70 transition-all"
              >
                {tr("btn_login")}
              </Link>

              {/* Register dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setRegisterOpen((v) => !v)}
                  className="btn-primary text-white font-semibold text-sm pl-4 pr-3 py-2 rounded-xl inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {tr("btn_start")}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${registerOpen ? "rotate-180" : ""}`} />
                </button>

                {registerOpen && (
                  <div
                    className="absolute top-full end-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 animate-slide-up overflow-hidden"
                    style={{ boxShadow: "0 20px 50px -12px rgba(15,23,42,0.18), 0 0 0 1px rgba(15,23,42,0.04)" }}
                  >
                    <Link
                      href="/register?role=CLIENT"
                      onClick={() => setRegisterOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors group/item"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                        <Package className="w-4 h-4 text-[#FF6B00]" />
                      </div>
                      <div className="text-start min-w-0">
                        <div className="font-bold text-sm text-[#0F172A]">{tr("btn_client")}</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                          {isRTL ? "اطلب نقل شحنتك" : "Commander un transport"}
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/register?role=TRANSPORTER"
                      onClick={() => setRegisterOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group/item"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                        <Truck className="w-4 h-4 text-[#2563EB]" />
                      </div>
                      <div className="text-start min-w-0">
                        <div className="font-bold text-sm text-[#0F172A]">{tr("btn_transporter")}</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                          {isRTL ? "اربح المزيد كناقل" : "Gagnez plus en livrant"}
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu overlay ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-0 end-0 w-[85%] max-w-sm h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* Mobile menu header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <NaqlGoLogo size="sm" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile nav links */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-3 mb-2">
                {isRTL ? "تصفّح" : "Navigation"}
              </div>
              <nav className="space-y-0.5 mb-6">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
                  >
                    <span>{l.label}</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 ${isRTL ? "rotate-180" : ""}`} />
                  </a>
                ))}
              </nav>

              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-3 mb-2">
                {isRTL ? "ابدأ الآن" : "Commencer"}
              </div>
              <div className="space-y-2">
                <Link
                  href="/register?role=CLIENT"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-orange-50/50 hover:bg-orange-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-[#FF6B00]" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0F172A]">{tr("btn_client")}</div>
                    <div className="text-[11px] text-gray-500">{isRTL ? "اطلب نقل" : "Commander"}</div>
                  </div>
                </Link>
                <Link
                  href="/register?role=TRANSPORTER"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0F172A]">{tr("btn_transporter")}</div>
                    <div className="text-[11px] text-gray-500">{isRTL ? "كن ناقلاً" : "Devenir transporteur"}</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Mobile menu footer */}
            <div className="border-t border-gray-100 p-4 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center bg-gray-50 hover:bg-gray-100 text-[#0F172A] font-semibold text-sm py-3 rounded-xl transition-colors"
              >
                {tr("btn_login")}
              </Link>
              <button
                onClick={() => { setLang(lang === "ar" ? "fr" : "ar"); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-[#FF6B00] hover:bg-orange-50/50 font-medium text-sm py-2.5 rounded-xl transition-colors"
              >
                <Globe className="w-4 h-4" />
                {lang === "ar" ? "Français" : "العربية"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          HERO — Centered
          ════════════════════════════════════════════════════ */}
      <section className="hero-bg relative">
        {/* Floating decorative blobs */}
        <div className="absolute top-20 start-10 w-72 h-72 bg-[#FF6B00] opacity-[0.08] blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-10 end-20 w-96 h-96 bg-[#2563EB] opacity-[0.06] blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-20 md:pb-28 text-center relative">
          {/* Tagline badge */}
          <div className="inline-flex items-center gap-2 bg-white text-[#FF6B00] text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full mb-7 animate-slide-up"
            style={{ boxShadow: "0 2px 12px rgba(255,107,0,0.12), 0 0 0 1px rgba(255,107,0,0.08)" }}>
            <span className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse-glow" />
            {tr("tagline")}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#0F172A] leading-[1.15] mb-6 animate-slide-up delay-100">
            {tr("hero_title")}
            <br />
            <span className="gradient-text">{tr("hero_title2")}</span>
          </h1>

          <p className="text-base md:text-xl text-[#64748B] max-w-2xl mx-auto mb-10 px-2 animate-slide-up delay-200 leading-relaxed">
            {tr("hero_sub")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 animate-slide-up delay-300">
            <Link href="/register?role=CLIENT"
              className="w-full sm:w-auto btn-primary text-white font-semibold px-7 py-4 rounded-2xl text-base md:text-lg flex items-center justify-center gap-2.5">
              <Package className="w-5 h-5" />
              {tr("btn_client")}
              <ArrowIcon className="w-5 h-5" />
            </Link>
            <Link href="/register?role=TRANSPORTER"
              className="w-full sm:w-auto btn-secondary text-[#0F172A] font-semibold px-7 py-4 rounded-2xl text-base md:text-lg flex items-center justify-center gap-2.5">
              <Truck className="w-5 h-5 text-[#FF6B00]" />
              {tr("btn_transporter")}
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-10 animate-slide-up delay-400">
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-[#64748B]">
              <Shield className="w-4 h-4 text-[#10B981]" />
              <span>{isRTL ? "آمن 100%" : "100% Sécurisé"}</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-[#64748B]">
              <Zap className="w-4 h-4 text-[#FF6B00]" />
              <span>{isRTL ? "تسجيل مجاني" : "Inscription gratuite"}</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5 text-xs md:text-sm text-[#64748B]">
              <MapPin className="w-4 h-4 text-[#2563EB]" />
              <span>{isRTL ? "كل الولايات" : "Toutes les wilayas"}</span>
            </div>
          </div>

        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* ════════════════════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════════════════════ */}
      <section id="how" className="py-16 md:py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="badge badge-orange mb-4 inline-flex">
              <Sparkles className="w-3 h-3" />
              {isRTL ? "سهل وبسيط" : "Simple et facile"}
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#0F172A] mb-3">{tr("how_title")}</h2>
            <p className="text-[#64748B] text-sm md:text-base max-w-lg mx-auto">{tr("how_sub")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 relative">
            {/* Connecting dotted line for desktop */}
            <div className="hidden md:block absolute top-20 start-[16%] end-[16%] h-px border-t-2 border-dashed border-orange-200 -z-0" />

            {steps.map((step, i) => (
              <div key={i} className="card-premium p-7 md:p-8 text-center group relative bg-white">
                <div className="absolute top-4 end-4 w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E65100] text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {i + 1}
                </div>
                <div className={`service-icon ${step.color} mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">{step.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SERVICES
          ════════════════════════════════════════════════════ */}
      <section id="services" className="py-16 md:py-24" style={{ background: "var(--bg-page)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="badge badge-blue mb-4 inline-flex">
              <Truck className="w-3 h-3" />
              {isRTL ? "خدماتنا" : "Nos services"}
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

      {/* ════════════════════════════════════════════════════
          PLATFORM SHOWCASE — Web + Mobile (NAQL1.png)
          ════════════════════════════════════════════════════ */}
      <section id="platform" className="py-16 md:py-28 bg-white relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(15,23,42,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Image side */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#FF6B00]/10 via-transparent to-[#2563EB]/10 blur-3xl rounded-[3rem]" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-white to-orange-50/30 border border-orange-100/50">
                <Image
                  src="/NAQL1.png"
                  alt="NaqlGo Web & Mobile platform"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>

            </div>

            {/* Text side */}
            <div className="order-1 lg:order-2">
              <span className="badge badge-orange mb-4 inline-flex">
                <Smartphone className="w-3 h-3" />
                {isRTL ? "ويب + موبايل" : "Web + Mobile"}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F172A] leading-tight mb-5">
                {isRTL ? (
                  <>تجربة موحّدة على <span className="gradient-text">كل الأجهزة</span></>
                ) : (
                  <>Une expérience unifiée sur <span className="gradient-text">tous vos appareils</span></>
                )}
              </h2>
              <p className="text-base md:text-lg text-[#64748B] leading-relaxed mb-8">
                {isRTL
                  ? "إدارة كاملة لطلباتك من المتصفح، وتتبّع مباشر من تطبيق هاتفك. لوحة تحكم احترافية، إحصائيات لحظية، ومزامنة فورية بين كل أجهزتك."
                  : "Gérez vos commandes depuis le web et suivez vos livraisons depuis votre mobile. Tableau de bord professionnel, statistiques en temps réel et synchronisation instantanée."}
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: TrendingUp, title: isRTL ? "إحصائيات لحظية" : "Statistiques en temps réel", desc: isRTL ? "تابع أرباحك ونشاطك بالأرقام" : "Suivez vos revenus et activités en chiffres" },
                  { icon: MapPin,     title: isRTL ? "تتبع GPS مباشر" : "Suivi GPS en direct",       desc: isRTL ? "اعرف مكان شحنتك في كل لحظة" : "Localisez votre colis à chaque instant" },
                  { icon: Shield,     title: isRTL ? "حماية وأمان" : "Sécurité maximale",            desc: isRTL ? "بياناتك ومعاملاتك في أمان تام" : "Vos données et paiements protégés" },
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <b.icon className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <div>
                      <div className="font-bold text-[#0F172A] mb-0.5">{b.title}</div>
                      <div className="text-sm text-[#64748B]">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/register"
                className="btn-primary text-white font-semibold px-7 py-3.5 rounded-2xl text-base inline-flex items-center gap-2.5">
                {isRTL ? "ابدأ مجاناً الآن" : "Commencer gratuitement"}
                <ArrowIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          WHY NAQLGO
          ════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="badge badge-green mb-4 inline-flex">
              <CheckCircle className="w-3 h-3" />
              {isRTL ? "لماذا نحن؟" : "Pourquoi nous?"}
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#0F172A]">{tr("why_title")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {features.map((f, i) => (
              <div key={i}
                className="flex items-start gap-4 p-6 rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5 group border border-transparent hover:border-orange-100"
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

      {/* ════════════════════════════════════════════════════
          DOWNLOAD APP — using NAQL2.png
          ════════════════════════════════════════════════════ */}
      <section id="download" className="py-16 md:py-28 relative overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#0F1D36] to-[#142240] text-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 start-0 w-96 h-96 bg-[#FF6B00] opacity-20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 end-0 w-96 h-96 bg-[#2563EB] opacity-15 blur-3xl rounded-full" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">

            {/* Text side */}
            <div className="text-center lg:text-start">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-orange-300 text-xs font-semibold px-4 py-2 rounded-full mb-5">
                <Smartphone className="w-3 h-3" />
                {isRTL ? "حمّل التطبيق" : "Télécharger l'app"}
              </span>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-5">
                {isRTL ? (
                  <>NaqlGo في <span className="gradient-text">جيبك</span><br />أينما كنت</>
                ) : (
                  <>NaqlGo dans votre <span className="gradient-text">poche</span><br />où que vous soyez</>
                )}
              </h2>

              <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                {isRTL
                  ? "حمّل التطبيق على هاتفك واستمتع بتجربة أسرع وأسهل. اطلب نقل، تابع شحنتك، وتحدث مع الناقل مباشرة."
                  : "Téléchargez l'application sur votre mobile pour une expérience plus rapide. Commandez, suivez et discutez en direct avec votre transporteur."}
              </p>

              {/* Download buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                <a href="/naqlgo.apk" download="NaqlGo.apk"
                  className="group flex items-center gap-3 bg-white text-[#0F172A] hover:bg-orange-50 transition-all px-5 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  <Smartphone className="w-7 h-7 text-[#FF6B00]" />
                  <div className="text-start">
                    <div className="text-[10px] uppercase tracking-widest text-[#64748B] font-bold">
                      {isRTL ? "متوفر على" : "Disponible sur"}
                    </div>
                    <div className="text-base font-bold leading-tight">Google Play / APK</div>
                  </div>
                  <Download className="w-5 h-5 text-[#FF6B00] ms-2 group-hover:scale-110 transition-transform" />
                </a>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 text-white px-5 py-3.5 rounded-2xl opacity-70 cursor-not-allowed">
                  <Apple className="w-7 h-7" />
                  <div className="text-start">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      {isRTL ? "قريباً على" : "Bientôt sur"}
                    </div>
                    <div className="text-base font-bold leading-tight">App Store</div>
                  </div>
                </div>
              </div>

              {/* Install hint */}
              <div className="mt-2 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-start">
                <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs md:text-sm text-amber-100/90 leading-relaxed">
                  <span className="font-bold">{isRTL ? "تنبيه: " : "Note : "}</span>
                  {isRTL
                    ? "بعد التنزيل، فعّل «السماح بمصادر غير معروفة» في إعدادات هاتفك."
                    : "Après le téléchargement, activez « Sources inconnues » dans les paramètres."}
                </div>
              </div>
            </div>

            {/* Image side */}
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-[#FF6B00]/30 via-[#2563EB]/20 to-transparent blur-3xl rounded-full" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white">
                <Image
                  src="/NAQL2.png"
                  alt="NaqlGo App Mobile & Web"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FINAL CTA
          ════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 text-center px-4 relative overflow-hidden bg-gradient-to-br from-[#FFF7ED] via-white to-[#FFEDD5]">
        {/* Decorative */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #FF6B00 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#E65100] flex items-center justify-center shadow-2xl animate-float">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0F172A] mb-4">{tr("cta_title")}</h2>
          <p className="text-[#64748B] mb-10 text-base md:text-lg max-w-md mx-auto">{tr("cta_sub")}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register"
              className="w-full sm:w-auto btn-primary text-white font-bold px-10 py-4 rounded-2xl text-base md:text-lg inline-flex items-center justify-center gap-2.5">
              <Sparkles className="w-5 h-5" />
              {tr("btn_free")}
              <ArrowIcon className="w-5 h-5" />
            </Link>
            <Link href="/login"
              className="w-full sm:w-auto bg-white border-2 border-gray-200 hover:border-[#FF6B00] hover:text-[#FF6B00] text-[#0F172A] font-bold px-10 py-4 rounded-2xl text-base md:text-lg inline-flex items-center justify-center gap-2.5 transition-all">
              {tr("btn_login")}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <p className="text-xs text-[#94A3B8] mt-6">
            {isRTL ? "✓ بدون بطاقة ائتمان   ✓ تسجيل في 30 ثانية   ✓ إلغاء في أي وقت" : "✓ Sans carte bancaire   ✓ Inscription en 30s   ✓ Annulation à tout moment"}
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════ */}
      <footer className="bg-[#0A1628] py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-slate-800">
            {/* Brand col */}
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4">
                <NaqlGoLogo size="sm" dark />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                {isRTL
                  ? "منصة النقل والشحن الرائدة في الجزائر."
                  : "La plateforme leader de transport en Algérie."}
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">{isRTL ? "المنصة" : "Plateforme"}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#how" className="text-slate-400 hover:text-[#FF6B00] transition-colors">{isRTL ? "كيف يعمل" : "Comment ça marche"}</a></li>
                <li><a href="#services" className="text-slate-400 hover:text-[#FF6B00] transition-colors">{isRTL ? "الخدمات" : "Services"}</a></li>
                <li><a href="#download" className="text-slate-400 hover:text-[#FF6B00] transition-colors">{isRTL ? "التطبيق" : "Application"}</a></li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">{isRTL ? "الحساب" : "Compte"}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/login" className="text-slate-400 hover:text-[#FF6B00] transition-colors">{tr("btn_login")}</Link></li>
                <li><Link href="/register?role=CLIENT" className="text-slate-400 hover:text-[#FF6B00] transition-colors">{isRTL ? "حساب عميل" : "Compte client"}</Link></li>
                <li><Link href="/register?role=TRANSPORTER" className="text-slate-400 hover:text-[#FF6B00] transition-colors">{isRTL ? "حساب ناقل" : "Compte transporteur"}</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">{isRTL ? "تواصل معنا" : "Contact"}</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="tel:+213000000000" className="flex items-center gap-2 text-slate-400 hover:text-[#FF6B00] transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>+213 000 000 000</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:contact@naqlgo.com" className="flex items-center gap-2 text-slate-400 hover:text-[#FF6B00] transition-colors">
                    <Mail className="w-4 h-4" />
                    <span>contact@naqlgo.com</span>
                  </a>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>{isRTL ? "الجزائر العاصمة" : "Alger, Algérie"}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-start">
            <p className="text-slate-600 text-xs">
              © 2025 NaqlGo. {tr("copyright")}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>{isRTL ? "🇩🇿 صُنع في الجزائر" : "🇩🇿 Fait en Algérie"}</span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                {isRTL ? "آمن ومشفّر" : "Sécurisé & chiffré"}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
