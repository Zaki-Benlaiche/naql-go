"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useLanguage } from "@/context/LanguageContext";
import {
  MapPin, Maximize2, Minimize2, Locate, Clock, Route as RouteIcon, Gauge,
} from "lucide-react";
import { useRealtimeRoom, useRealtimeEvent } from "@/hooks/useRealtime";

/* ════════════════════════════════════════════════════
   Marker factories
   ════════════════════════════════════════════════════ */

// Truck icon — rotates with the heading. Rotation is applied to the *inner*
// SVG only, so the round badge background and the popup anchor stay still.
const makeTruckIcon = (headingDeg: number | null) =>
  L.divIcon({
    className: "",
    html: `<div style="
      background:linear-gradient(135deg,#F97316,#EA580C);
      width:46px;height:46px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      border:3px solid white;
      box-shadow:0 6px 18px rgba(249,115,22,0.55);
      position:relative;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
        viewBox="0 0 24 24" fill="none" stroke="white"
        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
        style="transform: rotate(${headingDeg ?? 0}deg); transition: transform 0.6s ease-out;">
        <rect x="1" y="3" width="15" height="13"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    </div>`,
    iconSize:    [46, 46],
    iconAnchor:  [23, 23],
    popupAnchor: [0, -28],
  });

const makePickupIcon = () =>
  L.divIcon({
    className: "",
    html: `<div style="
      background:#3B82F6;width:36px;height:36px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      border:3px solid white;box-shadow:0 3px 10px rgba(59,130,246,0.45);
      color:white;font-size:15px;font-weight:900;font-family:system-ui,sans-serif;
    ">A</div>`,
    iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -22],
  });

const makeDeliveryIcon = () =>
  L.divIcon({
    className: "",
    html: `<div style="
      background:#10B981;width:36px;height:36px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      border:3px solid white;box-shadow:0 3px 10px rgba(16,185,129,0.45);
      color:white;font-size:15px;font-weight:900;font-family:system-ui,sans-serif;
    ">B</div>`,
    iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -22],
  });

/* ════════════════════════════════════════════════════
   Map helpers
   ════════════════════════════════════════════════════ */

function MapRecenter({ lat, lng, follow }: { lat: number; lng: number; follow: boolean }) {
  const map = useMap();
  const prev = useRef("");
  useEffect(() => {
    if (!follow) return;
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (key !== prev.current) {
      map.panTo([lat, lng], { animate: true, duration: 0.8 });
      prev.current = key;
    }
  }, [lat, lng, map, follow]);
  return null;
}

function FitAll({ points, trigger }: { points: [number, number][]; trigger: number }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points.map(([la, ln]) => L.latLng(la, ln)));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
  }, [trigger, points, map]);
  return null;
}

