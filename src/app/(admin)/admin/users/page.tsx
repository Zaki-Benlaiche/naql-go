"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Users, Search, ShieldOff, ShieldCheck, Star, Truck, Package,
  Trash2, AlertTriangle, X, Phone, Mail, Calendar, Filter,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type User = {
  id: string; name: string; phone: string; email: string | null;
  role: string; isActive: boolean; isOnline: boolean;
  wilaya: string | null;
  vehicleType: string | null;
  vehicleColor: string | null;
  isLivreur: boolean; isFrodeur: boolean; isTransporteur: boolean;
  avgRating: number | null; totalRatings: number; createdAt: string;
  _count: { requests: number; bids: number };
};

type UsersResponse = { users: User[]; total: number; page: number; pageSize: number };

const roleBg: Record<string, string> = {
  CLIENT: "bg-blue-100 text-blue-700",
  TRANSPORTER: "bg-orange-100 text-orange-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

function StarBadge({ score, count }: { score: number | null; count: number }) {
  if (!score || count === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg font-medium">
        <Star className="w-3 h-3" />
        —
      </span>
    );
  }
  const color = score >= 4.5 ? "emerald" : score >= 3.5 ? "yellow" : score >= 2.5 ? "orange" : "red";
  const colorClass = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    red: "bg-red-50 text-red-700 border-red-200",
  }[color];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${colorClass}`}>
      <Star className="w-3 h-3 fill-current" />
      {score.toFixed(1)}
      <span className="opacity-60 font-medium">({count})</span>
    </span>
  );
}

export default function AdminUsersPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (search) params.set("q", search);
    params.set("page", String(p));
    const res = await fetch(`/api/admin/users?${params}`);
    if (res.ok) {
      const data: UsersResponse = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setPage(data.page);
    }
    setLoading(false);
  }, [role, search]);

  useEffect(() => { load(1); }, [role, load]);

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

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError(null);
    const res = await fetch(`/api/admin/users/${deleting.id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== deleting.id));
      setDeleting(null);
    } else {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error || (ar ? "خطأ في الحذف" : "Erreur de suppression"));
    }
    setDeleteBusy(false);
  }

  const filtered = search
    ? users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search))
    : users;

  const clientCount = users.filter(u => u.role === "CLIENT").length;
  const transporterCount = users.filter(u => u.role === "TRANSPORTER").length;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-500" />
            {ar ? "المستخدمون" : "Utilisateurs"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {ar
              ? `${total.toLocaleString("ar-DZ")} مستخدم إجمالاً • ${clientCount} عميل، ${transporterCount} ناقل في هذه الصفحة`
              : `${total.toLocaleString("fr-DZ")} utilisateurs • ${clientCount} clients, ${transporterCount} transporteurs sur cette page`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={ar ? "بحث بالاسم أو الهاتف..." : "Recherche nom ou téléphone..."}
              className="w-full ps-9 pe-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            {[
              { value: "", label: ar ? "الكل" : "Tous" },
              { value: "CLIENT", label: ar ? "عملاء" : "Clients" },
              { value: "TRANSPORTER", label: ar ? "ناقلون" : "Transporteurs" },
            ].map(f => (
              <button key={f.value} onClick={() => setRole(f.value)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  role === f.value
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{ar ? "لا يوجد مستخدمون" : "Aucun utilisateur"}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(user => (
            <div key={user.id}
              className={`bg-white rounded-2xl border p-4 transition-all hover:shadow-md ${
                user.isActive ? "border-gray-100" : "border-red-200 bg-red-50/30"
              }`}>

              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base shrink-0 shadow-sm ${
                  user.role === "CLIENT" ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-orange-500 to-orange-600"
                }`}>
                  {user.name[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBg[user.role]}`}>
                      {user.role === "CLIENT" ? (ar ? "عميل" : "Client")
                        : user.role === "TRANSPORTER" ? (ar ? "ناقل" : "Transporteur")
                        : (ar ? "مدير" : "Admin")}
                    </span>
                    {!user.isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        {ar ? "محظور" : "Bloqué"}
                      </span>
                    )}
                    {user.isOnline && user.role === "TRANSPORTER" && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {ar ? "متصل" : "En ligne"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-500">
                    <a href={`tel:${user.phone}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                      <Phone className="w-3 h-3" />
                      <span dir="ltr">{user.phone}</span>
                    </a>
                    {user.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {user.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.createdAt).toLocaleDateString(ar ? "ar-DZ" : "fr-DZ")}
                    </span>
                  </div>

                  {/* Activity row */}
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    {user.role === "CLIENT" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 bg-purple-50 px-2 py-1 rounded-lg font-semibold">
                        <Package className="w-3 h-3" /> {user._count.requests} {ar ? "طلب" : "cmd"}
                      </span>
                    )}
                    {user.role === "TRANSPORTER" && (
                      <>
                        <span className="inline-flex items-center gap-1 text-[11px] text-orange-700 bg-orange-50 px-2 py-1 rounded-lg font-semibold">
                          <Truck className="w-3 h-3" /> {user._count.bids} {ar ? "عرض" : "offres"}
                        </span>
                        <StarBadge score={user.avgRating} count={user.totalRatings} />
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleActive(user.id, user.isActive)}
                    disabled={toggling === user.id}
                    title={user.isActive ? (ar ? "حظر" : "Bloquer") : (ar ? "تفعيل" : "Activer")}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
                      user.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {toggling === user.id
                      ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      : user.isActive ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />
                    }
                  </button>
                  <button
                    onClick={() => { setDeleteError(null); setDeleting(user); }}
                    title={ar ? "حذف" : "Supprimer"}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && total > 50 && (
        <div className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm">
          <button
            onClick={() => load(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {ar ? "← السابق" : "← Précédent"}
          </button>
          <p className="text-xs text-gray-500 font-medium">
            {ar
              ? `صفحة ${page} من ${Math.ceil(total / 50)}`
              : `Page ${page} / ${Math.ceil(total / 50)}`}
          </p>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= Math.ceil(total / 50)}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {ar ? "التالي →" : "Suivant →"}
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-black text-gray-900 text-lg mb-2">
                {ar ? "حذف نهائي للمستخدم؟" : "Suppression définitive ?"}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {ar
                  ? `سيُحذف ${deleting.name} نهائياً مع كل طلباته وعروضه وتقييماته. لا يمكن التراجع عن هذا الإجراء.`
                  : `${deleting.name} sera supprimé définitivement avec ses commandes, offres et évaluations. Action irréversible.`}
              </p>
              {deleteError && (
                <div className="mt-4 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 border-t border-gray-100">
              <button onClick={() => setDeleting(null)}
                disabled={deleteBusy}
                className="py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <X className="w-4 h-4" />
                {ar ? "إلغاء" : "Annuler"}
              </button>
              <button onClick={confirmDelete}
                disabled={deleteBusy}
                className="py-3.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                {deleteBusy
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Trash2 className="w-4 h-4" />}
                {ar ? "حذف نهائي" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
