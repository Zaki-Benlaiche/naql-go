"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { AlertTriangle, RotateCw, Settings } from "lucide-react";

/**
 * Silent GPS tracker — no button, no banner.
 *
 * Mounts during ACCEPTED / IN_TRANSIT, automatically requests geolocation
 * permission, and streams the position to /api/orders/:id/location via
 * watchPosition. The only UI it ever renders is an actionable error card
 * when permission is denied — because that's something the user must fix
 * before the rest of the flow works.
 *
 * Push policy:
 *  - Every movement >= 8 meters, OR
 *  - Every 25 seconds heartbeat (keeps the client's "fresh" badge green
 *    while the truck is parked at a light)
 */
export function GpsTracker({ requestId }: { requestId: string }) {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [error, setError]       = useState<"" | "denied" | "unavailable" | "nogps">("");
  const [attempt, setAttempt]   = useState(0); // bumping this re-runs the effect

  const watchRef     = useRef<number | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPushAt   = useRef(0);
  const lastPos      = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) { setError("nogps"); return; }
    setError("");

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
        setError("");
        const dist = lastPos.current ? haversineMeters(lastPos.current, p.coords) : Infinity;
        const sinceLast = Date.now() - lastPushAt.current;
        if (!lastPos.current || dist >= 8 || sinceLast >= 6_000) {
          push(p.coords.latitude, p.coords.longitude, p.coords.heading, p.coords.speed);
        }
      },
      (err) => {
        setError(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
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
  }, [requestId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const openSettings = useCallback(() => {
    // On Capacitor APK, deep-link to the app's permissions page so the user
    // doesn't have to hunt through Settings → Apps. The intent URL is
    // recognized by the Android WebView. On browser, fall through to the
    // text instructions in the message body.
    try {
      const w = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } };
      if (w.Capacitor?.isNativePlatform?.()) {
        window.location.href =
          "intent://com.naqlgo.app#Intent;scheme=package;" +
          "action=android.settings.APPLICATION_DETAILS_SETTINGS;end";
      }
    } catch { /* old WebView — user opens settings manually */ }
  }, []);

  if (!error) return null;

  const titles: Record<typeof error, { title: string; hint: string }> = {
    denied: {
      title: ar ? "صلاحية الموقع مرفوضة" : "Position refusée",
      hint:  ar
        ? "افتح إعدادات التطبيق ← الأذونات ← الموقع ← السماح، ثم اضغط إعادة المحاولة."
        : "Ouvrez Réglages → Autorisations → Position → Autoriser, puis Réessayer.",
    },
    unavailable: {
      title: ar ? "تعذّر قراءة الموقع" : "Position introuvable",
      hint:  ar ? "تأكد من تشغيل GPS وإشارة جيدة، ثم أعد المحاولة." : "Vérifiez que le GPS est activé, puis réessayez.",
    },
    nogps: {
      title: ar ? "GPS غير مدعوم" : "GPS non supporté",
      hint:  ar ? "هذا الجهاز لا يدعم تحديد الموقع." : "Cet appareil ne prend pas en charge la géolocalisation.",
    },
  };
  const t = titles[error];

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-amber-900 leading-tight">{t.title}</p>
        <p className="text-xs text-amber-800/90 mt-1 leading-snug">{t.hint}</p>
        <div className="flex flex-wrap gap-2 mt-2.5">
          {error === "denied" && (
            <button
              onClick={openSettings}
              className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              {ar ? "افتح الإعدادات" : "Ouvrir les réglages"}
            </button>
          )}
          <button
            onClick={retry}
            className="inline-flex items-center gap-1.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            {ar ? "إعادة المحاولة" : "Réessayer"}
          </button>
        </div>
      </div>
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
