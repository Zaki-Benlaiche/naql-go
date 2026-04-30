"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Bell, CheckCheck, Truck, DollarSign, PackageCheck, Trash2, X, History,
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

const typeIcon: Record<string, React.ReactNode> = {
  new_bid:      <DollarSign className="w-4 h-4 text-blue-500" />,
  bid_accepted: <CheckCheck className="w-4 h-4 text-green-500" />,
  in_transit:   <Truck className="w-4 h-4 text-orange-500" />,
  delivered:    <PackageCheck className="w-4 h-4 text-green-600" />,
};

const typeBg: Record<string, string> = {
  new_bid:      "bg-blue-50",
  bid_accepted: "bg-green-50",
  in_transit:   "bg-orange-50",
  delivered:    "bg-green-50",
};

function timeAgo(dateStr: string, lang: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)    return lang === "ar" ? "الآن"                        : "À l'instant";
  if (diff < 3600)  return lang === "ar" ? `${Math.floor(diff / 60)} د`  : `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return lang === "ar" ? `${Math.floor(diff / 3600)} س`: `Il y a ${Math.floor(diff / 3600)} h`;
  return lang === "ar" ? `${Math.floor(diff / 86400)} ي` : `Il y a ${Math.floor(diff / 86400)} j`;
}

export default function NotificationsPage() {
  const { lang, tr } = useLanguage();
  const [notifs, setNotifs]           = useState<Notif[]>([]);
  const [loading, setLoading]         = useState(true);
  const [marking, setMarking]         = useState(false);
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  async function load() {
    const res = await fetch("/api/notifications");
    if (res.ok) setNotifs(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // Mark all as read in background so badge resets
    fetch("/api/notifications", { method: "PATCH" });
  }, []);

  async function markAllRead() {
    setMarking(true);
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setMarking(false);
  }

  async function deleteNotif(id: string) {
    setDeleting(id);
    const res = await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    if (res.ok) setNotifs(prev => prev.filter(n => n.id !== id));
    setDeleting(null);
  }

  async function deleteAllRead() {
    setDeletingAll(true);
    const res = await fetch("/api/notifications", { method: "DELETE" });
    if (res.ok) setNotifs(prev => prev.filter(n => !n.read));
    setDeletingAll(false);
  }

  const unread = notifs.filter(n => !n.read);
  const read   = notifs.filter(n => n.read);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{tr("notifications")}</h1>
            {unread.length > 0 && (
              <p className="text-sm text-orange-500 font-medium mt-0.5">
                {unread.length} {lang === "ar" ? "غير مقروء" : "non lue(s)"}
              </p>
            )}
          </div>
          {unread.length > 0 && (
            <button
              onClick={markAllRead}
              disabled={marking}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-xl transition-colors font-medium"
            >
              <CheckCheck className="w-4 h-4" />
              {tr("mark_all_read")}
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
            ))}
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Bell className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">{tr("no_notifications")}</p>
          </div>
        ) : (
          <div className="space-y-5">

            {/* ── Unread section ── */}
            {unread.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <h2 className="text-xs font-bold text-orange-500 uppercase tracking-widest">
                    {tr("notif_new_section")}
                  </h2>
                </div>
                <div className="space-y-2">
                  {unread.map(n => (
                    <NotifCard
                      key={n.id} n={n} lang={lang}
                      deleting={deleting} onDelete={deleteNotif}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── History section ── */}
            {read.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-gray-400" />
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {tr("notif_history")}
                    </h2>
                  </div>
                  <button
                    onClick={deleteAllRead}
                    disabled={deletingAll}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 font-medium disabled:opacity-50 transition-colors"
                  >
                    {deletingAll
                      ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                      : <Trash2 className="w-3 h-3" />
                    }
                    {tr("delete_all_read")}
                  </button>
                </div>
                <div className="space-y-2">
                  {read.map(n => (
                    <NotifCard
                      key={n.id} n={n} lang={lang}
                      deleting={deleting} onDelete={deleteNotif}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function NotifCard({
  n, lang, deleting, onDelete,
}: {
  n: Notif; lang: string;
  deleting: string | null;
  onDelete: (id: string) => void;
}) {
  const bg   = typeBg[n.type]   ?? "bg-gray-50";
  const icon = typeIcon[n.type] ?? <Bell className="w-4 h-4 text-gray-400" />;

  return (
    <div className={`group flex items-start gap-3 px-4 py-3.5 rounded-2xl border transition-all ${
      n.read
        ? "bg-white border-gray-100"
        : "bg-orange-50/60 border-orange-100 shadow-sm"
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${n.read ? "text-gray-700" : "text-gray-900"}`}>
          {n.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt, lang)}</p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        {!n.read && <span className="w-2 h-2 rounded-full bg-orange-500" />}
        <button
          onClick={() => onDelete(n.id)}
          disabled={deleting === n.id}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all disabled:opacity-50"
          title={lang === "ar" ? "حذف" : "Supprimer"}
        >
          {deleting === n.id
            ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin block" />
            : <X className="w-3.5 h-3.5" />
          }
        </button>
      </div>
    </div>
  );
}
