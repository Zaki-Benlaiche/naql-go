"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { List, DollarSign, Star } from "lucide-react";

type Request = {
  id: string;
  fromCity: string;
  toCity: string;
  goodsType: string;
  weight: number;
  status: string;
  bids: { id: string; price: number; status: string }[];
  client: { name: string };
};

export default function TransporterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && session.user.role !== "TRANSPORTER") {
      router.push("/client"); return;
    }
    if (status === "authenticated") {
      fetch("/api/requests")
        .then((r) => r.json())
        .then((data) => { setRequests(data); setLoading(false); });
    }
  }, [status, session, router]);

  const myBids = requests.filter((r) => r.bids.length > 0);
  const accepted = myBids.filter((r) => r.bids[0]?.status === "ACCEPTED");

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
            <p className="text-gray-500 text-sm mt-1">مرحباً {session?.user?.name}</p>
          </div>
          <Link
            href="/transporter/browse"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm"
          >
            <List className="w-4 h-4" />
            تصفح الطلبات
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
              <List className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{loading ? "—" : requests.length}</div>
            <div className="text-sm text-gray-500 mt-0.5">طلبات متاحة</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{loading ? "—" : myBids.length}</div>
            <div className="text-sm text-gray-500 mt-0.5">عروضي المقدّمة</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
              <Star className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{loading ? "—" : accepted.length}</div>
            <div className="text-sm text-gray-500 mt-0.5">عروض مقبولة</div>
          </div>
        </div>

        {/* Available requests preview */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">آخر الطلبات المتاحة</h2>
            <Link href="/transporter/browse" className="text-sm text-orange-500 hover:underline">
              عرض الكل
            </Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">جارٍ التحميل...</div>
          ) : requests.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">لا توجد طلبات متاحة حالياً</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requests.slice(0, 5).map((req) => (
                <div key={req.id} className="p-5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{req.fromCity} ← {req.toCity}</div>
                    <div className="text-sm text-gray-400 mt-0.5">{req.weight} كغ • {req.client.name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {req.bids.length > 0 ? (
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                        قدّمت عرضاً ✓
                      </span>
                    ) : (
                      <Link
                        href={`/transporter/browse`}
                        className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                      >
                        قدّم عرضاً
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
