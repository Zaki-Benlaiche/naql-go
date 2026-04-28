"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PlusCircle, Package, CheckCircle, Truck } from "lucide-react";

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

const statusMap: Record<string, { label: string; color: string }> = {
  OPEN: { label: "مفتوح", color: "bg-blue-100 text-blue-700" },
  ACCEPTED: { label: "مقبول", color: "bg-green-100 text-green-700" },
  IN_TRANSIT: { label: "في الطريق", color: "bg-orange-100 text-orange-700" },
  DELIVERED: { label: "تم التسليم", color: "bg-gray-100 text-gray-700" },
  CANCELLED: { label: "ملغي", color: "bg-red-100 text-red-700" },
};

const goodsMap: Record<string, string> = {
  furniture: "أثاث",
  electronics: "إلكترونيات",
  food: "مواد غذائية",
  building_material: "مواد بناء",
  packages: "طرود",
  other: "أخرى",
};

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
            <p className="text-gray-500 text-sm mt-1">مرحباً {session?.user?.name}</p>
          </div>
          <Link
            href="/client/new-request"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            طلب جديد
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={Package} label="طلبات مفتوحة" value={open} color="text-blue-500 bg-blue-50" />
          <StatCard icon={Truck} label="قيد التنفيذ" value={accepted} color="text-orange-500 bg-orange-50" />
          <StatCard icon={CheckCircle} label="تم التسليم" value={delivered} color="text-green-500 bg-green-50" />
        </div>

        {/* Recent requests */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">آخر الطلبات</h2>
            <Link href="/client/requests" className="text-sm text-orange-500 hover:underline">
              عرض الكل
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">جارٍ التحميل...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">لا توجد طلبات بعد</p>
              <Link href="/client/new-request" className="text-orange-500 text-sm mt-2 inline-block hover:underline">
                أنشئ طلبك الأول
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
                        {goodsMap[req.goodsType] || req.goodsType} • {req.weight} كغ
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {req.bids.length} عرض
                    </span>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusMap[req.status]?.color}`}>
                      {statusMap[req.status]?.label}
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
