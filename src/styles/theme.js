export const C = {
  bg: "#08081a",
  surface: "rgba(255,255,255,0.04)",
  surfaceHover: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.20)",
  purple: "#8b5cf6",
  purpleDim: "rgba(139,92,246,0.15)",
  purpleBorder: "rgba(139,92,246,0.35)",
  blue: "#3b82f6",
  blueDim: "rgba(59,130,246,0.15)",
  red: "#ef4444",
  redDim: "rgba(239,68,68,0.15)",
  redBorder: "rgba(239,68,68,0.35)",
  green: "#22c55e",
  greenDim: "rgba(34,197,94,0.15)",
  greenBorder: "rgba(34,197,94,0.35)",
  gold: "#f59e0b",
  goldDim: "rgba(245,158,11,0.15)",
  goldBorder: "rgba(245,158,11,0.35)",
  text: "#f1f5f9",
  muted: "rgba(255,255,255,0.45)",
  hint: "rgba(255,255,255,0.25)",
};

export const card = (extra = {}) => ({
  background: C.surface,
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  borderRadius: "24px",
  border: `1px solid ${C.border}`,
  padding: "28px",
  boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
  ...extra,
});

export const btn = (variant = "default", extra = {}) => {
  const base = {
    padding: "13px 24px",
    borderRadius: "14px",
    border: "none",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    transition: "opacity 0.15s, transform 0.15s",
    userSelect: "none",
    letterSpacing: "0.3px",
  };

  const variants = {
    primary: { 
      background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", 
      color: "#fff", 
      boxShadow: "0 4px 24px rgba(139,92,246,0.4)" 
    },
    danger: { 
      background: "linear-gradient(135deg,#ef4444,#dc2626)", 
      color: "#fff", 
      boxShadow: "0 4px 24px rgba(239,68,68,0.35)" 
    },
    success: { 
      background: "linear-gradient(135deg,#22c55e,#16a34a)", 
      color: "#fff", 
      boxShadow: "0 4px 24px rgba(34,197,94,0.35)" 
    },
    ghost: { 
      background: C.surface, 
      color: C.text, 
      border: `1px solid ${C.border}` 
    },
    vote: { 
      background: C.redDim, 
      color: "#fca5a5", 
      border: `1px solid ${C.redBorder}`, 
      padding: "8px 16px", 
      fontSize: "13px", 
      borderRadius: "10px" 
    },
    hint: { 
      background: C.goldDim, 
      color: "#fcd34d", 
      border: `1px solid ${C.goldBorder}`, 
      padding: "10px 18px", 
      fontSize: "14px", 
      borderRadius: "12px" 
    },
  };

  return { ...base, ...variants[variant], ...extra };
};
