"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Truck, LogOut, LayoutDashboard, PlusCircle, List } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isClient = session?.user?.role === "CLIENT";

  const links = isClient
    ? [
        { href: "/dashboard/client", label: "لوحة التحكم", icon: LayoutDashboard },
        { href: "/dashboard/client/new-request", label: "طلب جديد", icon: PlusCircle },
        { href: "/dashboard/client/requests", label: "طلباتي", icon: List },
      ]
    : [
        { href: "/dashboard/transporter", label: "لوحة التحكم", icon: LayoutDashboard },
        { href: "/dashboard/transporter/browse", label: "تصفح الطلبات", icon: List },
      ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-100 flex flex-col fixed h-full">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">NaqlGo</span>
          </Link>
        </div>

        <div className="p-4 flex-1">
          <div className="mb-4 px-2">
            <div className="text-xs text-gray-400 font-medium uppercase mb-1">مرحباً</div>
            <div className="font-semibold text-gray-800 text-sm">{session?.user?.name}</div>
            <div className="text-xs text-orange-500 mt-0.5">
              {isClient ? "عميل" : "ناقل"}
            </div>
          </div>

          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 mr-64 p-8">{children}</main>
    </div>
  );
}
