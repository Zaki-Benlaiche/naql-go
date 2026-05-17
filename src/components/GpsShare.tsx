"use client";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { AlertTriangle } from "lucide-react";

/**
 * Silent GPS tracker — no button, no banner.
 *
 * Mounts when the transporter's order is IN_TRANSIT, automatically requests
 * geolocation permission, and streams the position to /api/orders/:id/location
 * via watchPosition. The only UI it ever renders is an error toast if
 * permission is denied (because that's something the transporter must fix).
 *
 * Push policy:
 *  - Every movement >= 8 meters, OR
 *  - Every 25 seconds heartbeat (keeps the client's "fresh" badge green
 *    while the truck is parked at a light)
 */
export function GpsTracker({ requestId }: { requestId: string }) {
  const { lang } = useLanguage();
  const [error, setError] = useState("");

  const watchRef     = useRef<number | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPushAt   = useRef(0);
  const lastPos      = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(lang === "ar" ? "GPS غير مدعوم في هذا الجهاز" : "GPS non supporté");
      return;
    }

    async function push(lat: number, lng: number, heading: number | null, speed: number | null) {
      lastPushAt.current = Date.now();
      lastPos.current    = { lat, lng };
      try {
        await fetch(`/api/orders/${requestId}/location`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ lat, lng, heading, speed }),
        });
      } catch { /* network blip — heartbeat will retry */ }
    }

    watchRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const dist = lastPos.current ? haversineMeters(lastPos.current, p.coords) : Infinity;
        const sinceLast = Date.now() - lastPushAt.current;
        if (!lastPos.current || dist >= 8 || sinceLast >= 6_000) {
          push(p.coords.latitude, p.coords.longitude, p.coords.heading, p.coords.speed);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError(lang === "ar"
            ? "تم رفض الوصول للموقع — فعّل صلاحية GPS من إعدادات التطبيق"
            : "Position refusée — activez la permission GPS dans les réglages");
        } else {
          setError(lang === "ar"
            ? "تعذّر الوصول للموقع — تأكد من تفعيل GPS"
            : "GPS indisponible — vérifiez qu'il est activé");
        }
      },
      { enableHighAccuracy: true, maximumAge: 3_000, timeout: 20_000 },
    );

    heartbeatRef.current = setInterval(() => {
      if (lastPos.current) {
        push(lastPos.current.lat, lastPos.current.lng, null, 0);
      }
    }, 25_000);

    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      lastPos.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  // Permission errors are the one thing the transporter *must* see — they
  // can't fix what they don't know about. Everything else stays silent.
  if (!error) return null;
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-amber-800">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <p className="text-xs leading-tight">{error}</p>
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
