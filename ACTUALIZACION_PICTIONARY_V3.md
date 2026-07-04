# Actualización Pictionary V3 - Dibujo Simultáneo con Palabras Colombianas

## 🎯 Cambios Realizados

### 1. **Sistema de Palabras Individuales**
- ✅ Cada jugador recibe su PROPIA palabra diferente
- ✅ Todos dibujan SIMULTÁNEAMENTE en el mismo canvas
- ✅ Integración completa con `colombianWords.js` (90+ palabras colombianas)
- ✅ Selector de categorías al inicio:
  - 🎲 Todas las categorías
  - 🐆 Animales de Colombia (15 palabras)
  - 🍊 Frutas de Colombia (15 palabras)
  - 🎬 Películas/Series (15 palabras)
  - 🇨🇴 Cultura General (35+ palabras)
  - 🗺️ Lugares de Colombia (10 palabras)

### 2. **Fases del Juego**
1. **Category Select**: Host selecciona categoría
2. **Drawing** (60 segundos): Todos dibujan su palabra simultáneamente
   - Cada jugador ve su propia palabra en la parte superior
   - Todos pueden ver el mismo canvas en tiempo real
   - Pueden adivinar las palabras de otros durante el dibujo
3. **Discussion**: Se revelan todas las palabras
   - Los jugadores pueden identificar quién dibujó qué
   - Host termina la ronda cuando estén listos
4. **Results**: Muestra puntuaciones de la ronda
5. **Gameover**: Resultados finales después de 5 rondas

### 3. **Sistema de Puntuación**
- Puntos por adivinar la palabra de otro jugador
- Puntos = max(100, tiempoRestante * 5)
- Se pueden adivinar múltiples palabras en una ronda

### 4. **Sincronización de Dibujos**
- ✅ Eventos de socket mejorados con logs detallados
- ✅ Canvas sincronizado en tiempo real entre todos los dispositivos
- ✅ Logs con emojis para debugging:
  - 🎨 [PictionaryGame] - Eventos del juego
  - 🖊️ [PictionaryGame] - Eventos de dibujo
  - 📥 [PictionaryGame] - Sincronización recibida

### 5. **Corrección del Chat de Voz WebRTC**
- ✅ Agregado manejo del evento `voice-user-joined`
- ✅ Nuevo handler `handleUserJoined` que crea ofertas WebRTC automáticamente
- ✅ Cuando un usuario se une, los que ya están crean ofertas peer-to-peer
- ✅ Logs mejorados para debugging de audio:
  - 🎤 [VoiceChat] - Micrófono y permisos
  - 🔗 [VoiceChat] - Conexiones WebRTC
  - 📥 [VoiceChat] - Offers/Answers
  - 🔊 [VoiceChat] - Volumen y deafen

### 6. **Cambios en ImpostorGame.jsx**
- ✅ Cambiado el import de `PictionaryGameV2` a `PictionaryGame` (original)
- ✅ Mantiene compatibilidad con modo impostor y pictionary

## 📝 Archivos Modificados

### `src/components/PictionaryGame.jsx`
- Import cambiado de `fetchWord` a `getRandomWord, getCategories`
- Estados actualizados para soportar palabras individuales por jugador
- Función `selectCategory()` para elegir categoría
- Función `startNewRound()` genera palabras diferentes para cada jugador
- Función `submitGuess()` verifica contra todas las palabras de otros jugadores
- Nueva fase `category-select` y `discussion`
- Logs detallados en todas las funciones

### `src/components/VoiceChat.jsx`
- Agregado `handleUserJoined()` para crear ofertas cuando alguien se une
- Agregado listener `socketService.onVoiceUserJoined(handleUserJoined)`
- Logs mejorados en todas las operaciones WebRTC

### `src/services/socketService.js`
- Agregado método `onVoiceUserJoined(callback)`
- Actualizado `offVoice()` para limpiar el nuevo listener

### `src/components/ImpostorGame.jsx`
- Cambiado uso de `<PictionaryGameV2>` a `<PictionaryGame>`

## 🐛 Problemas Resueltos

### ❌ ANTES
- Dibujos NO se sincronizaban entre dispositivos
- Micrófonos conectados pero sin transmitir audio
- Todos veían la misma palabra (modo por turnos)
- No mostraba palabras colombianas
- WebRTC no iniciaba conexiones peer-to-peer

### ✅ AHORA
- ✅ Dibujos sincronizados en tiempo real con logs de debugging
- ✅ WebRTC inicia ofertas automáticamente cuando usuarios se unen
- ✅ Cada jugador tiene su propia palabra diferente
- ✅ 90+ palabras 100% colombianas en 6 categorías
- ✅ Todos dibujan simultáneamente
- ✅ Se puede adivinar durante dibujo O en discusión
- ✅ Logs completos para debugging con F12

## 🧪 Cómo Probar

### 1. Probar Localmente
```bash
# Terminal 1 - Backend
node server.js

# Terminal 2 - Frontend  
npm run dev
```

### 2. Abrir dos ventanas/dispositivos
- Ventana 1: Crear sala online → Seleccionar Pictionary
- Ventana 2: Unirse con código → Esperar en lobby

### 3. Iniciar juego
1. Host selecciona una categoría (ej: Animales de Colombia)
2. Ambos jugadores ven sus propias palabras diferentes
3. Ambos dibujan en el mismo canvas (verán dibujos del otro en tiempo real)
4. Pueden adivinar escribiendo en el campo de texto
5. Después de 60 segundos pasa a fase de discusión

### 4. Verificar Chat de Voz
1. Click en "Activar Chat de Voz" en ambos dispositivos
2. Dar permiso al micrófono cuando lo pida el navegador
3. Verificar logs en consola (F12) para ver conexiones WebRTC
4. Hablar y verificar que el otro puede escuchar

## 🔍 Debugging

### Para ver logs detallados:
1. Presiona F12 para abrir DevTools
2. Ve a la pestaña "Console"
3. Busca logs con estos emojis:
   - 🎨 🖊️ 📥 = Pictionary Game
   - 🎤 🔗 📥 🔊 = Voice Chat
   - 🌐 📤 = Socket Service
   - 🎮 👑 = Server

### Si los dibujos no se sincronizan:
- Busca `🖊️ [PictionaryGame] Empezando a dibujar`
- Verifica que aparezca `📥 [PictionaryGame] Dibujo recibido` en el otro dispositivo

### Si el audio no funciona:
- Busca `✅ [VoiceChat] Micrófono obtenido`
- Verifica `📤 [VoiceChat] Oferta enviada` y `📥 [VoiceChat] Recibiendo offer`
- Chequea estado de conexión: `🔌 [VoiceChat] Estado conexión`

## 🚀 Próximos Pasos (Opcional)

- [ ] Sistema de pistas (cuesta 1 intento)
- [ ] Límite de intentos por palabra (2-3 intentos)
- [ ] Votar quién dibujó cada palabra en fase de discusión
- [ ] Puntos extra por adivinar el autor del dibujo
- [ ] Guardar dibujos para revisarlos después

## 📊 Estadísticas del Proyecto

- **Palabras colombianas**: 90+
- **Categorías**: 6
- **Tiempo de dibujo**: 60 segundos
- **Rondas por juego**: 5
- **Puntos por acierto**: 100-500 (según velocidad)
