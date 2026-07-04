import { C, card, btn } from '../styles/theme';

export default function Setup({ cfg, setCfg, onStart }) {
  const add = () => {
    if (cfg.names.length < 12)
      setCfg(c => ({ ...c, names: [...c.names, `Jugador ${c.names.length + 1}`] }));
  };

  const remove = (i) => {
    if (cfg.names.length > 2)
      setCfg(c => ({ ...c, names: c.names.filter((_, j) => j !== i) }));
  };

  const rename = (i, v) =>
    setCfg(c => {
      const n = [...c.names];
      n[i] = v;
      return { ...c, names: n };
    });

  const maxImp = Math.max(1, Math.floor(cfg.names.length / 3));

  const avatarColors = [
    "#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#ec4899",
    "#06b6d4", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#67e8f9"
  ];

  return (
    <div style={{ width: "100%", maxWidth: "500px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
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
          Juego de cultura general con inteligencia artificial
        </p>
      </div>

      {/* Players */}
      <div style={{ ...card(), marginBottom: "14px" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "18px" 
        }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>
            👥 Jugadores <span style={{ color: C.purple, fontWeight: "800" }}>{cfg.names.length}</span>
          </h3>
          <button
            onClick={add}
            disabled={cfg.names.length >= 12}
            style={btn("ghost", {
              padding: "7px 16px",
              fontSize: "13px",
              opacity: cfg.names.length >= 12 ? 0.35 : 1,
              cursor: cfg.names.length >= 12 ? "not-allowed" : "pointer"
            })}
          >
            + Agregar
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {cfg.names.map((name, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: avatarColors[i % avatarColors.length],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: "800",
                color: "#fff",
                flexShrink: 0,
              }}>
                {name.trim().charAt(0).toUpperCase() || (i + 1)}
              </div>
              <input
                value={name}
                onChange={e => rename(i, e.target.value)}
                placeholder={`Jugador ${i + 1}`}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: `1px solid ${C.border}`,
                  background: "rgba(255,255,255,0.06)",
                  color: C.text,
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {cfg.names.length > 2 && (
                <button onClick={() => remove(i)} style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "none",
                  background: C.redDim,
                  color: "#f87171",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  flexShrink: 0,
                }}>
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Config */}
      <div style={{ ...card(), marginBottom: "16px" }}>
        <h3 style={{ margin: "0 0 18px", fontSize: "15px", fontWeight: "700" }}>
          ⚙️ Configuración
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Impostors */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <label style={{ fontSize: "13px", color: C.muted }}>Impostores</label>
              <span style={{ fontSize: "14px", fontWeight: "700", color: C.red }}>{cfg.numImp}</span>
            </div>
            <input
              type="range"
              min={1}
              max={maxImp}
              value={cfg.numImp}
              onChange={e => setCfg(c => ({ ...c, numImp: +e.target.value }))}
              style={{ width: "100%", accentColor: C.red }}
            />
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              fontSize: "11px", 
              color: C.hint, 
              marginTop: "4px" 
            }}>
              <span>1</span>
              <span>{maxImp}</span>
            </div>
          </div>

          {/* Discussion time */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <label style={{ fontSize: "13px", color: C.muted }}>Tiempo de discusión</label>
              <span style={{ fontSize: "14px", fontWeight: "700", color: C.blue }}>{cfg.time}s</span>
            </div>
            <input
              type="range"
              min={30}
              max={180}
              step={15}
              value={cfg.time}
              onChange={e => setCfg(c => ({ ...c, time: +e.target.value }))}
              style={{ width: "100%", accentColor: C.blue }}
            />
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              fontSize: "11px", 
              color: C.hint, 
              marginTop: "4px" 
            }}>
              <span>30s</span>
              <span>3 min</span>
            </div>
          </div>

          {/* Theme / Category */}
          <div>
            <label style={{ 
              fontSize: "13px", 
              color: C.muted, 
              display: "block", 
              marginBottom: "10px" 
            }}>
              Tema del Juego
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                ["general", "🌐 Cultura General"],
                ["soccer", "⚽ Fútbol & Deportes"],
                ["movies", "🎬 Cine & Series"],
                ["anime", "🎮 Geek & Anime"]
              ].map(([v, lbl]) => (
                <button
                  key={v}
                  onClick={() => setCfg(c => ({ ...c, theme: v }))}
                  style={{
                    padding: "10px 6px",
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: cfg.theme === v || (!cfg.theme && v === 'general') ? C.purple : C.border,
                    background: cfg.theme === v || (!cfg.theme && v === 'general') ? C.purpleDim : "transparent",
                    color: cfg.theme === v || (!cfg.theme && v === 'general') ? "#c4b5fd" : C.muted,
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "700",
                    transition: "all 0.2s",
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label style={{ 
              fontSize: "13px", 
              color: C.muted, 
              display: "block", 
              marginBottom: "10px" 
            }}>
              Dificultad de preguntas
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                ["easy", "⭐ Fácil"],
                ["mixed", "⭐⭐ Mixto"],
                ["hard", "⭐⭐⭐ Difícil"]
              ].map(([v, lbl]) => (
                <button
                  key={v}
                  onClick={() => setCfg(c => ({ ...c, diff: v }))}
                  style={{
                    flex: 1,
                    padding: "9px 4px",
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: cfg.diff === v ? C.purple : C.border,
                    background: cfg.diff === v ? C.purpleDim : "transparent",
                    color: cfg.diff === v ? "#c4b5fd" : C.muted,
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "700",
                    transition: "all 0.2s",
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Impostor Hint */}
          <div>
            <label style={{ 
              fontSize: "13px", 
              color: C.muted, 
              display: "block", 
              marginBottom: "10px" 
            }}>
              Pista para el impostor
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                [false, "❌ Sin pista"],
                [true, "💡 Con pista"]
              ].map(([v, lbl]) => (
                <button
                  key={String(v)}
                  onClick={() => setCfg(c => ({ ...c, giveHint: v }))}
                  style={{
                    flex: 1,
                    padding: "9px 4px",
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: cfg.giveHint === v ? C.purple : C.border,
                    background: cfg.giveHint === v ? C.purpleDim : "transparent",
                    color: cfg.giveHint === v ? "#c4b5fd" : C.muted,
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "700",
                    transition: "all 0.2s",
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
            <p style={{ 
              fontSize: "11px", 
              color: C.hint, 
              marginTop: "8px",
              lineHeight: 1.4 
            }}>
              {cfg.giveHint 
                ? "El impostor recibirá una palabra similar pero diferente para confundirlo" 
                : "El impostor no recibirá ninguna palabra"}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={cfg.names.filter(n => n.trim()).length < 2}
        style={btn("primary", {
          width: "100%",
          padding: "17px",
          fontSize: "17px",
          letterSpacing: "0.5px",
          opacity: cfg.names.filter(n => n.trim()).length < 2 ? 0.45 : 1,
        })}
      >
        🎮 ¡Comenzar partida!
      </button>

      <p style={{ 
        textAlign: "center", 
        color: C.hint, 
        fontSize: "12px", 
        marginTop: "12px" 
      }}>
        Mínimo 2 jugadores · Máximo 12 jugadores
      </p>
    </div>
  );
}
