"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin } from "lucide-react";

/* ── Custom SVG icons (avoids Next.js default-icon path issues) ── */
const makeTruckIcon = () =>
  L.divIcon({
    className: "",
    html: `<div style="
      background:linear-gradient(135deg,#F97316,#EA580C);
      width:44px;height:44px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      border:3px solid white;
      box-shadow:0 4px 16px rgba(249,115,22,0.55);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
        viewBox="0 0 24 24" fill="none" stroke="white"
        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -26],
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
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
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
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  });

/* ── Smooth pan to new transporter position ── */
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prev = useRef("");
  useEffect(() => {
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (key !== prev.current) {
      map.panTo([lat, lng], { animate: true, duration: 0.8 });
      prev.current = key;
    }
  }, [lat, lng, map]);
  return null;
}

/* ── FitBounds on first load when all points are known ── */
function FitAll({
  points,
}: {
  points: [number, number][];
}) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || points.length < 2) return;
    const bounds = L.latLngBounds(points.map(([la, ln]) => L.latLng(la, ln)));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    done.current = true;
  }, [points, map]);
  return null;
}

/* ── Main component ── */
type Props = {
  requestId: string;
  fromLat?: number | null;
  fromLng?: number | null;
  toLat?: number | null;
  toLng?: number | null;
};

export default function LiveMap({ requestId, fromLat, fromLng, toLat, toLng }: Props) {
  const { lang } = useLanguage();
  const [pos, setPos] = useState<{ lat: number; lng: number; updatedAt: string } | null>(null);
  const [noData, setNoData] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Poll location every 10 seconds
  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(`/api/orders/${requestId}/location`);
        if (res.ok) {
          const data = await res.json();
          if (data?.lat) {
            setPos(data);
            setNoData(false);
          } else {
            setNoData(true);
          }
        }
      } catch {}
    }
    poll();
    const id = setInterval(poll, 10_000);
    return () => clearInterval(id);
  }, [requestId]);

  // "X seconds ago" live counter
  useEffect(() => {
    if (!pos) return;
    const id = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - new Date(pos.updatedAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [pos]);

  /* ── Empty states ── */
  if (!pos) {
    return (
      <div className="flex flex-col items-center justify-center h-44 bg-gray-50 rounded-2xl border border-gray-200">
        {noData ? (
          <>
            <MapPin className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400 font-medium">
              {lang === "ar"
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

  const truckIcon    = makeTruckIcon();
  const pickupIcon   = makePickupIcon();
  const deliveryIcon = makeDeliveryIcon();

  const hasPickup   = typeof fromLat === "number" && typeof fromLng === "number";
  const hasDelivery = typeof toLat   === "number" && typeof toLng   === "number";

  const allPoints: [number, number][] = [
    [pos.lat, pos.lng],
    ...(hasPickup   ? [[fromLat!, fromLng!] as [number, number]] : []),
    ...(hasDelivery ? [[toLat!,   toLng!  ] as [number, number]] : []),
  ];

  const freshSecs  = secondsAgo < 20;
  const freshLabel =
    secondsAgo < 60
      ? lang === "ar" ? `منذ ${secondsAgo}ث` : `il y a ${secondsAgo}s`
      : lang === "ar"
        ? `منذ ${Math.floor(secondsAgo / 60)}د`
        : `il y a ${Math.floor(secondsAgo / 60)}min`;

  return (
    /* Force LTR — Leaflet doesn't handle RTL natively */
    <div dir="ltr" className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-md" style={{ height: 300 }}>

      {/* ── Top badges ── */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm shadow-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700">
          <span className={`w-2 h-2 rounded-full ${freshSecs ? "bg-green-400 animate-pulse" : "bg-orange-400"}`} />
          {lang === "ar" ? "تتبع مباشر 🛰" : "Suivi en direct 🛰"}
        </div>
        {secondsAgo > 0 && (
          <div className={`bg-white/90 shadow-sm rounded-full px-2.5 py-1.5 text-[10px] font-medium ${freshSecs ? "text-green-600" : "text-orange-500"}`}>
            {freshLabel}
          </div>
        )}
      </div>

      {/* ── Legend (bottom-left) ── */}
      <div className="absolute bottom-8 left-3 z-[1000] bg-white/95 backdrop-blur-sm shadow-sm rounded-xl px-3 py-2 text-[11px] space-y-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
          <span className="font-medium text-gray-700">{lang === "ar" ? "الناقل" : "Transporteur"}</span>
        </div>
        {hasPickup && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
            <span className="text-gray-600">{lang === "ar" ? "نقطة الانطلاق (A)" : "Départ (A)"}</span>
          </div>
        )}
        {hasDelivery && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-gray-600">{lang === "ar" ? "نقطة التسليم (B)" : "Livraison (B)"}</span>
          </div>
        )}
      </div>

      {/* ── Map ── */}
      <MapContainer
        center={[pos.lat, pos.lng]}
        zoom={13}
        scrollWheelZoom={false}
        zoomControl={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Transporter (live) */}
        <Marker position={[pos.lat, pos.lng]} icon={truckIcon}>
          <Popup className="font-medium">
            {lang === "ar" ? "📍 موقع الناقل" : "📍 Position du transporteur"}
          </Popup>
        </Marker>

        {/* Pickup point A */}
        {hasPickup && (
          <Marker position={[fromLat!, fromLng!]} icon={pickupIcon}>
            <Popup>{lang === "ar" ? "📦 نقطة الانطلاق" : "📦 Point de départ"}</Popup>
          </Marker>
        )}

        {/* Delivery point B */}
        {hasDelivery && (
          <Marker position={[toLat!, toLng!]} icon={deliveryIcon}>
            <Popup>{lang === "ar" ? "🏁 نقطة التسليم" : "🏁 Point de livraison"}</Popup>
          </Marker>
        )}

        {/* Fit all markers on first render */}
        <FitAll points={allPoints} />

        {/* Smooth pan on each GPS update */}
        <MapRecenter lat={pos.lat} lng={pos.lng} />
      </MapContainer>
    </div>
  );
}
