# 🔍 Guía Completa de Debugging

## 📊 Logs Implementados

He agregado logs detallados en **todo el sistema** para facilitar el debugging.

---

## 🚀 Cómo Ver los Logs

### 1. Abrir Consola del Navegador
- **Chrome/Edge**: `F12` o `Ctrl+Shift+I`
- **Firefox**: `F12` o `Ctrl+Shift+K`
- Ir a pestaña **"Console"**

### 2. Ver Logs del Servidor
- Los logs aparecen en la **terminal** donde ejecutaste `npm run dev:full`

---

## 🏠 Logs del Lobby (Cliente)

### Inicialización:
```
🏠 [OnlineLobby] Inicializando lobby...
```

### Crear Sala - Exitoso:
```
🎮 [OnlineLobby] Creando sala...
🎮 [OnlineLobby] Nombre del host: Victor
✅ [OnlineLobby] Sala creada exitosamente
🔑 [OnlineLobby] Código de sala: ABC123
✅ [OnlineLobby] Estado actualizado - Host listo
```

### Crear Sala - Error:
```
⚠️ [OnlineLobby] Nombre vacío al crear sala
❌ [OnlineLobby] Error al crear sala: [mensaje]
```

### Unirse a Sala - Exitoso:
```
🚪 [OnlineLobby] Intentando unirse a sala...
🚪 [OnlineLobby] Código: ABC123
🚪 [OnlineLobby] Nombre: Manuel
⏳ [OnlineLobby] Esperando respuesta del servidor...
👋 [OnlineLobby] Jugador unido: Manuel
👥 [OnlineLobby] Jugadores totales: [Array]
```

### Unirse a Sala - Error:
```
⚠️ [OnlineLobby] Nombre vacío al unirse
⚠️ [OnlineLobby] Código vacío al unirse
❌ [OnlineLobby] Error recibido: Sala no encontrada
⏱️ [OnlineLobby] Timeout de conexión alcanzado
```

### Jugador Sale:
```
👋 [OnlineLobby] Jugador salió: Juan
👥 [OnlineLobby] Jugadores restantes: [Array]
```

---

## 🌐 Logs de Socket.IO (Cliente)

### Conexión:
```
🌐 [SocketService] Conectando a servidor...
🌐 [SocketService] URL: http://localhost:3001
✅ [SocketService] Conectado al servidor
🆔 [SocketService] Socket ID: abc123xyz
```

### Error de Conexión:
```
❌ [SocketService] Error de conexión: [error]
⚠️ [SocketService] Desconectado: transport close
```

### Crear Sala:
```
🎮 [SocketService] Creando sala...
🎮 [SocketService] RoomCode: ABC123
🎮 [SocketService] HostName: Victor
✅ [SocketService] Sala creada exitosamente
```

### Unirse a Sala:
```
🚪 [SocketService] Uniéndose a sala...
🚪 [SocketService] RoomCode: ABC123
🚪 [SocketService] PlayerName: Manuel
📤 [SocketService] Evento "join-room" enviado
```

---

## 🖥️ Logs del Servidor

### Usuario Conecta:
```
✅ [Server] Usuario conectado: abc123xyz
```

### Crear Sala:
```
🎮 [Server] Creando sala...
🎮 [Server] RoomCode: ABC123
🎮 [Server] HostName: Victor
🎮 [Server] Socket ID: abc123xyz
✅ [Server] Sala creada: ABC123
📊 [Server] Total de salas activas: 1
```

### Unirse a Sala - Exitoso:
```
🚪 [Server] Intento de unión...
🚪 [Server] RoomCode: ABC123
🚪 [Server] PlayerName: Manuel
🚪 [Server] Socket ID: def456uvw
✅ [Server] Sala encontrada
👥 [Server] Jugadores actuales: 1
✅ [Server] Jugador unido exitosamente
👥 [Server] Nuevos jugadores totales: 2
```

### Unirse a Sala - Error:
```
🚪 [Server] Intento de unión...
🚪 [Server] RoomCode: WRONG123
🚪 [Server] PlayerName: Pedro
❌ [Server] Sala no encontrada: WRONG123
📊 [Server] Salas disponibles: [ 'ABC123', 'XYZ789' ]
```

### Usuario Desconecta:
```
⚠️ [Server] Usuario desconectado: abc123xyz
👋 [Server] Removiendo jugador: Victor de sala: ABC123
🗑️ [Server] Sala ABC123 eliminada (vacía)
📊 [Server] Salas activas restantes: 0
```

### Cambio de Host:
```
👑 [Server] Nuevo host en sala ABC123: Manuel
```

---

## 🎤 Logs de Chat de Voz

