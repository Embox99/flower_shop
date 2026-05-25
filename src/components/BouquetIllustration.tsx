"use client";
import React from "react";

type Props = {
  palette: string[];
  seed?: number;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Abstract SVG bouquet illustration, parametrised by palette + seed.
 * Used in place of stock photography to keep the botanical aesthetic
 * consistent and offline-friendly.
 */
const BouquetIllustration: React.FC<Props> = ({ palette, seed = 1, className, style }) => {
  const blooms = React.useMemo(() => {
    let s = seed * 9301 + 49297;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const arr = [];
    for (let i = 0; i < 18; i++) {
      arr.push({
        cx: 50 + (rand() - 0.5) * 70,
        cy: 38 + (rand() - 0.5) * 36,
        r: 6 + rand() * 7,
        c: palette[Math.floor(rand() * palette.length)],
        rot: rand() * 360,
        kind: rand() > 0.55 ? "rose" : rand() > 0.4 ? "daisy" : "fill",
      });
    }
    arr.sort((a, b) => a.r - b.r);
    return arr;
  }, [palette, seed]);

  return (
    <svg
      viewBox="0 0 100 120"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="#5a6a48" strokeWidth="0.8" strokeLinecap="round" opacity="0.85">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={50 + (i - 4) * 1.8} y1={62} x2={50 + (i - 4) * 0.6} y2={108} />
        ))}
      </g>
      <path
        d="M30 76 Q50 70 70 76 L66 108 Q50 104 34 108 Z"
        fill="#efe2c7"
        stroke="#c9a47a"
        strokeWidth="0.6"
      />
      <path d="M50 78 L50 108" stroke="#c9a47a" strokeWidth="0.5" opacity="0.6" />
      <g fill="#7a8a5a" opacity="0.85">
        <ellipse cx="22" cy="48" rx="8" ry="4" transform="rotate(-30 22 48)" />
        <ellipse cx="78" cy="46" rx="8" ry="4" transform="rotate(28 78 46)" />
        <ellipse cx="34" cy="64" rx="6" ry="3" transform="rotate(-10 34 64)" />
        <ellipse cx="66" cy="64" rx="6" ry="3" transform="rotate(15 66 64)" />
      </g>
      {blooms.map((b, i) => (
        <g key={i} transform={`translate(${b.cx} ${b.cy}) rotate(${b.rot})`}>
          {b.kind === "daisy" ? (
            <>
              {Array.from({ length: 8 }).map((_, j) => (
                <ellipse
                  key={j}
                  cx="0"
                  cy={-b.r * 0.7}
                  rx={b.r * 0.35}
                  ry={b.r * 0.7}
                  fill={b.c}
                  transform={`rotate(${j * 45})`}
                />
              ))}
              <circle r={b.r * 0.35} fill="#3d2f24" />
            </>
          ) : b.kind === "rose" ? (
            <>
              <circle r={b.r} fill={b.c} />
              <circle r={b.r * 0.65} fill={b.c} opacity="0.85" stroke="rgba(0,0,0,0.15)" strokeWidth="0.3" />
              <circle r={b.r * 0.35} fill={b.c} opacity="0.7" stroke="rgba(0,0,0,0.15)" strokeWidth="0.3" />
            </>
          ) : (
            <circle r={b.r} fill={b.c} opacity="0.9" />
          )}
        </g>
      ))}
    </svg>
  );
};

export default BouquetIllustration;
