"use client";

interface NaqlGoLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  iconOnly?: boolean;
  className?: string;
  dark?: boolean;
}

const sizeMap = {
  xs: { icon: 26, text: 14, gap: 6, sub: 7 },
  sm: { icon: 34, text: 17, gap: 8, sub: 9 },
  md: { icon: 44, text: 22, gap: 10, sub: 10 },
  lg: { icon: 56, text: 30, gap: 12, sub: 12 },
  xl: { icon: 68, text: 38, gap: 14, sub: 14 },
};

export function NaqlGoLogo({ size = "md", iconOnly = false, className = "", dark = false }: NaqlGoLogoProps) {
  const s = sizeMap[size];
  // Use unique IDs per instance to avoid SVG gradient conflicts
  const uid = `nlg_${size}_${dark ? "d" : "l"}`;

  return (
    <div className={`flex items-center ${className}`} style={{ gap: s.gap }}>
      {/* Icon Mark */}
      <div
        className="relative shrink-0"
        style={{ width: s.icon, height: s.icon }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-label="NaqlGo Logo"
        >
          <defs>
            {/* Primary gradient - warm orange with depth */}
            <linearGradient id={`${uid}_pri`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8A3D" />
              <stop offset="40%" stopColor="#FF6B00" />
              <stop offset="100%" stopColor="#D45500" />
            </linearGradient>
            {/* Shine overlay */}
            <linearGradient id={`${uid}_shine`} x1="0%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.22" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            {/* Glass accent */}
            <linearGradient id={`${uid}_glass`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            {/* Road gradient */}
            <linearGradient id={`${uid}_road`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="30%" stopColor="white" stopOpacity="0.35" />
              <stop offset="70%" stopColor="white" stopOpacity="0.35" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            {/* Drop shadow */}
            <filter id={`${uid}_ds`} x="-15%" y="-10%" width="130%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#D45500" floodOpacity="0.3" />
            </filter>
            {/* Inner glow */}
            <filter id={`${uid}_glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ━━ Background Shape ━━ */}
          {/* Squircle background */}
          <rect
            x="6" y="6" width="188" height="188" rx="48"
            fill={`url(#${uid}_pri)`}
            filter={`url(#${uid}_ds)`}
          />
          {/* Shine overlay */}
          <rect
            x="6" y="6" width="188" height="188" rx="48"
            fill={`url(#${uid}_shine)`}
          />
          {/* Subtle border */}
          <rect
            x="6" y="6" width="188" height="188" rx="48"
            fill="none"
            stroke="white"
            strokeOpacity="0.15"
            strokeWidth="1.5"
          />

          {/* ━━ Truck Design ━━ */}
          {/* Truck body - main frame with rounded modern shape */}
          <path
            d="M32 118V78c0-6.6 5.4-12 12-12h42v52H32z"
            fill="white"
            fillOpacity="0.95"
          />
          {/* Rounded cab roof detail */}
          <path
            d="M44 66c-6.6 0-12 5.4-12 12v4h12V66z"
            fill="white"
            fillOpacity="0.08"
          />

          {/* Cargo container - sleek */}
          <rect
            x="86" y="58" width="72" height="60" rx="8"
            fill="white"
            fillOpacity="0.95"
          />

          {/* Cargo cross-tape detail */}
          <line x1="122" y1="58" x2="122" y2="118" stroke="#FF6B00" strokeWidth="1.8" strokeOpacity="0.15" />
          <line x1="86" y1="88" x2="158" y2="88" stroke="#FF6B00" strokeWidth="1.8" strokeOpacity="0.15" />
          {/* Small NaqlGo "N" brand mark on cargo */}
          <text
            x="122" y="98"
            textAnchor="middle"
            fontFamily="'Segoe UI', Arial, sans-serif"
            fontWeight="900"
            fontSize="20"
            fill="#FF6B00"
            fillOpacity="0.1"
          >N</text>

          {/* Windshield - glass effect */}
          <rect
            x="38" y="72" width="36" height="20" rx="4"
            fill={`url(#${uid}_glass)`}
            fillOpacity="0.25"
          />
          {/* Windshield glare line */}
          <line x1="42" y1="76" x2="48" y2="76" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />

          {/* Bumper bar */}
          <rect x="28" y="114" width="134" height="8" rx="4" fill="white" fillOpacity="0.92" />

          {/* ━━ Wheels - detailed with rim design ━━ */}
          {/* Left wheel */}
          <circle cx="58" cy="134" r="16" fill="white" fillOpacity="0.95" />
          <circle cx="58" cy="134" r="11" fill={`url(#${uid}_pri)`} />
          <circle cx="58" cy="134" r="7" fill="white" fillOpacity="0.15" />
          <circle cx="58" cy="134" r="4" fill="white" />
          {/* Rim spokes */}
          <line x1="58" y1="125" x2="58" y2="129" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="58" y1="139" x2="58" y2="143" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="49" y1="134" x2="53" y2="134" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="63" y1="134" x2="67" y2="134" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />

          {/* Right wheel */}
          <circle cx="138" cy="134" r="16" fill="white" fillOpacity="0.95" />
          <circle cx="138" cy="134" r="11" fill={`url(#${uid}_pri)`} />
          <circle cx="138" cy="134" r="7" fill="white" fillOpacity="0.15" />
          <circle cx="138" cy="134" r="4" fill="white" />
          {/* Rim spokes */}
          <line x1="138" y1="125" x2="138" y2="129" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="138" y1="139" x2="138" y2="143" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="129" y1="134" x2="133" y2="134" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="143" y1="134" x2="147" y2="134" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />

          {/* ━━ Motion Effects ━━ */}
          {/* Speed lines - left side */}
          <line x1="8" y1="78" x2="22" y2="78" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.55" />
          <line x1="4" y1="88" x2="20" y2="88" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.35" />
          <line x1="10" y1="98" x2="24" y2="98" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.45" />

          {/* Forward arrow cluster - top right */}
          <g opacity="0.9">
            <path
              d="M148 34l18 0"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M160 26l8 8-8 8"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
          {/* Secondary smaller arrow */}
          <g opacity="0.5">
            <path
              d="M140 46l10 0"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M146 42l5 4-5 4"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>

          {/* ━━ Decorative Elements ━━ */}
          {/* Location pin - top left (GPS tracking symbol) */}
          <g opacity="0.35">
            <circle cx="24" cy="38" r="7" fill="none" stroke="white" strokeWidth="2" />
            <circle cx="24" cy="38" r="2.5" fill="white" />
            <line x1="24" y1="45" x2="24" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Sparkle dots - representing premium quality */}
          <circle cx="172" cy="56" r="2.5" fill="white" fillOpacity="0.5" />
          <circle cx="180" cy="48" r="1.5" fill="white" fillOpacity="0.3" />
          <circle cx="176" cy="66" r="1.8" fill="white" fillOpacity="0.35" />

          {/* Road surface */}
          <rect x="20" y="152" width="160" height="2.5" rx="1.25" fill={`url(#${uid}_road)`} />
          <rect x="55" y="158" width="90" height="1.5" rx="0.75" fill="white" fillOpacity="0.12" />
          {/* Dashed center line */}
          <line x1="60" y1="155" x2="76" y2="155" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.15" />
          <line x1="84" y1="155" x2="100" y2="155" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.15" />
          <line x1="108" y1="155" x2="124" y2="155" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.15" />
          <line x1="132" y1="155" x2="140" y2="155" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.15" />
        </svg>
      </div>

      {/* Text */}
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
            Naql<span style={{
              background: "linear-gradient(135deg, #FF8A3D, #FF6B00, #D45500)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Go</span>
          </span>
          {size !== "xs" && size !== "sm" && (
            <span
              className="font-semibold tracking-wider uppercase leading-none mt-0.5"
              style={{
                fontSize: s.sub,
                color: dark ? "rgba(255,138,61,0.75)" : "rgba(212,85,0,0.55)",
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

/**
 * Favicon-optimized SVG export
 */
export function NaqlGoFavicon() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="favPri" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8A3D" />
          <stop offset="40%" stopColor="#FF6B00" />
          <stop offset="100%" stopColor="#D45500" />
        </linearGradient>
        <linearGradient id="favShine" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.2" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="192" height="192" rx="48" fill="url(#favPri)" />
      <rect x="4" y="4" width="192" height="192" rx="48" fill="url(#favShine)" />
      {/* Truck body */}
      <path d="M32 118V78c0-6.6 5.4-12 12-12h42v52H32z" fill="white" fillOpacity="0.95" />
      <rect x="86" y="58" width="72" height="60" rx="8" fill="white" fillOpacity="0.95" />
      {/* Windshield */}
      <rect x="38" y="72" width="36" height="20" rx="4" fill="#2563EB" fillOpacity="0.2" />
      {/* Bumper */}
      <rect x="28" y="114" width="134" height="8" rx="4" fill="white" fillOpacity="0.92" />
      {/* Wheels */}
      <circle cx="58" cy="134" r="16" fill="white" fillOpacity="0.95" />
      <circle cx="58" cy="134" r="10" fill="#D45500" />
      <circle cx="58" cy="134" r="4" fill="white" />
      <circle cx="138" cy="134" r="16" fill="white" fillOpacity="0.95" />
      <circle cx="138" cy="134" r="10" fill="#D45500" />
      <circle cx="138" cy="134" r="4" fill="white" />
      {/* Speed arrow */}
      <path d="M148 34l18 0M160 26l8 8-8 8" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Speed lines */}
      <line x1="8" y1="80" x2="22" y2="80" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="4" y1="90" x2="18" y2="90" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.35" />
      <line x1="10" y1="100" x2="22" y2="100" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.45" />
    </svg>
  );
}
