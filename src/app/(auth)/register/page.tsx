"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Truck, Package, Globe, Shield, User, Phone, Mail, Lock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { NaqlGoLogo } from "@/components/NaqlGoLogo";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "CLIENT";
  const { lang, setLang, tr } = useLanguage();

  const [role, setRole] = useState<"CLIENT" | "TRANSPORTER">(defaultRole as "CLIENT" | "TRANSPORTER");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || tr("error_occurred")); setLoading(false); return; }
    await signIn("credentials", { identifier: phone, password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-page)" }}>
      {/* Language toggle – top corner */}
      <div className="fixed top-4 end-4 z-10">
        <button
          onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border bg-white text-slate-600 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all"
          style={{ borderColor: "var(--border-light)", boxShadow: "var(--shadow-sm)" }}
        >
          <Globe className="w-4 h-4" />
          {lang === "ar" ? "FR" : "AR"}
        </button>
      </div>

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-5 hover:opacity-90 transition-opacity">
            <NaqlGoLogo size="lg" />
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{tr("create_account")}</h1>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { value: "CLIENT", label: tr("role_client"), sub: tr("role_client_sub"), icon: Package, color: "#FF6B00" },
            { value: "TRANSPORTER", label: tr("role_transporter"), sub: tr("role_transporter_sub"), icon: Truck, color: "#2563EB" },
          ].map(({ value, label, sub, icon: Icon, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value as "CLIENT" | "TRANSPORTER")}
              className={`p-4 rounded-2xl border-2 text-center transition-all group ${
                role === value
                  ? "border-[#FF6B00] bg-[#FFF7ED]"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
              style={role === value ? { boxShadow: "0 4px 16px rgba(255,107,0,0.12)" } : {}}
            >
              <div className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                role === value ? "bg-[#FF6B00]/10" : "bg-slate-100"
              }`}>
                <Icon className="w-5 h-5" style={{ color: role === value ? color : "#94A3B8" }} />
              </div>
              <p className={`font-semibold text-sm ${role === value ? "text-[#FF6B00]" : "text-slate-600"}`}>
                {label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </button>
          ))}
        </div>

        <div className="card-premium p-7" style={{ boxShadow: "var(--shadow-xl)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                <User className="w-3.5 h-3.5 text-[#64748B]" />
                {tr("full_name")}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tr("name_placeholder")}
                className="w-full input-premium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                {tr("phone_label")}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="w-full input-premium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                {tr("email_label")} <span className="text-slate-400 font-normal text-xs">{tr("email_optional")}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tr("email_placeholder")}
                className="w-full input-premium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                <Lock className="w-3.5 h-3.5 text-[#64748B]" />
                {tr("password_label")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tr("password_min")}
                minLength={8}
                className="w-full input-premium"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                <Shield className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-1"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {tr("creating")}</>
                : tr("create_btn")
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
          {tr("have_account")}{" "}
          <Link href="/login" className="text-[#FF6B00] font-semibold hover:text-[#E65100] transition-colors">
            {tr("login_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
