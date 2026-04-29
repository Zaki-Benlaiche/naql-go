"use client";
import { useState, useEffect, useRef } from "react";
import { Navigation } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Transporter: share their live GPS (updates every 15 s)
export function GpsShareButton({ requestId }: { requestId: string }) {
  const { lang, tr } = useLanguage();
  const [sharing, setSharing]   = useState(false);
  const [error, setError]       = useState("");
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null);

  async function push(lat: number, lng: number) {
    await fetch(`/api/orders/${requestId}/location`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ lat, lng }),
    });
  }

  function getPos(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10_000,
      })
    );
  }

  async function startSharing() {
    if (!navigator.geolocation) {
      setError(lang === "ar" ? "GPS غير مدعوم في هذا الجهاز" : "GPS non supporté");
      return;
    }
    setError("");
    try {
      const pos = await getPos();
      await push(pos.coords.latitude, pos.coords.longitude);
      setSharing(true);

      intervalRef.current = setInterval(async () => {
        try {
          const p = await getPos();
          await push(p.coords.latitude, p.coords.longitude);
        } catch {}
      }, 15_000);
    } catch {
      setError(lang === "ar" ? "تعذّر الوصول للموقع — تأكد من تفعيل GPS" : "Impossible d'accéder à la position");
    }
  }

  function stopSharing() {
    setSharing(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  if (sharing) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
          <span className="text-sm text-green-700 font-semibold flex-1">
            {lang === "ar" ? "موقعك يُشارك كل 15 ثانية" : "Position partagée (15 s)"}
          </span>
          <button
            onClick={stopSharing}
            className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors px-2 py-0.5 rounded-lg hover:bg-red-50"
          >
            {lang === "ar" ? "إيقاف" : "Arrêter"}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center">
          {lang === "ar" ? "العميل يتابع موقعك الآن على الخريطة" : "Le client suit votre position sur la carte"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={startSharing}
        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors w-full justify-center shadow-sm"
      >
        <Navigation className="w-4 h-4" />
        {tr("share_location")}
      </button>
      {error && <p className="text-red-500 text-xs mt-1.5 text-center">{error}</p>}
    </div>
  );
}
