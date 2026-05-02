"use client";

interface NaqlGoLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  iconOnly?: boolean;
  className?: string;
  dark?: boolean;
}

const sizeMap = {
  xs: { icon: 28, text: 14, gap: 6,  sub: 7  },
  sm: { icon: 36, text: 17, gap: 8,  sub: 9  },
  md: { icon: 48, text: 22, gap: 10, sub: 10 },
  lg: { icon: 60, text: 30, gap: 12, sub: 12 },
  xl: { icon: 72, text: 38, gap: 14, sub: 14 },
};

export function NaqlGoLogo({
  size = "md", iconOnly = false, className = "", dark = false,
}: NaqlGoLogoProps) {
  const s = sizeMap[size];

  return (
    <div className={`flex items-center ${className}`} style={{ gap: s.gap }}>
      <img
        src="/logo2.png"
        alt="NaqlGo"
        width={s.icon}
        height={s.icon}
        className="shrink-0 select-none"
        style={{
          width: s.icon,
          height: s.icon,
          objectFit: "contain",
          borderRadius: Math.round(s.icon * 0.22),
        }}
        draggable={false}
      />

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
