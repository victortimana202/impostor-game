import { useState, useEffect, useRef, useCallback } from "react";
import { C } from '../styles/theme';

export default function DragReveal({ playerName, role, topic, showHint, onDone }) {
  const CARD_H = 360;
  const [offset, setOffset] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(null);
  
  const isImpostor = role === "impostor";
  
  // Reset cuando cambia el jugador
  useEffect(() => {
    setOffset(0);
    setRevealed(false);
    setDragging(false);
  }, [playerName]);
  
  const getY = (e) => (e.touches ? e.touches[0].clientY : e.clientY);

  const onStart = (e) => {
    if (revealed) return;
    e.preventDefault();
    startY.current = getY(e);
    setDragging(true);
  };

  const onMove = useCallback((e) => {
    if (!dragging || revealed) return;
    e.preventDefault();
    const delta = Math.max(0, Math.min(CARD_H, getY(e) - startY.current));
    setOffset(delta);
    if (delta >= CARD_H * 0.78) {
      setRevealed(true);
      setOffset(CARD_H);
      setDragging(false);
    }
  }, [dragging, revealed]);

  const onEnd = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    if (!revealed) setOffset(0);
  }, [dragging, revealed]);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [dragging, onMove, onEnd]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <p style={{ color: C.muted, fontSize: "15px", margin: 0, textAlign: "center" }}>
        👉 Turno de <strong style={{ color: C.text }}>{playerName}</strong>
      </p>
      
      <div style={{ 
        position: "relative", 
        width: "260px", 
        height: `${CARD_H}px`, 
        borderRadius: "22px", 
        overflow: "hidden" 
      }}>
        {/* Revealed content */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "22px",
          background: isImpostor
            ? "linear-gradient(150deg,#450a0a,#7f1d1d,#991b1b)"
            : "linear-gradient(150deg,#0c1a3a,#1e3a8a,#1d4ed8)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          padding: "24px",
        }}>
          <div style={{ fontSize: "64px", lineHeight: 1 }}>
            {isImpostor ? "🕵️" : "🧑‍🤝‍🧑"}
          </div>
          <div style={{
            fontSize: "26px",
            fontWeight: "900",
            letterSpacing: "3px",
            color: isImpostor ? "#fca5a5" : "#93c5fd",
          }}>
            {isImpostor ? "¡IMPOSTOR!" : "CIUDADANO"}
          </div>
          <div style={{
            background: "rgba(0,0,0,0.35)",
            borderRadius: "14px",
            padding: "12px 18px",
            textAlign: "center",
            width: "100%",
            boxSizing: "border-box",
          }}>
            <div style={{ 
              fontSize: "11px", 
              color: "rgba(255,255,255,0.5)", 
              marginBottom: "6px", 
              letterSpacing: "1px" 
            }}>
              {isImpostor && showHint ? "TU PISTA ES:" : isImpostor ? "NO TIENES PALABRA" : "TU PALABRA ES:"}
            </div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#fff" }}>
              {topic}
            </div>
            {isImpostor && showHint && topic !== "???" && (
              <div style={{ 
                fontSize: "10px", 
                color: "rgba(255,255,255,0.4)", 
                marginTop: "8px",
                fontStyle: "italic"
              }}>
                Esta NO es la palabra real, es solo una pista
              </div>
            )}
          </div>
          {revealed && (
            <button onClick={onDone} style={{
              marginTop: "6px",
              padding: "10px 28px",
              borderRadius: "12px",
              border: "none",
              background: "rgba(255,255,255,0.18)",
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px",
            }}>
              ✓ Listo — pasar el teléfono
            </button>
          )}
        </div>

        {/* Draggable curtain */}
        {!revealed && (
          <div
            onMouseDown={onStart}
            onTouchStart={onStart}
            style={{
              position: "absolute",
              top: `${offset}px`,
              left: 0,
              right: 0,
              height: `${CARD_H}px`,
              borderRadius: "22px",
              background: "linear-gradient(150deg,#1a0d3d,#2e1065,#1a1035)",
              cursor: "grab",
              touchAction: "none",
              userSelect: "none",
              transition: dragging ? "none" : "top 0.4s cubic-bezier(0.34,1.2,0.64,1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingTop: "32px",
              gap: "14px",
            }}
          >
            <div style={{ 
              width: "44px", 
              height: "4px", 
              borderRadius: "2px", 
              background: "rgba(255,255,255,0.25)" 
            }} />
            <div style={{ fontSize: "52px", marginTop: "12px" }}>🎭</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#e2d9f3" }}>
              {playerName}
            </div>
            <div style={{ fontSize: "13px", color: C.muted, textAlign: "center", padding: "0 16px" }}>
              Arrastra hacia abajo para ver tu rol
            </div>
            <div style={{ fontSize: "22px", opacity: 0.4, marginTop: "8px" }}>↓</div>
            
            {/* Progress bar */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "0 0 22px 22px",
            }}>
              <div style={{
                height: "100%",
                borderRadius: "0 0 0 22px",
                background: "#8b5cf6",
                width: `${(offset / CARD_H) * 100}%`,
                transition: dragging ? "none" : "width 0.2s",
              }} />
            </div>
          </div>
        )}
      </div>
      
      {!revealed && (
        <p style={{ color: C.hint, fontSize: "12px", margin: 0, textAlign: "center" }}>
          ¡Solo tú debes ver esta pantalla!
        </p>
      )}
    </div>
  );
}
