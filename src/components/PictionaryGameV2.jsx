import { useState, useEffect, useRef } from 'react';
import { getRandomWord, getCategories } from '../services/colombianWords';
import { C, card, btn } from '../styles/theme';
import socketService from '../services/socketService';
import VoiceChat from './VoiceChat';

export default function PictionaryGameV2({ roomCode, players: initialPlayers, onBack, isHost, myPlayerName }) {
  const [phase, setPhase] = useState('categorySelect'); // categorySelect, waiting, drawing, discussion, roundResults, gameOver
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentDrawerIndex, setCurrentDrawerIndex] = useState(0);
  const [word, setWord] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minuto para dibujar
  const [scores, setScores] = useState({});
  const [roundNumber, setRoundNumber] = useState(1);
  const [drawings, setDrawings] = useState([]); // Array de { playerName, imageData, word }
  const [myGuess, setMyGuess] = useState('');
  const [myAttempts, setMyAttempts] = useState(3); // 3 intentos por defecto
  const [usedHint, setUsedHint] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [guessedPlayers, setGuessedPlayers] = useState([]); // Jugadores que ya adivinaron
  const [authorGuesses, setAuthorGuesses] = useState({}); // Adivinanzas de autores {playerName: guess}
  
  // Canvas
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

  const currentDrawer = initialPlayers[currentDrawerIndex];
  const isMyTurn = currentDrawer?.name === myPlayerName;

  useEffect(() => {
    // Inicializar puntuaciones
    const initScores = {};
    initialPlayers.forEach(p => {
      initScores[p.name] = 0;
    });
    setScores(initScores);

    // Escuchar eventos
    socketService.onPictionaryV2Update(handleGameUpdate);
    socketService.onPictionaryV2Drawing(handleDrawingReceived);
    socketService.onPictionaryV2Guess(handleGuessReceived);
    socketService.onPictionaryV2Clear(handleCanvasClear);

    return () => {
      socketService.offPictionaryV2();
    };
  }, []);

  useEffect(() => {
    if (phase === 'drawing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        const newTime = timeLeft - 1;
        setTimeLeft(newTime);
        if (isHost) {
          socketService.syncPictionaryV2State(roomCode, { timeLeft: newTime });
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'drawing' && timeLeft === 0) {
      if (isHost && isMyTurn) {
        saveDrawingAndContinue();
      }
    }
  }, [phase, timeLeft, isHost, isMyTurn]);

  const startNewRound = async () => {
    if (!isHost) return;
    
    setPhase('waiting');
    
    try {
      const data = getRandomWord(selectedCategory);
      setWord(data);
      setTimeLeft(60);
      setMyGuess('');
      setMyAttempts(3);
      setUsedHint(false);
      setCurrentHint('');
      setGuessedPlayers([]);

      socketService.syncPictionaryV2State(roomCode, {
        phase: 'drawing',
        word: data,
        timeLeft: 60,
        currentDrawerIndex,
        roundNumber,
        guessedPlayers: []
      });

      setPhase('drawing');
      clearCanvas();
    } catch (e) {
      console.error('Error al obtener palabra:', e);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (isHost) {
      socketService.syncPictionaryV2State(roomCode, {
        selectedCategory: category,
        phase: 'drawing'
      });
      startNewRoundWithCategory(category);
    }
  };

  const startNewRoundWithCategory = async (category) => {
    if (!isHost) return;
    
    setPhase('waiting');
    
    try {
      const data = getRandomWord(category);
      setWord(data);
      setTimeLeft(60);
      setMyGuess('');
      setMyAttempts(3);
      setUsedHint(false);
      setCurrentHint('');
      setGuessedPlayers([]);

      socketService.syncPictionaryV2State(roomCode, {
        phase: 'drawing',
        word: data,
        timeLeft: 60,
        currentDrawerIndex,
        roundNumber,
        guessedPlayers: [],
        selectedCategory: category
      });

      setPhase('drawing');
      clearCanvas();
    } catch (e) {
      console.error('Error al obtener palabra:', e);
    }
  };

  const saveDrawingAndContinue = () => {
    // Guardar el dibujo actual
    const canvas = canvasRef.current;
    if (canvas && isMyTurn) {
      const imageData = canvas.toDataURL('image/png');
      const newDrawing = {
        playerName: myPlayerName,
        imageData,
        word: word.word
      };
      
      const updatedDrawings = [...drawings, newDrawing];
      setDrawings(updatedDrawings);

      if (isHost) {
        socketService.syncPictionaryV2State(roomCode, {
          drawings: updatedDrawings,
          phase: 'discussion'
        });
      }
    }

    setPhase('discussion');
  };

  const handleGameUpdate = ({ gameState }) => {
    if (gameState.phase !== undefined) setPhase(gameState.phase);
    if (gameState.word !== undefined) setWord(gameState.word);
    if (gameState.timeLeft !== undefined) setTimeLeft(gameState.timeLeft);
    if (gameState.scores !== undefined) setScores(gameState.scores);
    if (gameState.currentDrawerIndex !== undefined) setCurrentDrawerIndex(gameState.currentDrawerIndex);
    if (gameState.roundNumber !== undefined) setRoundNumber(gameState.roundNumber);
    if (gameState.drawings !== undefined) setDrawings(gameState.drawings);
    if (gameState.guessedPlayers !== undefined) setGuessedPlayers(gameState.guessedPlayers);
    if (gameState.selectedCategory !== undefined) setSelectedCategory(gameState.selectedCategory);
  };

  const handleGuessReceived = (guessData) => {
    if (guessData.correct && !guessedPlayers.includes(guessData.playerName)) {
      setGuessedPlayers(prev => [...prev, guessData.playerName]);
    }
  };

  const handleDrawingReceived = ({ x, y, color, lineWidth, isDrawing, tool }) => {
    drawLine(x, y, color, lineWidth, isDrawing, tool);
  };

  const handleCanvasClear = () => {
    clearCanvas();
  };

  const requestHint = () => {
    if (usedHint || myAttempts <= 1) return;
    
    setUsedHint(true);
    setMyAttempts(prev => prev - 1);
    setCurrentHint(word.impostorHint || `Empieza con "${word.word[0]}"`);
  };

  const submitGuess = () => {
    if (!myGuess.trim() || myAttempts <= 0 || guessedPlayers.includes(myPlayerName)) return;

    const guess = myGuess.trim().toLowerCase();
    const correct = guess === word.word.toLowerCase();

    setMyAttempts(prev => prev - 1);

    if (correct) {
      // ¡Acierto!
      const newGuessed = [...guessedPlayers, myPlayerName];
      setGuessedPlayers(newGuessed);
      
      // Calcular puntos basados en orden de adivinanza
      const points = Math.max(100, 500 - (newGuessed.length * 100));
      const newScores = { ...scores };
      newScores[myPlayerName] = (newScores[myPlayerName] || 0) + points;
      
      // Dar puntos al dibujante
      newScores[currentDrawer.name] = (newScores[currentDrawer.name] || 0) + 50;
      
      setScores(newScores);

      socketService.sendPictionaryV2Guess(roomCode, {
        playerName: myPlayerName,
        guess: myGuess.trim(),
        correct: true,
        points,
        timestamp: Date.now()
      });

      if (isHost) {
        socketService.syncPictionaryV2State(roomCode, {
          scores: newScores,
          guessedPlayers: newGuessed
        });
      }
    }

    setMyGuess('');
  };

  const submitAuthorGuess = (guessedAuthor) => {
    const newAuthorGuesses = { ...authorGuesses };
    newAuthorGuesses[currentDrawer.name] = guessedAuthor;
    setAuthorGuesses(newAuthorGuesses);

    // Verificar si es correcto
    if (guessedAuthor === currentDrawer.name) {
      const newScores = { ...scores };
      newScores[myPlayerName] = (newScores[myPlayerName] || 0) + 100;
      setScores(newScores);
      
      if (isHost) {
        socketService.syncPictionaryV2State(roomCode, { scores: newScores });
      }
    }
  };

  const nextTurn = () => {
    if (!isHost) return;

    const nextIndex = currentDrawerIndex + 1;
    
    if (nextIndex >= initialPlayers.length) {
      // Fin de la ronda
      if (roundNumber >= initialPlayers.length) {
        // Fin del juego
        setPhase('gameOver');
        socketService.syncPictionaryV2State(roomCode, { phase: 'gameOver' });
      } else {
        // Siguiente ronda
        setCurrentDrawerIndex(0);
        setRoundNumber(roundNumber + 1);
        startNewRound();
      }
    } else {
      // Siguiente jugador
      setCurrentDrawerIndex(nextIndex);
      startNewRound();
    }
  };

  // Funciones de dibujo (igual que antes)
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
    if (!isMyTurn) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (canvas.width / rect.width);
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * (canvas.height / rect.height);

    drawLine(x, y, color, lineWidth, false, tool);
    setIsDrawing(true);
    socketService.sendPictionaryV2Drawing(roomCode, x, y, color, lineWidth, false, tool);
  };

  const draw = (e) => {
    if (!isDrawing || !isMyTurn) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (canvas.width / rect.width);
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * (canvas.height / rect.height);

    drawLine(x, y, color, lineWidth, true, tool);
    socketService.sendPictionaryV2Drawing(roomCode, x, y, color, lineWidth, true, tool);
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
    if (!isMyTurn) return;
    clearCanvas();
    socketService.clearPictionaryV2Canvas(roomCode);
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
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        {/* Header */}
        <div style={{ 
          ...card({ marginBottom: '16px', textAlign: 'center' }),
          background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(59,130,246,0.2))'
        }}>
          <h1 style={{ fontSize: '32px', margin: '0 0 8px', fontWeight: '900' }}>
            🎨 Pictionary - Turnos
          </h1>
          <div style={{ fontSize: '16px', color: C.muted }}>
            Ronda {roundNumber} • {isMyTurn ? (
              <span style={{ color: C.green, fontWeight: '700' }}>¡Es tu turno!</span>
            ) : (
              <span style={{ color: C.purple, fontWeight: '700' }}>Alguien está dibujando... 🤔</span>
            )}
          </div>
        </div>

        {/* Chat de Voz */}
        {phase !== 'categorySelect' && (
          <VoiceChat roomCode={roomCode} myPlayerName={myPlayerName} />
        )}

        {phase === 'categorySelect' && (
          <div style={{ ...card({ padding: '32px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }) }}>
            <h2 style={{ fontSize: '28px', marginBottom: '16px', fontWeight: '900' }}>
              🇨🇴 Selecciona una Categoría
            </h2>
            <p style={{ color: C.muted, marginBottom: '32px', fontSize: '15px' }}>
              {isHost ? 'Elige el tipo de palabras para jugar' : 'Esperando que el anfitrión elija la categoría...'}
            </p>

            {isHost ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {getCategories().map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    style={{
                      ...btn('ghost', { padding: '20px', height: 'auto' }),
                      background: selectedCategory === cat.id ? C.purpleDim : C.surface,
                      borderColor: selectedCategory === cat.id ? C.purpleBorder : C.border,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '48px' }}>{cat.emoji}</span>
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: '700',
                      color: selectedCategory === cat.id ? '#c4b5fd' : C.text
                    }}>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: '32px',
                background: C.surface,
                borderRadius: '12px',
                border: `1px solid ${C.border}`
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <div style={{ fontSize: '16px', color: C.muted }}>
                  El anfitrión está seleccionando la categoría...
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 'drawing' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            {/* Canvas */}
            <div style={{ ...card({ padding: '16px' }) }}>
              <div style={{ 
                marginBottom: '12px',
                padding: '12px',
                background: isMyTurn ? C.greenDim : C.blueDim,
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '700'
              }}>
                {isMyTurn ? (
                  <>
                    🎨 ¡ES TU TURNO! Dibuja: <span style={{ color: C.green }}>{word.emoji} {word.word}</span>
                  </>
                ) : (
                  <>
                    👀 Alguien está dibujando... ¿Qué será? ¿Quién será?
                  </>
                )}
              </div>

              <div style={{ 
                marginBottom: '12px',
                padding: '10px',
                background: C.goldDim,
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: '900',
                color: timeLeft < 20 ? '#fca5a5' : '#fcd34d'
              }}>
                ⏱️ {timeLeft}s restantes
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
                  cursor: isMyTurn ? 'crosshair' : 'default',
                  background: '#1a1a2e',
                  border: `3px solid ${isMyTurn ? C.green : C.border}`,
                  touchAction: 'none',
                  marginBottom: '12px',
                  opacity: isMyTurn ? 1 : 0.95
                }}
              />

              {isMyTurn && (
                <div>
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
              )}
            </div>

            {/* Panel de Adivinanza */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!isMyTurn && !guessedPlayers.includes(myPlayerName) && (
                <div style={{ ...card({ padding: '16px' }) }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '700' }}>
                    🎯 Adivina la Palabra
                  </h3>

                  <div style={{ 
                    padding: '10px',
                    background: myAttempts <= 1 ? C.redDim : C.purpleDim,
                    borderRadius: '8px',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: C.muted }}>INTENTOS RESTANTES</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: myAttempts <= 1 ? '#fca5a5' : '#c4b5fd' }}>
                      {myAttempts}
                    </div>
                  </div>

                  {word && !usedHint && myAttempts > 1 && (
                    <button
                      onClick={requestHint}
                      style={btn('ghost', { 
                        width: '100%', 
                        marginBottom: '12px',
                        fontSize: '13px'
                      })}
                    >
                      💡 Pedir Pista (-1 intento)
                    </button>
                  )}

                  {currentHint && (
                    <div style={{ 
                      padding: '10px',
                      background: C.goldDim,
                      borderRadius: '8px',
                      marginBottom: '12px',
                      fontSize: '13px',
                      color: '#fcd34d',
                      textAlign: 'center'
                    }}>
                      💡 Pista: {currentHint}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={myGuess}
                      onChange={(e) => setMyGuess(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
                      placeholder="Escribe tu respuesta..."
                      disabled={myAttempts <= 0}
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
                      disabled={!myGuess.trim() || myAttempts <= 0}
                      style={{
                        ...btn('primary', { padding: '12px 20px', fontSize: '15px' }),
                        opacity: (!myGuess.trim() || myAttempts <= 0) ? 0.5 : 1
                      }}
                    >
                      📤
                    </button>
                  </div>
                </div>
              )}

              {guessedPlayers.includes(myPlayerName) && (
                <div style={{ 
                  ...card({ padding: '20px', textAlign: 'center' }),
                  background: C.greenDim,
                  borderColor: C.greenBorder
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#86efac' }}>
                    ¡Adivinaste correctamente!
                  </div>
                </div>
              )}

              {/* Puntuaciones */}
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
                        <span style={{ fontSize: '15px', fontWeight: '700' }}>
                          {idx + 1}. {name}
                          {name === myPlayerName && ' (Tú)'}
                        </span>
                        <span style={{ fontSize: '18px', color: C.gold, fontWeight: '900' }}>
                          {score}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Quién adivinó */}
              {guessedPlayers.length > 0 && (
                <div style={{ ...card({ padding: '12px' }) }}>
                  <div style={{ fontSize: '12px', color: C.muted, marginBottom: '8px' }}>
                    ✅ Han adivinado:
                  </div>
                  {guessedPlayers.map((name, idx) => (
                    <div key={name} style={{ 
                      fontSize: '13px', 
                      color: C.green,
                      padding: '4px 0'
                    }}>
                      {idx + 1}. {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {phase === 'discussion' && (
          <div style={{ ...card({ padding: '20px', textAlign: 'center' }) }}>
            <h2 style={{ marginBottom: '16px' }}>💬 Fase de Discusión</h2>
            <p style={{ color: C.muted, marginBottom: '20px' }}>
              ¿Quién crees que dibujó esto?
            </p>
            
            {/* Mostrar dibujo */}
            {drawings[currentDrawerIndex] && (
              <img 
                src={drawings[currentDrawerIndex].imageData} 
                alt="Dibujo"
                style={{ 
                  maxWidth: '100%',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}
              />
            )}

            {/* Botones para adivinar autor */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {initialPlayers.map(p => (
                <button
                  key={p.name}
                  onClick={() => submitAuthorGuess(p.name)}
                  disabled={authorGuesses[currentDrawer?.name]}
                  style={{
                    ...btn(
                      authorGuesses[currentDrawer?.name] === p.name ? 'primary' : 'ghost',
                      { padding: '12px' }
                    ),
                    opacity: authorGuesses[currentDrawer?.name] ? 0.5 : 1
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {isHost && (
              <button
                onClick={nextTurn}
                style={btn('primary', { padding: '16px 32px' })}
              >
                Siguiente Turno →
              </button>
            )}
          </div>
        )}

        {phase === 'gameOver' && (
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
