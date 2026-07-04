import { useState, useEffect, useRef } from 'react';
import { C, btn } from '../styles/theme';

export default function VoiceChat({ roomCode, myPlayerName }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      // Crear contexto de audio para visualización
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('No se pudo acceder al micrófono. Verifica los permisos.');
      console.error('Error accediendo al micrófono:', err);
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  return (
    <div style={{
      padding: '14px',
      borderRadius: '12px',
      background: 'rgba(139,92,246,0.1)',
      border: `1px solid ${C.purpleBorder}`,
      marginBottom: '14px',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🎤</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: C.text }}>
            Chat de Voz
          </span>
        </div>
        {isRecording && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isMuted ? C.red : C.green,
              animation: isMuted ? 'none' : 'pulse 1.5s infinite',
            }} />
            <span style={{ 
              fontSize: '12px', 
              color: isMuted ? C.red : C.green,
              fontWeight: '700' 
            }}>
              {isMuted ? 'Silenciado' : 'En vivo'}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          padding: '8px 12px',
          borderRadius: '8px',
          background: C.redDim,
          border: `1px solid ${C.redBorder}`,
          color: '#fca5a5',
          fontSize: '12px',
          marginBottom: '12px',
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        fontSize: '12px', 
        color: C.muted, 
        marginBottom: '12px',
        lineHeight: 1.5 
      }}>
        {!isRecording 
          ? 'Activa tu micrófono para hablar con los demás jugadores durante la discusión.'
          : 'Tu micrófono está activo. Los demás pueden escucharte.'}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {!isRecording ? (
          <button 
            onClick={startRecording}
            style={btn('primary', { flex: 1, padding: '12px', fontSize: '14px' })}
          >
            🎙️ Activar Micrófono
          </button>
        ) : (
          <>
            <button 
              onClick={toggleMute}
              style={btn(isMuted ? 'danger' : 'ghost', { 
                flex: 1, 
                padding: '12px', 
                fontSize: '14px' 
              })}
            >
              {isMuted ? '🔇 Silenciado' : '🔊 Mutearse'}
            </button>
            <button 
              onClick={stopRecording}
              style={btn('danger', { flex: 1, padding: '12px', fontSize: '14px' })}
            >
              ⏹️ Desactivar
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
