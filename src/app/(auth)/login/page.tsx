"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, Eye, EyeOff, Globe, MapPin, Package, Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang, tr } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { identifier, password, redirect: false });
    setLoading(false);
    if (result?.error) setError(tr("login_error"));
    else router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex" dir={lang === "ar" ? "rtl" : "ltr"}>

      {/* ── Left panel — Branding ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden animated-gradient flex-col items-center justify-center p-12">

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Floating route line */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <svg viewBox="0 0 600 400" className="w-full h-full">
            <path d="M50,200 Q150,80 300,200 Q450,320 550,200"
              stroke="white" strokeWidth="3" fill="none" strokeDasharray="12,8" />
            <circle cx="50" cy="200" r="10" fill="#F97316" />
            <circle cx="550" cy="200" r="10" fill="#F97316" />
          </svg>
        </div>

        <div className="relative z-10 text-center max-w-md">

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/40">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div className="text-start">
              <p className="text-3xl font-bold text-white tracking-tight">NaqlGo</p>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-orange-400" />
                <p className="text-xs text-orange-400 font-medium uppercase tracking-widest">
                  {lang === "ar" ? "نقل البضائع" : "Freight Transport"}
                </p>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            {lang === "ar" ? "منصة النقل الذكي في الجزائر" : "La plateforme de transport intelligente en Algérie"}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-12">
            {lang === "ar"
              ? "اربط تجارتك بأفضل الناقلين في أي ولاية."
              : "Connectez votre commerce aux meilleurs transporteurs."}
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: MapPin,   text: lang === "ar" ? "تتبع مباشر" : "Suivi en direct" },
              { icon: Package,  text: lang === "ar" ? "عروض فورية" : "Offres instantanées" },
              { icon: Zap,      text: lang === "ar" ? "نقل سريع" : "Transport rapide" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-4 py-2">
                <Icon className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-sm text-white font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6 mt-16 w-full max-w-sm">
          {[
            { value: "58", label: lang === "ar" ? "ولاية" : "Wilayas" },
            { value: "500+", label: lang === "ar" ? "ناقل" : "Transporteurs" },
            { value: "24/7", label: lang === "ar" ? "خدمة" : "Service" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — Form ── */}
      <div className="flex-1 flex flex-col bg-[#F0F5FF]">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">NaqlGo</span>
          </Link>
          <div className="ms-auto">
            <button onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
              className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-500 transition-all shadow-sm">
              <Globe className="w-4 h-4" />
              {lang === "ar" ? "FR" : "AR"}
            </button>
          </div>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">{tr("welcome_back")}</h2>
              <p className="text-slate-500 text-sm mt-1">{tr("login_sub")}</p>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(15,23,42,0.10)] border border-slate-100/80 p-7">
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {tr("identifier_label")}
                  </label>
                  <input
                    type="text" value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={tr("identifier_placeholder")}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition bg-slate-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {tr("password_label")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={tr("password_placeholder")}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 pe-11 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition bg-slate-50/50"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full btn-primary disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {tr("logging_in")}</>
                    : tr("login_btn")
                  }
                </button>
              </form>
            </div>

            <p className="text-center text-slate-500 text-sm mt-6">
              {tr("no_account")}{" "}
              <Link href="/register" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                {tr("register_now")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
