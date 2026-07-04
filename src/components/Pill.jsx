export default function Pill({ color, bg, border, children }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "4px 12px",
      borderRadius: "20px",
      background: bg,
      border: `1px solid ${border}`,
      color,
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "0.5px",
    }}>
      {children}
    </span>
  );
}
