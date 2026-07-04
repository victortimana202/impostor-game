import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('create-room', ({ roomCode, hostName }) => {
    socket.join(roomCode);
    rooms.set(roomCode, {
      host: socket.id,
      players: [{ id: socket.id, name: hostName, ready: false }],
      gameState: null,
      config: null,
    });
    socket.emit('room-created', { roomCode });
    console.log(`Sala ${roomCode} creada por ${hostName}`);
  });

  socket.on('join-room', ({ roomCode, playerName }) => {
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit('error', { message: 'Sala no encontrada' });
      return;
    }
    
    socket.join(roomCode);
    room.players.push({ id: socket.id, name: playerName, ready: false });
    
    io.to(roomCode).emit('player-joined', { 
      players: room.players,
      playerName 
    });
    console.log(`${playerName} se unió a la sala ${roomCode}`);
  });

  socket.on('player-ready', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (room) {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.ready = true;
        io.to(roomCode).emit('players-update', { players: room.players });
      }
    }
  });

  socket.on('start-game', ({ roomCode, config, word, playerRoles }) => {
    const room = rooms.get(roomCode);
    if (room && socket.id === room.host) {
      room.config = config;
      room.gameState = {
        word,
        playerRoles,
        phase: 'reveal',
        eliminated: [],
        votes: {},
      };
      io.to(roomCode).emit('game-started', { 
        word, 
        playerRoles, 
        config 
      });
      console.log(`Juego iniciado en sala ${roomCode}`);
    }
  });

  socket.on('sync-game-state', ({ roomCode, gameState }) => {
    const room = rooms.get(roomCode);
    if (room && socket.id === room.host) {
      room.gameState = gameState;
      console.log(`📤 Sincronizando estado en sala ${roomCode}:`, gameState.phase);
      // Usar io.to() en lugar de socket.to() para incluir al host también
      io.to(roomCode).emit('game-state-update', { gameState });
    }
  });

  socket.on('cast-vote', ({ roomCode, voter, target }) => {
    io.to(roomCode).emit('vote-cast', { voter, target });
  });

  socket.on('send-drawing', ({ roomCode, x, y, color, lineWidth, isDrawing, tool, opacity }) => {
    socket.to(roomCode).emit('drawing', { x, y, color, lineWidth, isDrawing, tool, opacity });
  });

  socket.on('clear-drawing', ({ roomCode }) => {
    io.to(roomCode).emit('drawing-cleared');
  });

  socket.on('send-drawing-comment', ({ roomCode, playerName, comment, timestamp }) => {
    io.to(roomCode).emit('drawing-comment', { playerName, comment, timestamp });
  });

  // WebRTC Voice Chat
  socket.on('join-voice-room', ({ roomCode, playerName }) => {
    socket.join(`voice-${roomCode}`);
    socket.to(`voice-${roomCode}`).emit('voice-user-joined', { userId: socket.id, playerName });
  });

  socket.on('leave-voice-room', ({ roomCode }) => {
    socket.to(`voice-${roomCode}`).emit('voice-user-disconnected', { userId: socket.id });
    socket.leave(`voice-${roomCode}`);
  });

  socket.on('voice-offer', ({ roomCode, targetUserId, offer }) => {
    io.to(targetUserId).emit('voice-offer', { from: socket.id, offer });
  });

  socket.on('voice-answer', ({ roomCode, targetUserId, answer }) => {
    io.to(targetUserId).emit('voice-answer', { from: socket.id, answer });
  });

  socket.on('voice-ice-candidate', ({ roomCode, targetUserId, candidate }) => {
    io.to(targetUserId).emit('voice-ice-candidate', { from: socket.id, candidate });
  });

  // Pictionary Game Events
  socket.on('pictionary-sync-state', ({ roomCode, gameState }) => {
    socket.to(roomCode).emit('pictionary-update', { gameState });
  });

  socket.on('pictionary-guess', ({ roomCode, playerName, guess, correct, timestamp }) => {
    io.to(roomCode).emit('pictionary-guess', { playerName, guess, correct, timestamp });
  });

  socket.on('pictionary-drawing', ({ roomCode, x, y, color, lineWidth, isDrawing, tool }) => {
    socket.to(roomCode).emit('pictionary-drawing', { x, y, color, lineWidth, isDrawing, tool });
  });

  socket.on('pictionary-clear-canvas', ({ roomCode }) => {
    io.to(roomCode).emit('pictionary-clear-canvas');
  });

  // Pictionary V2 Events (con turnos)
  socket.on('pictionary-v2-sync-state', ({ roomCode, gameState }) => {
    socket.to(roomCode).emit('pictionary-v2-update', { gameState });
  });

  socket.on('pictionary-v2-guess', ({ roomCode, playerName, guess, correct, points, timestamp }) => {
    io.to(roomCode).emit('pictionary-v2-guess', { playerName, guess, correct, points, timestamp });
  });

  socket.on('pictionary-v2-drawing', ({ roomCode, x, y, color, lineWidth, isDrawing, tool }) => {
    socket.to(roomCode).emit('pictionary-v2-drawing', { x, y, color, lineWidth, isDrawing, tool });
  });

  socket.on('pictionary-v2-clear-canvas', ({ roomCode }) => {
    io.to(roomCode).emit('pictionary-v2-clear-canvas');
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const playerName = room.players[playerIndex].name;
        room.players.splice(playerIndex, 1);
        
        if (room.players.length === 0) {
          rooms.delete(roomCode);
          console.log(`Sala ${roomCode} eliminada`);
        } else {
          io.to(roomCode).emit('player-left', { 
            players: room.players,
            playerName 
          });
          
          if (socket.id === room.host && room.players.length > 0) {
            room.host = room.players[0].id;
            io.to(roomCode).emit('new-host', { hostId: room.host });
          }
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎮 Servidor de juego corriendo en puerto ${PORT}`);
});
