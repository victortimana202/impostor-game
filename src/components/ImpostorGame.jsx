import { useState, useEffect } from "react";
import { fetchWord } from '../services/groqApi';
import { C, card, btn } from '../styles/theme';
import DragReveal from './DragReveal';
import CountdownTimer from './CountdownTimer';
import Pill from './Pill';
import Setup from './Setup';
import GameModeSelector from './GameModeSelector';
import OnlineLobby from './OnlineLobby';
import VoiceChat from './VoiceChat';
import DrawingBoard from './DrawingBoard';
import PictionaryGameV2 from './PictionaryGameV2';
import socketService from '../services/socketService';

export default function ImpostorGame() {
  const [gameMode, setGameMode] = useState(null); // null, 'local', 'online'
  const [gameType, setGameType] = useState('impostor'); // 'impostor' or 'pictionary'
  const [showPictionary, setShowPictionary] = useState(false);
  const [phase, setPhase] = useState("mode-select");
  const [cfg, setCfg] = useState({
    names: ["Ana", "Carlos", "María", "Luis"],
    numImp: 1,
    time: 90,
    diff: "mixed",
    theme: "general",
    giveHint: false,
  });
  
  const [players, setPlayers] = useState([]);
  const [word, setWord] = useState(null);
  const [revealIdx, setRevealIdx] = useState(0);
  const [showingCard, setShowingCard] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [voterIdx, setVoterIdx] = useState(0);
  const [votes, setVotes] = useState({});
  const [eliminated, setEliminated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [isOnlineHost, setIsOnlineHost] = useState(false);
  const [myPlayerName, setMyPlayerName] = useState(null); // Nombre del jugador en este dispositivo

  // Manejar conexión y registro de eventos de juego en modo online
  useEffect(() => {
    if (gameMode !== 'online') return;

    socketService.connect();

    socketService.onGameStarted(({ word: gameWord, playerRoles, config }) => {
      setWord(gameWord);
      setPlayers(playerRoles);
      setCfg(config);
      setPhase('reveal');
    });
    
    socketService.onGameStateUpdate(({ gameState }) => {
      console.log('📥 Recibiendo actualización:', gameState);
      if (gameState.phase !== undefined) setPhase(gameState.phase);
      if (gameState.voterIdx !== undefined) setVoterIdx(gameState.voterIdx);
      if (gameState.votes !== undefined) setVotes(gameState.votes);
      if (gameState.eliminated !== undefined) setEliminated(gameState.eliminated);
      if (gameState.players !== undefined) setPlayers(gameState.players);
      if (gameState.timerOn !== undefined) setTimerOn(gameState.timerOn);
      if (gameState.timerKey !== undefined) setTimerKey(gameState.timerKey);
      if (gameState.roundHistory !== undefined) setRoundHistory(gameState.roundHistory);
      if (gameState.config !== undefined) setCfg(gameState.config);
    });
    
    socketService.onVoteCast(({ voter, target }) => {
      setVotes(prev => ({ ...prev, [voter]: target }));
    });

    return () => {
      socketService.offGame();
    };
  }, [gameMode]);

  // El host procesa los votos automáticamente cuando todos han votado
  useEffect(() => {
    if (gameMode === 'online' && isOnlineHost && phase === 'vote') {
      const alivePlayers = players.filter(p => p.alive);
      const voteCount = Object.keys(votes).length;
      if (voteCount > 0 && voteCount >= alivePlayers.length) {
        processVotes(votes);
      }
    }
  }, [votes, gameMode, isOnlineHost, phase, players]);

  const handleModeSelect = (mode) => {
    setGameMode(mode);
    if (mode === 'local') {
      setPhase('setup');
    } else {
      setPhase('online-lobby');
    }
  };

  const handleOnlineGameStart = async (playerNames, isHost, currentPlayerName) => {
    setIsOnlineHost(isHost);
    setGameMode('online');
    setMyPlayerName(currentPlayerName); // Guardar el nombre del jugador actual
    
    // Si es host, generar y compartir la palabra
    if (isHost) {
      setLoading(true);
      try {
        const data = await fetchWord(cfg.diff, cfg.giveHint, cfg.theme);
        setWord(data);
        
        const shuffled = [...playerNames].sort(() => Math.random() - 0.5);
        const impSet = new Set(shuffled.slice(0, cfg.numImp));
        
        const playerRoles = playerNames.map(n => ({
          name: n,
          role: impSet.has(n) ? "impostor" : "citizen",
          word: impSet.has(n) ? (data.impostorHint || null) : data.word,
          alive: true,
        }));
        
        setPlayers(playerRoles);
        
        // Enviar configuración a todos
        socketService.startGame(cfg, data, playerRoles);
        
        setPhase('reveal');
      } catch (e) {
        setError("Error al iniciar el juego");
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePictionaryStart = (playerNames, isHost, currentPlayerName) => {
    setIsOnlineHost(isHost);
    setGameMode('online');
    setMyPlayerName(currentPlayerName);
    
    const playerList = playerNames.map(name => ({ name }));
    setPlayers(playerList);
    setShowPictionary(true);
  };

  const backFromPictionary = () => {
    setShowPictionary(false);
    setPhase('online-lobby');
  };

  const backToModeSelect = () => {
    socketService.disconnect();
    setGameMode(null);
    setGameType('impostor');
    setShowPictionary(false);
    setPhase('mode-select');
    setPlayers([]);
    setWord(null);
    setEliminated([]);
    setRoundHistory([]);
  };

  const startGame = async () => {
    setLoading(true);
    setError(null);
    setPhase("loading");
    
    try {
      const data = await fetchWord(cfg.diff, cfg.giveHint, cfg.theme);
      setWord(data);
      
      if (gameMode === 'online' && isOnlineHost) {
        // Modo online: usar los jugadores actuales de la sala
        const playerNames = players.map(p => p.name);
        const shuffled = [...playerNames].sort(() => Math.random() - 0.5);
        const impSet = new Set(shuffled.slice(0, cfg.numImp));
        
        const playerRoles = playerNames.map(n => ({
          name: n,
          role: impSet.has(n) ? "impostor" : "citizen",
          word: impSet.has(n) ? (data.impostorHint || null) : data.word,
          alive: true,
        }));
        
        setPlayers(playerRoles);
        setRevealIdx(0);
        setShowingCard(false);
        setTimerOn(false);
        setVoterIdx(0);
        setVotes({});
        setEliminated([]);
        setRoundHistory([]);
        
        // Enviar nueva ronda a todos
        socketService.startGame(cfg, data, playerRoles);
        
        setPhase("reveal");
      } else {
        // Modo local
        const names = cfg.names.filter(n => n.trim());
        const shuffled = [...names].sort(() => Math.random() - 0.5);
        const impSet = new Set(shuffled.slice(0, cfg.numImp));
        
        setPlayers(names.map(n => ({
          name: n,
          role: impSet.has(n) ? "impostor" : "citizen",
          word: impSet.has(n) ? (data.impostorHint || null) : data.word,
          alive: true,
        })));
        
        setRevealIdx(0);
        setShowingCard(false);
        setTimerOn(false);
        setVoterIdx(0);
        setVotes({});
        setEliminated([]);
        setRoundHistory([]);
        
        setPhase("reveal");
      }
    } catch (e) {
      setError("No se pudo conectar con la IA. Verifica tu internet e inténtalo de nuevo.");
      setPhase("setup");
    } finally {
      setLoading(false);
    }
  };

  const startShowingCard = () => {
    setShowingCard(true);
  };

  const nextReveal = () => {
    setShowingCard(false);
    if (gameMode === 'online') {
      setPhase("discussion");
    } else {
      if (revealIdx + 1 >= players.length) {
        setPhase("discussion");
      } else {
        setRevealIdx(i => i + 1);
      }
    }
  };

  const startVoting = () => {
    setPhase("vote");
    setVoterIdx(0);
    setVotes({});
    
    // Sincronizar en modo online
    if (gameMode === 'online' && isOnlineHost) {
      socketService.syncGameState({ 
        phase: 'vote', 
        voterIdx: 0, 
        votes: {},
        players 
      });
    }
  };

  const castVote = (target) => {
    if (gameMode === 'online') {
      const isAlive = players.some(p => p.name === myPlayerName && p.alive);
      if (!isAlive) return;

      setVotes(prev => ({ ...prev, [myPlayerName]: target }));
      socketService.castVote(myPlayerName, target);
    } else {
      // Modo local: votan uno por uno
      const alivePlayers = players.filter(p => p.alive);
      const voter = alivePlayers[voterIdx].name;
      const newVotes = { ...votes, [voter]: target };
      setVotes(newVotes);
      
      if (voterIdx + 1 >= alivePlayers.length) {
        processVotes(newVotes);
      } else {
        const newVoterIdx = voterIdx + 1;
        setVoterIdx(newVoterIdx);
      }
    }
  };

  const processVotes = (allVotes) => {
    const tally = Object.values(allVotes).reduce((acc, v) => {
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {});
    
    const mostVoted = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    const eliminatedPlayer = players.find(p => p.name === mostVoted);
    const wasImpostor = eliminatedPlayer?.role === "impostor";
    
    setEliminated([...eliminated, { 
      name: mostVoted, 
      wasImpostor, 
      votes: tally[mostVoted] 
    }]);
    
    const newPlayers = players.map(p => 
      p.name === mostVoted ? { ...p, alive: false } : p
    );
    setPlayers(newPlayers);
    
    setRoundHistory([...roundHistory, { eliminated: mostVoted, wasImpostor, votes: allVotes }]);
    
    if (wasImpostor) {
      setPhase("result");
      if (gameMode === 'online' && isOnlineHost) {
        socketService.syncGameState({ 
          phase: 'result',
          players: newPlayers,
          eliminated: [...eliminated, { name: mostVoted, wasImpostor, votes: tally[mostVoted] }],
          roundHistory: [...roundHistory, { eliminated: mostVoted, wasImpostor, votes: allVotes }]
        });
      }
    } else {
      const aliveImpostors = newPlayers.filter(p => p.alive && p.role === "impostor").length;
      const aliveCitizens = newPlayers.filter(p => p.alive && p.role === "citizen").length;
      
      if (aliveImpostors >= aliveCitizens) {
        setPhase("result");
        if (gameMode === 'online' && isOnlineHost) {
          socketService.syncGameState({ 
            phase: 'result',
            players: newPlayers,
            eliminated: [...eliminated, { name: mostVoted, wasImpostor, votes: tally[mostVoted] }],
            roundHistory: [...roundHistory, { eliminated: mostVoted, wasImpostor, votes: allVotes }]
          });
        }
      } else {
        setPhase("continue");
        if (gameMode === 'online' && isOnlineHost) {
          socketService.syncGameState({ 
            phase: 'continue',
            players: newPlayers,
            eliminated: [...eliminated, { name: mostVoted, wasImpostor, votes: tally[mostVoted] }]
          });
        }
      }
    }
  };

  const continueGame = () => {
    setTimerOn(false);
    setPhase("discussion");
    
    // Sincronizar en modo online
    if (gameMode === 'online' && isOnlineHost) {
      socketService.syncGameState({ 
        phase: 'discussion',
        players,
        eliminated,
        timerOn: false
      });
    }
  };

  const alivePlayers = players.filter(p => p.alive);
  const impostors = players.filter(p => p.role === "impostor");
  const aliveImpostors = impostors.filter(p => p.alive);
  const citizensWin = aliveImpostors.length === 0;
  
  const avatarColors = [
    "#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#ec4899",
    "#06b6d4", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#67e8f9"
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at 20% 20%, #1a0d3d 0%, ${C.bg} 60%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "24px 16px 48px",
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      color: C.text,
      boxSizing: "border-box",
    }}>
      {showPictionary ? (
        <PictionaryGameV2
          roomCode={socketService.roomCode}
          players={players}
          onBack={backFromPictionary}
          isHost={isOnlineHost}
          myPlayerName={myPlayerName}
        />
      ) : (
        <>
          {phase === "mode-select" && (
            <GameModeSelector onSelectMode={handleModeSelect} />
          )}

          {phase === "online-lobby" && (
            <OnlineLobby 
              onStartGame={handleOnlineGameStart}
              onStartPictionary={handlePictionaryStart}
              onBack={backToModeSelect}
              setMyPlayerName={setMyPlayerName}
              cfg={cfg}
              setCfg={setCfg}
            />
          )}
          
          {phase === "setup" && <Setup cfg={cfg} setCfg={setCfg} onStart={startGame} />}
      
      {phase === "loading" && (
        <div style={{ ...card({ maxWidth: "380px", width: "100%", textAlign: "center", marginTop: "80px" }) }}>
          <div style={{ fontSize: "52px", animation: "spin 1.5s linear infinite", display: "inline-block" }}>🎭</div>
          <h2 style={{ color: C.purple, margin: "16px 0 8px", fontSize: "22px" }}>Preparando el juego…</h2>
          <p style={{ color: C.muted, margin: 0, fontSize: "14px" }}>
            La IA está generando una palabra secreta para esta partida
          </p>
        </div>
      )}
      
      {phase === "reveal" && (gameMode === 'online' ? players.find(p => p.name === myPlayerName) : players[revealIdx]) && (
        <div style={{ ...card({ maxWidth: "400px", width: "100%" }), marginTop: "40px" }}>
          {gameMode === 'local' && (
            <div style={{ textAlign: "center", marginBottom: "22px" }}>
              <div style={{ fontSize: "13px", color: C.muted, marginBottom: "10px" }}>Revela tu rol en privado</div>
              <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                {players.map((_, i) => (
                  <div key={i} style={{
                    width: i === revealIdx ? "20px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    background: i < revealIdx ? C.green : i === revealIdx ? C.purple : C.border,
                    transition: "all 0.3s",
                  }} />
                ))}
              </div>
            </div>
          )}

          {(() => {
            const playerToReveal = gameMode === 'online' ? players.find(p => p.name === myPlayerName) : players[revealIdx];
            return !showingCard ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>👤</div>
                <h2 style={{ 
                  fontSize: "28px", 
                  fontWeight: "800", 
                  color: C.text, 
                  marginBottom: "12px" 
                }}>
                  {playerToReveal.name}
                </h2>
                <p style={{ 
                  color: C.muted, 
                  fontSize: "14px", 
                  marginBottom: "28px",
                  lineHeight: 1.6 
                }}>
                  Es tu turno para ver tu rol.<br />
                  Asegúrate de que nadie más esté mirando tu pantalla.
                </p>
                <button 
                  onClick={startShowingCard}
                  style={btn("primary", { 
                    width: "100%", 
                    padding: "16px",
                    fontSize: "16px" 
                  })}
                >
                  👁️ Ver mi rol
                </button>
              </div>
            ) : (
              <>
                <DragReveal
                  key={playerToReveal.name}
                  playerName={playerToReveal.name}
                  role={playerToReveal.role}
                  topic={playerToReveal.word || "???"}
                  showHint={cfg.giveHint && playerToReveal.role === "impostor"}
                  onDone={nextReveal}
                />
                <p style={{ textAlign: "center", color: C.hint, fontSize: "12px", margin: "18px 0 0" }}>
                  {gameMode === 'online' 
                    ? "Una vez hayas memorizado tu rol, pulsa Siguiente para discutir"
                    : "Después de ver tu rol, pasa el teléfono a la siguiente persona"
                  }
                </p>
              </>
            );
          })()}
        </div>
      )}

      
      {phase === "discussion" && word && (
        <div style={{ maxWidth: "480px", width: "100%", marginTop: "32px" }}>
          {gameMode === 'online' && (
            <div style={{ 
              ...card({ marginBottom: "14px", padding: "12px 16px", textAlign: "center" }),
              background: C.blueDim,
              borderColor: "rgba(59,130,246,0.35)"
            }}>
              <span style={{ fontSize: "13px", color: "#93c5fd", fontWeight: "700" }}>
                🌐 Modo Online - Todos ven la misma pantalla
              </span>
            </div>
          )}
          
          <div style={{ ...card({ marginBottom: "14px", textAlign: "center" }) }}>
            <Pill color="#c4b5fd" bg={C.purpleDim} border={C.purpleBorder}>
              {word.emoji} {word.category}
            </Pill>
            <h2 style={{ fontSize: "22px", fontWeight: "800", margin: "16px 0 8px" }}>
              💬 Fase de Discusión
            </h2>
            <p style={{ color: C.muted, fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
              {gameMode === 'online' 
                ? "Discutan por videollamada. Cada uno describir su palabra sin decirla."
                : "Describe tu palabra sin decirla directamente. El impostor debe actuar como si conociera la palabra."}
            </p>
          </div>

          <div style={{ ...card({ marginBottom: "14px" }), background: C.goldDim, borderColor: C.goldBorder }}>
            <div style={{ fontSize: "13px", color: C.gold, fontWeight: "700", marginBottom: "8px" }}>
              📋 JUGADORES VIVOS ({alivePlayers.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {alivePlayers.map((p, idx) => (
                <div key={p.name} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  background: "rgba(0,0,0,0.2)",
                  border: `1px solid ${C.goldBorder}`,
                }}>
                  <div style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: avatarColors[players.indexOf(p) % avatarColors.length],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "#fff",
                  }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: "13px", color: "#fcd34d", fontWeight: "700" }}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {eliminated.length > 0 && (
            <div style={{ ...card({ marginBottom: "14px" }), background: C.redDim, borderColor: C.redBorder }}>
              <div style={{ fontSize: "13px", color: "#fca5a5", fontWeight: "700", marginBottom: "8px" }}>
                ⚰️ ELIMINADOS ({eliminated.length})
              </div>
              {eliminated.map((e, idx) => (
                <div key={idx} style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.2)",
                  marginBottom: idx < eliminated.length - 1 ? "6px" : 0,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span style={{ color: "#f87171", fontSize: "13px" }}>
                    {e.name}
                  </span>
                  <span style={{ color: C.hint, fontSize: "11px" }}>
                    {e.wasImpostor ? "🕵️ Era impostor" : "🧑‍🤝‍🧑 Era ciudadano"}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ ...card({ marginBottom: "14px" }), textAlign: "center" }}>
            {timerOn ? (
              <>
                <CountdownTimer 
                  key={timerKey} 
                  seconds={cfg.time} 
                  onEnd={() => setTimerOn(false)} 
                />
                <p style={{ color: C.muted, fontSize: "13px", margin: "10px 0 0" }}>
                  ¡Discutan! El impostor intenta camuflarse.
                </p>
              </>
            ) : (
              <>
                {gameMode === 'online' && !isOnlineHost ? (
                  <div style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    color: C.muted,
                    fontSize: "14px",
                  }}>
                    ⏱ Esperando que el anfitrión inicie la discusión...
                  </div>
                ) : (
                  <button 
                    onClick={() => { 
                      setTimerOn(true); 
                      setTimerKey(k => k + 1); 
                      if (gameMode === 'online' && isOnlineHost) {
                        socketService.syncGameState({ 
                          timerOn: true, 
                          timerKey: timerKey + 1 
                        });
                      }
                    }}
                    style={btn("primary", { width: "100%", fontSize: "15px" })}
                  >
                    ⏱ Iniciar discusión ({cfg.time}s)
                  </button>
                )}
              </>
            )}
          </div>
          
          {gameMode === 'online' && (
            <>
              <VoiceChat roomCode={socketService.roomCode} myPlayerName={myPlayerName} />
              <DrawingBoard 
                roomCode={socketService.roomCode} 
                myPlayerName={myPlayerName}
                gameMode={gameMode}
              />
            </>
          )}
          
          {gameMode === 'online' && !isOnlineHost ? (
            <div style={{
              padding: "16px",
              borderRadius: "12px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              color: C.muted,
              fontSize: "14px",
              textAlign: "center",
            }}>
              🗳️ Esperando que el anfitrión inicie la votación...
            </div>
          ) : (
            <button 
              onClick={startVoting}
              style={btn("ghost", { width: "100%", display: "block" })}
            >
              🗳️ Ir a votar →
            </button>
          )}
        </div>
      )}
      
      {phase === "vote" && (
        <div style={{ ...card({ maxWidth: "480px", width: "100%" }), marginTop: "40px" }}>
          {gameMode === 'online' ? (
            <>
              <div style={{ 
                padding: "10px 14px", 
                borderRadius: "10px", 
                background: C.blueDim,
                border: `1px solid rgba(59,130,246,0.35)`,
                marginBottom: "14px",
                textAlign: "center"
              }}>
                <span style={{ fontSize: "12px", color: "#93c5fd", fontWeight: "700" }}>
                  🌐 Votos registrados: {Object.keys(votes).length} de {alivePlayers.length}
                </span>
              </div>
              
              <h2 style={{ textAlign: "center", margin: "0 0 6px", fontSize: "26px" }}>🗳️ ¡Hora de votar!</h2>
              
              {alivePlayers.some(p => p.name === myPlayerName) ? (
                <>
                  <div style={{
                    background: C.purpleDim,
                    border: `1px solid ${C.purpleBorder}`,
                    borderRadius: "14px",
                    padding: "12px 16px",
                    margin: "14px 0",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "12px", color: C.muted, marginBottom: "4px" }}>TU VOTO:</div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "#c4b5fd" }}>
                      {votes[myPlayerName] ? `Votaste a: ${votes[myPlayerName]}` : "Selecciona a tu sospechoso"}
                    </div>
                  </div>

                  <p style={{ color: C.muted, textAlign: "center", fontSize: "14px", margin: "0 0 16px" }}>
                    ¿Quién crees que es el impostor? (No puedes votarte a ti mismo)
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {alivePlayers.filter(p => p.name !== myPlayerName).map(p => {
                      const myVote = votes[myPlayerName];
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
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "24px 10px" }}>
                  <div style={{ fontSize: "52px", marginBottom: "16px" }}>💀</div>
                  <h3 style={{ fontSize: "20px", color: "#fca5a5", margin: "0 0 10px" }}>Estás eliminado</h3>
                  <p style={{ color: C.muted, fontSize: "14px", margin: 0 }}>
                    Observando la votación de los jugadores vivos en tiempo real...
                  </p>
                </div>
              )}

              {/* Panel de estado de votos */}
              <div style={{
                marginTop: "24px",
                background: "rgba(255,255,255,0.03)",
                padding: "16px",
                borderRadius: "14px",
                border: `1px solid ${C.border}`
              }}>
                <div style={{ 
                  fontSize: "12px", 
                  color: C.muted, 
                  fontWeight: "700", 
                  marginBottom: "12px", 
                  textAlign: "center",
                  letterSpacing: "0.5px"
                }}>
                  ESTADO DE VOTACIÓN
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {alivePlayers.map(p => {
                    const hasVoted = !!votes[p.name];
                    return (
                      <div key={p.name} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.02)",
                        border: `1px solid ${C.border}`
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: avatarColors[players.findIndex(pl => pl.name === p.name) % avatarColors.length],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "800",
                            color: "#fff"
                          }}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: "14px", fontWeight: "700" }}>{p.name}</span>
                        </div>
                        <span style={{ 
                          fontSize: "12px", 
                          fontWeight: "700", 
                          color: hasVoted ? C.green : C.muted 
                        }}>
                          {hasVoted ? "✓ Votó" : "⏳ Votando..."}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {phase === "continue" && eliminated.length > 0 && (
        <div style={{ ...card({ maxWidth: "480px", width: "100%" }), marginTop: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>❌</div>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#fca5a5", marginBottom: "12px" }}>
            {eliminated[eliminated.length - 1].name} fue eliminado
          </h2>
          <div style={{
            padding: "14px",
            borderRadius: "12px",
            background: C.redDim,
            border: `1px solid ${C.redBorder}`,
            marginBottom: "20px",
          }}>
            <p style={{ color: "#f87171", fontSize: "16px", fontWeight: "700", margin: 0 }}>
              {eliminated[eliminated.length - 1].wasImpostor 
                ? "🕵️ ¡Era el impostor!" 
                : "🧑‍🤝‍🧑 ¡NO era el impostor!"}
            </p>
          </div>
          
          {!eliminated[eliminated.length - 1].wasImpostor && (
            <>
              <p style={{ color: C.muted, fontSize: "14px", marginBottom: "20px", lineHeight: 1.6 }}>
                El impostor sigue entre ustedes.<br />
                Continúen discutiendo para encontrarlo.
              </p>
              {gameMode === 'online' && !isOnlineHost ? (
                <div style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.muted,
                  fontSize: "14px",
                }}>
                  💬 Esperando que el anfitrión continúe...
                </div>
              ) : (
                <button 
                  onClick={continueGame}
                  style={btn("primary", { width: "100%", padding: "16px", fontSize: "16px" })}
                >
                  💬 Continuar discusión
                </button>
              )}
            </>
          )}
        </div>
      )}
      
      {phase === "result" && word && (
        <div style={{ maxWidth: "480px", width: "100%", marginTop: "32px" }}>
          <div style={{
            ...card({ marginBottom: "14px", textAlign: "center" }),
            background: citizensWin ? C.greenDim : C.redDim,
            borderColor: citizensWin ? C.greenBorder : C.redBorder,
          }}>
            <div style={{ fontSize: "72px", marginBottom: "10px", animation: "pop 0.4s ease" }}>
              {citizensWin ? "🎉" : "🕵️"}
            </div>
            <h1 style={{
              fontSize: "26px",
              fontWeight: "900",
              margin: "0 0 8px",
              color: citizensWin ? "#86efac" : "#fca5a5",
            }}>
              {citizensWin ? "¡Los ciudadanos ganaron!" : "¡El impostor ganó!"}
            </h1>
            <p style={{ color: C.muted, margin: 0, fontSize: "14px" }}>
              {citizensWin 
                ? "Identificaron al impostor correctamente." 
                : "El impostor logró engañar a todos."}
            </p>
          </div>
          
          <div style={{ ...card({ marginBottom: "14px" }), background: C.blueDim, borderColor: "rgba(59,130,246,0.35)" }}>
            <div style={{ fontSize: "11px", color: C.hint, letterSpacing: "1px", marginBottom: "8px" }}>
              PALABRA SECRETA
            </div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#93c5fd", marginBottom: "4px" }}>
              {word.emoji} {word.word}
            </div>
            <div style={{ fontSize: "13px", color: C.muted }}>
              Categoría: <span style={{ color: "#60a5fa", fontWeight: "700" }}>{word.category}</span>
            </div>
          </div>
          
          <div style={{ ...card({ marginBottom: "14px" }), background: C.redDim, borderColor: C.redBorder }}>
            <div style={{ fontSize: "11px", color: C.hint, letterSpacing: "1px", marginBottom: "8px" }}>
              {impostors.length > 1 ? "LOS IMPOSTORES ERAN" : "EL IMPOSTOR ERA"}
            </div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#fca5a5", marginBottom: "6px" }}>
              🕵️ {impostors.map(i => i.name).join(" & ")}
            </div>
            {cfg.giveHint && word.impostorHint && (
              <div style={{ 
                marginTop: "10px",
                padding: "8px 12px",
                borderRadius: "8px",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(239,68,68,0.3)"
              }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                  SU PISTA ERA:
                </div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#f87171" }}>
                  {word.impostorHint}
                </div>
              </div>
            )}
          </div>
          
          {roundHistory.length > 0 && (
            <div style={{ ...card({ marginBottom: "14px" }) }}>
              <div style={{ fontSize: "11px", color: C.hint, letterSpacing: "1px", marginBottom: "12px" }}>
                HISTORIAL DE VOTACIONES
              </div>
              {roundHistory.map((round, idx) => (
                <div key={idx} style={{
                  marginBottom: idx < roundHistory.length - 1 ? "12px" : 0,
                  paddingBottom: idx < roundHistory.length - 1 ? "12px" : 0,
                  borderBottom: idx < roundHistory.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    marginBottom: "6px" 
                  }}>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: C.text }}>
                      Ronda {idx + 1}
                    </span>
                    <span style={{ 
                      fontSize: "12px", 
                      color: round.wasImpostor ? C.green : C.red,
                      fontWeight: "700"
                    }}>
                      {round.wasImpostor ? "✓ Impostor" : "✗ Ciudadano"}
                    </span>
                  </div>
                  <div style={{ 
                    padding: "8px 12px", 
                    borderRadius: "8px",
                    background: round.wasImpostor ? C.greenDim : C.redDim,
                    border: `1px solid ${round.wasImpostor ? C.greenBorder : C.redBorder}`,
                  }}>
                    <div style={{ fontSize: "13px", color: C.muted }}>
                      Eliminado: <span style={{ fontWeight: "700", color: C.text }}>{round.eliminated}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ display: "flex", gap: "10px" }}>
            {gameMode === 'online' ? (
              <>
                <button 
                  onClick={backToModeSelect}
                  style={btn("ghost", { flex: 1, padding: "15px" })}
                >
                  🚪 Salir
                </button>
                {isOnlineHost && (
                  <button 
                    onClick={startGame}
                    style={btn("primary", { flex: 1, padding: "15px" })}
                  >
                    🔄 Nueva ronda
                  </button>
                )}
              </>
            ) : (
              <>
                <button 
                  onClick={startGame}
                  style={btn("primary", { flex: 1, padding: "15px" })}
                >
                  🔄 Nueva ronda
                </button>
                <button 
                  onClick={() => setPhase("setup")}
                  style={btn("ghost", { flex: 1, padding: "15px" })}
                >
                  ⚙️ Configurar
                </button>
              </>
            )}
          </div>
        </div>
      )}
        </>
      )}
      
      {error && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#7f1d1d",
          border: `1px solid ${C.redBorder}`,
          color: "#fca5a5",
          padding: "13px 22px",
          borderRadius: "14px",
          fontSize: "14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          maxWidth: "380px",
          textAlign: "center",
          zIndex: 999,
        }}>
          ⚠️ {error}
          <button 
            onClick={() => setError(null)} 
            style={{
              marginLeft: "12px",
              background: "none",
              border: "none",
              color: "#fca5a5",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            ✕
          </button>
        </div>
      )}
      
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pop { 
          0% { transform: scale(0.5); opacity: 0; } 
          100% { transform: scale(1); opacity: 1; } 
        }
        input[type=range] { 
          -webkit-appearance: none; 
          appearance: none; 
          height: 4px; 
          border-radius: 2px; 
          background: rgba(255,255,255,0.12); 
          outline: none; 
        }
        input[type=range]::-webkit-slider-thumb { 
          -webkit-appearance: none; 
          width: 18px; 
          height: 18px; 
          border-radius: 50%; 
          cursor: pointer; 
        }
        input:focus { 
          border-color: rgba(139,92,246,0.6) !important; 
          outline: none !important; 
        }
        button:active { 
          opacity: 0.82; 
          transform: scale(0.97); 
        }
        * { 
          -webkit-tap-highlight-color: transparent; 
        }
      `}</style>
    </div>
  );
}
