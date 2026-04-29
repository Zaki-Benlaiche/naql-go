"use client";
import { useEffect, useRef } from "react";

type Props = {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number, label: string) => void;
  label: string;
};

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

let leafletLoaded = false;

export function MapPicker({ lat, lng, onChange, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof window.L.map> | null>(null);
  const markerRef = useRef<ReturnType<typeof window.L.marker> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    function initMap() {
      if (mapRef.current || !containerRef.current) return;
      const L = window.L;

      const map = L.map(containerRef.current, { zoomControl: true }).setView(
        lat && lng ? [lat, lng] : [28.0339, 1.6596], // Center of Algeria
        lat && lng ? 13 : 5
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      if (lat && lng) {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      map.on("click", async (e: { latlng: { lat: number; lng: number } }) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          markerRef.current = L.marker([clickLat, clickLng]).addTo(map);
        }
        // Reverse geocode with Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${clickLat}&lon=${clickLng}&format=json`,
            { headers: { "Accept-Language": "ar" } }
          );
          const data = await res.json();
          const displayName = data.display_name?.split(",").slice(0, 2).join("، ") ?? `${clickLat.toFixed(4)}, ${clickLng.toFixed(4)}`;
          onChange(clickLat, clickLng, displayName);
        } catch {
          onChange(clickLat, clickLng, `${clickLat.toFixed(4)}, ${clickLng.toFixed(4)}`);
        }
      });

      mapRef.current = map;
    }

    if (leafletLoaded && window.L) {
      initMap();
      return;
    }

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => { leafletLoaded = true; initMap(); };
    document.head.appendChild(script);

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500">{label}</p>
      <div ref={containerRef} className="w-full h-48 rounded-xl overflow-hidden border border-gray-200 z-0" />
    </div>
  );
}
