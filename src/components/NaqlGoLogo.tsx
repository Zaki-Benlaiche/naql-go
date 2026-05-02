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

          {/* ── Filled delivery truck (cab + cargo + wheels) ── */}
          {/* Cargo box (right, taller) */}
          <path d="M85,55 L156,55 Q163,55 163,62 L163,135 L85,135 Z" fill="white" />
          {/* Cab (left, lower, sloped front) */}
          <path d="M44,86 L85,86 L85,135 L37,135 Q31,135 31,129 L31,98 Q31,86 42,86 Z" fill="white" />
          {/* Cab window (orange = same as bg, reads as glass) */}
          <path d="M40,93 L80,93 L80,108 L40,108 Q37,108 37,105 L37,96 Q37,93 40,93 Z" fill={`url(#${uid}_bg)`} />
          {/* Cargo door divider line */}
          <rect x="122" y="60" width="3" height="75" fill="#E05000" fillOpacity="0.18" />
          {/* Front wheel */}
          <circle cx="58"  cy="148" r="15" fill="white" />
          <circle cx="58"  cy="148" r="5.5" fill={`url(#${uid}_bg)`} />
          {/* Rear wheel */}
          <circle cx="142" cy="148" r="15" fill="white" />
          <circle cx="142" cy="148" r="5.5" fill={`url(#${uid}_bg)`} />
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
      <path d="M85,55 L156,55 Q163,55 163,62 L163,135 L85,135 Z" fill="white" />
      <path d="M44,86 L85,86 L85,135 L37,135 Q31,135 31,129 L31,98 Q31,86 42,86 Z" fill="white" />
      <path d="M40,93 L80,93 L80,108 L40,108 Q37,108 37,105 L37,96 Q37,93 40,93 Z" fill="#FF7020" />
      <rect x="122" y="60" width="3" height="75" fill="#E05000" fillOpacity="0.18" />
      <circle cx="58"  cy="148" r="15" fill="white" />
      <circle cx="58"  cy="148" r="5.5" fill="#FF7020" />
      <circle cx="142" cy="148" r="15" fill="white" />
      <circle cx="142" cy="148" r="5.5" fill="#FF7020" />
    </svg>
  );
}
