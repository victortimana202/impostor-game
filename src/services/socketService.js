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

  sendDrawing(roomCode, x, y, color, lineWidth, isDrawing) {
    this.socket.emit('send-drawing', {
      roomCode,
      x,
      y,
      color,
      lineWidth,
      isDrawing
    });
  }

  clearDrawing(roomCode) {
    this.socket.emit('clear-drawing', { roomCode });
  }

  onDrawing(callback) {
    this.socket.on('drawing', callback);
  }

  onDrawingCleared(callback) {
    this.socket.on('drawing-cleared', callback);
  }

  offDrawing() {
    if (this.socket) {
      this.socket.off('drawing');
      this.socket.off('drawing-cleared');
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
