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
  DELIVERED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { tr } = useLanguage();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && session.user.role !== "CLIENT") {
      router.push("/transporter"); return;
    }
    if (status === "authenticated") {
      fetch("/api/requests")
        .then((r) => r.json())
        .then((data) => { setRequests(data); setLoading(false); });
    }
  }, [status, session, router]);

  const open = requests.filter((r) => r.status === "OPEN").length;
  const accepted = requests.filter((r) => r.status === "ACCEPTED").length;
  const delivered = requests.filter((r) => r.status === "DELIVERED").length;

  const statusLabel = (s: string) => {
    const key = `status_${s}` as Parameters<typeof tr>[0];
    return tr(key);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tr("dashboard")}</h1>
            <p className="text-gray-500 text-sm mt-1">{tr("welcome")} {session?.user?.name}</p>
          </div>
          <Link
            href="/client/new-request"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            {tr("new_request")}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={Package} label={tr("open_requests")} value={open} color="text-blue-500 bg-blue-50" />
          <StatCard icon={Truck} label={tr("in_progress")} value={accepted} color="text-orange-500 bg-orange-50" />
          <StatCard icon={CheckCircle} label={tr("delivered")} value={delivered} color="text-green-500 bg-green-50" />
        </div>

        {/* Recent requests */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">{tr("recent_requests")}</h2>
            <Link href="/client/requests" className="text-sm text-orange-500 hover:underline">
              {tr("view_all")}
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">{tr("loading")}</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{tr("no_requests")}</p>
              <Link href="/client/new-request" className="text-orange-500 text-sm mt-2 inline-block hover:underline">
                {tr("create_first")}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requests.slice(0, 5).map((req) => (
                <div key={req.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {req.fromCity} ← {req.toCity}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {req.weight} {tr("kg_suffix")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {req.bids.length} {tr("bids_count")}
                    </span>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[req.status]}`}>
                      {statusLabel(req.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
