"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Bell, CheckCheck, Truck, DollarSign, PackageCheck,
  Trash2, X, History, AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Notif = {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
  requestId: string | null;
};

/* ── Type metadata ─────────────────────────────────────────────── */
const typeMeta: Record<string, { icon: React.ReactNode; iconBg: string; accent: string }> = {
  new_bid: {
    icon:   <DollarSign  className="w-4 h-4 text-blue-500" />,
    iconBg: "bg-blue-50",
    accent: "border-l-blue-400",
  },
  bid_accepted: {
    icon:   <CheckCheck  className="w-4 h-4 text-emerald-500" />,
    iconBg: "bg-emerald-50",
    accent: "border-l-emerald-400",
  },
  in_transit: {
    icon:   <Truck       className="w-4 h-4 text-orange-500" />,
    iconBg: "bg-orange-50",
    accent: "border-l-orange-400",
  },
  delivered: {
    icon:   <PackageCheck className="w-4 h-4 text-green-600" />,
    iconBg: "bg-green-50",
    accent: "border-l-green-500",
  },
};

const fallbackMeta = {
  icon:   <Bell className="w-4 h-4 text-gray-400" />,
  iconBg: "bg-gray-50",
  accent: "border-l-gray-300",
};

/* ── Time formatting ───────────────────────────────────────────── */
function formatTime(dateStr: string, lang: string): string {
  const d    = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60)     return lang === "ar" ? "الآن"                              : "À l'instant";
  if (diff < 3600)   return lang === "ar" ? `منذ ${Math.floor(diff / 60)} د`   : `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400)  return lang === "ar" ? `منذ ${Math.floor(diff / 3600)} س` : `Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return lang === "ar" ? `منذ ${Math.floor(diff / 86400)} ي`: `Il y a ${Math.floor(diff / 86400)} j`;
  return d.toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ", { day: "numeric", month: "short" });
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function NotificationsPage() {
  const { lang, tr } = useLanguage();
  const [notifs, setNotifs]             = useState<Notif[]>([]);
  const [loading, setLoading]           = useState(true);
  const [marking, setMarking]           = useState(false);
  const [deleting, setDeleting]         = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing]         = useState(false);

  async function load() {
    const res = await fetch("/api/notifications");
    if (res.ok) setNotifs(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    fetch("/api/notifications", { method: "PATCH" }); // mark all read silently
  }, []);

  async function markAllRead() {
    setMarking(true);
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setMarking(false);
  }

  async function deleteOne(id: string) {
    setDeleting(id);
    const res = await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    if (res.ok) setNotifs(prev => prev.filter(n => n.id !== id));
    setDeleting(null);
  }

  async function clearHistory() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    setClearing(true);
    const res = await fetch("/api/notifications", { method: "DELETE" });
    if (res.ok) setNotifs(prev => prev.filter(n => !n.read));
    setClearing(false);
    setConfirmClear(false);
  }

  const unread = notifs.filter(n => !n.read);
  const read   = notifs.filter(n => n.read);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{tr("notifications")}</h1>
              {unread.length > 0
                ? <p className="text-xs text-orange-500 font-semibold mt-0.5">
                    {unread.length} {lang === "ar" ? "غير مقروء" : "non lue(s)"}
                  </p>
                : <p className="text-xs text-gray-400 mt-0.5">
                    {lang === "ar" ? "كل شيء مقروء" : "Tout est lu"}
                  </p>
              }
            </div>
          </div>

          {unread.length > 0 && (
            <button
              onClick={markAllRead}
              disabled={marking}
              className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              {marking
                ? <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                : <CheckCheck className="w-3.5 h-3.5" />
              }
              {tr("mark_all_read")}
            </button>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-[72px] animate-pulse" />
            ))}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && notifs.length === 0 && (
          <div className="flex flex-col items-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-500 font-semibold text-sm">{tr("no_notifications")}</p>
            <p className="text-gray-400 text-xs mt-1">
              {lang === "ar" ? "ستظهر هنا إشعاراتك عند وصولها" : "Vos notifications apparaîtront ici"}
            </p>
          </div>
        )}

        {!loading && notifs.length > 0 && (
          <>
            {/* ── Unread section ── */}
            {unread.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shrink-0" />
                  <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
                    {tr("notif_new_section")}
                  </span>
                  <span className="ms-auto text-xs font-bold text-orange-400 bg-orange-50 px-2 py-0.5 rounded-full">
                    {unread.length}
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden divide-y divide-orange-50">
                  {unread.map(n => (
                    <NotifRow
                      key={n.id} n={n} lang={lang}
                      deleting={deleting} onDelete={deleteOne}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── History section ── */}
            {read.length > 0 && (
              <section className="space-y-2">
                {/* Section header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {tr("notif_history")}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-semibold">
                      {read.length}
                    </span>
                  </div>

                  {/* Delete all read button — two-step confirm */}
                  <button
                    onClick={clearHistory}
                    disabled={clearing}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all disabled:opacity-50 ${
                      confirmClear
                        ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                        : "bg-white text-red-400 border-red-200 hover:bg-red-50 hover:border-red-300"
                    }`}
                  >
                    {clearing
                      ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : confirmClear
                        ? <AlertTriangle className="w-3 h-3" />
                        : <Trash2 className="w-3 h-3" />
                    }
                    {confirmClear
                      ? (lang === "ar" ? "تأكيد الحذف" : "Confirmer ?")
                      : tr("delete_all_read")
                    }
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                  {read.map(n => (
                    <NotifRow
                      key={n.id} n={n} lang={lang}
                      deleting={deleting} onDelete={deleteOne}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

/* ── Notification row ──────────────────────────────────────────── */
function NotifRow({
  n, lang, deleting, onDelete,
}: {
  n: Notif; lang: string;
  deleting: string | null;
  onDelete: (id: string) => void;
}) {
  const meta   = typeMeta[n.type] ?? fallbackMeta;
  const isNew  = !n.read;
  const isBusy = deleting === n.id;

  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 border-l-[3px] transition-colors hover:bg-gray-50/60 ${
      isNew ? `${meta.accent} bg-orange-50/30` : "border-l-transparent"
    }`}>
      {/* Type icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${meta.iconBg}`}>
        {meta.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${isNew ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
            {n.title}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {isNew && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1" />}
            {/* Delete button — always visible */}
            <button
              onClick={() => onDelete(n.id)}
              disabled={isBusy}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all disabled:opacity-40 shrink-0"
              title={lang === "ar" ? "حذف" : "Supprimer"}
            >
              {isBusy
                ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                : <X className="w-3.5 h-3.5" />
              }
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
        <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
          {formatTime(n.createdAt, lang)}
        </p>
      </div>
    </div>
  );
}
