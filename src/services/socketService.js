import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.roomCode = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
      return new Promise((resolve) => {
        this.socket.on('connect', () => {
          console.log('Conectado al servidor');
          resolve();
        });
      });
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
    this.socket.emit('create-room', { roomCode, hostName });
    return new Promise((resolve) => {
      this.socket.once('room-created', () => {
        resolve(roomCode);
      });
    });
  }

  joinRoom(roomCode, playerName) {
    this.roomCode = roomCode;
    this.socket.emit('join-room', { roomCode, playerName });
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

  onVoiceUserDisconnected(callback) {
    this.socket.on('voice-user-disconnected', callback);
  }

  offVoice() {
    if (this.socket) {
      this.socket.off('voice-offer');
      this.socket.off('voice-answer');
      this.socket.off('voice-ice-candidate');
      this.socket.off('voice-user-disconnected');
    }
  }

  // Métodos de Pictionary
  syncPictionaryState(roomCode, gameState) {
    this.socket.emit('pictionary-sync-state', { roomCode, gameState });
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

  offPictionary() {
    if (this.socket) {
      this.socket.off('pictionary-update');
      this.socket.off('pictionary-guess');
      this.socket.off('pictionary-drawing');
      this.socket.off('pictionary-clear-canvas');
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
