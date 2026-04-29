"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Search, ShieldOff, ShieldCheck, ArrowLeft, Star, Truck, Package } from "lucide-react";

type User = {
  id: string; name: string; phone: string; email: string | null;
  role: string; isActive: boolean; isOnline: boolean;
  avgRating: number | null; totalRatings: number; createdAt: string;
  _count: { requests: number; bids: number };
};

const roleBg: Record<string, string> = {
  CLIENT: "bg-blue-100 text-blue-700",
  TRANSPORTER: "bg-orange-100 text-orange-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (search) params.set("q", search);
    const res = await fetch(`/api/admin/users?${params}`);
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [role]);

  async function toggleActive(userId: string, current: boolean) {
    setToggling(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !current } : u));
    setToggling(null);
  }

  const filtered = search
    ? users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search))
    : users;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
        <Link href="/admin" className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-500" />
          <h1 className="font-bold text-gray-900 text-lg">إدارة المستخدمين</h1>
        </div>
        <span className="ms-auto text-sm text-gray-500">{filtered.length} مستخدم</span>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-4">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && load()}
              placeholder="بحث بالاسم أو الهاتف..."
              className="w-full ps-9 pe-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: "", label: "الكل" },
              { value: "CLIENT", label: "عملاء" },
              { value: "TRANSPORTER", label: "ناقلون" },
            ].map(f => (
              <button key={f.value} onClick={() => setRole(f.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  role === f.value
                    ? "bg-orange-500 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">لا يوجد مستخدمون</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(user => (
              <div key={user.id}
                className={`bg-white rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                  user.isActive ? "border-gray-100" : "border-red-100 bg-red-50/30"
                }`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                  user.role === "CLIENT" ? "bg-blue-500" : "bg-orange-500"
                }`}>
                  {user.name[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBg[user.role]}`}>
                      {user.role === "CLIENT" ? "عميل" : user.role === "TRANSPORTER" ? "ناقل" : "مدير"}
                    </span>
                    {!user.isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">محظور</span>
                    )}
                    {user.isOnline && (
                      <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> متاح
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <p className="text-xs text-gray-500">{user.phone}</p>
                    {user.role === "CLIENT" && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Package className="w-3 h-3" /> {user._count.requests}
                      </span>
                    )}
                    {user.role === "TRANSPORTER" && (
                      <>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Truck className="w-3 h-3" /> {user._count.bids} عرض
                        </span>
                        {user.avgRating && (
                          <span className="flex items-center gap-1 text-xs text-yellow-600">
                            <Star className="w-3 h-3 fill-yellow-400" /> {user.avgRating.toFixed(1)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => toggleActive(user.id, user.isActive)}
                  disabled={toggling === user.id}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors shrink-0 ${
                    user.isActive
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {toggling === user.id
                    ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    : user.isActive
                      ? <><ShieldOff className="w-3.5 h-3.5" /> حظر</>
                      : <><ShieldCheck className="w-3.5 h-3.5" /> تفعيل</>
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex z-30">
        {[
          { href: "/admin", label: "الإحصائيات" },
          { href: "/admin/users", label: "المستخدمون" },
          { href: "/admin/orders", label: "الطلبات" },
        ].map(({ href, label }) => (
          <Link key={href} href={href}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 hover:text-orange-500 transition-colors text-[11px] font-medium">
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
