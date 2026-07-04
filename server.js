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
