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
      <div className="relative shrink-0" style={{ width: s.icon, height: s.icon }}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-label="NaqlGo"
        >
          <defs>
            <linearGradient id={`${uid}_bg`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#FF7520" />
              <stop offset="100%" stopColor="#E05000" />
            </linearGradient>
            <filter id={`${uid}_ds`} x="-15%" y="-10%" width="130%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="7"
                floodColor="#BF4000" floodOpacity="0.32" />
            </filter>
          </defs>

          {/* Orange squircle */}
          <rect x="6" y="6" width="188" height="188" rx="52"
            fill={`url(#${uid}_bg)`} filter={`url(#${uid}_ds)`} />

          {/* ── Truck icon (white stroke, outline style) ──
              Cab on LEFT (shorter), Cargo on RIGHT (taller).
              Path: bottom-left → up left → round cab top-left → cab roof →
                    step up to cargo → round cargo corners → down right side
          ── */}
          <path
            d="M40,128 L40,92 Q40,78 54,78 L82,78 L82,59 Q82,45 96,45 L151,45 Q165,45 165,59 L165,128"
            fill="none"
            stroke="white"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bottom undercarriage */}
          <line x1="40" y1="128" x2="165" y2="128"
            stroke="white" strokeWidth="11" strokeLinecap="round" />

          {/* Wheel left (under cab) */}
          <circle cx="64"  cy="148" r="20" fill="white" fillOpacity="0.96" />

          {/* Wheel right (under cargo rear) */}
          <circle cx="147" cy="148" r="20" fill="white" fillOpacity="0.96" />
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
              background: "linear-gradient(135deg, #FF7520, #FF6B00, #D45500)",
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
                color: dark ? "rgba(255,120,32,0.75)" : "rgba(180,70,0,0.5)",
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

export function NaqlGoFavicon() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="192" height="192" rx="52" fill="#FF7020" />
      <path
        d="M40,128 L40,92 Q40,78 54,78 L82,78 L82,59 Q82,45 96,45 L151,45 Q165,45 165,59 L165,128"
        fill="none" stroke="white" strokeWidth="11"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <line x1="40" y1="128" x2="165" y2="128"
        stroke="white" strokeWidth="11" strokeLinecap="round" />
      <circle cx="64"  cy="148" r="20" fill="white" fillOpacity="0.96" />
      <circle cx="147" cy="148" r="20" fill="white" fillOpacity="0.96" />
    </svg>
  );
}
