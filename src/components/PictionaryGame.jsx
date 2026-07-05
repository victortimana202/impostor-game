import { useState, useEffect, useRef } from 'react';
import { getRandomWord, getCategories } from '../services/colombianWords';
import { C, card, btn } from '../styles/theme';
import socketService from '../services/socketService';

export default function PictionaryGame({ roomCode, players: initialPlayers, onBack, isHost, myPlayerName }) {
  const [playerWords, setPlayerWords] = useState({}); // Cada jugador tiene su propia palabra
  const [myWord, setMyWord] = useState(null); // Mi palabra personal
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutos para dibujar
  const [phase, setPhase] = useState('category-select'); // category-select, waiting, drawing, guessing, author-guessing, results, gameover
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [myGuess, setMyGuess] = useState('');
  const [scores, setScores] = useState({});
  const [roundWinner, setRoundWinner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  
  // Sistema de intentos y pistas
  const [attempts, setAttempts] = useState({}); // { playerName: { wordOwner: attemptsLeft } }
  const [hintsUsed, setHintsUsed] = useState({}); // { playerName: { wordOwner: true/false } }
  const [guessedWords, setGuessedWords] = useState({}); // { playerName: [wordOwner1, wordOwner2...] }
  const [authorGuesses, setAuthorGuesses] = useState({}); // { playerName: { wordOwner: guessedAuthor } }
  const [revealedLetters, setRevealedLetters] = useState({}); // { playerName: { wordOwner: [indices] } }

  // Canvas states - uno por jugador
  const canvasRefs = useRef({}); // { playerName: canvasRef }
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
    console.log('🎨 [PictionaryGame] Iniciando juego');
    console.log('🎨 [PictionaryGame] RoomCode:', roomCode);
    console.log('🎨 [PictionaryGame] MyPlayerName:', myPlayerName);
    console.log('🎨 [PictionaryGame] IsHost:', isHost);
    console.log('🎨 [PictionaryGame] Jugadores:', initialPlayers);
    
    // Inicializar puntuaciones
    const initScores = {};
    initialPlayers.forEach(p => {
      initScores[p.name] = 0;
    });
    setScores(initScores);

    // Escuchar eventos
    socketService.onPictionaryUpdate(handleGameUpdate);
    socketService.onPictionaryGuess(handleGuessReceived);
    socketService.onPictionaryDrawing(handleDrawingReceived);
    socketService.onPictionaryClear(handleCanvasClear);
    
    // Si soy host, escuchar solicitudes de estado
    if (isHost) {
      socketService.onPictionaryStateRequested(() => {
        console.log('📤 [PictionaryGame] Host recibió solicitud de estado, reenviando...');
        // Reenviar el estado completo actual
        socketService.syncPictionaryState(roomCode, {
          phase,
          playerWords,
          timeLeft,
          roundNumber,
          scores,
          selectedCategory
        });
      });
    }

    return () => {
      console.log('🎨 [PictionaryGame] Desmontando, limpiando eventos');
      socketService.offPictionary();
    };
  }, []);

  // Efecto para detectar si no tengo palabra después de un tiempo
  useEffect(() => {
    if (!isHost && phase === 'drawing' && !myWord) {
      console.log('⚠️ [PictionaryGame] No tengo palabra en fase de dibujo, esperando...');
      const timer = setTimeout(() => {
        if (!myWord) {
          console.log('❌ [PictionaryGame] Aún no tengo palabra después de 2 segundos, solicitando estado');
          socketService.requestPictionaryState(roomCode);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, myWord, isHost]);

  useEffect(() => {
    if (phase === 'drawing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        const newTime = timeLeft - 1;
        setTimeLeft(newTime);
        if (isHost) {
          console.log(`⏱️ [PictionaryGame] Tiempo restante: ${newTime}s`);
          socketService.syncPictionaryState(roomCode, { timeLeft: newTime });
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'drawing' && timeLeft === 0) {
      if (isHost) {
        console.log('⏰ [PictionaryGame] ¡Tiempo terminado! Iniciando fase de adivinanza');
        startGuessing();
      }
    }
  }, [phase, timeLeft, isHost]);

  const selectCategory = (categoryId) => {
    console.log('📂 [PictionaryGame] Categoría seleccionada:', categoryId);
    setSelectedCategory(categoryId);
    
    if (isHost) {
      startNewRound(categoryId);
    }
  };

  const startNewRound = async (category = selectedCategory) => {
    console.log('🎮 [PictionaryGame] Iniciando nueva ronda');
    console.log('🎮 [PictionaryGame] Categoría:', category);
    setLoading(true);
    setPhase('waiting');
    
    try {
      // Generar una palabra DIFERENTE para cada jugador
      const wordsForPlayers = {};
      const usedWords = new Set();
      
      initialPlayers.forEach(player => {
        let wordData;
        // Evitar palabras repetidas
        do {
          wordData = getRandomWord(category);
        } while (usedWords.has(wordData.word) && usedWords.size < 50); // Protección contra bucles infinitos
        
        usedWords.add(wordData.word);
        wordsForPlayers[player.name] = wordData;
      });
      
      console.log('📝 [PictionaryGame] Palabras generadas:', wordsForPlayers);
      
      setPlayerWords(wordsForPlayers);
      setMyWord(wordsForPlayers[myPlayerName]);
      setTimeLeft(120);
      setMyGuess('');
      setRoundWinner(null);

      if (isHost) {
        console.log('👑 [PictionaryGame] Soy host, sincronizando estado');
        socketService.syncPictionaryState(roomCode, {
          phase: 'drawing',
          playerWords: wordsForPlayers,
          timeLeft: 120,
          roundNumber,
          roundWinner: null,
          selectedCategory: category
        });
      }

      setPhase('drawing');
      clearCanvas();
      console.log('✅ [PictionaryGame] Ronda iniciada en fase de dibujo');
    } catch (e) {
      console.error('❌ [PictionaryGame] Error al iniciar ronda:', e);
    } finally {
      setLoading(false);
    }
  };

  const startGuessing = () => {
    console.log('💬 [PictionaryGame] Iniciando fase de adivinanza');
    setPhase('guessing');
    
    // Inicializar intentos (3 por palabra)
    const newAttempts = {};
    initialPlayers.forEach(player => {
      newAttempts[player.name] = {};
      Object.keys(playerWords).forEach(wordOwner => {
        if (wordOwner !== player.name) {
          newAttempts[player.name][wordOwner] = 3;
        }
      });
    });
    setAttempts(newAttempts);
    
    if (isHost) {
      socketService.syncPictionaryState(roomCode, {
        phase: 'guessing'
      });
    }
  };
  
  const startAuthorGuessing = () => {
    console.log('🎨 [PictionaryGame] Iniciando fase de adivinar autores');
    setPhase('author-guessing');
    
    if (isHost) {
      socketService.syncPictionaryState(roomCode, {
        phase: 'author-guessing'
      });
    }
  };

  const endRound = (winner) => {
    console.log('🏁 [PictionaryGame] Finalizando ronda');
    console.log('🏆 [PictionaryGame] Ganador:', winner);
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
          console.log('🎉 [PictionaryGame] Juego terminado');
          setPhase('gameover');
          socketService.syncPictionaryState(roomCode, { 
            phase: 'gameover', 
            scores: newScores 
          });
        } else {
          // Siguiente ronda
          console.log('➡️ [PictionaryGame] Siguiente ronda');
          setRoundNumber(roundNumber + 1);
          startNewRound();
        }
      }, 5000);
    }
  };

  // Función para generar pistas estilo ahorcado (SOLO guiones bajos - difícil)
  const getHangmanHint = (word, revealedIndices = []) => {
    if (!word) return '';
    return word.split('').map((char, idx) => {
      if (char === ' ') return '   '; // Espacio visible entre palabras
      return '_ '; // SIEMPRE mostrar guión bajo (sin revelar letras)
    }).join('');
  };

  // Función para adivinar una letra
  const guessLetter = (wordOwner, letter) => {
    const wordData = playerWords[wordOwner];
    if (!wordData) return;
    
    const word = wordData.word.toLowerCase();
    const guessedLetter = letter.toLowerCase();
    
    // Verificar si la letra está en la palabra
    const indices = [];
    for (let i = 0; i < word.length; i++) {
      if (word[i] === guessedLetter) {
        indices.push(i);
      }
    }
    
    if (indices.length > 0) {
      // ¡Letra correcta! Revelarla
      const newRevealed = { ...revealedLetters };
      if (!newRevealed[myPlayerName]) newRevealed[myPlayerName] = {};
      if (!newRevealed[myPlayerName][wordOwner]) newRevealed[myPlayerName][wordOwner] = [];
      newRevealed[myPlayerName][wordOwner] = [...new Set([...newRevealed[myPlayerName][wordOwner], ...indices])];
      setRevealedLetters(newRevealed);
      
      // Verificar si completó la palabra
      if (newRevealed[myPlayerName][wordOwner].length === word.replace(/ /g, '').length) {
        // ¡Palabra completa!
        const newGuessed = { ...guessedWords };
        if (!newGuessed[myPlayerName]) newGuessed[myPlayerName] = [];
        newGuessed[myPlayerName].push(wordOwner);
        setGuessedWords(newGuessed);
        
        // Dar puntos
        const points = 200;
        const newScores = { ...scores };
        newScores[myPlayerName] = (newScores[myPlayerName] || 0) + points;
        setScores(newScores);
        
        console.log(`✅ [PictionaryGame] ${myPlayerName} completó la palabra de ${wordOwner}`);
      }
      
      return true;
    } else {
      // Letra incorrecta - restar intento
      const newAttempts = { ...attempts };
      if (!newAttempts[myPlayerName]) newAttempts[myPlayerName] = {};
      newAttempts[myPlayerName][wordOwner] = Math.max(0, (newAttempts[myPlayerName][wordOwner] ?? 3) - 1);
      setAttempts(newAttempts);
      
      console.log(`❌ [PictionaryGame] Letra incorrecta, intentos restantes: ${newAttempts[myPlayerName][wordOwner]}`);
      return false;
    }
  };

  // Función para adivinar palabra completa
  const guessCompleteWord = (wordOwner, guess) => {
    const wordData = playerWords[wordOwner];
    if (!wordData) return;
    
    const correct = guess.toLowerCase() === wordData.word.toLowerCase();
    
    if (correct) {
      // ¡Correcto!
      const newGuessed = { ...guessedWords };
      if (!newGuessed[myPlayerName]) newGuessed[myPlayerName] = [];
      newGuessed[myPlayerName].push(wordOwner);
      setGuessedWords(newGuessed);
      
      // Dar puntos (bonus por adivinar completa)
      const points = 300;
      const newScores = { ...scores };
      newScores[myPlayerName] = (newScores[myPlayerName] || 0) + points;
      setScores(newScores);
      
      console.log(`✅ [PictionaryGame] ${myPlayerName} adivinó la palabra completa de ${wordOwner}`);
      return true;
    } else {
      // Incorrecto - restar intento
      const newAttempts = { ...attempts };
      if (!newAttempts[myPlayerName]) newAttempts[myPlayerName] = {};
      newAttempts[myPlayerName][wordOwner] = Math.max(0, (newAttempts[myPlayerName][wordOwner] ?? 3) - 1);
      setAttempts(newAttempts);
      
      console.log(`❌ [PictionaryGame] Palabra incorrecta, intentos restantes: ${newAttempts[myPlayerName][wordOwner]}`);
      return false;
    }
  };

  // Función para usar pista (resta 1 intento)
  const usePictionaryHint = (wordOwner) => {
    const newHintsUsed = { ...hintsUsed };
    if (!newHintsUsed[myPlayerName]) newHintsUsed[myPlayerName] = {};
    newHintsUsed[myPlayerName][wordOwner] = true;
    setHintsUsed(newHintsUsed);
    
    // Restar un intento
    const newAttempts = { ...attempts };
    if (!newAttempts[myPlayerName]) newAttempts[myPlayerName] = {};
    newAttempts[myPlayerName][wordOwner] = Math.max(0, (newAttempts[myPlayerName][wordOwner] ?? 3) - 1);
    setAttempts(newAttempts);
    
    console.log(`💡 [PictionaryGame] Pista usada para ${wordOwner}, intentos restantes: ${newAttempts[myPlayerName][wordOwner]}`);
  };

  const handleGameUpdate = ({ gameState }) => {
    console.log('📥 [PictionaryGame] Actualización de estado recibida:', gameState);
    console.log('📥 [PictionaryGame] Mi nombre de jugador:', myPlayerName);
    
    if (gameState.phase !== undefined) {
      console.log('📥 [PictionaryGame] Cambiando fase a:', gameState.phase);
      setPhase(gameState.phase);
    }
    
    if (gameState.playerWords !== undefined) {
      console.log('📥 [PictionaryGame] PlayerWords recibidas:', gameState.playerWords);
      console.log('📥 [PictionaryGame] Mi palabra debería ser:', gameState.playerWords[myPlayerName]);
      setPlayerWords(gameState.playerWords);
      setMyWord(gameState.playerWords[myPlayerName]);
    }
    
    if (gameState.timeLeft !== undefined) setTimeLeft(gameState.timeLeft);
    if (gameState.scores !== undefined) setScores(gameState.scores);
    if (gameState.roundWinner !== undefined) setRoundWinner(gameState.roundWinner);
    if (gameState.roundNumber !== undefined) setRoundNumber(gameState.roundNumber);
    if (gameState.selectedCategory !== undefined) setSelectedCategory(gameState.selectedCategory);
  };

  const handleGuessReceived = (guessData) => {
    console.log('🎯 [PictionaryGame] Adivinanza recibida:', guessData);
    if (guessData.correct) {
      console.log(`✅ [PictionaryGame] ${guessData.playerName} adivinó correctamente!`);
      // Actualizar puntajes si es necesario
      if (guessData.guessedPlayer) {
        console.log(`👤 [PictionaryGame] Adivinó la palabra de: ${guessData.guessedPlayer}`);
      }
    }
  };

  const handleDrawingReceived = ({ x, y, color, lineWidth, isDrawing, tool, playerName: drawingPlayer }) => {
    console.log(`🖌️ [PictionaryGame] Dibujo recibido de ${drawingPlayer} - x:${x}, y:${y}, drawing:${isDrawing}`);
    // Dibujar en el canvas del jugador que envió el dibujo
    drawLine(x, y, color, lineWidth, isDrawing, tool, drawingPlayer);
  };

  const handleCanvasClear = ({ playerName: clearingPlayer }) => {
    console.log(`🗑️ [PictionaryGame] Canvas limpiado por ${clearingPlayer}`);
    clearCanvas(clearingPlayer);
  };

  // Funciones de dibujo
  const drawLine = (x, y, drawColor, drawWidth, drawing, drawTool, targetPlayer) => {
    const canvas = canvasRefs.current[targetPlayer];
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
    const canvas = canvasRefs.current[myPlayerName];
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (canvas.width / rect.width);
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * (canvas.height / rect.height);

    console.log(`🖊️ [PictionaryGame] Empezando a dibujar en x:${x.toFixed(0)}, y:${y.toFixed(0)}`);
    drawLine(x, y, color, lineWidth, false, tool, myPlayerName);
    setIsDrawing(true);
    socketService.sendPictionaryDrawing(roomCode, x, y, color, lineWidth, false, tool, myPlayerName);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRefs.current[myPlayerName];
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (canvas.width / rect.width);
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * (canvas.height / rect.height);

    drawLine(x, y, color, lineWidth, true, tool, myPlayerName);
    socketService.sendPictionaryDrawing(roomCode, x, y, color, lineWidth, true, tool, myPlayerName);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      console.log('🖊️ [PictionaryGame] Dejando de dibujar');
    }
    setIsDrawing(false);
  };

  const clearCanvas = (targetPlayer) => {
    const playerToClear = targetPlayer || myPlayerName;
    const canvas = canvasRefs.current[playerToClear];
    if (!canvas) {
      console.log(`⚠️ [PictionaryGame] No hay canvas para ${playerToClear}`);
      return;
    }
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    console.log(`🗑️ [PictionaryGame] Canvas limpiado para ${playerToClear}`);
  };

  const handleClearCanvas = () => {
    console.log('🗑️ [PictionaryGame] Limpiando mi canvas y enviando evento');
    clearCanvas(myPlayerName);
    socketService.clearPictionaryCanvas(roomCode, myPlayerName);
  };
  
  // Inicializar todos los canvas cuando cambien los jugadores
  useEffect(() => {
    if (phase === 'drawing' && initialPlayers.length > 0) {
      initialPlayers.forEach(player => {
        const canvas = canvasRefs.current[player.name];
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#1a1a2e';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      });
    }
  }, [phase, initialPlayers]);

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
            🎨 Pictionary Colombiano - Todos Dibujan
          </h1>
          <div style={{ fontSize: '16px', color: C.muted }}>
            Ronda {roundNumber} de {totalRounds} • Cada uno dibuja su propia palabra
          </div>
        </div>

        {phase === 'category-select' && isHost && (
          <div style={{ ...card({ padding: '32px', textAlign: 'center' }) }}>
            <h2 style={{ fontSize: '28px', marginBottom: '24px', fontWeight: '800' }}>
              📂 Selecciona una Categoría
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {getCategories().map(cat => (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  style={{
                    ...btn('ghost', { padding: '20px', fontSize: '16px' }),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '32px' }}>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'category-select' && !isHost && (
          <div style={{ ...card({ padding: '32px', textAlign: 'center' }) }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>⏳</div>
            <h2 style={{ fontSize: '24px', marginBottom: '12px', fontWeight: '800' }}>
              Esperando al anfitrión
            </h2>
            <p style={{ color: C.muted, fontSize: '16px' }}>
              El anfitrión está seleccionando la categoría...
            </p>
          </div>
        )}

        {phase === 'drawing' && !myWord && (
          <div style={{ ...card({ padding: '32px', textAlign: 'center' }) }}>
            <div style={{ fontSize: '52px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>🎨</div>
            <h2 style={{ fontSize: '24px', marginBottom: '12px', fontWeight: '800' }}>
              Cargando tu palabra...
            </h2>
            <p style={{ color: C.muted, fontSize: '16px' }}>
              Esperando sincronización del servidor
            </p>
          </div>
        )}

        {phase === 'drawing' && myWord && (
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
                background: C.purpleDim,
                borderColor: C.purpleBorder,
                minWidth: '300px'
              }}>
                <div style={{ fontSize: '13px', color: C.muted, marginBottom: '6px' }}>
                  🎯 TU PALABRA SECRETA
                </div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#c4b5fd' }}>
                  {myWord.emoji} {myWord.word}
                </div>
                <div style={{ fontSize: '12px', color: C.hint, marginTop: '4px' }}>
                  {myWord.category} • Dibuja esto
                </div>
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

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
              {/* Grilla de Canvas - Todos los jugadores */}
              <div>
                <div style={{ ...card({ padding: '16px' }) }}>
                  <div style={{ 
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(34,197,94,0.1)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#86efac',
                    fontWeight: '700'
                  }}>
                    🎨 Cada uno dibuja su palabra - Solo puedes dibujar en TU canvas
                  </div>

                  {/* Grilla de Canvas */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: initialPlayers.length > 2 ? 'repeat(2, 1fr)' : '1fr',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    {initialPlayers.map(player => {
                      const isMyCanvas = player.name === myPlayerName;
                      return (
                        <div key={player.name} style={{
                          padding: '12px',
                          borderRadius: '12px',
                          background: isMyCanvas ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)',
                          border: `2px solid ${isMyCanvas ? C.green : C.border}`
                        }}>
                          {/* Header del canvas */}
                          <div style={{
                            marginBottom: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '700', color: isMyCanvas ? '#86efac' : C.text }}>
                                {player.name} {isMyCanvas && '(TÚ)'}
                              </div>
                              {isMyCanvas && myWord && (
                                <div style={{ fontSize: '12px', color: C.hint, marginTop: '2px' }}>
                                  {myWord.emoji} {myWord.word}
                                </div>
                              )}
                            </div>
                            {isMyCanvas && (
                              <button
                                onClick={handleClearCanvas}
                                style={{
                                  ...btn('ghost', { padding: '6px 10px', fontSize: '12px' }),
                                  borderColor: C.redBorder
                                }}
                              >
                                🗑️
                              </button>
                            )}
                          </div>

                          {/* Canvas */}
                          <canvas
                            ref={el => canvasRefs.current[player.name] = el}
                            width={400}
                            height={300}
                            onMouseDown={isMyCanvas ? startDrawing : undefined}
                            onMouseMove={isMyCanvas ? draw : undefined}
                            onMouseUp={isMyCanvas ? stopDrawing : undefined}
                            onMouseLeave={isMyCanvas ? stopDrawing : undefined}
                            onTouchStart={isMyCanvas ? startDrawing : undefined}
                            onTouchMove={isMyCanvas ? draw : undefined}
                            onTouchEnd={isMyCanvas ? stopDrawing : undefined}
                            style={{
                              width: '100%',
                              height: 'auto',
                              borderRadius: '8px',
                              cursor: isMyCanvas ? 'crosshair' : 'default',
                              background: '#1a1a2e',
                              border: `2px solid ${C.border}`,
                              touchAction: isMyCanvas ? 'none' : 'auto'
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Herramientas de dibujo - Compartidas */}
                  <div style={{ 
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(139,92,246,0.05)',
                    border: `1px solid ${C.purpleBorder}`
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: C.muted }}>
                      🎨 Herramientas de Dibujo
                    </div>

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
                            borderRadius: '6px',
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

              {/* Panel lateral - Puntuaciones */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

        {phase === 'guessing' && (
          <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
            <div style={{ ...card({ padding: '24px', marginBottom: '16px', textAlign: 'center' }) }}>
              <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '12px' }}>
                🔍 Adivina las Palabras
              </h2>
              <p style={{ color: C.muted, fontSize: '16px', marginBottom: '8px' }}>
                Adivina letra por letra O la palabra completa. Tienes 3 intentos por palabra.
              </p>
              <p style={{ color: C.gold, fontSize: '14px', fontWeight: '700' }}>
                💡 Puedes pedir una pista, pero te costará 1 intento
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
              {Object.entries(playerWords).map(([wordOwner, wordData]) => {
                if (wordOwner === myPlayerName) return null;
                
                const alreadyGuessed = guessedWords[myPlayerName]?.includes(wordOwner);
                const attemptsLeft = attempts[myPlayerName]?.[wordOwner] ?? 3;
                const hintUsed = hintsUsed[myPlayerName]?.[wordOwner];
                const revealed = revealedLetters[myPlayerName]?.[wordOwner] || [];
                const noAttemptsLeft = attemptsLeft === 0;
                
                return (
                  <div key={wordOwner} style={{
                    ...card({ padding: '20px' }),
                    background: alreadyGuessed ? C.greenDim : noAttemptsLeft ? C.redDim : C.purpleDim,
                    borderColor: alreadyGuessed ? C.greenBorder : noAttemptsLeft ? C.redBorder : C.purpleBorder,
                    opacity: alreadyGuessed || noAttemptsLeft ? 0.7 : 1
                  }}>
                    {/* Canvas del jugador */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', color: C.muted, marginBottom: '8px', fontWeight: '700' }}>
                        🎨 Dibujo de {wordOwner}
                      </div>
                      <canvas
                        ref={el => {
                          if (el && canvasRefs.current[wordOwner]) {
                            const ctx = el.getContext('2d');
                            const sourceCanvas = canvasRefs.current[wordOwner];
                            ctx.drawImage(sourceCanvas, 0, 0);
                          }
                        }}
                        width={400}
                        height={300}
                        style={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: '8px',
                          background: '#1a1a2e',
                          border: `2px solid ${C.border}`
                        }}
                      />
                    </div>

                    {/* Ahorcado */}
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '8px' }}>
                        {wordData.emoji}
                      </div>
                      {alreadyGuessed ? (
                        <>
                          <div style={{ fontSize: '22px', fontWeight: '700', color: '#86efac', marginBottom: '4px' }}>
                            ✅ {wordData.word.toUpperCase()}
                          </div>
                          <div style={{ fontSize: '14px', color: C.green }}>
                            ¡Correcta! +200 pts
                          </div>
                        </>
                      ) : noAttemptsLeft ? (
                        <>
                          <div style={{ fontSize: '22px', fontWeight: '700', color: '#fca5a5', marginBottom: '4px' }}>
                            {wordData.word.toUpperCase()}
                          </div>
                          <div style={{ fontSize: '14px', color: C.red }}>
                            Sin intentos - La respuesta era: {wordData.word}
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ 
                            fontSize: '24px', 
                            fontWeight: '700', 
                            fontFamily: 'monospace',
                            letterSpacing: '4px',
                            color: C.green,
                            marginBottom: '8px'
                          }}>
                            {getHangmanHint(wordData.word, revealed)}
                          </div>
                          <div style={{ fontSize: '13px', color: C.hint, marginBottom: '8px' }}>
                            {wordData.category} • {wordData.word.length} letras
                          </div>
                          <div style={{ 
                            fontSize: '16px', 
                            color: attemptsLeft <= 1 ? '#fca5a5' : C.gold, 
                            fontWeight: '700'
                          }}>
                            ❤️ {attemptsLeft} intento{attemptsLeft !== 1 ? 's' : ''} restante{attemptsLeft !== 1 ? 's' : ''}
                          </div>
                        </>
                      )}
                    </div>

                    {!alreadyGuessed && !noAttemptsLeft && (
                      <>
                        {/* Pista */}
                        {!hintUsed && (
                          <button
                            onClick={() => usePictionaryHint(wordOwner)}
                            style={{
                              ...btn('ghost', { width: '100%', padding: '10px', fontSize: '14px', marginBottom: '12px' }),
                              borderColor: C.goldBorder
                            }}
                          >
                            💡 Ver Pista (-1 intento)
                          </button>
                        )}
                        
                        {hintUsed && (
                          <div style={{
                            padding: '10px',
                            borderRadius: '8px',
                            background: 'rgba(251,191,36,0.1)',
                            border: '1px solid rgba(251,191,36,0.3)',
                            marginBottom: '12px',
                            fontSize: '14px',
                            color: C.gold,
                            textAlign: 'center'
                          }}>
                            💡 {wordData.impostorHint}
                          </div>
                        )}

                        {/* Adivinar letra */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '13px', color: C.muted, marginBottom: '6px', fontWeight: '700' }}>
                            🔤 Adivinar una letra:
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').map(letter => {
                              const alreadyTried = revealed.some(idx => 
                                wordData.word[idx]?.toUpperCase() === letter
                              );
                              return (
                                <button
                                  key={letter}
                                  onClick={() => guessLetter(wordOwner, letter)}
                                  disabled={alreadyTried}
                                  style={{
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    border: `1px solid ${alreadyTried ? C.greenBorder : C.border}`,
                                    background: alreadyTried ? C.greenDim : 'rgba(255,255,255,0.05)',
                                    color: alreadyTried ? '#86efac' : C.text,
                                    cursor: alreadyTried ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    opacity: alreadyTried ? 0.5 : 1
                                  }}
                                >
                                  {letter}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Adivinar palabra completa */}
                        <div>
                          <div style={{ fontSize: '13px', color: C.muted, marginBottom: '6px', fontWeight: '700' }}>
                            💬 O adivina la palabra completa (+300 pts):
                          </div>
                          <input
                            type="text"
                            placeholder="Escribe la palabra..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                guessCompleteWord(wordOwner, e.target.value.trim());
                                e.target.value = '';
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '8px',
                              border: `1px solid ${C.border}`,
                              background: 'rgba(255,255,255,0.06)',
                              color: C.text,
                              fontSize: '15px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botón para pasar a adivinar autores */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              {isHost ? (
                <button 
                  onClick={() => {
                    console.log('🎨 [PictionaryGame] Host inicia fase de adivinar autores');
                    startAuthorGuessing();
                  }}
                  style={btn('primary', { padding: '16px 40px', fontSize: '16px' })}
                >
                  🎨 Siguiente: Adivinar Quién Dibujó Qué
                </button>
              ) : (
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.muted,
                  fontSize: '14px',
                }}>
                  ⏳ Esperando que el anfitrión continúe...
                </div>
              )}
            </div>
          </div>
        )}

        {phase === 'author-guessing' && (
          <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
            <div style={{ ...card({ padding: '24px', marginBottom: '16px', textAlign: 'center' }) }}>
              <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '12px' }}>
                🎨 ¿Quién Dibujó Qué?
              </h2>
              <p style={{ color: C.muted, fontSize: '16px' }}>
                Ahora adivina quién fue el autor de cada dibujo. ¡+100 pts por cada acierto!
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
              {Object.entries(playerWords).map(([wordOwner, wordData]) => {
                if (wordOwner === myPlayerName) return null;
                
                const myGuess = authorGuesses[myPlayerName]?.[wordOwner];
                const isCorrect = myGuess === wordOwner;
                const hasGuessed = myGuess !== undefined;
                
                return (
                  <div key={wordOwner} style={{
                    ...card({ padding: '20px' }),
                    background: hasGuessed ? (isCorrect ? C.greenDim : C.redDim) : C.surface,
                    borderColor: hasGuessed ? (isCorrect ? C.greenBorder : C.redBorder) : C.border
                  }}>
                    {/* Canvas */}
                    <div style={{ marginBottom: '16px' }}>
                      <canvas
                        ref={el => {
                          if (el && canvasRefs.current[wordOwner]) {
                            const ctx = el.getContext('2d');
                            const sourceCanvas = canvasRefs.current[wordOwner];
                            ctx.drawImage(sourceCanvas, 0, 0);
                          }
                        }}
                        width={400}
                        height={300}
                        style={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: '8px',
                          background: '#1a1a2e',
                          border: `2px solid ${C.border}`
                        }}
                      />
                    </div>

                    {/* Palabra */}
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                        {wordData.emoji}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: C.green }}>
                        {wordData.word.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '13px', color: C.hint, marginTop: '4px' }}>
                        {wordData.category}
                      </div>
                    </div>

                    {hasGuessed ? (
                      <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: isCorrect ? '#86efac' : '#fca5a5'
                      }}>
                        {isCorrect ? `✅ ¡Correcto! Era ${wordOwner} (+100 pts)` : `❌ Incorrecto. Era ${wordOwner}`}
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: C.muted, textAlign: 'center' }}>
                          🎨 ¿Quién lo dibujó?
                        </div>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const guessedAuthor = e.target.value;
                              const correct = guessedAuthor === wordOwner;
                              
                              // Guardar respuesta
                              const newAuthorGuesses = { ...authorGuesses };
                              if (!newAuthorGuesses[myPlayerName]) newAuthorGuesses[myPlayerName] = {};
                              newAuthorGuesses[myPlayerName][wordOwner] = guessedAuthor;
                              setAuthorGuesses(newAuthorGuesses);
                              
                              if (correct) {
                                // ¡Correcto! Dar puntos
                                const points = 100;
                                const newScores = { ...scores };
                                newScores[myPlayerName] = (newScores[myPlayerName] || 0) + points;
                                setScores(newScores);
                                
                                console.log(`✅ [PictionaryGame] ${myPlayerName} adivinó que ${wordOwner} dibujó`);
                              }
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: `1px solid ${C.border}`,
                            background: 'rgba(255,255,255,0.06)',
                            color: C.text,
                            fontSize: '15px',
                            outline: 'none'
                          }}
                        >
                          <option value="">Selecciona un jugador...</option>
                          {initialPlayers.map(p => (
                            <option key={p.name} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botón para terminar ronda */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              {isHost ? (
                <button 
                  onClick={() => {
                    console.log('🏁 [PictionaryGame] Host termina la ronda');
                    endRound(null);
                  }}
                  style={btn('primary', { padding: '16px 40px', fontSize: '16px' })}
                >
                  🏁 Terminar Ronda y Ver Resultados
                </button>
              ) : (
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.muted,
                  fontSize: '14px',
                }}>
                  ⏳ Esperando que el anfitrión termine la ronda...
                </div>
              )}
            </div>
          </div>
        )}
          <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
            <div style={{ ...card({ padding: '24px', marginBottom: '16px', textAlign: 'center' }) }}>
              <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '12px' }}>
                💬 Fase de Discusión
              </h2>
              <p style={{ color: C.muted, fontSize: '16px', marginBottom: '16px' }}>
                ¡Tiempo terminado! Ahora adivina las palabras Y quién las dibujó. Tienes 3 intentos por palabra.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
              {/* Mostrar cada palabra como una tarjeta para adivinar */}
              {Object.entries(playerWords).map(([wordOwner, wordData]) => {
                if (wordOwner === myPlayerName) return null; // No adivinar tu propia palabra
                
                const alreadyGuessed = guessedWords[myPlayerName]?.includes(wordOwner);
                const attemptsLeft = attempts[myPlayerName]?.[wordOwner] ?? 3;
                const hintUsed = hintsUsed[myPlayerName]?.[wordOwner];
                
                return (
                  <div key={wordOwner} style={{
                    ...card({ padding: '20px' }),
                    background: alreadyGuessed ? C.greenDim : C.purpleDim,
                    borderColor: alreadyGuessed ? C.greenBorder : C.purpleBorder,
                    opacity: alreadyGuessed ? 0.7 : 1
                  }}>
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '8px' }}>
                        {wordData.emoji}
                      </div>
                      {alreadyGuessed ? (
                        <>
                          <div style={{ fontSize: '22px', fontWeight: '700', color: '#86efac', marginBottom: '4px' }}>
                            ✅ {wordData.word}
                          </div>
                          <div style={{ fontSize: '14px', color: C.green }}>
                            ¡Ya la adivinaste!
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: '#c4b5fd', marginBottom: '4px' }}>
                            {"_ ".repeat(wordData.word.length)}
                          </div>
                          <div style={{ fontSize: '13px', color: C.hint }}>
                            {wordData.category} • {wordData.word.length} letras
                          </div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: attemptsLeft <= 1 ? '#fca5a5' : C.gold, 
                            fontWeight: '700',
                            marginTop: '8px'
                          }}>
                            {attemptsLeft} intento{attemptsLeft !== 1 ? 's' : ''} restante{attemptsLeft !== 1 ? 's' : ''}
                          </div>
                        </>
                      )}
                    </div>

                    {!alreadyGuessed && attemptsLeft > 0 && (
                      <>
                        {/* Mostrar pista si fue usada */}
                        {hintUsed && (
                          <div style={{
                            padding: '10px',
                            borderRadius: '8px',
                            background: 'rgba(251,191,36,0.1)',
                            border: '1px solid rgba(251,191,36,0.3)',
                            marginBottom: '12px',
                            fontSize: '14px',
                            color: C.gold
                          }}>
                            💡 Pista: {wordData.impostorHint}
                          </div>
                        )}

                        {/* Botón de pista */}
                        {!hintUsed && (
                          <button
                            onClick={() => {
                              const newHintsUsed = { ...hintsUsed };
                              if (!newHintsUsed[myPlayerName]) newHintsUsed[myPlayerName] = {};
                              newHintsUsed[myPlayerName][wordOwner] = true;
                              setHintsUsed(newHintsUsed);
                              
                              // Restar un intento
                              const newAttempts = { ...attempts };
                              if (!newAttempts[myPlayerName]) newAttempts[myPlayerName] = {};
                              newAttempts[myPlayerName][wordOwner] = (newAttempts[myPlayerName][wordOwner] ?? 3) - 1;
                              setAttempts(newAttempts);
                            }}
                            style={{
                              ...btn('ghost', { width: '100%', padding: '10px', fontSize: '14px', marginBottom: '8px' }),
                              borderColor: C.goldBorder
                            }}
                          >
                            💡 Ver Pista (-1 intento)
                          </button>
                        )}

                        {/* Input para adivinar */}
                        <input
                          type="text"
                          placeholder="Escribe la palabra..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              const guess = e.target.value.trim().toLowerCase();
                              const correct = guess === wordData.word.toLowerCase();
                              
                              if (correct) {
                                // ¡Correcto!
                                const newGuessed = { ...guessedWords };
                                if (!newGuessed[myPlayerName]) newGuessed[myPlayerName] = [];
                                newGuessed[myPlayerName].push(wordOwner);
                                setGuessedWords(newGuessed);
                                
                                // Dar puntos
                                const points = 200;
                                const newScores = { ...scores };
                                newScores[myPlayerName] = (newScores[myPlayerName] || 0) + points;
                                setScores(newScores);
                                
                                console.log(`✅ [PictionaryGame] ${myPlayerName} adivinó la palabra de ${wordOwner}`);
                              } else {
                                // Incorrecto - restar intento
                                const newAttempts = { ...attempts };
                                if (!newAttempts[myPlayerName]) newAttempts[myPlayerName] = {};
                                newAttempts[myPlayerName][wordOwner] = (newAttempts[myPlayerName][wordOwner] ?? 3) - 1;
                                setAttempts(newAttempts);
                              }
                              
                              e.target.value = '';
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: `1px solid ${C.border}`,
                            background: 'rgba(255,255,255,0.06)',
                            color: C.text,
                            fontSize: '15px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </>
                    )}

                    {/* Adivinar quién dibujó (bonus) */}
                    {alreadyGuessed && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: C.muted }}>
                          🎨 ¿Quién la dibujó? (+100 pts)
                        </div>
                        <select
                          onChange={(e) => {
                            if (e.target.value === wordOwner) {
                              // ¡Correcto!
                              const points = 100;
                              const newScores = { ...scores };
                              newScores[myPlayerName] = (newScores[myPlayerName] || 0) + points;
                              setScores(newScores);
                              
                              e.target.disabled = true;
                              e.target.value = wordOwner;
                              console.log(`✅ [PictionaryGame] ${myPlayerName} adivinó que ${wordOwner} dibujó esta palabra`);
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: `1px solid ${C.border}`,
                            background: 'rgba(255,255,255,0.06)',
                            color: C.text,
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        >
                          <option value="">Selecciona un jugador...</option>
                          {initialPlayers.map(p => (
                            <option key={p.name} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botón para terminar la ronda */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              {isHost ? (
                <button 
                  onClick={() => {
                    console.log('🏁 [PictionaryGame] Host termina la ronda');
                    endRound(null);
                  }}
                  style={btn('primary', { padding: '16px 40px', fontSize: '16px' })}
                >
                  🏁 Terminar Ronda y Ver Resultados
                </button>
              ) : (
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.muted,
                  fontSize: '14px',
                }}>
                  ⏳ Esperando que el anfitrión termine la ronda...
                </div>
              )}
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
