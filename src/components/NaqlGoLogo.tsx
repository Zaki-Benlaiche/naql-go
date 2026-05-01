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
  size = "md",
  iconOnly = false,
  className = "",
  dark = false,
}: NaqlGoLogoProps) {
  const s = sizeMap[size];
  const uid = `nlg_${size}_${dark ? "d" : "l"}`;

  return (
    <div className={`flex items-center ${className}`} style={{ gap: s.gap }}>

      {/* ── Icon Mark ── */}
      <div className="relative shrink-0" style={{ width: s.icon, height: s.icon }}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-label="NaqlGo icon"
        >
          <defs>
            {/* Orange brand gradient */}
            <linearGradient id={`${uid}_bg`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#FF9040" />
              <stop offset="45%"  stopColor="#FF6500" />
              <stop offset="100%" stopColor="#C94400" />
            </linearGradient>
            {/* Top-left gloss */}
            <linearGradient id={`${uid}_gloss`} x1="10%" y1="0%" x2="55%" y2="75%">
              <stop offset="0%"   stopColor="white" stopOpacity="0.2" />
              <stop offset="100%" stopColor="white" stopOpacity="0"   />
            </linearGradient>
            {/* Windshield blue */}
            <linearGradient id={`${uid}_glass`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#93C5FD" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            {/* Wheel rim */}
            <linearGradient id={`${uid}_rim`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#FF7A1A" />
              <stop offset="100%" stopColor="#B83A00" />
            </linearGradient>
            {/* Icon drop shadow */}
            <filter id={`${uid}_ds`} x="-15%" y="-10%" width="130%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="#B83A00" floodOpacity="0.38" />
            </filter>
          </defs>

          {/* ── Background: squircle ── */}
          <rect x="6" y="6" width="188" height="188" rx="52"
            fill={`url(#${uid}_bg)`} filter={`url(#${uid}_ds)`} />
          <rect x="6" y="6" width="188" height="188" rx="52"
            fill={`url(#${uid}_gloss)`} />
          <rect x="6" y="6" width="188" height="188" rx="52"
            fill="none" stroke="white" strokeOpacity="0.13" strokeWidth="1.5" />

          {/* ── Cargo container (right block) ── */}
          <rect x="82" y="48" width="90" height="72" rx="11"
            fill="white" fillOpacity="0.96" />
          {/* Cargo door center divider */}
          <line x1="127" y1="48" x2="127" y2="120"
            stroke="#FF6500" strokeWidth="1.5" strokeOpacity="0.11" />
          <line x1="82"  y1="84" x2="172" y2="84"
            stroke="#FF6500" strokeWidth="1.5" strokeOpacity="0.11" />
          {/* Small "N" brand stamp on cargo */}
          <text x="105" y="100"
            fontFamily="'Segoe UI','Arial',sans-serif"
            fontWeight="900" fontSize="22"
            fill="#FF6500" fillOpacity="0.08"
            textAnchor="middle">N</text>

          {/* ── Cab (left block) ── */}
          <path d="M26 120 L26 76 Q26 66 36 66 L82 66 L82 120 Z"
            fill="white" fillOpacity="0.96" />

          {/* Windshield */}
          <rect x="32" y="72" width="44" height="27" rx="7"
            fill={`url(#${uid}_glass)`} fillOpacity="0.28" />
          {/* Windshield glare */}
          <line x1="36" y1="78" x2="45" y2="78"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.55" />

          {/* Headlight strip */}
          <rect x="19" y="84" width="9" height="16" rx="4.5"
            fill="white" fillOpacity="0.92" />
          {/* Headlight inner glow */}
          <rect x="21" y="86" width="5" height="10" rx="2.5"
            fill="#FFF0C0" fillOpacity="0.5" />

          {/* Bumper / chassis rail */}
          <rect x="17" y="116" width="162" height="10" rx="5"
            fill="white" fillOpacity="0.93" />

          {/* ── Wheels ── */}
          {/* Front wheel */}
          <circle cx="57"  cy="140" r="20" fill="white" fillOpacity="0.95" />
          <circle cx="57"  cy="140" r="13" fill={`url(#${uid}_rim)`} />
          <circle cx="57"  cy="140" r="8"  fill="white" fillOpacity="0.1" />
          <circle cx="57"  cy="140" r="5"  fill="white" fillOpacity="0.92" />
          <line x1="57" y1="128" x2="57" y2="133" stroke="white" strokeWidth="1.5" strokeOpacity="0.42" />
          <line x1="57" y1="147" x2="57" y2="152" stroke="white" strokeWidth="1.5" strokeOpacity="0.42" />
          <line x1="45"  y1="140" x2="50"  y2="140" stroke="white" strokeWidth="1.5" strokeOpacity="0.42" />
          <line x1="64"  y1="140" x2="69"  y2="140" stroke="white" strokeWidth="1.5" strokeOpacity="0.42" />

          {/* Rear wheel */}
          <circle cx="143" cy="140" r="20" fill="white" fillOpacity="0.95" />
          <circle cx="143" cy="140" r="13" fill={`url(#${uid}_rim)`} />
          <circle cx="143" cy="140" r="8"  fill="white" fillOpacity="0.1" />
          <circle cx="143" cy="140" r="5"  fill="white" fillOpacity="0.92" />
          <line x1="143" y1="128" x2="143" y2="133" stroke="white" strokeWidth="1.5" strokeOpacity="0.42" />
          <line x1="143" y1="147" x2="143" y2="152" stroke="white" strokeWidth="1.5" strokeOpacity="0.42" />
          <line x1="131" y1="140" x2="136" y2="140" stroke="white" strokeWidth="1.5" strokeOpacity="0.42" />
          <line x1="150" y1="140" x2="155" y2="140" stroke="white" strokeWidth="1.5" strokeOpacity="0.42" />

          {/* ── Motion: speed lines (left) ── */}
          <line x1="6"  y1="80"  x2="20" y2="80"  stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.62" />
          <line x1="3"  y1="92"  x2="17" y2="92"  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.42" />
          <line x1="6"  y1="104" x2="19" y2="104" stroke="white" strokeWidth="3"   strokeLinecap="round" strokeOpacity="0.52" />

          {/* ── Motion: forward arrows (top-right) ── */}
          <g opacity="0.88">
            <line x1="150" y1="30" x2="170" y2="30"
              stroke="white" strokeWidth="4" strokeLinecap="round" />
            <path d="M162 22 L170 30 L162 38"
              stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
          <g opacity="0.45">
            <line x1="142" y1="42" x2="158" y2="42"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M152 35 L158 42 L152 49"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>

          {/* ── Road surface (decorative) ── */}
          <rect x="28" y="162" width="144" height="3"   rx="1.5" fill="white" fillOpacity="0.1" />
          <rect x="50" y="167" width="14"  height="2"   rx="1"   fill="white" fillOpacity="0.07" />
          <rect x="78" y="167" width="14"  height="2"   rx="1"   fill="white" fillOpacity="0.07" />
          <rect x="106" y="167" width="14" height="2"   rx="1"   fill="white" fillOpacity="0.07" />
          <rect x="134" y="167" width="14" height="2"   rx="1"   fill="white" fillOpacity="0.07" />
        </svg>
      </div>

      {/* ── Text Mark ── */}
      {!iconOnly && (
        <div className="flex flex-col min-w-0">
          <span
            className="font-black tracking-tight leading-none"
            style={{
              fontSize: s.text,
              color: dark ? "#ffffff" : "#0F172A",
              letterSpacing: "-0.03em",
            }}
          >
            Naql
            <span
              style={{
                background: "linear-gradient(135deg, #FF8A3D 0%, #FF6500 55%, #C94400 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Go
            </span>
          </span>

          {size !== "xs" && size !== "sm" && (
            <span
              className="font-bold leading-none mt-1"
              style={{
                fontSize: s.sub,
                color: dark ? "rgba(255,144,64,0.72)" : "rgba(180,68,0,0.52)",
                letterSpacing: "0.13em",
              }}
            >
              نقل · شحن
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Simplified favicon-optimized SVG (no unique IDs needed — standalone file) */
export function NaqlGoFavicon() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="f_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#FF9040" />
          <stop offset="100%" stopColor="#C94400" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="188" height="188" rx="52" fill="url(#f_bg)" />
      <rect x="6" y="6" width="188" height="188" rx="52" fill="white" fillOpacity="0.1" />
      <rect x="82" y="48" width="90" height="72" rx="11" fill="white" fillOpacity="0.95" />
      <path d="M26 120 L26 76 Q26 66 36 66 L82 66 L82 120 Z" fill="white" fillOpacity="0.95" />
      <rect x="32" y="72" width="44" height="27" rx="7" fill="#2563EB" fillOpacity="0.25" />
      <rect x="19" y="84" width="9" height="16" rx="4.5" fill="white" fillOpacity="0.9" />
      <rect x="17" y="116" width="162" height="10" rx="5" fill="white" fillOpacity="0.92" />
      <circle cx="57"  cy="140" r="20" fill="white" fillOpacity="0.95" />
      <circle cx="57"  cy="140" r="13" fill="#B83A00" />
      <circle cx="57"  cy="140" r="5"  fill="white"  fillOpacity="0.9" />
      <circle cx="143" cy="140" r="20" fill="white" fillOpacity="0.95" />
      <circle cx="143" cy="140" r="13" fill="#B83A00" />
      <circle cx="143" cy="140" r="5"  fill="white"  fillOpacity="0.9" />
      <line x1="6"  y1="80"  x2="20" y2="80"  stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="3"  y1="92"  x2="17" y2="92"  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" />
      <line x1="6"  y1="104" x2="19" y2="104" stroke="white" strokeWidth="3"   strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="150" y1="30" x2="170" y2="30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.88" />
      <path d="M162 22 L170 30 L162 38" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.88" />
    </svg>
  );
}
