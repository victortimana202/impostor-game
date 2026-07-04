import { useState, useEffect, useRef } from 'react';
import { fetchWord } from '../services/groqApi';
import { C, card, btn } from '../styles/theme';
import socketService from '../services/socketService';

export default function PictionaryGame({ roomCode, players: initialPlayers, onBack, isHost, myPlayerName }) {
  const [currentDrawer, setCurrentDrawer] = useState(0);
  const [word, setWord] = useState(null);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(40);
  const [phase, setPhase] = useState('waiting'); // waiting, drawing, results, gameover
  const [guesses, setGuesses] = useState([]);
  const [myGuess, setMyGuess] = useState('');
  const [attempts, setAttempts] = useState({});
  const [scores, setScores] = useState({});
  const [guessedCorrectly, setGuessedCorrectly] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState('pen');

  const colors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#ffc0cb', '#a52a2a', '#808080', '#90ee90', '#ffd700',
    '#ff69b4'
  ];

  const totalRounds = initialPlayers.length;
  const maxAttempts = 3;

  useEffect(() => {
    // Inicializar puntuaciones e intentos
    const initScores = {};
    const initAttempts = {};
    initialPlayers.forEach(p => {
      initScores[p.name] = 0;
      initAttempts[p.name] = maxAttempts;
    });
    setScores(initScores);
    setAttempts(initAttempts);

    if (isHost) {
      startNewRound();
    }

    // Escuchar eventos
    socketService.onPictionaryUpdate(handleGameUpdate);
    socketService.onPictionaryGuess(handleGuessReceived);
    socketService.onPictionaryDrawing(handleDrawingReceived);

    return () => {
      socketService.offPictionary();
    };
  }, []);

  useEffect(() => {
    if (phase === 'drawing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(t => t - 1);
        if (isHost) {
          socketService.syncPictionaryState(roomCode, { timeLeft: timeLeft - 1 });
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'drawing' && timeLeft === 0) {
      if (isHost) {
        endRound();
      }
    }
  }, [phase, timeLeft, isHost]);

  const startNewRound = async () => {
    setLoading(true);
    setPhase('waiting');
    
    try {
      const data = await fetchWord('mixed', false, 'general');
      setWord(data);
      setTimeLeft(40);
      setGuesses([]);
      setMyGuess('');
      setGuessedCorrectly(new Set());
      
      // Reset intentos
      const newAttempts = {};
      initialPlayers.forEach(p => {
        newAttempts[p.name] = maxAttempts;
      });
      setAttempts(newAttempts);

      if (isHost) {
        socketService.syncPictionaryState(roomCode, {
          phase: 'drawing',
          word: data,
          currentDrawer,
          round,
          timeLeft: 40,
          guesses: [],
          attempts: newAttempts
        });
      }

      setPhase('drawing');
      clearCanvas();
    } catch (e) {
      console.error('Error al obtener palabra:', e);
    } finally {
      setLoading(false);
    }
  };

  const endRound = () => {
    setPhase('results');
    
    if (isHost) {
      socketService.syncPictionaryState(roomCode, {
        phase: 'results',
        scores
      });
      
      setTimeout(() => {
        if (currentDrawer + 1 >= initialPlayers.length) {
          // Fin del juego
          setPhase('gameover');
          socketService.syncPictionaryState(roomCode, { phase: 'gameover', scores });
        } else {
          // Siguiente ronda
          setCurrentDrawer(currentDrawer + 1);
          setRound(round + 1);
          startNewRound();
        }
      }, 5000);
    }
  };

  const submitGuess = () => {
    if (!myGuess.trim() || phase !== 'drawing') return;
    if (initialPlayers[currentDrawer].name === myPlayerName) return;
    if (guessedCorrectly.has(myPlayerName)) return;
    if (attempts[myPlayerName] <= 0) return;

    const guess = myGuess.trim().toLowerCase();
    const correct = guess === word.word.toLowerCase();

    const guessData = {
      playerName: myPlayerName,
      guess: myGuess.trim(),
      correct,
      timestamp: Date.now()
    };

    setGuesses(prev => [...prev, guessData]);
    setMyGuess('');

    if (correct) {
      // Acierto!
      const pointsEarned = Math.ceil(timeLeft / 10) * 100;
      setScores(prev => ({
        ...prev,
        [myPlayerName]: prev[myPlayerName] + pointsEarned,
        [initialPlayers[currentDrawer].name]: prev[initialPlayers[currentDrawer].name] + 50
      }));
      setGuessedCorrectly(prev => new Set(prev).add(myPlayerName));
    } else {
      // Fallo
      setAttempts(prev => ({
        ...prev,
        [myPlayerName]: prev[myPlayerName] - 1
      }));
    }

    socketService.sendPictionaryGuess(roomCode, guessData);

    if (isHost && correct) {
      socketService.syncPictionaryState(roomCode, { 
        scores,
        guessedCorrectly: Array.from(guessedCorrectly)
      });
    }
  };

  const handleGameUpdate = ({ gameState }) => {
    if (gameState.phase !== undefined) setPhase(gameState.phase);
    if (gameState.word !== undefined) setWord(gameState.word);
    if (gameState.currentDrawer !== undefined) setCurrentDrawer(gameState.currentDrawer);
    if (gameState.round !== undefined) setRound(gameState.round);
    if (gameState.timeLeft !== undefined) setTimeLeft(gameState.timeLeft);
    if (gameState.scores !== undefined) setScores(gameState.scores);
    if (gameState.attempts !== undefined) setAttempts(gameState.attempts);
    if (gameState.guessedCorrectly !== undefined) {
      setGuessedCorrectly(new Set(gameState.guessedCorrectly));
    }
  };

  const handleGuessReceived = (guessData) => {
    setGuesses(prev => [...prev, guessData]);
    
    if (guessData.correct) {
      setGuessedCorrectly(prev => new Set(prev).add(guessData.playerName));
    }
  };

  const handleDrawingReceived = ({ x, y, color, lineWidth, isDrawing, tool }) => {
    drawLine(x, y, color, lineWidth, isDrawing, tool);
  };

  // Funciones de dibujo
  const drawLine = (x, y, drawColor, drawWidth, drawing, drawTool) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (drawTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawColor;
    }

    ctx.lineWidth = drawWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (drawing) {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const startDrawing = (e) => {
    if (initialPlayers[currentDrawer].name !== myPlayerName) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (canvas.width / rect.width);
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * (canvas.height / rect.height);

    drawLine(x, y, color, lineWidth, false, tool);
    setIsDrawing(true);
    socketService.sendPictionaryDrawing(roomCode, x, y, color, lineWidth, false, tool);
  };

  const draw = (e) => {
    if (!isDrawing || initialPlayers[currentDrawer].name !== myPlayerName) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (canvas.width / rect.width);
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * (canvas.height / rect.height);

    drawLine(x, y, color, lineWidth, true, tool);
    socketService.sendPictionaryDrawing(roomCode, x, y, color, lineWidth, true, tool);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const isMyTurnToDraw = initialPlayers[currentDrawer]?.name === myPlayerName;
  const haveIGuessed = guessedCorrectly.has(myPlayerName);

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at 20% 20%, #1a0d3d 0%, ${C.bg} 60%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 16px',
      color: C.text
    }}>
      <div style={{ maxWidth: '900px', width: '100%' }}>
        {/* Header */}
        <div style={{ 
          ...card({ marginBottom: '16px', textAlign: 'center' }),
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))'
        }}>
          <h1 style={{ fontSize: '32px', margin: '0 0 8px', fontWeight: '900' }}>
            🎨 Dibuja y Adivina
          </h1>
          <div style={{ fontSize: '16px', color: C.muted }}>
            Ronda {round} de {totalRounds}
          </div>
        </div>

        {phase === 'drawing' && (
          <>
            {/* Información de turno y tiempo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ 
                ...card({ padding: '16px', textAlign: 'center' }),
                background: isMyTurnToDraw ? C.purpleDim : C.blueDim,
                borderColor: isMyTurnToDraw ? C.purpleBorder : 'rgba(59,130,246,0.35)'
              }}>
                <div style={{ fontSize: '14px', color: C.muted, marginBottom: '6px' }}>
                  {isMyTurnToDraw ? '🎨 TU TURNO' : '👀 DIBUJANDO'}
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800' }}>
                  {initialPlayers[currentDrawer]?.name}
                </div>
              </div>

              <div style={{ 
                ...card({ padding: '16px', textAlign: 'center' }),
                background: timeLeft < 10 ? C.redDim : C.goldDim,
                borderColor: timeLeft < 10 ? C.redBorder : C.goldBorder
              }}>
                <div style={{ fontSize: '14px', color: C.muted, marginBottom: '6px' }}>
                  ⏱️ TIEMPO
                </div>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '900',
                  color: timeLeft < 10 ? '#fca5a5' : '#fcd34d'
                }}>
                  {timeLeft}s
                </div>
              </div>
            </div>

            {/* Palabra para el dibujante */}
            {isMyTurnToDraw && word && (
              <div style={{ 
                ...card({ marginBottom: '16px', textAlign: 'center' }),
                background: C.greenDim,
                borderColor: C.greenBorder
              }}>
                <div style={{ fontSize: '13px', color: C.muted, marginBottom: '8px' }}>
                  🎯 TU PALABRA SECRETA
                </div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#86efac' }}>
                  {word.emoji} {word.word}
                </div>
                <div style={{ fontSize: '14px', color: C.muted, marginTop: '6px' }}>
                  {word.category}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              {/* Canvas de dibujo */}
              <div>
                <div style={{ ...card({ padding: '16px' }) }}>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={450}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '12px',
                      cursor: isMyTurnToDraw ? 'crosshair' : 'not-allowed',
                      background: '#1a1a2e',
                      border: `3px solid ${C.border}`,
                      touchAction: 'none'
                    }}
                  />

                  {isMyTurnToDraw && (
                    <div style={{ marginTop: '12px' }}>
                      {/* Herramientas */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <button
                          onClick={() => setTool('pen')}
                          style={{
                            ...btn(tool === 'pen' ? 'primary' : 'ghost', { flex: 1, padding: '10px' })
                          }}
                        >
                          ✏️ Lápiz
                        </button>
                        <button
                          onClick={() => setTool('eraser')}
                          style={{
                            ...btn(tool === 'eraser' ? 'danger' : 'ghost', { flex: 1, padding: '10px' })
                          }}
                        >
                          🧹 Borrador
                        </button>
                        <button
                          onClick={clearCanvas}
                          style={btn('ghost', { padding: '10px' })}
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Colores */}
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(8, 1fr)',
                        gap: '6px',
                        marginBottom: '12px'
                      }}>
                        {colors.map(c => (
                          <button
                            key={c}
                            onClick={() => { setColor(c); setTool('pen'); }}
                            style={{
                              width: '100%',
                              aspectRatio: '1',
                              borderRadius: '8px',
                              background: c,
                              border: color === c ? `3px solid ${C.green}` : `1px solid ${C.border}`,
                              cursor: 'pointer'
                            }}
                          />
                        ))}
                      </div>

                      {/* Grosor */}
                      <div>
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          marginBottom: '6px'
                        }}>
                          <span style={{ color: C.muted }}>Grosor</span>
                          <span style={{ fontWeight: '700' }}>{lineWidth}px</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={lineWidth}
                          onChange={(e) => setLineWidth(parseInt(e.target.value))}
                          style={{ width: '100%', accentColor: C.purple }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat de adivinanzas */}
              <div>
                <div style={{ ...card({ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }) }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>
                    💬 Adivinanzas
                  </h3>

                  <div style={{ 
                    flex: 1,
                    overflowY: 'auto',
                    marginBottom: '12px',
                    padding: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    border: `1px solid ${C.border}`
                  }}>
                    {guesses.map((g, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '8px',
                          marginBottom: '6px',
                          borderRadius: '6px',
                          background: g.correct ? C.greenDim : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${g.correct ? C.greenBorder : C.border}`
                        }}
                      >
                        <div style={{ fontSize: '11px', color: C.muted }}>
                          {g.playerName}
                        </div>
                        <div style={{ 
                          fontSize: '14px',
                          fontWeight: g.correct ? '700' : '400',
                          color: g.correct ? '#86efac' : C.text
                        }}>
                          {g.correct ? '✅ ¡Correcto!' : g.guess}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isMyTurnToDraw && (
                    <>
                      <div style={{ 
                        fontSize: '12px',
                        color: haveIGuessed ? C.green : C.muted,
                        marginBottom: '8px',
                        fontWeight: '700'
                      }}>
                        {haveIGuessed 
                          ? '✅ ¡Ya adivinaste!'
                          : `Intentos restantes: ${attempts[myPlayerName] || 0}`
                        }
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={myGuess}
                          onChange={(e) => setMyGuess(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
                          placeholder="Escribe tu respuesta..."
                          disabled={haveIGuessed || attempts[myPlayerName] <= 0}
                          style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: `1px solid ${C.border}`,
                            background: 'rgba(255,255,255,0.06)',
                            color: C.text,
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                        <button
                          onClick={submitGuess}
                          disabled={!myGuess.trim() || haveIGuessed || attempts[myPlayerName] <= 0}
                          style={{
                            ...btn('primary', { padding: '10px 16px' }),
                            opacity: (!myGuess.trim() || haveIGuessed || attempts[myPlayerName] <= 0) ? 0.5 : 1
                          }}
                        >
                          📤
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla de puntuaciones */}
            <div style={{ ...card({ marginTop: '16px', padding: '16px' }) }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>
                🏆 Puntuaciones
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
                {initialPlayers.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: p.name === initialPlayers[currentDrawer]?.name ? C.purpleDim : C.surface,
                      border: `1px solid ${p.name === initialPlayers[currentDrawer]?.name ? C.purpleBorder : C.border}`,
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{p.name}</div>
                    <div style={{ fontSize: '20px', color: C.gold, fontWeight: '900' }}>
                      {scores[p.name] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {phase === 'results' && word && (
          <div style={{ ...card({ textAlign: 'center', padding: '40px' }) }}>
            <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>
              La palabra era:
            </h2>
            <div style={{ fontSize: '48px', fontWeight: '900', color: C.green, marginBottom: '32px' }}>
              {word.emoji} {word.word}
            </div>
            <div style={{ fontSize: '16px', color: C.muted }}>
              Siguiente ronda en unos segundos...
            </div>
          </div>
        )}

        {phase === 'gameover' && (
          <div style={{ ...card({ textAlign: 'center', padding: '40px' }) }}>
            <h1 style={{ fontSize: '42px', marginBottom: '24px' }}>
              🎉 ¡Juego Terminado!
            </h1>
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', color: C.muted, marginBottom: '16px' }}>
                🏆 Ganador
              </h3>
              <div style={{ fontSize: '36px', fontWeight: '900', color: C.gold }}>
                {Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]}
              </div>
              <div style={{ fontSize: '24px', color: C.green }}>
                {Object.entries(scores).sort((a, b) => b[1] - a[1])[0][1]} puntos
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>
                Resultados Finales
              </h3>
              {Object.entries(scores)
                .sort((a, b) => b[1] - a[1])
                .map(([name, score], idx) => (
                  <div
                    key={name}
                    style={{
                      padding: '12px',
                      marginBottom: '8px',
                      borderRadius: '10px',
                      background: idx === 0 ? C.goldDim : C.surface,
                      border: `1px solid ${idx === 0 ? C.goldBorder : C.border}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: '700' }}>
                      {idx + 1}. {name}
                    </span>
                    <span style={{ fontSize: '18px', color: C.gold, fontWeight: '900' }}>
                      {score}
                    </span>
                  </div>
                ))}
            </div>

            <button 
              onClick={onBack}
              style={btn('primary', { padding: '16px 32px', fontSize: '16px' })}
            >
              🏠 Volver al Lobby
            </button>
          </div>
        )}

        <button 
          onClick={onBack}
          style={btn('ghost', { marginTop: '16px', padding: '12px' })}
        >
          ← Salir del juego
        </button>
      </div>
    </div>
  );
}