### Inicio Exitoso:
```
🎤 [VoiceChat] Iniciando chat de voz...
🎤 [VoiceChat] RoomCode: ABC123
🎤 [VoiceChat] PlayerName: Victor
✅ [VoiceChat] Navegador soporta getUserMedia
🎤 [VoiceChat] Solicitando permiso de micrófono...
✅ [VoiceChat] Micrófono obtenido: [MediaStreamTrack]
🎤 [VoiceChat] Creando contexto de audio...
✅ [VoiceChat] Contexto de audio creado
🌐 [VoiceChat] Uniéndose a sala de voz...
✅ [VoiceChat] Chat de voz iniciado correctamente
```

### Errores de Micrófono:
```
❌ [VoiceChat] Error al acceder al micrófono: NotAllowedError
❌ [VoiceChat] Error name: NotAllowedError
❌ [VoiceChat] Error message: Permission denied
```

### Conexiones WebRTC:
```
🔗 [VoiceChat] Creando conexión peer con: def456uvw
➕ [VoiceChat] Agregando track local: audio
✅ [VoiceChat] Conexión peer creada con: def456uvw
🔌 [VoiceChat] Estado conexión con def456uvw: connecting
🧊 [VoiceChat] Estado ICE con def456uvw: checking
🔌 [VoiceChat] Estado conexión con def456uvw: connected
🧊 [VoiceChat] Estado ICE con def456uvw: connected
📥 [VoiceChat] Track remoto recibido de: def456uvw
✅ [VoiceChat] Audio reproduciendo de: def456uvw
```

---

## 🐛 Problemas Comunes y Qué Logs Buscar

### Problema 1: No puedo crear sala

#### Buscar en Consola:
```
❌ [SocketService] Error de conexión
❌ [SocketService] Timeout al crear sala
```

#### Verificar:
1. ¿Servidor corriendo? → Ver terminal
2. ¿URL correcta? → Debe ver `http://localhost:3001`
3. ¿Firewall bloqueando? → Desactivar temporalmente

#### Solución:
```bash
# En la terminal:
netstat -ano | findstr :3001

# Si está ocupado:
taskkill /PID [número] /F

# Reiniciar:
npm run dev:full
```

---

### Problema 2: No puedo unirme a sala

#### Buscar en Consola del Cliente:
```
🚪 [SocketService] Evento "join-room" enviado
⏱️ [OnlineLobby] Timeout de conexión alcanzado
```

#### Buscar en Servidor:
```
❌ [Server] Sala no encontrada: WRONG123
📊 [Server] Salas disponibles: [ 'ABC123' ]
```

#### Causas Posibles:
1. **Código incorrecto**
   - Verificar que coincide exactamente
   - Debe ser en MAYÚSCULAS (ABC123)

2. **Sala no existe**
   - El host no creó la sala correctamente
   - Verificar logs del servidor

3. **Conexión perdida**
   - El servidor se reinició
   - Las salas se borraron

#### Solución:
```bash
# Ver salas activas en logs del servidor
📊 [Server] Salas disponibles: [ ... ]

# Si está vacío, crear nueva sala
```

---

### Problema 3: Micrófono no funciona

#### Buscar en Consola:
```
❌ [VoiceChat] Error al acceder al micrófono
❌ [VoiceChat] Error name: NotAllowedError
```

#### Tipos de Errores:

**NotAllowedError** (Permisos):
```
❌ [VoiceChat] Error name: NotAllowedError
❌ [VoiceChat] Permiso de micrófono denegado
```
→ Solución: Click en 🔒 → Permitir micrófono → Recargar

**NotFoundError** (No hay micrófono):
```
❌ [VoiceChat] Error name: NotFoundError
```
→ Solución: Conectar micrófono físicamente

**NotReadableError** (En uso):
```
❌ [VoiceChat] Error name: NotReadableError
```
→ Solución: Cerrar Discord, Zoom, etc.

---

### Problema 4: WebRTC no conecta

#### Buscar en Consola:
```
🔌 [VoiceChat] Estado conexión: failed
🧊 [VoiceChat] Estado ICE: failed
```

#### Causas:
1. **Firewall bloqueando WebRTC**
2. **STUN servers no accesibles**
3. **Red restrictiva (corporativa)**

#### Solución:
```
1. Desactivar firewall temporalmente
2. Usar VPN
3. Cambiar a red móvil/WiFi diferente
```

---

## 📋 Checklist de Debugging

### Antes de Reportar un Bug:

#### Cliente (Consola del Navegador):
- [ ] ¿Abrí la consola con F12?
- [ ] ¿Veo logs con `[OnlineLobby]`?
- [ ] ¿Veo logs con `[SocketService]`?
- [ ] ¿Hay errores rojos (❌)?
- [ ] ¿Copié el error completo?

