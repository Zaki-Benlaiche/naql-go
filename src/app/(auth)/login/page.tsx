"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, Eye, EyeOff, Globe } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Language toggle – top corner */}
      <div className="fixed top-4 end-4">
        <button
          onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-500 transition-colors shadow-sm"
        >
          <Globe className="w-4 h-4" />
          {lang === "ar" ? "FR" : "AR"}
        </button>
      </div>

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-md">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">NaqlGo</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{tr("welcome_back")}</h1>
          <p className="text-gray-500 text-sm mt-1">{tr("login_sub")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                {tr("identifier_label")}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={tr("identifier_placeholder")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">{tr("password_label")}</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tr("password_placeholder")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pe-11 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm"
            >
              {loading ? tr("logging_in") : tr("login_btn")}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          {tr("no_account")}{" "}
          <Link href="/register" className="text-orange-500 font-semibold hover:underline">
            {tr("register_now")}
          </Link>
        </p>
      </div>
    </div>
  );
}
