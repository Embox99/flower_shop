import React from "react";

type Props = { size?: number; color?: string };

// Math.cos/sin can differ in their last bit between the Node.js and browser
// V8 builds, which flips a trailing digit and trips a hydration mismatch.
// Rounding to a fixed precision keeps server- and client-rendered markup
// byte-identical.
const round = (n: number) => Math.round(n * 1000) / 1000;

const PETALS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  const x = round(24 + Math.cos(a) * 18);
  const y = round(24 + Math.sin(a) * 18);
  const rotate = round((a * 180) / Math.PI + 90);
  return { x, y, rotate };
});

const FlowerShopMark: React.FC<Props> = ({ size = 32, color = "currentColor" }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round">
        {PETALS.map(({ x, y, rotate }, i) => (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="3.5"
            ry="1.6"
            transform={`rotate(${rotate} ${x} ${y})`}
            fill={color}
            fillOpacity="0.18"
          />
        ))}
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
