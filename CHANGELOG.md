# 📝 Changelog

Todos los cambios notables del proyecto serán documentados aquí.

---

## [2.0.0] - 2026-07-04

### 🎨 Nuevo - Modo Pictionary
- **Modo de juego completamente nuevo**: "Dibuja y Adivina"
- Todos los jugadores dibujan simultáneamente en sus dispositivos
- Todos ven los dibujos de todos en tiempo real
- Sistema de adivinanzas: primer en acertar gana
- 5 rondas de 40 segundos cada una
- Puntuación basada en velocidad: `max(100, tiempoRestante * 10)`
- Canvas profesional con 18 colores
- Herramientas: lápiz, borrador, limpiar
- Grosor de trazo ajustable (1-20px)
- Sincronización perfecta vía Socket.IO

#### Archivos Nuevos
- `src/components/PictionaryGame.jsx` - Componente principal del juego

#### Eventos Socket.IO Nuevos
- `pictionary-sync-state` - Sincroniza estado del juego
- `pictionary-guess` - Procesa respuestas
- `pictionary-drawing` - Transmite dibujos en tiempo real
- `pictionary-clear-canvas` - Sincroniza limpieza de canvas

### 🎤 Nuevo - Chat de Voz WebRTC
- Chat de voz en tiempo real usando WebRTC
- Conexiones peer-to-peer entre jugadores
- Señalización vía Socket.IO
- Controles: Mute, Deafen
- Control de volumen por jugador
- Indicador de actividad de voz
- Funciona en modo online durante discusiones

#### Archivos Nuevos
- `src/components/VoiceChat.jsx` - Componente de chat de voz

#### Eventos Socket.IO Nuevos
- `join-voice-room` / `leave-voice-room`
- `voice-offer` / `voice-answer`
- `voice-ice-candidate`
- `voice-user-disconnected`

### ✏️ Mejorado - Pizarra de Dibujo
- **Actualizada a versión profesional**
- 32 colores disponibles (básicos, primarios, pastel)
- Herramientas: lápiz, borrador, limpiar
- Control de opacidad (10-100%)
- Control de grosor (1-30px)
- Canvas 600x400px
- Sistema de comentarios sobre dibujos
- Descarga como PNG
- Sincronización en tiempo real mejorada

#### Archivos Modificados
- `src/components/DrawingBoard.jsx` - Versión profesional

#### Eventos Socket.IO Nuevos
- `send-drawing-comment` / `drawing-comment`

### 🐛 Corregido
- **Bug "Nueva Ronda"**: Ahora funciona correctamente en modo online
  - Reutiliza los jugadores actuales de la sala
  - Sincroniza correctamente el nuevo estado
  - No requiere reiniciar la sala

### 🔧 Actualizado
- `src/services/socketService.js` - Métodos para Pictionary y limpieza de canvas
- `server.js` - Eventos del servidor para todas las nuevas funcionalidades
- `src/components/ImpostorGame.jsx` - Integración del modo Pictionary
- `src/components/OnlineLobby.jsx` - Selector de tipo de juego
- `README.md` - Documentación actualizada con nuevos modos

### 📚 Documentación Nueva
- `MODO_PICTIONARY.md` - Documentación completa del modo
- `PRUEBA_PICTIONARY.md` - Guía de pruebas
- `RESUMEN_FINAL.md` - Resumen ejecutivo
- `INSTRUCCIONES_DEPLOY.md` - Guía de re-deploy
- `CHANGELOG.md` - Este archivo

### 📦 Dependencias
- No se agregaron nuevas dependencias
- Todas las funcionalidades usan las librerías existentes

---

## [1.0.0] - 2026-07-03

### 🎉 Lanzamiento Inicial
- Modo de juego Impostor completo
- Juego local (mismo dispositivo)
- Juego online (múltiples dispositivos)
- Generación de palabras con IA (Groq API)
- Sistema de votación
- Revelación de roles
- Temporizador de discusión
- Configuración personalizable:
  - Número de jugadores (2-12)
  - Número de impostores
  - Tiempo de discusión (30s - 3min)
  - Dificultad (fácil, mixto, difícil)
  - Pista para impostor (sí/no)

### 🌐 Despliegue
- Frontend desplegado en Netlify
- Backend desplegado en Render
- Variables de entorno configuradas
- HTTPS habilitado automáticamente

### 📁 Estructura Inicial
- React + Vite para frontend
- Express + Socket.IO para backend
- Integración con Groq API (Llama 3.1)
- CSS-in-JS para estilos

### 📚 Documentación Inicial
- `README.md` - Guía principal
- `DEPLOYMENT.md` - Guía de despliegue
- `.env.example` - Ejemplo de variables

---

## Tipos de Cambios

- **Nuevo**: Nueva funcionalidad
- **Mejorado**: Mejora de funcionalidad existente
- **Corregido**: Corrección de bugs
- **Actualizado**: Actualización de código existente
- **Eliminado**: Funcionalidad removida
- **Seguridad**: Mejoras de seguridad
- **Documentación**: Cambios en documentación

---

## Links

- [Código fuente](https://github.com/victortimana202/impostor-game)
- [Frontend en vivo](https://dulcet-starship-db38fc.netlify.app)
- [Backend](https://impostor-game-server-1ih5.onrender.com)

---

**Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)**
