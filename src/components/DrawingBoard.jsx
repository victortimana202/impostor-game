import { useRef, useState, useEffect } from 'react';
import { C, btn } from '../styles/theme';
import socketService from '../services/socketService';

export default function DrawingBoard({ roomCode, myPlayerName, gameMode }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [isExpanded, setIsExpanded] = useState(false);

  const colors = ['#ffffff', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#000000'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameMode === 'online') {
      socketService.onDrawing(({ x, y, color, lineWidth, isDrawing }) => {
        if (isDrawing) {
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.lineTo(x, y);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(x, y);
        }
      });

      socketService.onDrawingCleared(() => {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
    }

    return () => {
      if (gameMode === 'online') {
        socketService.offDrawing();
      }
    };
  }, [gameMode]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    setIsDrawing(true);

    if (gameMode === 'online') {
      socketService.sendDrawing(roomCode, x, y, color, lineWidth, false);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();

    if (gameMode === 'online') {
      socketService.sendDrawing(roomCode, x, y, color, lineWidth, true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
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

  return (
    <div style={{
      padding: '14px',
      borderRadius: '12px',
      background: 'rgba(34,197,94,0.1)',
      border: `1px solid ${C.greenBorder}`,
      marginBottom: '14px',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: isExpanded ? '12px' : '0',
        cursor: 'pointer',
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🎨</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: C.text }}>
            Pizarra de Dibujo
          </span>
        </div>
        <span style={{ fontSize: '18px', color: C.muted }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {isExpanded && (
        <>
          <div style={{ 
            fontSize: '12px', 
            color: C.muted, 
            marginBottom: '12px',
            lineHeight: 1.5 
          }}>
            Dibuja algo para ayudar a explicar tu palabra (sin escribir texto).
          </div>

          <div style={{
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '12px',
            border: `2px solid ${C.border}`,
            touchAction: 'none',
          }}>
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
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
                cursor: 'crosshair',
              }}
            />
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '6px', 
            marginBottom: '12px',
            flexWrap: 'wrap'
          }}>
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: c,
                  border: color === c ? `3px solid ${C.purple}` : `1px solid ${C.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '6px',
              fontSize: '12px',
              color: C.muted
            }}>
              <span>Grosor del trazo</span>
              <span style={{ fontWeight: '700', color: C.text }}>{lineWidth}px</span>
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

          <button 
            onClick={clearCanvas}
            style={btn('danger', { width: '100%', padding: '10px', fontSize: '13px' })}
          >
            🗑️ Limpiar pizarra
          </button>
        </>
      )}
    </div>
  );
}
