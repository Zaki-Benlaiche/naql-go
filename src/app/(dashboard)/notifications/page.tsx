"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Bell, CheckCheck, Truck, DollarSign, MapPin, PackageCheck } from "lucide-react";
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
  if (diff < 60)   return lang === "ar" ? "الآن"              : "À l'instant";
  if (diff < 3600) return lang === "ar" ? `${Math.floor(diff/60)} د`   : `Il y a ${Math.floor(diff/60)} min`;
  if (diff < 86400)return lang === "ar" ? `${Math.floor(diff/3600)} س` : `Il y a ${Math.floor(diff/3600)} h`;
  return lang === "ar" ? `${Math.floor(diff/86400)} ي` : `Il y a ${Math.floor(diff/86400)} j`;
}

export default function NotificationsPage() {
  const { lang, tr } = useLanguage();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  async function load() {
    const res = await fetch("/api/notifications");
    if (res.ok) setNotifs(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markAllRead() {
    setMarking(true);
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setMarking(false);
  }

  const unread = notifs.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{tr("notifications")}</h1>
            {unread > 0 && (
              <p className="text-sm text-orange-500 font-medium mt-0.5">
                {unread} {lang === "ar" ? "غير مقروء" : "non lue(s)"}
              </p>
            )}
          </div>
          {unread > 0 && (
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
          <div className="text-center py-12 text-gray-400 text-sm">{tr("loading")}</div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Bell className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">{tr("no_notifications")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map((n) => {
              const bg = typeBg[n.type] ?? "bg-gray-50";
              const icon = typeIcon[n.type] ?? <Bell className="w-4 h-4 text-gray-400" />;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-4 py-4 rounded-2xl border transition-all ${
                    n.read
                      ? "bg-white border-gray-100"
                      : "bg-orange-50/60 border-orange-100"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug ${n.read ? "text-gray-700" : "text-gray-900"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] text-gray-400">{timeAgo(n.createdAt, lang)}</span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
