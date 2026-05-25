import React from "react";

type Props = { size?: number; color?: string };

const FlowerShopMark: React.FC<Props> = ({ size = 32, color = "currentColor" }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const x = 24 + Math.cos(a) * 18;
          const y = 24 + Math.sin(a) * 18;
          return (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx="3.5"
              ry="1.6"
              transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`}
              fill={color}
              fillOpacity="0.18"
            />
          );
        })}
      </g>
      <text
        x="24"
        y="29"
        textAnchor="middle"
        style={{ font: "600 16px 'Cormorant Garamond', serif", letterSpacing: "0.02em" }}
        fill={color}
      >
        fs
      </text>
    </svg>
  );
};

export default FlowerShopMark;
