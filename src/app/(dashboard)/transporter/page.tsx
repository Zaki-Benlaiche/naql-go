"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { List, DollarSign, Star, Package } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Request = {
  id: string; fromCity: string; toCity: string;
  weight: number; status: string;
  bids: { id: string; price: number; status: string }[];
  client: { name: string };
};

export default function TransporterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { tr } = useLanguage();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && session.user.role !== "TRANSPORTER") { router.push("/client"); return; }
    if (status === "authenticated") {
      fetch("/api/requests").then(r => r.json()).then(data => { setRequests(data); setLoading(false); });
    }
  }, [status, session, router]);

  const myBids = requests.filter(r => r.bids.length > 0);
  const accepted = myBids.filter(r => r.bids[0]?.status === "ACCEPTED");

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{tr("dashboard")}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{tr("welcome")}, {session?.user?.name}</p>
          </div>
          <Link href="/transporter/browse"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm shrink-0 shadow-sm">
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">{tr("browse_requests")}</span>
            <span className="sm:hidden">{tr("browse_requests").split(" ")[0]}</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
          {[
            { icon: List, label: tr("available_requests"), value: loading ? "—" : requests.length, color: "text-blue-500 bg-blue-50" },
            { icon: DollarSign, label: tr("my_bids"), value: loading ? "—" : myBids.length, color: "text-orange-500 bg-orange-50" },
            { icon: Star, label: tr("accepted_bids"), value: loading ? "—" : accepted.length, color: "text-green-500 bg-green-50" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-3 md:p-5 shadow-sm">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center mb-2 md:mb-3 ${color}`}>
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-xs md:text-sm text-gray-500 mt-0.5 leading-tight">{label}</div>
            </div>
          ))}
        </div>

        {/* Recent available */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-4 md:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-sm md:text-base">{tr("recent_available")}</h2>
            <Link href="/transporter/browse" className="text-xs md:text-sm text-orange-500 font-medium hover:underline">
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
              <p className="text-gray-400 text-sm">{tr("no_available_now")}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requests.slice(0, 5).map((req) => (
                <div key={req.id} className="px-4 md:px-5 py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{req.fromCity} ← {req.toCity}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {req.weight} {tr("kg_suffix")} · {req.client.name}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {req.bids.length > 0 ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                        {tr("already_bid")}
                      </span>
                    ) : (
                      <Link href="/transporter/browse"
                        className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                        {tr("submit_bid_btn")}
                      </Link>
                    )}
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
