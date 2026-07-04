import { useState, useEffect } from "react";
import { C } from '../styles/theme';

export default function CountdownTimer({ seconds, onEnd }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) {
      onEnd?.();
      return;
    }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onEnd]);

  const pct = left / seconds;
  const color = pct > 0.55 ? C.green : pct > 0.25 ? C.gold : C.red;
  const r = 28;
  const stroke = 4;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle 
          cx="36" 
          cy="36" 
          r={r} 
          fill="none" 
          stroke="rgba(255,255,255,0.08)" 
          strokeWidth={stroke} 
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
        />
        <text
          x="36"
          y="42"
          textAnchor="middle"
          fill={color}
          style={{ fontSize: "22px", fontWeight: "900", fontFamily: "system-ui" }}
        >
          {left}
        </text>
      </svg>
      <span style={{ fontSize: "11px", color: C.hint, letterSpacing: "1px" }}>
        SEGUNDOS
      </span>
    </div>
  );
}
