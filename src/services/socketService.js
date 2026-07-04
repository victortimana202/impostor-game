import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.roomCode = null;
    this.lastPlayerName = null; // Guardar para reconexión
  }

  connect() {
    if (!this.socket) {
      console.log('🌐 [SocketService] Conectando a servidor...');
      console.log('🌐 [SocketService] URL:', SOCKET_URL);
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'], // Intentar websocket primero
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      
      this.socket.on('connect', () => {
        console.log('✅ [SocketService] Conectado al servidor');
        console.log('🆔 [SocketService] Socket ID:', this.socket.id);
        
        // Si estábamos en una sala, volver a unirse
        if (this.roomCode && this.lastPlayerName) {
          console.log('🔄 [SocketService] Reconectando a sala:', this.roomCode);
          this.socket.emit('join-room', { 
            roomCode: this.roomCode, 
            playerName: this.lastPlayerName 
          });
        }
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('❌ [SocketService] Error de conexión:', error);
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log('⚠️ [SocketService] Desconectado:', reason);
      });
      
      return new Promise((resolve) => {
        this.socket.once('connect', resolve);
      });
    } else {
      console.log('ℹ️ [SocketService] Ya conectado');
      return Promise.resolve();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.roomCode = null;
    }
  }

  createRoom(hostName) {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.roomCode = roomCode;
    this.lastPlayerName = hostName; // Guardar para reconexión
    
    console.log('🎮 [SocketService] Creando sala...');
    console.log('🎮 [SocketService] RoomCode:', roomCode);
    console.log('🎮 [SocketService] HostName:', hostName);
    
    this.socket.emit('create-room', { roomCode, hostName });
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('❌ [SocketService] Timeout al crear sala (servidor puede estar dormido)');
        reject(new Error('Timeout al crear sala. El servidor puede estar despertando, intenta de nuevo en 10 segundos.'));
      }, 30000); // Aumentado a 30 segundos para dar tiempo al servidor a despertar
      
      this.socket.once('room-created', () => {
        clearTimeout(timeout);
        console.log('✅ [SocketService] Sala creada exitosamente');
        resolve(roomCode);
      });
    });
  }

  joinRoom(roomCode, playerName) {
    this.roomCode = roomCode;
    this.lastPlayerName = playerName; // Guardar para reconexión
    console.log('🚪 [SocketService] Uniéndose a sala...');
    console.log('🚪 [SocketService] RoomCode:', roomCode);
    console.log('🚪 [SocketService] PlayerName:', playerName);
    
    this.socket.emit('join-room', { roomCode, playerName });
    console.log('📤 [SocketService] Evento "join-room" enviado');
  }

  onPlayerJoined(callback) {
    this.socket.on('player-joined', callback);
  }

  onPlayerLeft(callback) {
    this.socket.on('player-left', callback);
  }

  onPlayersUpdate(callback) {
    this.socket.on('players-update', callback);
  }

  onGameStarted(callback) {
    this.socket.on('game-started', callback);
  }

  onGameStateUpdate(callback) {
    this.socket.on('game-state-update', callback);
  }

  onVoteCast(callback) {
    this.socket.on('vote-cast', callback);
  }

  onError(callback) {
    this.socket.on('error', callback);
  }

  setPlayerReady() {
    this.socket.emit('player-ready', { roomCode: this.roomCode });
  }

  startGame(config, word, playerRoles) {
    this.socket.emit('start-game', { 
      roomCode: this.roomCode, 
      config, 
      word, 
      playerRoles 
    });
  }

  syncGameState(gameState) {
    this.socket.emit('sync-game-state', { 
      roomCode: this.roomCode, 
      gameState 
    });
  }

  castVote(voter, target) {
    this.socket.emit('cast-vote', { 
      roomCode: this.roomCode, 
      voter, 
      target 
    });
  }

  sendDrawing(roomCode, x, y, color, lineWidth, isDrawing, tool, opacity) {
    this.socket.emit('send-drawing', {
      roomCode,
      x,
      y,
      color,
      lineWidth,
      isDrawing,
      tool,
      opacity
    });
  }

  clearDrawing(roomCode) {
    this.socket.emit('clear-drawing', { roomCode });
  }

  sendDrawingComment(roomCode, comment) {
    this.socket.emit('send-drawing-comment', { roomCode, ...comment });
  }

  onDrawing(callback) {
    this.socket.on('drawing', callback);
  }

  onDrawingCleared(callback) {
    this.socket.on('drawing-cleared', callback);
  }

  onDrawingComment(callback) {
    this.socket.on('drawing-comment', callback);
  }

  offDrawing() {
    if (this.socket) {
      this.socket.off('drawing');
      this.socket.off('drawing-cleared');
      this.socket.off('drawing-comment');
    }
  }

  // Métodos de voz WebRTC
  joinVoiceRoom(roomCode, playerName) {
    this.socket.emit('join-voice-room', { roomCode, playerName });
  }

  leaveVoiceRoom(roomCode) {
    this.socket.emit('leave-voice-room', { roomCode });
  }

  sendVoiceOffer(roomCode, targetUserId, offer) {
    this.socket.emit('voice-offer', { roomCode, targetUserId, offer });
  }

  sendVoiceAnswer(roomCode, targetUserId, answer) {
    this.socket.emit('voice-answer', { roomCode, targetUserId, answer });
  }

  sendVoiceIceCandidate(roomCode, targetUserId, candidate) {
    this.socket.emit('voice-ice-candidate', { roomCode, targetUserId, candidate });
  }

  onVoiceOffer(callback) {
    this.socket.on('voice-offer', callback);
  }

  onVoiceAnswer(callback) {
    this.socket.on('voice-answer', callback);
  }

  onVoiceIceCandidate(callback) {
    this.socket.on('voice-ice-candidate', callback);
  }

  onVoiceUserJoined(callback) {
    this.socket.on('voice-user-joined', callback);
  }

  onVoiceUserDisconnected(callback) {
    this.socket.on('voice-user-disconnected', callback);
  }

  offVoice() {
    if (this.socket) {
      this.socket.off('voice-offer');
      this.socket.off('voice-answer');
      this.socket.off('voice-ice-candidate');
      this.socket.off('voice-user-joined');
      this.socket.off('voice-user-disconnected');
    }
  }

  // Métodos de Pictionary
  syncPictionaryState(roomCode, gameState) {
    console.log('📤 [SocketService] Sincronizando estado Pictionary:', gameState);
    this.socket.emit('pictionary-sync-state', { roomCode, gameState });
  }

  requestPictionaryState(roomCode) {
    console.log('📥 [SocketService] Solicitando estado actual de Pictionary');
    this.socket.emit('pictionary-request-state', { roomCode });
  }

  sendPictionaryGuess(roomCode, guessData) {
    this.socket.emit('pictionary-guess', { roomCode, ...guessData });
  }

  sendPictionaryDrawing(roomCode, x, y, color, lineWidth, isDrawing, tool) {
    this.socket.emit('pictionary-drawing', { roomCode, x, y, color, lineWidth, isDrawing, tool });
  }

  clearPictionaryCanvas(roomCode) {
    this.socket.emit('pictionary-clear-canvas', { roomCode });
  }

  onPictionaryUpdate(callback) {
    this.socket.on('pictionary-update', callback);
  }

  onPictionaryGuess(callback) {
    this.socket.on('pictionary-guess', callback);
  }

  onPictionaryDrawing(callback) {
    this.socket.on('pictionary-drawing', callback);
  }

  onPictionaryClear(callback) {
    this.socket.on('pictionary-clear-canvas', callback);
  }

  onPictionaryStateRequested(callback) {
    this.socket.on('pictionary-state-requested', callback);
  }

  offPictionary() {
    if (this.socket) {
      this.socket.off('pictionary-update');
      this.socket.off('pictionary-guess');
      this.socket.off('pictionary-drawing');
      this.socket.off('pictionary-clear-canvas');
      this.socket.off('pictionary-state-requested');
    }
  }

  // Métodos de Pictionary V2 (con turnos)
  syncPictionaryV2State(roomCode, gameState) {
    this.socket.emit('pictionary-v2-sync-state', { roomCode, gameState });
  }

  sendPictionaryV2Guess(roomCode, guessData) {
    this.socket.emit('pictionary-v2-guess', { roomCode, ...guessData });
  }

  sendPictionaryV2Drawing(roomCode, x, y, color, lineWidth, isDrawing, tool) {
    this.socket.emit('pictionary-v2-drawing', { roomCode, x, y, color, lineWidth, isDrawing, tool });
  }

  clearPictionaryV2Canvas(roomCode) {
    this.socket.emit('pictionary-v2-clear-canvas', { roomCode });
  }

  onPictionaryV2Update(callback) {
    this.socket.on('pictionary-v2-update', callback);
  }

  onPictionaryV2Guess(callback) {
    this.socket.on('pictionary-v2-guess', callback);
  }

  onPictionaryV2Drawing(callback) {
    this.socket.on('pictionary-v2-drawing', callback);
  }

  onPictionaryV2Clear(callback) {
    this.socket.on('pictionary-v2-clear-canvas', callback);
  }

  offPictionaryV2() {
    if (this.socket) {
      this.socket.off('pictionary-v2-update');
      this.socket.off('pictionary-v2-guess');
      this.socket.off('pictionary-v2-drawing');
      this.socket.off('pictionary-v2-clear-canvas');
    }
  }

  offLobby() {
    if (this.socket) {
      this.socket.off('player-joined');
      this.socket.off('player-left');
      this.socket.off('players-update');
    }
  }

  offGame() {
    if (this.socket) {
      this.socket.off('game-started');
      this.socket.off('game-state-update');
      this.socket.off('vote-cast');
    }
  }

  offAll() {
    if (this.socket) {
      this.offLobby();
      this.offGame();
      this.socket.off('error');
    }
  }
}

export default new SocketService();
