import { C, card, btn } from '../styles/theme';

export default function GameModeSelector({ onSelectMode }) {
  return (
    <div style={{ width: "100%", maxWidth: "500px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "72px", lineHeight: 1, marginBottom: "14px" }}>🎭</div>
        <h1 style={{
          fontSize: "42px",
          fontWeight: "900",
          margin: "0 0 8px",
          background: "linear-gradient(135deg,#a78bfa,#60a5fa,#34d399)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-1px",
        }}>
          El Impostor
        </h1>
        <p style={{ color: C.muted, margin: 0, fontSize: "15px" }}>
          Selecciona cómo quieres jugar
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Local Mode */}
        <div 
          onClick={() => onSelectMode('local')}
          style={{
            ...card({ padding: "24px", cursor: "pointer" }),
            transition: "all 0.2s",
            border: `2px solid ${C.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.purple;
            e.currentTarget.style.background = C.purpleDim;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.background = C.surface;
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
            <div style={{ fontSize: "40px" }}>📱</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "800" }}>
                Mismo Dispositivo
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: C.muted }}>
                Todos juegan desde este dispositivo
              </p>
            </div>
          </div>
          <div style={{ 
            padding: "12px", 
            borderRadius: "10px", 
            background: "rgba(139,92,246,0.1)",
            border: `1px solid ${C.purpleBorder}` 
          }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#c4b5fd", lineHeight: 1.5 }}>
              ✓ Perfecto para reuniones presenciales<br />
              ✓ Un solo teléfono o computadora<br />
              ✓ Pasan el dispositivo de mano en mano
            </p>
          </div>
        </div>

        {/* Online Mode */}
        <div 
          onClick={() => onSelectMode('online')}
          style={{
            ...card({ padding: "24px", cursor: "pointer" }),
            transition: "all 0.2s",
            border: `2px solid ${C.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.blue;
            e.currentTarget.style.background = C.blueDim;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.background = C.surface;
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
            <div style={{ fontSize: "40px" }}>🌐</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "800" }}>
                En Línea (Diferentes Lugares)
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: C.muted }}>
                Cada jugador desde su dispositivo
              </p>
            </div>
          </div>
          <div style={{ 
            padding: "12px", 
            borderRadius: "10px", 
            background: "rgba(59,130,246,0.1)",
            border: `1px solid rgba(59,130,246,0.35)` 
          }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#93c5fd", lineHeight: 1.5 }}>
              ✓ Juega desde diferentes lugares<br />
              ✓ Cada uno en su celular o computadora<br />
              ✓ Ideal para videollamadas o a distancia
            </p>
          </div>
        </div>
      </div>

      <p style={{ 
        textAlign: "center", 
        color: C.hint, 
        fontSize: "11px", 
        marginTop: "20px",
        lineHeight: 1.4 
      }}>
        🎮 En ambos modos el juego funciona igual.<br />
        Solo cambia cómo se conectan los jugadores.
      </p>
    </div>
  );
}
