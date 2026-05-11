"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { AlertTriangle, Trash2, Lock, ArrowLeft } from "lucide-react";

export default function DeleteAccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = password.length > 0 && confirmText === "حذف";

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!canDelete) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "تعذّر حذف الحساب");
        setBusy(false);
        return;
      }
      // Sign out, then send to home.
      await signOut({ redirect: false });
      router.replace("/?account-deleted=1");
    } catch {
      setError("خطأ في الاتصال");
      setBusy(false);
    }
  }

  return (
    <div dir="rtl" lang="ar">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        <Trash2 className="w-8 h-8 text-red-600" />
        حذف الحساب
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        طلب نهائي — لا يمكن استرجاع البيانات بعد الحذف.
      </p>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
        <div className="flex gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900 mb-2">ماذا سيُحذف؟</h3>
            <ul className="text-sm text-red-800 space-y-1 list-disc ps-5">
              <li>كل بيانات حسابك (الاسم، الهاتف، البريد، كلمة السر)</li>
              <li>سجلّ الطلبات والعروض</li>
              <li>الرسائل في الشات</li>
              <li>التقييمات (التي قمتَ بها وتلك التي تلقّيتها)</li>
              <li>الوثائق المرفوعة (للسائقين)</li>
              <li>الإشعارات</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
        <p className="text-sm text-amber-900">
          ⚠️ <strong>لا يمكن حذف الحساب</strong> إذا كانت لديك طلبات نشطة (مقبولة أو
          قيد التوصيل). أنهها أو ألغها أولاً.
        </p>
      </div>

      {status === "loading" && (
        <div className="text-center py-8 text-slate-400">جاري التحميل…</div>
      )}

      {status === "unauthenticated" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
          <p className="text-slate-700 mb-4">يجب تسجيل الدخول أولاً لحذف الحساب.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700"
          >
            تسجيل الدخول
          </Link>
        </div>
      )}

      {status === "authenticated" && session?.user && (
        <form onSubmit={handleDelete} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="text-sm text-slate-600">
            ستحذف الحساب: <span className="font-bold text-slate-900">{session.user.name}</span>
            <span className="text-slate-400 mx-2">·</span>
            <span className="font-mono text-xs">{session.user.phone}</span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              كلمة السر <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pe-10 ps-3 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-none text-sm"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              للتأكيد، اكتب كلمة <span className="text-red-600 font-bold">حذف</span>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="حذف"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-none text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Link
              href="/"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-center hover:bg-slate-50 inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> العودة
            </Link>
            <button
              type="submit"
              disabled={!canDelete || busy}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {busy ? "جاري الحذف…" : "حذف نهائياً"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
