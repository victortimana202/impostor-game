import { useState, useEffect, useRef } from 'react';
import { fetchWord } from '../services/groqApi';
import { C, card, btn } from '../styles/theme';
import socketService from '../services/socketService';

export default function PictionaryGame({ roomCode, players: initialPlayers, onBack, isHost, myPlayerName }) {
  const [word, setWord] = useState(null);
  const [timeLeft, setTimeLeft] = useState(40);
  const [phase, setPhase] = useState('waiting'); // waiting, playing, results, gameover
  const [myGuess, setMyGuess] = useState('');
  const [scores, setScores] = useState({});
  const [roundWinner, setRoundWinner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);

  // Canvas states
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState('pen');

  const colors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#ffc0cb', '#a52a2a', '#808080', '#90ee90', '#ffd700',
    '#ff69b4', '#4169e1', '#32cd32'
  ];

  useEffect(() => {
    // Inicializar puntuaciones
    const initScores = {};
    initialPlayers.forEach(p => {
      initScores[p.name] = 0;
    });
    setScores(initScores);

    if (isHost) {
      startNewRound();
    }

    // Escuchar eventos
    socketService.onPictionaryUpdate(handleGameUpdate);
    socketService.onPictionaryGuess(handleGuessReceived);
    socketService.onPictionaryDrawing(handleDrawingReceived);
    socketService.onPictionaryClear(handleCanvasClear);

    return () => {
      socketService.offPictionary();
    };
  }, []);

  useEffect(() => {
    if (phase === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        const newTime = timeLeft - 1;
        setTimeLeft(newTime);
        if (isHost) {
          socketService.syncPictionaryState(roomCode, { timeLeft: newTime });
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'playing' && timeLeft === 0) {
      if (isHost) {
        endRound(null); // Nadie ganó
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
      setMyGuess('');
      setRoundWinner(null);

      if (isHost) {
        socketService.syncPictionaryState(roomCode, {
          phase: 'playing',
          word: data,
          timeLeft: 40,
          roundNumber,
          roundWinner: null
        });
      }

      setPhase('playing');
      clearCanvas();
    } catch (e) {
      console.error('Error al obtener palabra:', e);
    } finally {
      setLoading(false);
    }
  };

  const endRound = (winner) => {
    setPhase('results');
    setRoundWinner(winner);

    let newScores = { ...scores };
    if (winner) {
      // Puntos basados en tiempo restante
      const points = Math.max(100, timeLeft * 10);
      newScores[winner] = (newScores[winner] || 0) + points;
      setScores(newScores);
    }

    if (isHost) {
      socketService.syncPictionaryState(roomCode, {
        phase: 'results',
        roundWinner: winner,
        scores: newScores,
        roundNumber
      });

      setTimeout(() => {
        if (roundNumber >= totalRounds) {
          // Fin del juego
          setPhase('gameover');
          socketService.syncPictionaryState(roomCode, { 
            phase: 'gameover', 
            scores: newScores 
          });
        } else {
          // Siguiente ronda
          setRoundNumber(roundNumber + 1);
          startNewRound();
        }
      }, 5000);
    }
  };

  const submitGuess = () => {
    if (!myGuess.trim() || phase !== 'playing' || roundWinner) return;

    const guess = myGuess.trim().toLowerCase();
    const correct = guess === word.word.toLowerCase();

    if (correct) {
      // ¡Acierto!
      setRoundWinner(myPlayerName);
      socketService.sendPictionaryGuess(roomCode, {
        playerName: myPlayerName,
        guess: myGuess.trim(),
        correct: true,
        timestamp: Date.now()
      });

      if (isHost) {
        endRound(myPlayerName);
      }
    }

    setMyGuess('');
  };

  const handleGameUpdate = ({ gameState }) => {
    if (gameState.phase !== undefined) setPhase(gameState.phase);
    if (gameState.word !== undefined) setWord(gameState.word);
    if (gameState.timeLeft !== undefined) setTimeLeft(gameState.timeLeft);
    if (gameState.scores !== undefined) setScores(gameState.scores);
    if (gameState.roundWinner !== undefined) setRoundWinner(gameState.roundWinner);
    if (gameState.roundNumber !== undefined) setRoundNumber(gameState.roundNumber);
  };

  const handleGuessReceived = (guessData) => {
    if (guessData.correct && !roundWinner) {
      setRoundWinner(guessData.playerName);
    }
  };

  const handleDrawingReceived = ({ x, y, color, lineWidth, isDrawing, tool }) => {
    drawLine(x, y, color, lineWidth, isDrawing, tool);
  };

  const handleCanvasClear = () => {
    clearCanvas();
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
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (canvas.width / rect.width);
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * (canvas.height / rect.height);

    drawLine(x, y, color, lineWidth, false, tool);
    setIsDrawing(true);
    socketService.sendPictionaryDrawing(roomCode, x, y, color, lineWidth, false, tool);
  };

  const draw = (e) => {
    if (!isDrawing) return;
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

  const handleClearCanvas = () => {
    clearCanvas();
    socketService.clearPictionaryCanvas(roomCode);
  };

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
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        {/* Header */}
        <div style={{ 
          ...card({ marginBottom: '16px', textAlign: 'center' }),
          background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(59,130,246,0.2))'
        }}>
          <h1 style={{ fontSize: '32px', margin: '0 0 8px', fontWeight: '900' }}>
            🎨 Dibuja y Adivina - Todos Juegan
          </h1>
          <div style={{ fontSize: '16px', color: C.muted }}>
            Ronda {roundNumber} de {totalRounds} • Todos dibujan, el primero en adivinar gana
          </div>
        </div>

        {phase === 'playing' && word && (
          <>
            {/* Información de tiempo y palabra */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
              <div style={{ 
                ...card({ padding: '16px', textAlign: 'center' }),
                background: timeLeft < 10 ? C.redDim : C.goldDim,
                borderColor: timeLeft < 10 ? C.redBorder : C.goldBorder
              }}>
                <div style={{ fontSize: '14px', color: C.muted, marginBottom: '6px' }}>
                  ⏱️ TIEMPO
                </div>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: '900',
                  color: timeLeft < 10 ? '#fca5a5' : '#fcd34d'
                }}>
                  {timeLeft}s
                </div>
              </div>

              <div style={{ 
                ...card({ padding: '20px', textAlign: 'center' }),
                background: roundWinner ? C.greenDim : C.purpleDim,
                borderColor: roundWinner ? C.greenBorder : C.purpleBorder,
                minWidth: '300px'
              }}>
                {roundWinner ? (
                  <>
                    <div style={{ fontSize: '16px', color: C.green, marginBottom: '6px', fontWeight: '700' }}>
                      🏆 ¡{roundWinner} GANÓ!
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#86efac' }}>
                      {word.emoji} {word.word}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '13px', color: C.muted, marginBottom: '6px' }}>
                      🎯 PALABRA SECRETA
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#c4b5fd' }}>
                      {word.emoji} {"_ ".repeat(word.word.length)}
                    </div>
                    <div style={{ fontSize: '12px', color: C.hint, marginTop: '4px' }}>
                      {word.category} • {word.word.length} letras
                    </div>
                  </>
                )}
              </div>

              <div style={{ 
                ...card({ padding: '16px', textAlign: 'center' }),
                background: C.blueDim,
                borderColor: 'rgba(59,130,246,0.35)'
              }}>
                <div style={{ fontSize: '14px', color: C.muted, marginBottom: '6px' }}>
                  👤 TÚ
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800' }}>
                  {myPlayerName}
                </div>
                <div style={{ fontSize: '16px', color: C.gold, fontWeight: '700' }}>
                  {scores[myPlayerName] || 0} pts
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '16px' }}>
              {/* Canvas de dibujo - TODOS PUEDEN DIBUJAR */}
              <div>
                <div style={{ ...card({ padding: '16px' }) }}>
                  <div style={{ 
                    marginBottom: '12px',
                    padding: '10px',
                    background: 'rgba(34,197,94,0.1)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#86efac',
                    fontWeight: '700'
                  }}>
                    🎨 ¡TODOS PUEDEN DIBUJAR! Ayuda a adivinar la palabra
                  </div>

                  <canvas
                    ref={canvasRef}
                    width={700}
                    height={500}
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
                      cursor: 'crosshair',
                      background: '#1a1a2e',
                      border: `3px solid ${C.border}`,
                      touchAction: 'none',
                      marginBottom: '12px'
                    }}
                  />

                  {/* Herramientas de dibujo */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <button
                        onClick={() => setTool('pen')}
                        style={{
                          ...btn(tool === 'pen' ? 'primary' : 'ghost', { 
                            flex: 1, 
                            padding: '10px',
                            fontSize: '14px'
                          })
                        }}
                      >
                        ✏️ Lápiz
                      </button>
                      <button
                        onClick={() => setTool('eraser')}
                        style={{
                          ...btn(tool === 'eraser' ? 'danger' : 'ghost', { 
                            flex: 1, 
                            padding: '10px',
                            fontSize: '14px'
                          })
                        }}
                      >
                        🧹 Borrador
                      </button>
                      <button
                        onClick={handleClearCanvas}
                        style={btn('ghost', { padding: '10px 16px', fontSize: '14px' })}
                      >
                        🗑️ Limpiar
                      </button>
                    </div>

                    {/* Colores */}
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(9, 1fr)',
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
                            cursor: 'pointer',
                            transform: color === c ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.2s'
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
                        style={{ width: '100%', accentColor: C.green }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de adivinanza y puntuaciones */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Adivinar */}
                {!roundWinner && (
                  <div style={{ ...card({ padding: '16px' }) }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '700' }}>
                      🎯 Adivina la Palabra
                    </h3>

                    <div style={{ 
                      padding: '12px',
                      background: 'rgba(139,92,246,0.1)',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      fontSize: '13px',
                      color: C.muted,
                      lineHeight: 1.5
                    }}>
                      💡 Mira los dibujos de todos y escribe la palabra. ¡El primero en acertar gana puntos!
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={myGuess}
                        onChange={(e) => setMyGuess(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
                        placeholder="Escribe tu respuesta..."
                        disabled={roundWinner}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '8px',
                          border: `1px solid ${C.border}`,
                          background: 'rgba(255,255,255,0.06)',
                          color: C.text,
                          fontSize: '15px',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={submitGuess}
                        disabled={!myGuess.trim() || roundWinner}
                        style={{
                          ...btn('primary', { padding: '12px 20px', fontSize: '15px' }),
                          opacity: (!myGuess.trim() || roundWinner) ? 0.5 : 1
                        }}
                      >
                        📤
                      </button>
                    </div>
                  </div>
                )}

                {roundWinner && (
                  <div style={{ 
                    ...card({ padding: '20px', textAlign: 'center' }),
                    background: C.greenDim,
                    borderColor: C.greenBorder
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#86efac', marginBottom: '8px' }}>
                      ¡{roundWinner} GANÓ!
                    </div>
                    <div style={{ fontSize: '14px', color: C.muted }}>
                      +{Math.max(100, timeLeft * 10)} puntos
                    </div>
                  </div>
                )}

                {/* Tabla de puntuaciones */}
                <div style={{ ...card({ padding: '16px' }) }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '700' }}>
                    🏆 Puntuaciones
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(scores)
                      .sort((a, b) => b[1] - a[1])
                      .map(([name, score], idx) => (
                        <div
                          key={name}
                          style={{
                            padding: '12px',
                            borderRadius: '10px',
                            background: name === myPlayerName ? C.purpleDim : idx === 0 ? C.goldDim : C.surface,
                            border: `1px solid ${name === myPlayerName ? C.purpleBorder : idx === 0 ? C.goldBorder : C.border}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '700', color: C.muted }}>
                              {idx + 1}.
                            </span>
                            <span style={{ fontSize: '15px', fontWeight: '700' }}>
                              {name}
                              {name === roundWinner && ' 👑'}
                            </span>
                          </div>
                          <span style={{ fontSize: '18px', color: C.gold, fontWeight: '900' }}>
                            {score}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </>
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
