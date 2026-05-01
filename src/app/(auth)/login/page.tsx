"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Globe, MapPin, Package, Zap, Shield, Truck, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { NaqlGoLogo } from "@/components/NaqlGoLogo";

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

        {/* Decorative glows */}
        <div className="absolute top-20 start-20 w-48 h-48 rounded-full bg-[#FF6B00] opacity-[0.06] blur-[80px]" />
        <div className="absolute bottom-20 end-20 w-64 h-64 rounded-full bg-[#2563EB] opacity-[0.05] blur-[100px]" />

        {/* Floating route line */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <svg viewBox="0 0 600 400" className="w-full h-full">
            <path d="M50,200 Q150,80 300,200 Q450,320 550,200"
              stroke="white" strokeWidth="3" fill="none" strokeDasharray="12,8" />
            <circle cx="50" cy="200" r="10" fill="#FF6B00" />
            <circle cx="550" cy="200" r="10" fill="#FF6B00" />
          </svg>
        </div>

        <div className="relative z-10 text-center max-w-md">

          {/* Logo */}
          <div className="flex items-center justify-center mb-14">
            <NaqlGoLogo size="xl" dark />
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
              { icon: MapPin,  text: lang === "ar" ? "تتبع مباشر" : "Suivi en direct",        color: "#2563EB" },
              { icon: Package, text: lang === "ar" ? "عروض فورية" : "Offres instantanées",    color: "#8B5CF6" },
              { icon: Zap,     text: lang === "ar" ? "نقل سريع" : "Transport rapide",          color: "#FF6B00" },
              { icon: Shield,  text: lang === "ar" ? "دفع آمن" : "Paiement sécurisé",          color: "#10B981" },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-2 card-glass px-4 py-2.5 rounded-full">
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-sm text-white font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6 mt-16 w-full max-w-sm">
          {[
            { value: "58", label: lang === "ar" ? "ولاية" : "Wilayas", icon: MapPin, color: "#2563EB" },
            { value: "500+", label: lang === "ar" ? "ناقل" : "Transporteurs", icon: Truck, color: "#FF6B00" },
            { value: "24/7", label: lang === "ar" ? "خدمة" : "Service", icon: Clock, color: "#10B981" },
          ].map(({ value, label, icon: Icon, color }) => (
            <div key={label} className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white/10 flex items-center justify-center">
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — Form ── */}
      <div className="flex-1 flex flex-col" style={{ background: "var(--bg-page)" }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="lg:hidden hover:opacity-90 transition-opacity">
            <NaqlGoLogo size="sm" />
          </Link>
          <div className="ms-auto">
            <button onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
              className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border bg-white text-slate-600 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all"
              style={{ borderColor: "var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
              <Globe className="w-4 h-4" />
              {lang === "ar" ? "FR" : "AR"}
            </button>
          </div>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">

            <div className="mb-8">
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{tr("welcome_back")}</h2>
              <p className="text-sm mt-1.5" style={{ color: "var(--text-secondary)" }}>{tr("login_sub")}</p>
            </div>

            <div className="card-premium p-7" style={{ boxShadow: "var(--shadow-xl)" }}>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                    {tr("identifier_label")}
                  </label>
                  <input
                    type="text" value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={tr("identifier_placeholder")}
                    className="w-full input-premium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                    {tr("password_label")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={tr("password_placeholder")}
                      className="w-full input-premium pe-11"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                    <Shield className="w-4 h-4 shrink-0" />
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

            <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
              {tr("no_account")}{" "}
              <Link href="/register" className="text-[#FF6B00] font-semibold hover:text-[#E65100] transition-colors">
                {tr("register_now")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
