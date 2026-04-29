"use client";
import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Transporter: share their location
export function GpsShareButton({ requestId }: { requestId: string }) {
  const { tr } = useLanguage();
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function pushLocation(lat: number, lng: number) {
    await fetch(`/api/orders/${requestId}/location`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng }),
    });
  }

  function startSharing() {
    if (!navigator.geolocation) { setError("GPS غير مدعوم في هذا الجهاز"); return; }
    setSharing(true); setError("");

    navigator.geolocation.getCurrentPosition(
      pos => { pushLocation(pos.coords.latitude, pos.coords.longitude); setShared(true); },
      () => { setError("تعذّر الوصول للموقع. تأكد من تفعيل GPS"); setSharing(false); },
      { enableHighAccuracy: true }
    );

    // Update every 30s
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        pos => pushLocation(pos.coords.latitude, pos.coords.longitude),
        () => {}
      );
    }, 30000);
  }

  function stopSharing() {
    setSharing(false); setShared(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  if (sharing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
          <span className="text-sm text-green-700 font-medium flex-1">{tr("location_shared")}</span>
          <button onClick={stopSharing}
            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
            إيقاف
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center">{tr("gps_updating")}</p>
      </div>
    );
  }

  return (
    <div>
      <button onClick={startSharing}
        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors w-full justify-center">
        <Navigation className="w-4 h-4" />
        {tr("share_location")}
      </button>
      {error && <p className="text-red-500 text-xs mt-1.5 text-center">{error}</p>}
    </div>
  );
}

// Client: track the transporter
export function GpsTrackButton({ requestId }: { requestId: string }) {
  const { tr } = useLanguage();
  const [loc, setLoc] = useState<{ lat: number; lng: number; updatedAt: string } | null>(null);
  const [checking, setChecking] = useState(false);

  async function checkLocation() {
    setChecking(true);
    const res = await fetch(`/api/orders/${requestId}/location`);
    if (res.ok) setLoc(await res.json());
    setChecking(false);
  }

  useEffect(() => {
    checkLocation();
    const interval = setInterval(checkLocation, 30000);
    return () => clearInterval(interval);
  }, [requestId]);

  if (!loc) {
    return (
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">{tr("location_unavailable")}</span>
      </div>
    );
  }

  const mapsUrl = `https://maps.google.com/maps?q=${loc.lat},${loc.lng}`;
  const timeAgo = Math.floor((Date.now() - new Date(loc.updatedAt).getTime()) / 60000);

  return (
    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors w-full justify-center">
      <MapPin className="w-4 h-4" />
      {tr("track_transporter")}
      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
      {timeAgo < 2 && (
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0" />
      )}
    </a>
  );
}