/* ════════════════════════════════════════════════════
   Math
   ════════════════════════════════════════════════════ */

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Initial bearing from A to B (degrees, clockwise from north).
function bearingDeg(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/* ════════════════════════════════════════════════════
   Types
   ════════════════════════════════════════════════════ */

type LocationPayload = {
  lat: number;
  lng: number;
  heading?: number | null;
  speed?: number | null;
  updatedAt: string;
};

type Props = {
  requestId: string;
  fromLat?: number | null;
  fromLng?: number | null;
  toLat?: number | null;
  toLng?: number | null;
};

/* ════════════════════════════════════════════════════
   Main component
   ════════════════════════════════════════════════════ */

const BREADCRUMB_MAX = 120;
const ARRIVAL_RADIUS_KM = 0.1;   // < 100 m → "arrived"
const APPROACH_RADIUS_KM = 0.5;  // < 500 m → "approaching"

export default function LiveMap({ requestId, fromLat, fromLng, toLat, toLng }: Props) {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const [pos, setPos]             = useState<LocationPayload | null>(null);
  const [noData, setNoData]       = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [trail, setTrail]         = useState<[number, number][]>([]);
  const [follow, setFollow]       = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [arrivalState, setArrivalState] = useState<"" | "approaching" | "arrived">("");
  const lastBearing = useRef<number | null>(null);

  /* ── Realtime: join request room & listen for pushes ── */
  useRealtimeRoom(requestId);
  useRealtimeEvent<LocationPayload>("location:update", (data) => {
    if (!data || typeof data.lat !== "number" || typeof data.lng !== "number") return;
    applyPos(data);
  });

  /* ── Initial fetch + slow safety poll (30s) in case socket drops ── */
  useEffect(() => {
    let cancelled = false;
    async function fetchOnce() {
      try {
        const res = await fetch(`/api/orders/${requestId}/location`, { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data?.lat) applyPos(data);
        else setNoData(true);
      } catch { /* offline — keep last known */ }
    }
    fetchOnce();
    const id = setInterval(fetchOnce, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  function applyPos(next: LocationPayload) {
    setNoData(false);
    setPos((cur) => {
      // Compute heading from prev → next if GPS didn't supply one
      let headingFromMotion: number | null = null;
      if (cur && (cur.lat !== next.lat || cur.lng !== next.lng)) {
        headingFromMotion = bearingDeg(cur, next);
        lastBearing.current = headingFromMotion;
      }
      const resolvedHeading = typeof next.heading === "number" && isFinite(next.heading)
        ? next.heading
        : headingFromMotion ?? lastBearing.current;

      setTrail((t) => {
        const last = t[t.length - 1];
        if (last && last[0] === next.lat && last[1] === next.lng) return t;
        const appended = [...t, [next.lat, next.lng] as [number, number]];
        return appended.length > BREADCRUMB_MAX
          ? appended.slice(appended.length - BREADCRUMB_MAX)
          : appended;
      });

      return { ...next, heading: resolvedHeading };
    });
  }

  /* ── "X seconds ago" live counter ── */
  useEffect(() => {
    if (!pos) return;
    const id = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - new Date(pos.updatedAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [pos]);

  /* ── Arrival detection (banner only — non-intrusive) ── */
  useEffect(() => {
    if (!pos || typeof toLat !== "number" || typeof toLng !== "number") {
      setArrivalState("");
      return;
    }
    const d = haversineKm(pos, { lat: toLat, lng: toLng });
    if      (d < ARRIVAL_RADIUS_KM)   setArrivalState("arrived");
    else if (d < APPROACH_RADIUS_KM)  setArrivalState("approaching");
    else                              setArrivalState("");
  }, [pos, toLat, toLng]);

  /* ── Lock body scroll while fullscreen ── */
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  const hasPickup   = typeof fromLat === "number" && typeof fromLng === "number";
  const hasDelivery = typeof toLat   === "number" && typeof toLng   === "number";

  const allPoints: [number, number][] = useMemo(() => {
    if (!pos) return [];
    return [
      [pos.lat, pos.lng],
      ...(hasPickup   ? [[fromLat!, fromLng!] as [number, number]] : []),
      ...(hasDelivery ? [[toLat!,   toLng!  ] as [number, number]] : []),
    ];
  }, [pos, hasPickup, hasDelivery, fromLat, fromLng, toLat, toLng]);

  // Distance/ETA to delivery point
  const stats = useMemo(() => {
    if (!pos || !hasDelivery) return null;
    const distanceKm = haversineKm(pos, { lat: toLat!, lng: toLng! });
    // Speed: prefer GPS, else assume 40 km/h in city traffic
    const speedMs   = typeof pos.speed === "number" && pos.speed > 1 ? pos.speed : null;
    const speedKmh  = speedMs ? speedMs * 3.6 : 40;
    const etaMin    = Math.max(1, Math.round((distanceKm / speedKmh) * 60));
    return { distanceKm, etaMin, speedKmh: speedMs ? speedKmh : null };
  }, [pos, hasDelivery, toLat, toLng]);

  /* ── Empty/loading states ── */
  if (!pos) {
    return (
      <div className="flex flex-col items-center justify-center h-44 bg-gray-50 rounded-2xl border border-gray-200">
        {noData ? (
          <>
            <MapPin className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400 font-medium">
              {isRTL
                ? "الناقل لم يشارك موقعه بعد"
                : "Le transporteur n'a pas encore partagé sa position"}
            </p>
          </>
        ) : (
          <span className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    );
  }

  const freshSecs  = secondsAgo < 30;
  const freshLabel =
    secondsAgo < 60
      ? isRTL ? `منذ ${secondsAgo}ث` : `il y a ${secondsAgo}s`
      : isRTL
        ? `منذ ${Math.floor(secondsAgo / 60)}د`
        : `il y a ${Math.floor(secondsAgo / 60)} min`;

  const containerClass = fullscreen
    ? "fixed inset-0 z-[9999] bg-white"
    : "relative rounded-2xl overflow-hidden border border-gray-200 shadow-md";
  const mapHeight = fullscreen ? "100dvh" : 320;

  return (
    /* Force LTR — Leaflet doesn't handle RTL natively */
    <div dir="ltr" className={containerClass} style={fullscreen ? undefined : { height: mapHeight }}>

      {/* ── Top-left: live badge + freshness ── */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm shadow-md rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-800">
          <span className={`w-2 h-2 rounded-full ${freshSecs ? "bg-green-400 animate-pulse" : "bg-orange-400"}`} />
          {isRTL ? "تتبع مباشر" : "Suivi en direct"}
        </div>
        {secondsAgo > 0 && (
          <div className={`bg-white/95 backdrop-blur-sm shadow-md rounded-full px-2.5 py-1.5 text-[10px] font-bold ${freshSecs ? "text-green-600" : "text-orange-500"}`}>
            {freshLabel}
          </div>
        )}
      </div>

      {/* ── Top-right: ETA / distance ── */}
      {stats && (
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm shadow-md rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <RouteIcon className="w-3.5 h-3.5 text-blue-500" />
            {stats.distanceKm < 1
              ? `${Math.round(stats.distanceKm * 1000)} m`
              : `${stats.distanceKm.toFixed(1)} km`}
          </div>
          <div className="bg-white/95 backdrop-blur-sm shadow-md rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            ~{stats.etaMin} min
          </div>
          {stats.speedKmh !== null && (
            <div className="hidden sm:flex bg-white/95 backdrop-blur-sm shadow-md rounded-full px-3 py-1.5 items-center gap-1.5 text-xs font-bold text-gray-800">
              <Gauge className="w-3.5 h-3.5 text-emerald-500" />
              {Math.round(stats.speedKmh)} km/h
            </div>
          )}
        </div>
      )}

      {/* ── Arrival banner ── */}
      {arrivalState && (
        <div className={`absolute top-14 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 pointer-events-none animate-slide-up ${
          arrivalState === "arrived"
            ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
            : "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
        }`}>
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <span className="text-sm font-bold whitespace-nowrap">
            {arrivalState === "arrived"
              ? (isRTL ? "🎉 الناقل وصل!" : "🎉 Le transporteur est arrivé!")
              : (isRTL ? "الناقل يقترب من الوجهة" : "Le transporteur approche")}
          </span>
        </div>
      )}

      {/* ── Bottom-left: legend ── */}
      <div className="absolute bottom-8 left-3 z-[1000] bg-white/95 backdrop-blur-sm shadow-md rounded-xl px-3 py-2 text-[11px] space-y-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
          <span className="font-semibold text-gray-700">{isRTL ? "الناقل" : "Transporteur"}</span>
        </div>
        {hasPickup && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
            <span className="text-gray-600">{isRTL ? "الانطلاق (A)" : "Départ (A)"}</span>
          </div>
        )}
        {hasDelivery && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-gray-600">{isRTL ? "التسليم (B)" : "Livraison (B)"}</span>
          </div>
        )}
      </div>

      {/* ── Bottom-right: action buttons ── */}
      <div className="absolute bottom-8 right-3 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => { setFollow(true); setFitTrigger((n) => n + 1); }}
          className="w-10 h-10 bg-white/95 backdrop-blur-sm shadow-md rounded-xl flex items-center justify-center text-gray-700 hover:text-orange-500 hover:bg-white transition-colors"
          title={isRTL ? "توسيط على الناقل" : "Centrer"}
        >
          <Locate className="w-4 h-4" />
        </button>
        <button
          onClick={() => setFullscreen((v) => !v)}
          className="w-10 h-10 bg-white/95 backdrop-blur-sm shadow-md rounded-xl flex items-center justify-center text-gray-700 hover:text-orange-500 hover:bg-white transition-colors"
          title={fullscreen ? (isRTL ? "تصغير" : "Réduire") : (isRTL ? "ملء الشاشة" : "Plein écran")}
        >
          {fullscreen
            ? <Minimize2 className="w-4 h-4" />
            : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Map ── */}
      <MapContainer
        center={[pos.lat, pos.lng]}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: typeof mapHeight === "number" ? `${mapHeight}px` : mapHeight, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Breadcrumb trail of past positions */}
        {trail.length > 1 && (
          <Polyline
            positions={trail}
            pathOptions={{
              color: "#F97316",
              weight: 4,
              opacity: 0.45,
              dashArray: "1,8",
              lineCap: "round",
            }}
          />
        )}

        {/* Straight-line route from current pos → delivery */}
        {hasDelivery && (
          <Polyline
            positions={[[pos.lat, pos.lng], [toLat!, toLng!]]}
            pathOptions={{
              color: "#10B981",
              weight: 3,
              opacity: 0.8,
              dashArray: "8,6",
              lineCap: "round",
            }}
          />
        )}

        {/* Transporter (live, rotates with heading) */}
        <Marker position={[pos.lat, pos.lng]} icon={makeTruckIcon(pos.heading ?? null)}>
          <Popup className="font-medium">
            {isRTL ? "📍 موقع الناقل" : "📍 Position du transporteur"}
          </Popup>
        </Marker>

        {/* Pickup A */}
        {hasPickup && (
          <Marker position={[fromLat!, fromLng!]} icon={makePickupIcon()}>
            <Popup>{isRTL ? "📦 نقطة الانطلاق" : "📦 Point de départ"}</Popup>
          </Marker>
        )}

        {/* Delivery B */}
        {hasDelivery && (
          <Marker position={[toLat!, toLng!]} icon={makeDeliveryIcon()}>
            <Popup>{isRTL ? "🏁 نقطة التسليم" : "🏁 Point de livraison"}</Popup>
          </Marker>
        )}

        <FitAll points={allPoints} trigger={fitTrigger} />
        <MapRecenter lat={pos.lat} lng={pos.lng} follow={follow} />
      </MapContainer>
    </div>
  );
}
