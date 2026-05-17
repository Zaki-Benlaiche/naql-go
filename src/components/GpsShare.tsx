"use client";
import { useState, useEffect, useRef } from "react";
import { Navigation, Satellite } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Transporter: share their live GPS via watchPosition (continuous, battery-friendly).
// We push:
//  - every movement > 8 meters
//  - OR every 25 s as a heartbeat (so the "fresh" badge on the client stays green)
export function GpsShareButton({ requestId }: { requestId: string }) {
  const { lang, tr } = useLanguage();
  const [sharing, setSharing] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState("");

  const watchRef     = useRef<number | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPushAt   = useRef(0);
  const lastPos      = useRef<{ lat: number; lng: number } | null>(null);

  async function push(lat: number, lng: number, heading: number | null, speed: number | null) {
    lastPushAt.current = Date.now();
    lastPos.current    = { lat, lng };
    try {
      await fetch(`/api/orders/${requestId}/location`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ lat, lng, heading, speed }),
      });
    } catch { /* network blip — next tick will retry */ }
  }

  function stopSharing() {
    setSharing(false);
    setAccuracy(null);
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
    lastPos.current = null;
  }

  function startSharing() {
    if (!navigator.geolocation) {
      setError(lang === "ar" ? "GPS غير مدعوم في هذا الجهاز" : "GPS non supporté");
      return;
    }
    setError("");

    watchRef.current = navigator.geolocation.watchPosition(
      (p) => {
        setSharing(true);
        setAccuracy(p.coords.accuracy);

        const dist = lastPos.current ? haversineMeters(lastPos.current, p.coords) : Infinity;
        const sinceLast = Date.now() - lastPushAt.current;

        // Push if first fix, OR moved >= 8m, OR more than 6s since last push
        if (!lastPos.current || dist >= 8 || sinceLast >= 6_000) {
          push(p.coords.latitude, p.coords.longitude, p.coords.heading, p.coords.speed);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError(lang === "ar"
            ? "تم رفض الوصول للموقع — فعّل الأذونات"
            : "Accès à la position refusé — activez les permissions");
        } else {
          setError(lang === "ar"
            ? "تعذّر الوصول للموقع — تأكد من تفعيل GPS"
            : "Impossible d'accéder à la position");
        }
        stopSharing();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3_000,
        timeout:    20_000,
      },
    );

    // Heartbeat: push current position every 25s even if not moving, so the
    // client's "fresh" indicator stays green while parked at a light.
    heartbeatRef.current = setInterval(() => {
      if (lastPos.current) {
        push(lastPos.current.lat, lastPos.current.lng, null, 0);
      }
    }, 25_000);
  }

  useEffect(() => () => stopSharing(), []); // eslint-disable-line react-hooks/exhaustive-deps

  if (sharing) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-3">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-green-800 font-bold leading-tight">
              {lang === "ar" ? "موقعك يُبثّ مباشرة" : "Position diffusée en direct"}
            </div>
            {accuracy !== null && (
              <div className="flex items-center gap-1 text-[10px] text-green-600 mt-0.5">
                <Satellite className="w-3 h-3" />
                <span>
                  {lang === "ar" ? `دقة ±${Math.round(accuracy)}م` : `précision ±${Math.round(accuracy)} m`}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={stopSharing}
            className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors px-2.5 py-1 rounded-lg hover:bg-red-50"
          >
            {lang === "ar" ? "إيقاف" : "Arrêter"}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center px-2">
          {lang === "ar"
            ? "العميل يرى موقعك لحظياً على الخريطة"
            : "Le client voit votre position en temps réel"}
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

function haversineMeters(
  a: { lat: number; lng: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.lat) * Math.PI) / 180;
  const dLng = ((b.longitude - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
