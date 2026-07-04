#!/usr/bin/env python3

with open('src/components/ImpostorGame.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Reemplazar la sección de votación completa
old_vote_section = '''      {phase === "vote" && (
        <div style={{ ...card({ maxWidth: "480px", width: "100%" }), marginTop: "40px" }}>
          {gameMode === 'online' && (
            <div style={{ 
              padding: "10px 14px", 
              borderRadius: "10px", 
              background: C.blueDim,
              border: `1px solid rgba(59,130,246,0.35)`,
              marginBottom: "14px",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "12px", color: "#93c5fd", fontWeight: "700" }}>
                🌐 Todos ven esta votación en tiempo real
              </span>
            </div>
          )}
          
          <h2 style={{ textAlign: "center", margin: "0 0 6px", fontSize: "26px" }}>🗳️ ¡Hora de votar!</h2>
          
          <div style={{
            background: C.purpleDim,
            border: `1px solid ${C.purpleBorder}`,
            borderRadius: "14px",
            padding: "12px 16px",
            margin: "14px 0",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "12px", color: C.muted, marginBottom: "4px" }}>VOTA AHORA:</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#c4b5fd" }}>
              {alivePlayers[voterIdx]?.name}
            </div>
            <div style={{ fontSize: "12px", color: C.hint, marginTop: "4px" }}>
              Voto {voterIdx + 1} de {alivePlayers.length}
            </div>
          </div>
          
          <p style={{ color: C.muted, textAlign: "center", fontSize: "14px", margin: "0 0 16px" }}>
            ¿Quién crees que es el impostor?
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {alivePlayers.filter((_, i) => i !== voterIdx).map(p => {
              const myVote = votes[alivePlayers[voterIdx]?.name];
              const isSelected = myVote === p.name;
              return (
                <button 
                  key={p.name} 
                  onClick={() => castVote(p.name)} 
                  style={{
                    padding: "14px 20px",
                    borderRadius: "14px",
                    border: `1px solid ${isSelected ? C.redBorder : C.border}`,
                    background: isSelected ? C.redDim : C.surface,
                    color: isSelected ? "#fca5a5" : C.text,
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "16px",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: avatarColors[players.indexOf(p) % avatarColors.length],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    fontWeight: "800",
                    flexShrink: 0,
                  }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  {p.name}
                  {isSelected && <span style={{ marginLeft: "auto", fontSize: "18px" }}>🎯</span>}
                </button>
              );
            })}
          </div>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "20px" }}>
            {alivePlayers.map((_, i) => (
              <div key={i} style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: i < voterIdx ? C.green : i === voterIdx ? C.purple : C.border,
                transition: "background 0.3s",
              }} />
            ))}
          </div>
        </div>
      )}'''

new_vote_section = '''      {phase === "vote" && (
        <div style={{ ...card({ maxWidth: "480px", width: "100%" }), marginTop: "40px" }}>
          {gameMode === 'online' && (
            <div style={{ 
              padding: "10px 14px", 
              borderRadius: "10px", 
              background: C.blueDim,
              border: `1px solid rgba(59,130,246,0.35)`,
              marginBottom: "14px",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "12px", color: "#93c5fd", fontWeight: "700" }}>
                🌐 Vota desde tu propio dispositivo
              </span>
            </div>
          )}
          
          <h2 style={{ textAlign: "center", margin: "0 0 6px", fontSize: "26px" }}>🗳️ ¡Hora de votar!</h2>
          
          {gameMode === 'online' ? (
            <>
              {/* Modo Online: Cada uno vota desde su dispositivo */}
              <div style={{
                background: C.purpleDim,
                border: `1px solid ${C.purpleBorder}`,
                borderRadius: "14px",
                padding: "12px 16px",
                margin: "14px 0",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "12px", color: C.muted, marginBottom: "4px" }}>TÚ ERES:</div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#c4b5fd" }}>
                  {myPlayerName}
                </div>
                <div style={{ fontSize: "12px", color: C.hint, marginTop: "4px" }}>
                  Votos: {Object.keys(votes).length} de {alivePlayers.length}
                </div>
              </div>
              
              {votes[myPlayerName] ? (
                <div style={{
                  padding: "20px",
                  borderRadius: "14px",
                  background: C.greenDim,
                  border: `1px solid ${C.greenBorder}`,
                  textAlign: "center",
                  marginBottom: "16px"
                }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#86efac", marginBottom: "4px" }}>
                    ¡Voto registrado!
                  </div>
                  <div style={{ fontSize: "14px", color: C.muted }}>
                    Votaste por: <span style={{ fontWeight: "700", color: C.text }}>{votes[myPlayerName]}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: C.hint, marginTop: "8px" }}>
                    Esperando a los demás jugadores...
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ color: C.muted, textAlign: "center", fontSize: "14px", margin: "0 0 16px" }}>
                    ¿Quién crees que es el impostor?
                  </p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {alivePlayers.filter(p => p.name !== myPlayerName).map(p => {
                      return (
                        <button 
                          key={p.name} 
                          onClick={() => castVote(p.name)} 
                          style={{
                            padding: "14px 20px",
                            borderRadius: "14px",
                            border: `1px solid ${C.border}`,
                            background: C.surface,
                            color: C.text,
                            cursor: "pointer",
                            fontWeight: "700",
                            fontSize: "16px",
                            textAlign: "left",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            transition: "all 0.15s",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = C.redBorder;
                            e.currentTarget.style.background = C.redDim;
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = C.border;
                            e.currentTarget.style.background = C.surface;
                          }}
                        >
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: avatarColors[players.indexOf(p) % avatarColors.length],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "15px",
                            fontWeight: "800",
                            flexShrink: 0,
                          }}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Modo Local: Votan uno por uno */}
              <div style={{
                background: C.purpleDim,
                border: `1px solid ${C.purpleBorder}`,
                borderRadius: "14px",
                padding: "12px 16px",
                margin: "14px 0",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "12px", color: C.muted, marginBottom: "4px" }}>VOTA AHORA:</div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#c4b5fd" }}>
                  {alivePlayers[voterIdx]?.name}
                </div>
                <div style={{ fontSize: "12px", color: C.hint, marginTop: "4px" }}>
                  Voto {voterIdx + 1} de {alivePlayers.length}
                </div>
              </div>
              
              <p style={{ color: C.muted, textAlign: "center", fontSize: "14px", margin: "0 0 16px" }}>
                ¿Quién crees que es el impostor?
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {alivePlayers.filter((_, i) => i !== voterIdx).map(p => {
                  const myVote = votes[alivePlayers[voterIdx]?.name];
                  const isSelected = myVote === p.name;
                  return (
                    <button 
                      key={p.name} 
                      onClick={() => castVote(p.name)} 
                      style={{
                        padding: "14px 20px",
                        borderRadius: "14px",
                        border: `1px solid ${isSelected ? C.redBorder : C.border}`,
                        background: isSelected ? C.redDim : C.surface,
                        color: isSelected ? "#fca5a5" : C.text,
                        cursor: "pointer",
                        fontWeight: "700",
                        fontSize: "16px",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: avatarColors[players.indexOf(p) % avatarColors.length],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "15px",
                        fontWeight: "800",
                        flexShrink: 0,
                      }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      {p.name}
                      {isSelected && <span style={{ marginLeft: "auto", fontSize: "18px" }}>🎯</span>}
                    </button>
                  );
                })}
              </div>
              
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "20px" }}>
                {alivePlayers.map((_, i) => (
                  <div key={i} style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: i < voterIdx ? C.green : i === voterIdx ? C.purple : C.border,
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>
            </>
          )}
        </div>
      )}'''

content = content.replace(old_vote_section, new_vote_section)

with open('src/components/ImpostorGame.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("UI de votación actualizada!")
