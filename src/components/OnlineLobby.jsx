import { useState, useEffect } from 'react';
import { C, card, btn } from '../styles/theme';
import socketService from '../services/socketService';

export default function OnlineLobby({ onStartGame, onBack, setMyPlayerName, cfg, setCfg, onStartPictionary }) {
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [gameType, setGameType] = useState('impostor'); // 'impostor' or 'pictionary'
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const avatarColors = [
    "#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#ec4899",
    "#06b6d4", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#67e8f9"
  ];

  useEffect(() => {
    socketService.connect();

    socketService.onPlayerJoined(({ players, playerName }) => {
      setPlayers(players);
      setError(null);
    });

    socketService.onPlayerLeft(({ players, playerName }) => {
      setPlayers(players);
    });

    socketService.onPlayersUpdate(({ players }) => {
      setPlayers(players);
    });

    socketService.onError(({ message }) => {
      setError(message);
      setConnecting(false);
    });

    return () => {
      socketService.offLobby();
    };
  }, []);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Ingresa tu nombre');
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const code = await socketService.createRoom(playerName.trim());
      setCurrentRoom(code);
      setIsHost(true);
      setPlayers([{ id: 'me', name: playerName.trim(), ready: false }]);
      setMyPlayerName(playerName.trim());
    } catch (e) {
      setError('Error al crear la sala');
    } finally {
      setConnecting(false);
    }
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError('Ingresa tu nombre');
      return;
    }
    if (!roomCode.trim()) {
      setError('Ingresa el código de sala');
      return;
    }
    setConnecting(true);
    setError(null);
    socketService.joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    setCurrentRoom(roomCode.trim().toUpperCase());
    setIsHost(false);
    setMyPlayerName(playerName.trim());
    setTimeout(() => setConnecting(false), 1000);
  };

  const handleReady = () => {
    socketService.setPlayerReady();
    setIsReady(true);
  };

  const handleStartGame = () => {
    const playerNames = players.map(p => p.name);
    if (gameType === 'pictionary') {
      onStartPictionary(playerNames, true, playerName);
    } else {
      onStartGame(playerNames, true, playerName);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(currentRoom);
    setError('¡Código copiado!');
    setTimeout(() => setError(null), 2000);
  };

  if (!currentRoom) {
    return (
      <div style={{ width: "100%", maxWidth: "450px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "56px", lineHeight: 1, marginBottom: "12px" }}>🌐</div>
          <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 6px" }}>
            Juego en Línea
          </h2>
          <p style={{ color: C.muted, margin: 0, fontSize: "14px" }}>
            Cada jugador desde su dispositivo
          </p>
        </div>

        {!mode ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button 
              onClick={() => setMode('create')}
              style={btn("primary", { width: "100%", padding: "16px", fontSize: "16px" })}
            >
              🎯 Crear Sala
            </button>
            <button 
              onClick={() => setMode('join')}
              style={btn("ghost", { width: "100%", padding: "16px", fontSize: "16px" })}
            >
              🚪 Unirse a Sala
            </button>
            <button 
              onClick={onBack}
              style={btn("ghost", { width: "100%", padding: "12px", fontSize: "14px", marginTop: "8px" })}
            >
              ← Volver
            </button>
          </div>
        ) : (
          <div style={{ ...card() }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700" }}>
              {mode === 'create' ? '🎯 Crear nueva sala' : '🚪 Unirse a sala'}
            </h3>

            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Tu nombre"
              maxLength={15}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: `1px solid ${C.border}`,
                background: "rgba(255,255,255,0.06)",
                color: C.text,
                fontSize: "15px",
                outline: "none",
                marginBottom: "12px",
                boxSizing: "border-box",
              }}
            />

            {mode === 'join' && (
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Código de sala (ej: ABC123)"
                maxLength={6}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: `1px solid ${C.border}`,
                  background: "rgba(255,255,255,0.06)",
                  color: C.text,
                  fontSize: "15px",
                  outline: "none",
                  marginBottom: "12px",
                  boxSizing: "border-box",
                  textTransform: "uppercase",
                }}
              />
            )}

            {error && (
              <div style={{
                padding: "10px 12px",
                borderRadius: "8px",
                background: error.includes('copiado') ? C.greenDim : C.redDim,
                border: `1px solid ${error.includes('copiado') ? C.greenBorder : C.redBorder}`,
                color: error.includes('copiado') ? "#86efac" : "#fca5a5",
                fontSize: "13px",
                marginBottom: "12px",
              }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => setMode(null)}
                style={btn("ghost", { flex: 1, padding: "12px" })}
              >
                Cancelar
              </button>
              <button 
                onClick={mode === 'create' ? handleCreateRoom : handleJoinRoom}
                disabled={connecting}
                style={btn("primary", { flex: 2, padding: "12px" })}
              >
                {connecting ? "Conectando..." : mode === 'create' ? "Crear Sala" : "Unirse"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const updateConfig = (updater) => {
    setCfg(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      socketService.syncGameState({ config: next });
      return next;
    });
  };

  // Lobby Screen
  return (
    <div style={{ width: "100%", maxWidth: "500px" }}>
      <div style={{ ...card({ marginBottom: "14px", textAlign: "center" }) }}>
        <div style={{ fontSize: "42px", marginBottom: "12px" }}>🎮</div>
        <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 8px" }}>
          Sala: {currentRoom}
        </h2>
        {isHost && (
          <button 
            onClick={copyRoomCode}
            style={btn("ghost", { padding: "8px 16px", fontSize: "13px" })}
          >
            📋 Copiar código
          </button>
        )}
        <p style={{ color: C.muted, fontSize: "13px", margin: "12px 0 0" }}>
          {isHost ? "Comparte este código con tus amigos" : "Esperando al anfitrión..."}
        </p>
      </div>

      {/* Config Card */}
      {isHost && cfg && (
        <div style={{ ...card({ marginBottom: "14px" }) }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>
            ⚙️ Configuración de la Sala
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Tipo de Juego */}
            <div>
              <label style={{ fontSize: "12px", color: C.muted, display: "block", marginBottom: "8px" }}>
                🎮 Tipo de Juego
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  onClick={() => setGameType('impostor')}
                  style={{
                    padding: "12px 8px",
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: gameType === 'impostor' ? C.purple : C.border,
                    background: gameType === 'impostor' ? C.purpleDim : "transparent",
                    color: gameType === 'impostor' ? "#c4b5fd" : C.muted,
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "700",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <span style={{ fontSize: "24px" }}>🎭</span>
                  <span>El Impostor</span>
                  <span style={{ fontSize: "10px", opacity: 0.7 }}>Adivina quién miente</span>
                </button>
                <button
                  onClick={() => setGameType('pictionary')}
                  style={{
                    padding: "12px 8px",
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: gameType === 'pictionary' ? C.green : C.border,
                    background: gameType === 'pictionary' ? C.greenDim : "transparent",
                    color: gameType === 'pictionary' ? "#86efac" : C.muted,
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "700",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <span style={{ fontSize: "24px" }}>🎨</span>
                  <span>Dibuja y Adivina</span>
                  <span style={{ fontSize: "10px", opacity: 0.7 }}>Estilo Pictionary</span>
                </button>
              </div>
            </div>

            {/* Tema del Juego - Solo para Impostor */}
            {gameType === 'impostor' && (
              <div>
                <label style={{ fontSize: "12px", color: C.muted, display: "block", marginBottom: "8px" }}>
                  Tema del Juego
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {[
                    ["general", "🌐 Cultura General"],
                    ["soccer", "⚽ Fútbol & Deportes"],
                    ["movies", "🎬 Cine & Series"],
                    ["anime", "🎮 Geek & Anime"]
                  ].map(([v, lbl]) => (
                    <button
                      key={v}
                      onClick={() => updateConfig(c => ({ ...c, theme: v }))}
                      style={{
                        padding: "8px 4px",
                        borderRadius: "10px",
                        border: "1px solid",
                        borderColor: cfg.theme === v || (!cfg.theme && v === 'general') ? C.purple : C.border,
                      background: cfg.theme === v || (!cfg.theme && v === 'general') ? C.purpleDim : "transparent",
                      color: cfg.theme === v || (!cfg.theme && v === 'general') ? "#c4b5fd" : C.muted,
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Impostores - Solo para Impostor */}
            {gameType === 'impostor' && (
            <div>
              <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", color: C.muted }}>Impostores</label>
                <span style={{ fontSize: "13px", fontWeight: "700", color: C.red }}>{cfg.numImp}</span>
              </div>
              <input
                type="range"
                min={1}
                max={Math.max(1, Math.floor(players.length / 2))}
                value={cfg.numImp}
                onChange={e => updateConfig(c => ({ ...c, numImp: +e.target.value }))}
                style={{ width: "100%", accentColor: C.red }}
              />
            </div>
            )}

            {/* Tiempo - Solo para Impostor */}
            {gameType === 'impostor' && (
            <div>
              <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", color: C.muted }}>Tiempo de Discusión</label>
                <span style={{ fontSize: "13px", fontWeight: "700", color: C.blue }}>{cfg.time}s</span>
              </div>
              <input
                type="range"
                min={30}
                max={180}
                step={15}
                value={cfg.time}
                onChange={e => updateConfig(c => ({ ...c, time: +e.target.value }))}
                style={{ width: "100%", accentColor: C.blue }}
              />
            </div>
            )}

            {/* Dificultad - Solo para Impostor */}
            {gameType === 'impostor' && (
            <div>
              <label style={{ fontSize: "12px", color: C.muted, display: "block", marginBottom: "8px" }}>
                Dificultad
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  ["easy", "⭐ Fácil"],
                  ["mixed", "⭐⭐ Mixto"],
                  ["hard", "⭐⭐⭐ Difícil"]
                ].map(([v, lbl]) => (
                  <button
                    key={v}
                    onClick={() => updateConfig(c => ({ ...c, diff: v }))}
                    style={{
                      flex: 1,
                      padding: "8px 2px",
                      borderRadius: "10px",
                      border: "1px solid",
                      borderColor: cfg.diff === v ? C.purple : C.border,
                      background: cfg.diff === v ? C.purpleDim : "transparent",
                      color: cfg.diff === v ? "#c4b5fd" : C.muted,
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Pistas - Solo para Impostor */}
            {gameType === 'impostor' && (
            <div>
              <label style={{ fontSize: "12px", color: C.muted, display: "block", marginBottom: "8px" }}>
                Pista del Impostor
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  [false, "❌ Sin pista"],
                  [true, "💡 Con pista"]
                ].map(([v, lbl]) => (
                  <button
                    key={String(v)}
                    onClick={() => updateConfig(c => ({ ...c, giveHint: v }))}
                    style={{
                      flex: 1,
                      padding: "8px 2px",
                      borderRadius: "10px",
                      border: "1px solid",
                      borderColor: cfg.giveHint === v ? C.purple : C.border,
                      background: cfg.giveHint === v ? C.purpleDim : "transparent",
                      color: cfg.giveHint === v ? "#c4b5fd" : C.muted,
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {!isHost && cfg && (
        <div style={{ ...card({ marginBottom: "14px" }), background: "rgba(255,255,255,0.03)" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: "700", color: C.muted }}>
            ⚙️ Configuración de Partida
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
            <div>
              <span style={{ color: C.muted }}>Tema: </span>
              <span style={{ fontWeight: "700", color: "#c4b5fd" }}>
                {cfg.theme === 'soccer' ? '⚽ Fútbol' : cfg.theme === 'movies' ? '🎬 Cine' : cfg.theme === 'anime' ? '🎮 Anime' : '🌐 General'}
              </span>
            </div>
            <div>
              <span style={{ color: C.muted }}>Impostores: </span>
              <span style={{ fontWeight: "700", color: C.red }}>{cfg.numImp}</span>
            </div>
            <div>
              <span style={{ color: C.muted }}>Tiempo: </span>
              <span style={{ fontWeight: "700", color: C.blue }}>{cfg.time}s</span>
            </div>
            <div>
              <span style={{ color: C.muted }}>Dificultad: </span>
              <span style={{ fontWeight: "700", color: "#c4b5fd" }}>
                {cfg.diff === 'easy' ? 'Fácil' : cfg.diff === 'hard' ? 'Difícil' : 'Mixto'}
              </span>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <span style={{ color: C.muted }}>Pistas: </span>
              <span style={{ fontWeight: "700", color: cfg.giveHint ? C.green : C.muted }}>
                {cfg.giveHint ? '💡 Con pista' : '❌ Sin pista'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div style={{ ...card({ marginBottom: "14px" }) }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>
          👥 Jugadores ({players.length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {players.map((player, idx) => (
            <div key={player.id} style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "12px",
              background: player.ready ? C.greenDim : C.surface,
              border: `1px solid ${player.ready ? C.greenBorder : C.border}`,
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: avatarColors[idx % avatarColors.length],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: "800",
                color: "#fff",
              }}>
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: "700" }}>
                  {player.name}
                  {player.id === socketService.socket?.id && " (Tú)"}
                </div>
              </div>
              {player.ready && (
                <span style={{ fontSize: "12px", color: C.green, fontWeight: "700" }}>✓ Listo</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          ...card({ marginBottom: "14px", padding: "12px 16px" }),
          background: error.includes('copiado') ? C.greenDim : C.redDim,
          borderColor: error.includes('copiado') ? C.greenBorder : C.redBorder,
        }}>
          <span style={{ fontSize: "13px", color: error.includes('copiado') ? "#86efac" : "#fca5a5" }}>
            {error}
          </span>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        {isHost ? (
          <>
            <button 
              onClick={onBack}
              style={btn("ghost", { flex: 1, padding: "14px" })}
            >
              Cancelar
            </button>
            <button 
              onClick={handleStartGame}
              disabled={players.length < 2}
              style={btn("primary", { 
                flex: 2, 
                padding: "14px",
                opacity: players.length < 2 ? 0.5 : 1 
              })}
            >
              🎮 Iniciar Juego ({players.length})
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={onBack}
              style={btn("ghost", { flex: 1, padding: "14px" })}
            >
              Salir
            </button>
            <button 
              onClick={handleReady}
              disabled={isReady}
              style={btn(isReady ? "success" : "primary", { flex: 2, padding: "14px" })}
            >
              {isReady ? "✓ Listo" : "✓ Marcar Listo"}
            </button>
          </>
        )}
      </div>

      <p style={{ textAlign: "center", color: C.hint, fontSize: "11px", marginTop: "12px" }}>
        Mínimo 2 jugadores para comenzar
      </p>
    </div>
  );
}
