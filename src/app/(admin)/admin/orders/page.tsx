"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ArrowLeft, Truck, Phone } from "lucide-react";

type Order = {
  id: string; fromCity: string; toCity: string;
  goodsType: string; weight: number; size: string;
  status: string; createdAt: string;
  estimatedPrice: number | null;
  client: { name: string; phone: string };
  acceptedBid: { price: number; transporter: { name: string; phone: string } } | null;
  _count: { bids: number };
};

const statusColors: Record<string, string> = {
  OPEN:       "bg-blue-100 text-blue-700",
  ACCEPTED:   "bg-green-100 text-green-700",
  IN_TRANSIT: "bg-orange-100 text-orange-700",
  DELIVERED:  "bg-gray-100 text-gray-600",
  CANCELLED:  "bg-red-100 text-red-600",
};
const statusAr: Record<string, string> = {
  OPEN: "مفتوح", ACCEPTED: "مقبول", IN_TRANSIT: "في الطريق",
  DELIVERED: "مُسلَّم", CANCELLED: "ملغي",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  async function load(status: string) {
    setLoading(true);
    const params = status ? `?status=${status}` : "";
    const res = await fetch(`/api/admin/orders${params}`);
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(filter); }, [filter]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
        <Link href="/admin" className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-500" />
          <h1 className="font-bold text-gray-900 text-lg">إدارة الطلبات</h1>
        </div>
        <span className="ms-auto text-sm text-gray-500">{orders.length} طلب</span>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-4">

        {/* Status filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { value: "", label: "الكل" },
            { value: "OPEN", label: "مفتوح" },
            { value: "ACCEPTED", label: "مقبول" },
            { value: "IN_TRANSIT", label: "في الطريق" },
            { value: "DELIVERED", label: "مُسلَّم" },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                filter === f.value
                  ? "bg-orange-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">لا توجد طلبات</div>
        ) : (
          <div className="space-y-2">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{order.fromCity} → {order.toCity}</p>
                      <p className="text-xs text-gray-500">{order.weight} كغ · {order._count.bids} عرض</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusColors[order.status]}`}>
                    {statusAr[order.status]}
                  </span>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Client */}
                  <div className="bg-blue-50 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-blue-500 font-medium">العميل</p>
                      <p className="text-sm font-semibold text-gray-900">{order.client.name}</p>
                    </div>
                    <a href={`tel:${order.client.phone}`}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-white px-2 py-1.5 rounded-lg font-medium">
                      <Phone className="w-3 h-3" /> {order.client.phone}
                    </a>
                  </div>

                  {/* Transporter */}
                  {order.acceptedBid ? (
                    <div className="bg-orange-50 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-orange-500 font-medium">الناقل · {order.acceptedBid.price.toLocaleString()} دج</p>
                        <p className="text-sm font-semibold text-gray-900">{order.acceptedBid.transporter.name}</p>
                      </div>
                      <a href={`tel:${order.acceptedBid.transporter.phone}`}
                        className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 bg-white px-2 py-1.5 rounded-lg font-medium">
                        <Phone className="w-3 h-3" /> {order.acceptedBid.transporter.phone}
                      </a>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-300" />
                      <p className="text-xs text-gray-400">في انتظار الناقل</p>
                    </div>
                  )}
                </div>

                {/* Estimated price */}
                {order.estimatedPrice && (
                  <p className="text-xs text-gray-400 mt-2">
                    السعر التقديري: <span className="text-orange-500 font-semibold">{order.estimatedPrice.toLocaleString()} دج</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex z-30">
        {[
          { href: "/admin", label: "الإحصائيات" },
          { href: "/admin/users", label: "المستخدمون" },
          { href: "/admin/orders", label: "الطلبات" },
        ].map(({ href, label }) => (
          <Link key={href} href={href}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 hover:text-orange-500 transition-colors text-[11px] font-medium">
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
