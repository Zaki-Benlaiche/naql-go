"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PlusCircle, Package, CheckCircle, Truck, ArrowRight, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Request = {
  id: string; fromCity: string; toCity: string;
  goodsType: string; weight: number; status: string;
  createdAt: string; bids: { id: string }[];
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  OPEN:       { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400" },
  ACCEPTED:   { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  IN_TRANSIT: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  DELIVERED:  { bg: "bg-slate-100", text: "text-slate-600",  dot: "bg-slate-400" },
  CANCELLED:  { bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-400" },
};

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { tr } = useLanguage();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && session.user.role !== "CLIENT") { router.push("/transporter"); return; }
    if (status === "authenticated") {
      fetch("/api/requests").then(r => r.json()).then(data => { setRequests(data); setLoading(false); });
    }
  }, [status, session, router]);

  const open      = requests.filter(r => r.status === "OPEN").length;
  const accepted  = requests.filter(r => r.status === "ACCEPTED" || r.status === "IN_TRANSIT").length;
  const delivered = requests.filter(r => r.status === "DELIVERED").length;

  const statusLabel = (s: string) => tr(`status_${s}` as Parameters<typeof tr>[0]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Hero header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1628] via-[#112240] to-[#1A3458] p-6 md:p-8">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          <div className="absolute -end-8 -top-8 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute -start-4 -bottom-8 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-slate-400 text-sm mb-1">
                👋 {tr("welcome")},
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{session?.user?.name}</h1>
              <p className="text-slate-400 text-sm mt-1.5">{tr("dashboard")}</p>
            </div>
            <Link href="/client/new-request"
              className="btn-primary text-white font-semibold px-5 py-3 rounded-2xl flex items-center gap-2 text-sm shrink-0">
              <PlusCircle className="w-4 h-4" />
              {tr("new_request")}
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <StatCard
            icon={Clock} label={tr("open_requests")} value={open}
            gradient="from-blue-500 to-blue-700" bg="bg-blue-50" loading={loading}
          />
          <StatCard
            icon={Truck} label={tr("in_progress")} value={accepted}
            gradient="from-orange-500 to-orange-700" bg="bg-orange-50" loading={loading}
          />
          <StatCard
            icon={CheckCircle} label={tr("delivered")} value={delivered}
            gradient="from-emerald-500 to-emerald-700" bg="bg-emerald-50" loading={loading}
          />
        </div>

        {/* Recent requests */}
        <div className="card-premium overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">{tr("recent_requests")}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{tr("my_requests")}</p>
            </div>
            <Link href="/client/requests"
              className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-all">
              {tr("view_all")}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded-full w-2/3" />
                    <div className="h-2.5 bg-slate-100 rounded-full w-1/3" />
                  </div>
                  <div className="w-16 h-6 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Package className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium text-sm mb-1">{tr("no_requests")}</p>
              <Link href="/client/new-request"
                className="text-orange-500 text-sm mt-2 inline-flex items-center gap-1 hover:text-orange-600 font-semibold">
                {tr("create_first")} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {requests.slice(0, 5).map((req) => {
                const cfg = statusConfig[req.status] ?? statusConfig.OPEN;
                return (
                  <div key={req.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center shrink-0 border border-orange-100">
                        <Package className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {req.fromCity} ← {req.toCity}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {req.weight} {tr("kg_suffix")} · {req.bids.length} {tr("bids_count")}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {statusLabel(req.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, gradient, bg, loading }: {
  icon: React.ElementType; label: string; value: number;
  gradient: string; bg: string; loading: boolean;
}) {
  return (
    <div className="card-premium p-4 md:p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {loading
        ? <div className="space-y-2 animate-pulse">
            <div className="h-7 bg-slate-100 rounded-lg w-1/2" />
            <div className="h-3 bg-slate-100 rounded-full w-3/4" />
          </div>
        : <>
            <div className="text-2xl md:text-3xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 leading-tight">{label}</div>
          </>
      }
    </div>
  );
}
