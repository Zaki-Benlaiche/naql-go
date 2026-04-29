"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PlusCircle, Package, CheckCircle, Truck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Request = {
  id: string;
  fromCity: string;
  toCity: string;
  goodsType: string;
  weight: number;
  status: string;
  createdAt: string;
  bids: { id: string }[];
};

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-green-100 text-green-700",
  IN_TRANSIT: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
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

  const open = requests.filter(r => r.status === "OPEN").length;
  const accepted = requests.filter(r => r.status === "ACCEPTED").length;
  const delivered = requests.filter(r => r.status === "DELIVERED").length;

  const statusLabel = (s: string) => tr(`status_${s}` as Parameters<typeof tr>[0]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="flex items-start justify-between mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{tr("dashboard")}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{tr("welcome")}, {session?.user?.name}</p>
          </div>
          <Link
            href="/client/new-request"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm shrink-0 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{tr("new_request")}</span>
            <span className="sm:hidden">+</span>
          </Link>
        </div>

        {/* Stats grid – 3 cols on all sizes with compact mobile style */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
          <StatCard icon={Package} label={tr("open_requests")} value={open} color="text-blue-500 bg-blue-50" />
          <StatCard icon={Truck} label={tr("in_progress")} value={accepted} color="text-orange-500 bg-orange-50" />
          <StatCard icon={CheckCircle} label={tr("delivered")} value={delivered} color="text-green-500 bg-green-50" />
        </div>

        {/* Recent requests */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-4 md:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-sm md:text-base">{tr("recent_requests")}</h2>
            <Link href="/client/requests" className="text-xs md:text-sm text-orange-500 font-medium hover:underline">
              {tr("view_all")}
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">{tr("loading")}</div>
          ) : requests.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Package className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-sm">{tr("no_requests")}</p>
              <Link href="/client/new-request" className="text-orange-500 text-sm mt-2 inline-block hover:underline font-medium">
                {tr("create_first")}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requests.slice(0, 5).map((req) => (
                <div key={req.id} className="px-4 md:px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {req.fromCity} ← {req.toCity}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {req.weight} {tr("kg_suffix")} · {req.bids.length} {tr("bids_count")}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusColors[req.status]}`}>
                    {statusLabel(req.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 md:p-5 shadow-sm">
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center mb-2 md:mb-3 ${color}`}>
        <Icon className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <div className="text-xl md:text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs md:text-sm text-gray-500 mt-0.5 leading-tight">{label}</div>
    </div>
  );
}
