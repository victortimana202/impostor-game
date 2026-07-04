import { useRef, useState, useEffect } from 'react';
import { C, btn } from '../styles/theme';
import socketService from '../services/socketService';

export default function DrawingBoard({ roomCode, myPlayerName, gameMode }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [isExpanded, setIsExpanded] = useState(true); // Expandido por defecto
  const [tool, setTool] = useState('pen'); // pen, eraser, fill
  const [opacity, setOpacity] = useState(100);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const lastPointRef = useRef(null);

  const colors = [
    // Básicos
    '#ffffff', '#000000', '#808080', '#C0C0C0',
    // Primarios
    '#ef4444', '#f59e0b', '#fbbf24', '#facc15',
    '#22c55e', '#10b981', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#ec4899', '#f43f5e', '#fb923c', '#84cc16',
    // Tonos pastel
    '#fecaca', '#fed7aa', '#fef3c7', '#fef9c3',
    '#bbf7d0', '#a7f3d0', '#a5f3fc', '#bfdbfe',
    '#c7d2fe', '#ddd6fe', '#e9d5ff', '#fbcfe8',
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameMode === 'online') {
      socketService.onDrawing(({ x, y, color, lineWidth, isDrawing, tool, opacity }) => {
        drawLine(x, y, color, lineWidth, isDrawing, tool, opacity);
      });

      socketService.onDrawingCleared(() => {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      socketService.onDrawingComment(({ playerName, comment, timestamp }) => {
        setComments(prev => [...prev, { playerName, comment, timestamp }]);
      });
    }

    return () => {
      if (gameMode === 'online') {
        socketService.offDrawing();
      }
    };
  }, [gameMode]);

  const drawLine = (x, y, drawColor, drawWidth, drawing, drawTool, drawOpacity) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (drawTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawColor;
      ctx.globalAlpha = (drawOpacity || 100) / 100;
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

    lastPointRef.current = { x, y };
    drawLine(x, y, color, lineWidth, false, tool, opacity);
    setIsDrawing(true);

    if (gameMode === 'online') {
      socketService.sendDrawing(roomCode, x, y, color, lineWidth, false, tool, opacity);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (canvas.width / rect.width);
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * (canvas.height / rect.height);

    drawLine(x, y, color, lineWidth, true, tool, opacity);
    lastPointRef.current = { x, y };

    if (gameMode === 'online') {
      socketService.sendDrawing(roomCode, x, y, color, lineWidth, true, tool, opacity);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameMode === 'online') {
      socketService.clearDrawing(roomCode);
    }
  };

  const sendComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      playerName: myPlayerName,
      comment: newComment.trim(),
      timestamp: Date.now()
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');

    if (gameMode === 'online') {
      socketService.sendDrawingComment(roomCode, comment);
    }
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `dibujo-impostor-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div style={{
      padding: '16px',
      borderRadius: '16px',
      background: 'rgba(34,197,94,0.08)',
      border: `1px solid ${C.greenBorder}`,
      marginBottom: '14px',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: isExpanded ? '16px' : '0',
        cursor: 'pointer',
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🎨</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: C.text }}>
            Pizarra Profesional de Dibujo
          </span>
        </div>
        <span style={{ fontSize: '20px', color: C.muted, transition: 'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <>
          <div style={{ 
            fontSize: '12px', 
            color: C.muted, 
            marginBottom: '14px',
            lineHeight: 1.5,
            padding: '10px 12px',
            background: 'rgba(34,197,94,0.1)',
            borderRadius: '8px',
            border: `1px solid rgba(34,197,94,0.2)`
          }}>
            💡 <strong>Dibuja para explicar tu palabra</strong> sin escribir texto. Todos verán tu dibujo en tiempo real.
          </div>

          {/* Herramientas */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: C.muted, marginBottom: '8px', fontWeight: '600' }}>
              🛠️ Herramientas
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setTool('pen')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: tool === 'pen' ? `2px solid ${C.green}` : `1px solid ${C.border}`,
                  background: tool === 'pen' ? 'rgba(34,197,94,0.2)' : C.surface,
                  color: tool === 'pen' ? '#86efac' : C.text,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                ✏️ Lápiz
              </button>
              <button
                onClick={() => setTool('eraser')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: tool === 'eraser' ? `2px solid ${C.red}` : `1px solid ${C.border}`,
                  background: tool === 'eraser' ? 'rgba(239,68,68,0.2)' : C.surface,
                  color: tool === 'eraser' ? '#fca5a5' : C.text,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                🧹 Borrador
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div style={{
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '14px',
            border: `3px solid ${C.border}`,
            touchAction: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            position: 'relative'
          }}>
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
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
                display: 'block',
                cursor: tool === 'eraser' ? 'crosshair' : 'crosshair',
                background: '#1a1a2e'
              }}
            />
          </div>

          {/* Paleta de colores */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '12px', color: C.muted, fontWeight: '600' }}>
                🎨 Colores ({colors.length})
              </span>
              <div style={{
                width: '40px',
                height: '24px',
                borderRadius: '6px',
                background: color,
                border: `2px solid ${C.border}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }} />
            </div>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: '6px',
              maxHeight: '120px',
              overflowY: 'auto',
              padding: '8px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '10px',
              border: `1px solid ${C.border}`
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
                    border: color === c ? `3px solid ${C.green}` : `1px solid rgba(255,255,255,0.2)`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: color === c ? '0 0 12px rgba(34,197,94,0.5)' : '0 2px 4px rgba(0,0,0,0.3)',
                    transform: color === c ? 'scale(1.1)' : 'scale(1)'
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Tamaño del pincel */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '12px',
              color: C.muted,
              fontWeight: '600'
            }}>
              <span>🖌️ Grosor</span>
              <span style={{ fontWeight: '700', color: C.text, fontSize: '14px' }}>{lineWidth}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              style={{ 
                width: '100%', 
                accentColor: C.green,
                height: '6px'
              }}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '10px',
              color: C.hint,
              marginTop: '4px'
            }}>
              <span>Fino</span>
              <span>Grueso</span>
            </div>
          </div>

          {/* Opacidad */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '12px',
              color: C.muted,
              fontWeight: '600'
            }}>
              <span>💧 Opacidad</span>
              <span style={{ fontWeight: '700', color: C.text, fontSize: '14px' }}>{opacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={opacity}
              onChange={(e) => setOpacity(parseInt(e.target.value))}
              style={{ 
                width: '100%', 
                accentColor: C.blue,
                height: '6px'
              }}
            />
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button 
              onClick={clearCanvas}
              style={btn('danger', { flex: 1, padding: '12px', fontSize: '14px' })}
            >
              🗑️ Limpiar
            </button>
            <button 
              onClick={downloadDrawing}
              style={btn('ghost', { flex: 1, padding: '12px', fontSize: '14px' })}
            >
              💾 Guardar
            </button>
          </div>

          {/* Comentarios */}
          <div style={{
            padding: '12px',
            borderRadius: '10px',
            background: 'rgba(0,0,0,0.2)',
            border: `1px solid ${C.border}`
          }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '700', 
              color: C.text,
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              💬 Comentarios ({comments.length})
            </div>
            
            <div style={{ 
              maxHeight: '150px', 
              overflowY: 'auto',
              marginBottom: '10px'
            }}>
              {comments.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: C.hint, 
                  fontSize: '12px',
                  padding: '20px 10px'
                }}>
                  Sin comentarios aún. ¡Sé el primero en opinar!
                </div>
              ) : (
                comments.map((c, idx) => (
                  <div key={idx} style={{
                    padding: '8px 10px',
                    marginBottom: '6px',
                    borderRadius: '8px',
                    background: c.playerName === myPlayerName ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${c.playerName === myPlayerName ? C.purpleBorder : C.border}`
                  }}>
                    <div style={{ 
                      fontSize: '11px', 
                      color: C.muted,
                      marginBottom: '2px'
                    }}>
                      <strong style={{ color: C.text }}>{c.playerName}</strong>
                    </div>
                    <div style={{ fontSize: '13px', color: C.text }}>
                      {c.comment}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendComment()}
                placeholder="Escribe tu opinión..."
                maxLength={100}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${C.border}`,
                  background: 'rgba(255,255,255,0.06)',
                  color: C.text,
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button 
                onClick={sendComment}
                disabled={!newComment.trim()}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: newComment.trim() ? C.green : C.surface,
                  color: '#fff',
                  cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '700',
                  opacity: newComment.trim() ? 1 : 0.5
                }}
              >
                📤
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
