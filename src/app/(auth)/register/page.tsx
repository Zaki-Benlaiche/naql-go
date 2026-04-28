"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Truck, Package } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "CLIENT";

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

    if (!res.ok) {
      setError(data.error || "حدث خطأ");
      setLoading(false);
      return;
    }

    await signIn("credentials", { phone, password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">NaqlGo</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">إنشاء حساب جديد</h1>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("CLIENT")}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${
              role === "CLIENT"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <Package className={`w-6 h-6 mx-auto mb-2 ${role === "CLIENT" ? "text-orange-500" : "text-gray-400"}`} />
            <div className={`font-semibold text-sm ${role === "CLIENT" ? "text-orange-600" : "text-gray-600"}`}>
              عميل
            </div>
            <div className="text-xs text-gray-400 mt-1">أريد نقل بضائع</div>
          </button>
          <button
            type="button"
            onClick={() => setRole("TRANSPORTER")}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${
              role === "TRANSPORTER"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <Truck className={`w-6 h-6 mx-auto mb-2 ${role === "TRANSPORTER" ? "text-orange-500" : "text-gray-400"}`} />
            <div className={`font-semibold text-sm ${role === "TRANSPORTER" ? "text-orange-600" : "text-gray-600"}`}>
              ناقل
            </div>
            <div className="text-xs text-gray-400 mt-1">أملك مركبة</div>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="محمد بن علي"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني <span className="text-gray-400 font-normal">(اختياري)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 أحرف على الأقل"
                minLength={8}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? "جارٍ التسجيل..." : "إنشاء الحساب"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-orange-500 font-semibold hover:underline">
            سجّل دخولك
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
