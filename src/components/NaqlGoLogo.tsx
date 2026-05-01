"use client";

interface NaqlGoLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  iconOnly?: boolean;
  className?: string;
  dark?: boolean;
}

const sizeMap = {
  xs: { icon: 26, text: 14, gap: 6,  sub: 7  },
  sm: { icon: 34, text: 17, gap: 8,  sub: 9  },
  md: { icon: 44, text: 22, gap: 10, sub: 10 },
  lg: { icon: 56, text: 30, gap: 12, sub: 12 },
  xl: { icon: 68, text: 38, gap: 14, sub: 14 },
};

export function NaqlGoLogo({
  size = "md", iconOnly = false, className = "", dark = false,
}: NaqlGoLogoProps) {
  const s   = sizeMap[size];
  const uid = `nlg_${size}_${dark ? "d" : "l"}`;

  return (
    <div className={`flex items-center ${className}`} style={{ gap: s.gap }}>
      {/* Icon mark */}
      <div className="relative shrink-0" style={{ width: s.icon, height: s.icon }}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-label="NaqlGo"
        >
          <defs>
            {/* Orange squircle background */}
            <linearGradient id={`${uid}_bg`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#FF7A20" />
              <stop offset="100%" stopColor="#C94400" />
            </linearGradient>
            {/* Subtle shine on background */}
            <linearGradient id={`${uid}_sh`} x1="0%" y1="0%" x2="60%" y2="100%">
              <stop offset="0%"   stopColor="white" stopOpacity="0.22" />
              <stop offset="100%" stopColor="white" stopOpacity="0"    />
            </linearGradient>
            {/* Drop shadow */}
            <filter id={`${uid}_ds`} x="-15%" y="-10%" width="130%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="7"
                floodColor="#C04000" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* ── Background squircle ── */}
          <rect x="6" y="6" width="188" height="188" rx="48"
            fill={`url(#${uid}_bg)`} filter={`url(#${uid}_ds)`} />
          <rect x="6" y="6" width="188" height="188" rx="48"
            fill={`url(#${uid}_sh)`} />
          <rect x="6" y="6" width="188" height="188" rx="48"
            fill="none" stroke="white" strokeOpacity="0.14" strokeWidth="1.5" />

          {/* ── Location pin (white) ──
              Path: tip(100,166) → left-shoulder(64,116) → large CCW arc to right-shoulder(136,116) → close
              The arc draws the full circle on top of the pin.
          ── */}
          <path
            d="M100,166 L64,116 A50,50 0 1 0 136,116 Z"
            fill="white"
            fillOpacity="0.97"
          />

          {/* ── Truck inside pin (dark navy) ── */}
          {/* Cargo container */}
          <rect x="80" y="58" width="62" height="38" rx="6" fill="#0D1F35" />
          {/* Cab — rectangle with rounded top-left corner */}
          <path d="M58,96 L58,72 Q58,62 68,62 L80,62 L80,96 Z" fill="#0D1F35" />
          {/* Windshield — orange accent (brand colour on dark cab) */}
          <rect x="62" y="70" width="14" height="14" rx="2" fill="#FF6B00" fillOpacity="0.9" />
          {/* Wheel left */}
          <circle cx="70"  cy="105" r="11" fill="#0D1F35" />
          <circle cx="70"  cy="105" r="4.5" fill="white" fillOpacity="0.8" />
          {/* Wheel right */}
          <circle cx="122" cy="105" r="11" fill="#0D1F35" />
          <circle cx="122" cy="105" r="4.5" fill="white" fillOpacity="0.8" />

          {/* ── Speed lines (left, white on orange bg) ── */}
          <line x1="12" y1="82"  x2="26" y2="82"
            stroke="white" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.72" />
          <line x1="8"  y1="96"  x2="24" y2="96"
            stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.48" />
          <line x1="12" y1="110" x2="26" y2="110"
            stroke="white" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.62" />
        </svg>
      </div>

      {/* Wordmark */}
      {!iconOnly && (
        <div className="flex flex-col min-w-0">
          <span
            className="font-bold tracking-tight leading-none"
            style={{
              fontSize: s.text,
              color: dark ? "#ffffff" : "#0F172A",
              letterSpacing: "-0.02em",
            }}
          >
            Naql
            <span style={{
              background: "linear-gradient(135deg, #FF7A20, #FF6B00, #C94400)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Go
            </span>
          </span>
          {size !== "xs" && size !== "sm" && (
            <span
              className="font-semibold tracking-wider uppercase leading-none mt-0.5"
              style={{
                fontSize: s.sub,
                color: dark ? "rgba(255,122,32,0.75)" : "rgba(180,70,0,0.5)",
                letterSpacing: "0.1em",
              }}
            >
              نقل وشحن
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Favicon-optimised mark */
export function NaqlGoFavicon() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="192" height="192" rx="48" fill="#FF7020" />
      <rect x="4" y="4" width="192" height="192" rx="48"
        fill="none" stroke="white" strokeOpacity="0.14" strokeWidth="1.5" />
      {/* Pin */}
      <path d="M100,166 L64,116 A50,50 0 1 0 136,116 Z" fill="white" fillOpacity="0.97" />
      {/* Truck (simplified) */}
      <rect x="80" y="58" width="62" height="38" rx="6" fill="#0D1F35" />
      <path d="M58,96 L58,72 Q58,62 68,62 L80,62 L80,96 Z" fill="#0D1F35" />
      <rect x="62" y="70" width="14" height="14" rx="2" fill="#FF6B00" fillOpacity="0.9" />
      <circle cx="70"  cy="105" r="11" fill="#0D1F35" />
      <circle cx="70"  cy="105" r="4.5" fill="white" fillOpacity="0.8" />
      <circle cx="122" cy="105" r="11" fill="#0D1F35" />
      <circle cx="122" cy="105" r="4.5" fill="white" fillOpacity="0.8" />
      {/* Speed lines */}
      <line x1="12" y1="82"  x2="26" y2="82"  stroke="white" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="8"  y1="96"  x2="24" y2="96"  stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.48" />
      <line x1="12" y1="110" x2="26" y2="110" stroke="white" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.62" />
    </svg>
  );
}
