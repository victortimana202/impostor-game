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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Impostor Game Server is running', rooms: rooms.size });
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('✅ [Server] Usuario conectado:', socket.id);

  socket.on('create-room', ({ roomCode, hostName }) => {
    console.log('🎮 [Server] Creando sala...');
    console.log('🎮 [Server] RoomCode:', roomCode);
    console.log('🎮 [Server] HostName:', hostName);
    console.log('🎮 [Server] Socket ID:', socket.id);
    
    socket.join(roomCode);
    rooms.set(roomCode, {
      host: socket.id,
      players: [{ id: socket.id, name: hostName, ready: false }],
      gameState: null,
      config: null,
    });
    
    socket.emit('room-created', { roomCode });
    console.log('✅ [Server] Sala creada:', roomCode);
    console.log('📊 [Server] Total de salas activas:', rooms.size);
  });

  socket.on('join-room', ({ roomCode, playerName }) => {
    console.log('🚪 [Server] Intento de unión...');
    console.log('🚪 [Server] RoomCode:', roomCode);
    console.log('🚪 [Server] PlayerName:', playerName);
    console.log('🚪 [Server] Socket ID:', socket.id);
    
    let room = rooms.get(roomCode);
    
    if (!room) {
      console.error('❌ [Server] Sala no encontrada:', roomCode);
      console.log('📊 [Server] Salas disponibles:', Array.from(rooms.keys()));
      
      // Si la sala no existe, intentar recrearla con este jugador
      console.log('🔄 [Server] Intentando recrear sala para reconexión');
      room = {
        host: socket.id,
        players: [{ id: socket.id, name: playerName, ready: false }],
        gameState: null,
        config: null,
      };
      rooms.set(roomCode, room);
      socket.join(roomCode);
      socket.emit('room-created', { roomCode });
      console.log('✅ [Server] Sala recreada para reconexión:', roomCode);
      return;
    }
    
    console.log('✅ [Server] Sala encontrada');
    console.log('👥 [Server] Jugadores actuales:', room.players.length);
    
    // Verificar si el jugador ya existe (reconexión)
    const existingPlayer = room.players.find(p => p.name === playerName);
    if (existingPlayer) {
      console.log('🔄 [Server] Jugador reconectando, actualizando socket ID');
      existingPlayer.id = socket.id;
    } else {
      // Nuevo jugador
      room.players.push({ id: socket.id, name: playerName, ready: false });
    }
    
    socket.join(roomCode);
    
    io.to(roomCode).emit('player-joined', { 
      players: room.players,
      playerName 
    });
    
    console.log('✅ [Server] Jugador unido exitosamente');
    console.log('👥 [Server] Nuevos jugadores totales:', room.players.length);
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
    console.log('📤 [Server] Sincronizando estado Pictionary en sala:', roomCode);
    socket.to(roomCode).emit('pictionary-update', { gameState });
  });

  socket.on('pictionary-request-state', ({ roomCode }) => {
    console.log('📥 [Server] Solicitud de estado Pictionary de:', socket.id, 'en sala:', roomCode);
    // El cliente que solicita está pidiendo el estado actual
    // Emitir a todos en la sala para que el host responda
    socket.to(roomCode).emit('pictionary-state-requested', { requesterId: socket.id });
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
    console.log('⚠️ [Server] Usuario desconectado:', socket.id);
    
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const playerName = room.players[playerIndex].name;
        console.log('👋 [Server] Removiendo jugador:', playerName, 'de sala:', roomCode);
        room.players.splice(playerIndex, 1);
        
        if (room.players.length === 0) {
          rooms.delete(roomCode);
          console.log(`🗑️ [Server] Sala ${roomCode} eliminada (vacía)`);
          console.log('📊 [Server] Salas activas restantes:', rooms.size);
        } else {
          io.to(roomCode).emit('player-left', { 
            players: room.players,
            playerName 
          });
          
          if (socket.id === room.host && room.players.length > 0) {
            room.host = room.players[0].id;
            console.log(`👑 [Server] Nuevo host en sala ${roomCode}:`, room.players[0].name);
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
