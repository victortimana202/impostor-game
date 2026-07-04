import { useState, useEffect, useRef } from 'react';
import { C, btn } from '../styles/theme';
import socketService from '../services/socketService';

export default function VoiceChat({ roomCode, myPlayerName }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [error, setError] = useState(null);
  const [activeSpeakers, setActiveSpeakers] = useState(new Set());
  const [volume, setVolume] = useState(100);
  
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const remoteStreamsRef = useRef({});
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  useEffect(() => {
    // Escuchar eventos de WebRTC
    socketService.onVoiceOffer(handleReceiveOffer);
    socketService.onVoiceAnswer(handleReceiveAnswer);
    socketService.onVoiceIceCandidate(handleReceiveIceCandidate);
    socketService.onVoiceUserDisconnected(handleUserDisconnected);
    socketService.onVoiceUserJoined(handleUserJoined);

    return () => {
      stopVoiceChat();
      socketService.offVoice();
    };
  }, []);

  const startVoiceChat = async () => {
    try {
      console.log('🎤 [VoiceChat] Iniciando chat de voz...');
      console.log('🎤 [VoiceChat] RoomCode:', roomCode);
      console.log('🎤 [VoiceChat] PlayerName:', myPlayerName);
      
      // Verificar soporte del navegador
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = 'Tu navegador no soporta acceso al micrófono';
        console.error('❌ [VoiceChat]', errorMsg);
        setError(errorMsg);
        return;
      }
      
      console.log('✅ [VoiceChat] Navegador soporta getUserMedia');
      
      // Obtener stream de audio local
      console.log('🎤 [VoiceChat] Solicitando permiso de micrófono...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      console.log('✅ [VoiceChat] Micrófono obtenido:', stream.getTracks());
      localStreamRef.current = stream;

      // Crear contexto de audio para análisis
      console.log('🎤 [VoiceChat] Creando contexto de audio...');
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      console.log('✅ [VoiceChat] Contexto de audio creado');

      // Monitorear actividad de voz local
      detectVoiceActivity();

      setIsConnected(true);
      setError(null);

      // Notificar al servidor que estamos listos para voz
      console.log('🌐 [VoiceChat] Uniéndose a sala de voz...');
      socketService.joinVoiceRoom(roomCode, myPlayerName);
      console.log('✅ [VoiceChat] Chat de voz iniciado correctamente');

    } catch (err) {
      console.error('❌ [VoiceChat] Error al acceder al micrófono:', err);
      console.error('❌ [VoiceChat] Error name:', err.name);
      console.error('❌ [VoiceChat] Error message:', err.message);
      
      let errorMsg = 'Error desconocido';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Permiso de micrófono denegado. Por favor, permite el acceso en tu navegador.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No se encontró ningún micrófono. Verifica que tu dispositivo tenga un micrófono conectado.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'No se puede acceder al micrófono. Puede estar siendo usado por otra aplicación.';
      } else if (err.name === 'OverconstrainedError') {
        errorMsg = 'Tu micrófono no cumple con los requisitos de audio.';
      } else {
        errorMsg = `Error: ${err.message}`;
      }
      
      setError(errorMsg);
    }
  };

  const stopVoiceChat = () => {
    console.log('⏹️ [VoiceChat] Deteniendo chat de voz...');
    
    // Detener stream local
    if (localStreamRef.current) {
      console.log('🎤 [VoiceChat] Deteniendo stream local');
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('✅ [VoiceChat] Track detenido:', track.kind);
      });
      localStreamRef.current = null;
    }

    // Cerrar todas las conexiones peer
    const peerCount = Object.keys(peerConnectionsRef.current).length;
    console.log(`🔗 [VoiceChat] Cerrando ${peerCount} conexiones peer`);
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};

    // Detener streams remotos
    const remoteCount = Object.keys(remoteStreamsRef.current).length;
    console.log(`🔊 [VoiceChat] Deteniendo ${remoteCount} streams remotos`);
    Object.values(remoteStreamsRef.current).forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    remoteStreamsRef.current = {};

    // Cerrar audio context
    if (audioContextRef.current) {
      console.log('🎵 [VoiceChat] Cerrando audio context');
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsConnected(false);
    setActiveSpeakers(new Set());

    // Notificar al servidor
    console.log('🌐 [VoiceChat] Saliendo de sala de voz');
    socketService.leaveVoiceRoom(roomCode);
    console.log('✅ [VoiceChat] Chat de voz detenido');
  };

  const createPeerConnection = (targetUserId) => {
    console.log('🔗 [VoiceChat] Creando conexión peer con:', targetUserId);
    const pc = new RTCPeerConnection(iceServers);

    // Agregar track local
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log('➕ [VoiceChat] Agregando track local:', track.kind);
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Manejar ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 [VoiceChat] ICE candidate para:', targetUserId);
        socketService.sendVoiceIceCandidate(roomCode, targetUserId, event.candidate);
      }
    };

    // Manejar conexión
    pc.onconnectionstatechange = () => {
      console.log(`🔌 [VoiceChat] Estado conexión con ${targetUserId}:`, pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`🧊 [VoiceChat] Estado ICE con ${targetUserId}:`, pc.iceConnectionState);
    };

    // Manejar stream remoto
    pc.ontrack = (event) => {
      console.log('📥 [VoiceChat] Track remoto recibido de:', targetUserId);
      const remoteStream = event.streams[0];
      remoteStreamsRef.current[targetUserId] = remoteStream;
      
      // Crear elemento de audio para reproducir
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.volume = volume / 100;
      if (!isDeafened) {
        audio.play()
          .then(() => console.log('✅ [VoiceChat] Audio reproduciendo de:', targetUserId))
          .catch(e => console.error('❌ [VoiceChat] Error al reproducir audio:', e));
      }
    };

    peerConnectionsRef.current[targetUserId] = pc;
    console.log('✅ [VoiceChat] Conexión peer creada con:', targetUserId);
    return pc;
  };

  const handleUserJoined = async ({ userId, playerName }) => {
    console.log('👋 [VoiceChat] Nuevo usuario unido:', userId, playerName);
    
    // Solo el usuario que ya estaba crea la oferta
    if (!localStreamRef.current) {
      console.warn('⚠️ [VoiceChat] No hay stream local todavía');
      return;
    }
    
    try {
      console.log('📤 [VoiceChat] Creando oferta para:', userId);
      const pc = createPeerConnection(userId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socketService.sendVoiceOffer(roomCode, userId, offer);
      console.log('✅ [VoiceChat] Oferta enviada a:', userId);
    } catch (err) {
      console.error('❌ [VoiceChat] Error al crear oferta:', err);
    }
  };

  const handleReceiveOffer = async ({ from, offer }) => {
    console.log('📨 [VoiceChat] Recibiendo offer de:', from);
    try {
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('✅ [VoiceChat] Remote description establecida');
      
      const answer = await pc.createAnswer();
      console.log('✅ [VoiceChat] Answer creada');
      
      await pc.setLocalDescription(answer);
      console.log('✅ [VoiceChat] Local description establecida');
      
      socketService.sendVoiceAnswer(roomCode, from, answer);
      console.log('📤 [VoiceChat] Answer enviada a:', from);
    } catch (err) {
      console.error('❌ [VoiceChat] Error en handleReceiveOffer:', err);
    }
  };

  const handleReceiveAnswer = async ({ from, answer }) => {
    console.log('📨 [VoiceChat] Recibiendo answer de:', from);
    try {
      const pc = peerConnectionsRef.current[from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('✅ [VoiceChat] Answer procesada de:', from);
      } else {
        console.warn('⚠️ [VoiceChat] No hay peer connection para:', from);
      }
    } catch (err) {
      console.error('❌ [VoiceChat] Error en handleReceiveAnswer:', err);
    }
  };

  const handleReceiveIceCandidate = async ({ from, candidate }) => {
    console.log('🧊 [VoiceChat] Recibiendo ICE candidate de:', from);
    try {
      const pc = peerConnectionsRef.current[from];
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('✅ [VoiceChat] ICE candidate agregado de:', from);
      } else {
        console.warn('⚠️ [VoiceChat] No hay peer connection para:', from);
      }
    } catch (err) {
      console.error('❌ [VoiceChat] Error en handleReceiveIceCandidate:', err);
    }
  };

  const handleUserDisconnected = ({ userId }) => {
    console.log('👋 [VoiceChat] Usuario desconectado:', userId);
    
    const pc = peerConnectionsRef.current[userId];
    if (pc) {
      pc.close();
      delete peerConnectionsRef.current[userId];
      console.log('✅ [VoiceChat] Peer connection cerrada');
    }
    
    const stream = remoteStreamsRef.current[userId];
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      delete remoteStreamsRef.current[userId];
      console.log('✅ [VoiceChat] Stream remoto detenido');
    }

    setActiveSpeakers(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  };

  const detectVoiceActivity = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const check = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      if (average > 30 && !isMuted) {
        setActiveSpeakers(prev => new Set(prev).add(myPlayerName));
      } else {
        setActiveSpeakers(prev => {
          const next = new Set(prev);
          next.delete(myPlayerName);
          return next;
        });
      }

      animationFrameRef.current = requestAnimationFrame(check);
    };

    check();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const newMuted = !isMuted;
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        console.log(`🔇 [VoiceChat] Track ${track.kind} ${newMuted ? 'muteado' : 'desmuteado'}`);
      });
      setIsMuted(newMuted);
      console.log(`🔇 [VoiceChat] Micrófono ${newMuted ? 'MUTEADO' : 'ACTIVO'}`);
    }
  };

  const toggleDeafen = () => {
    const newDeafened = !isDeafened;
    setIsDeafened(newDeafened);
    console.log(`🔇 [VoiceChat] Deafen ${newDeafened ? 'ACTIVADO' : 'DESACTIVADO'}`);
    
    // Silenciar todos los audios remotos
    Object.values(remoteStreamsRef.current).forEach(stream => {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        if (audio.srcObject === stream) {
          audio.volume = newDeafened ? 0 : (volume / 100);
          console.log(`🔊 [VoiceChat] Volumen audio remoto: ${audio.volume}`);
        }
      });
    });
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    console.log(`🔊 [VoiceChat] Volumen cambiado a: ${newVolume}%`);
    
    // Actualizar volumen de todos los audios
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      if (!isDeafened) {
        audio.volume = newVolume / 100;
      }
    });
  };

  return (
    <div style={{
      padding: '16px',
      borderRadius: '14px',
      background: 'rgba(139,92,246,0.08)',
      border: `1px solid ${C.purpleBorder}`,
      marginBottom: '14px',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>
            {isConnected ? (isMuted ? '🔇' : '🎤') : '🎙️'}
          </span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: C.text }}>
            Chat de Voz en Vivo
          </span>
        </div>
        {isConnected && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: isMuted ? C.red : C.green,
              animation: isMuted ? 'none' : 'pulse 1.5s infinite',
              boxShadow: isMuted ? 'none' : `0 0 10px ${C.green}`
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
          padding: '10px 14px',
          borderRadius: '10px',
          background: C.redDim,
          border: `1px solid ${C.redBorder}`,
          color: '#fca5a5',
          fontSize: '13px',
          marginBottom: '14px',
          lineHeight: 1.5
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ 
        fontSize: '12px', 
        color: C.muted, 
        marginBottom: '14px',
        lineHeight: 1.6,
        padding: '10px 12px',
        background: 'rgba(139,92,246,0.1)',
        borderRadius: '8px',
        border: `1px solid rgba(139,92,246,0.2)`
      }}>
        {!isConnected 
          ? '🎧 <strong>Activa el chat de voz</strong> para hablar en tiempo real con los demás jugadores. Usa auriculares para mejor calidad.'
          : '✅ <strong>Conectado.</strong> Los demás pueden escucharte. Controla tu micrófono y volumen abajo.'}
      </div>

      {!isConnected ? (
        <button 
          onClick={startVoiceChat}
          style={btn('primary', { 
            width: '100%', 
            padding: '14px', 
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          })}
        >
          🎙️ Activar Chat de Voz
        </button>
      ) : (
        <>
          {/* Controles */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button 
              onClick={toggleMute}
              style={btn(isMuted ? 'danger' : 'ghost', { 
                flex: 1, 
                padding: '12px', 
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              })}
            >
              {isMuted ? '🔇 Muteado' : '🔊 Mutear'}
            </button>
            <button 
              onClick={toggleDeafen}
              style={btn(isDeafened ? 'danger' : 'ghost', { 
                flex: 1, 
                padding: '12px', 
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              })}
            >
              {isDeafened ? '🔇 Deafen' : '🔊 Deafen'}
            </button>
          </div>

          {/* Control de volumen */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '12px',
              color: C.muted,
              fontWeight: '600'
            }}>
              <span>🔊 Volumen de otros</span>
              <span style={{ fontWeight: '700', color: C.text, fontSize: '14px' }}>{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
              disabled={isDeafened}
              style={{ 
                width: '100%', 
                accentColor: C.purple,
                height: '6px',
                opacity: isDeafened ? 0.5 : 1
              }}
            />
          </div>

          <button 
            onClick={stopVoiceChat}
            style={btn('danger', { 
              width: '100%', 
              padding: '12px', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            })}
          >
            ⏹️ Desconectar
          </button>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}