#### Servidor (Terminal):
- [ ] ¿El servidor está corriendo?
- [ ] ¿Veo logs con `[Server]`?
- [ ] ¿Veo la sala creada en los logs?
- [ ] ¿Hay errores en la terminal?

#### Chat de Voz:
- [ ] ¿Veo logs con `[VoiceChat]`?
- [ ] ¿Solicité permisos de micrófono?
- [ ] ¿El estado es "connected"?
- [ ] ¿Hay tracks remotos recibidos?

---

## 🧪 Secuencia Normal de Logs

### 1. Iniciar Aplicación
```
Cliente:
🏠 [OnlineLobby] Inicializando lobby...
🌐 [SocketService] Conectando a servidor...
🌐 [SocketService] URL: http://localhost:3001
✅ [SocketService] Conectado al servidor
🆔 [SocketService] Socket ID: abc123

Servidor:
✅ [Server] Usuario conectado: abc123
```

### 2. Crear Sala (Host)
```
Cliente:
🎮 [OnlineLobby] Creando sala...
🎮 [SocketService] RoomCode: ABC123
✅ [OnlineLobby] Sala creada exitosamente

Servidor:
🎮 [Server] Creando sala...
✅ [Server] Sala creada: ABC123
📊 [Server] Total de salas activas: 1
```

### 3. Unirse a Sala (Jugador 2)
```
Cliente 2:
🚪 [OnlineLobby] Intentando unirse...
🚪 [SocketService] RoomCode: ABC123
📤 [SocketService] Evento "join-room" enviado
👋 [OnlineLobby] Jugador unido: Manuel

Cliente 1 (Host):
👋 [OnlineLobby] Jugador unido: Manuel
👥 [OnlineLobby] Jugadores totales: 2

Servidor:
🚪 [Server] Intento de unión...
✅ [Server] Sala encontrada
✅ [Server] Jugador unido exitosamente
👥 [Server] Nuevos jugadores totales: 2
```

### 4. Activar Chat de Voz
```
Cliente:
🎤 [VoiceChat] Iniciando chat de voz...
✅ [VoiceChat] Micrófono obtenido
✅ [VoiceChat] Chat de voz iniciado
🔗 [VoiceChat] Creando conexión peer
✅ [VoiceChat] Conexión peer creada
📥 [VoiceChat] Track remoto recibido
✅ [VoiceChat] Audio reproduciendo
```

---

## 🎯 Comandos de Debugging Manual

### En la Consola del Navegador:

#### Ver estado del socket:
```javascript
// Pegar en consola:
console.log('Socket conectado:', socketService.socket?.connected);
console.log('Socket ID:', socketService.socket?.id);
console.log('Room actual:', socketService.roomCode);
```

#### Listar dispositivos de audio:
```javascript
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    devices.forEach(d => {
      if (d.kind === 'audioinput') {
        console.log('🎤 Micrófono:', d.label);
      }
    });
  });
```

#### Probar micrófono:
```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Micrófono funciona');
    stream.getTracks().forEach(t => t.stop());
  })
  .catch(err => console.error('❌ Error:', err.name, err.message));
```

---

## 📞 Información para Reportar Bugs

Si necesitas reportar un bug, incluye:

### 1. Logs del Cliente
```
Copiar de la consola (F12):
- Todos los logs con ❌
- Contexto (5-10 líneas antes del error)
```

### 2. Logs del Servidor
```
Copiar de la terminal:
- Últimas 20-30 líneas
- Especialmente logs con ❌
```

### 3. Información del Sistema
```
- Navegador: Chrome 120.0.6099.130
- Sistema: Windows 10
- Modo: Local / Producción
- URL: localhost:5173 / URL producción
```

### 4. Pasos para Reproducir
```
1. Abro la aplicación
2. Click en "Crear Sala"
3. Ingreso nombre "Victor"
4. Click en crear
5. → Error aparece aquí
```

---

## ✅ Verificación Final

Todo funciona correctamente si ves:

### Cliente:
```
✅ [SocketService] Conectado al servidor
✅ [OnlineLobby] Sala creada exitosamente
👥 [OnlineLobby] Jugadores totales: [correcto]
✅ [VoiceChat] Chat de voz iniciado correctamente
✅ [VoiceChat] Audio reproduciendo
```

### Servidor:
```
✅ [Server] Usuario conectado
✅ [Server] Sala creada
✅ [Server] Jugador unido exitosamente
📊 [Server] Total de salas activas: [número correcto]
```

---

**Última actualización**: 4 de Julio, 2026
**Versión**: 2.1.0
**Con logs completos y debugging mejorado** 🔍✨
