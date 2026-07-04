# 🎨 Modo Pictionary - Dibuja y Adivina

## ✅ IMPLEMENTACIÓN COMPLETADA

El nuevo modo de juego Pictionary ha sido implementado completamente con las siguientes características:

### 📋 Características Principales

#### 1. Mecánica del Juego
- **Juego simultáneo**: TODOS los jugadores dibujan al mismo tiempo en sus propios dispositivos
- **Visibilidad en tiempo real**: Todos pueden ver los dibujos de todos los demás instantáneamente
- **Sistema de adivinanza**: Cada jugador puede escribir su respuesta para adivinar la palabra
- **Primer en adivinar gana**: El primer jugador que acierte recibe puntos
- **5 rondas totales**: El juego consta de 5 rondas completas
- **40 segundos por ronda**: Cada ronda tiene un límite de 40 segundos

#### 2. Sistema de Puntuación
- **Puntos basados en velocidad**: Más rápido = más puntos
- **Fórmula**: `puntos = max(100, tiempoRestante * 10)`
- **Puntos mínimos**: 100 puntos si adivinas al final
- **Puntos máximos**: 400 puntos si adivinas de inmediato
- **Sin ganador**: Si nadie adivina en 40s, la ronda termina sin puntos

#### 3. Canvas de Dibujo Profesional
- **Dimensiones**: 700x500 píxeles
- **18 colores disponibles**: Paleta completa de colores
- **Herramientas**:
  - ✏️ Lápiz: Para dibujar
  - 🧹 Borrador: Para corregir errores
  - 🗑️ Limpiar todo: Borra el canvas completo
- **Grosor ajustable**: 1-20 píxeles
- **Sincronización en tiempo real**: Todos los trazos se ven instantáneamente

#### 4. Interfaz de Usuario
- **Temporizador visible**: Cuenta regresiva de 40 segundos
- **Palabra oculta**: Muestra solo guiones bajos (_) con emoji y categoría
- **Campo de adivinanza**: Input para escribir la respuesta
- **Tabla de puntuaciones**: Rankings en vivo durante el juego
- **Panel de resultados finales**: Al terminar las 5 rondas

### 🔧 Implementación Técnica

#### Archivos Modificados/Creados:

1. **`src/components/PictionaryGame.jsx`** (NUEVO)
   - Componente principal del juego Pictionary
   - Maneja toda la lógica del juego
   - Canvas de dibujo sincronizado
   - Sistema de adivinanzas y puntuación

2. **`src/services/socketService.js`** (ACTUALIZADO)
   - ✅ Agregado: `syncPictionaryState()` - Sincroniza estado del juego
   - ✅ Agregado: `sendPictionaryGuess()` - Envía respuestas
   - ✅ Agregado: `sendPictionaryDrawing()` - Envía trazos de dibujo
   - ✅ Agregado: `clearPictionaryCanvas()` - Limpia el canvas
   - ✅ Agregado: `onPictionaryUpdate()` - Recibe actualizaciones
   - ✅ Agregado: `onPictionaryGuess()` - Recibe respuestas de otros
   - ✅ Agregado: `onPictionaryDrawing()` - Recibe dibujos en tiempo real
   - ✅ Agregado: `onPictionaryClear()` - Recibe eventos de limpieza
   - ✅ Agregado: `offPictionary()` - Limpia listeners

3. **`server.js`** (ACTUALIZADO)
   - ✅ Agregado: Evento `pictionary-sync-state` - Sincroniza estado
   - ✅ Agregado: Evento `pictionary-guess` - Procesa respuestas
   - ✅ Agregado: Evento `pictionary-drawing` - Transmite dibujos
   - ✅ Agregado: Evento `pictionary-clear-canvas` - Sincroniza limpieza

4. **`src/components/ImpostorGame.jsx`** (ACTUALIZADO)
   - ✅ Integrado selector de modo de juego
   - ✅ Manejo de estado para Pictionary vs Impostor
   - ✅ Renderizado condicional del componente correcto

5. **`src/components/OnlineLobby.jsx`** (ACTUALIZADO)
   - ✅ Agregado selector de tipo de juego
   - ✅ Configuración específica por modo
   - ✅ Inicio diferenciado según el tipo

### 🎮 Flujo del Juego

```
1. Lobby Online
   ↓
2. Seleccionar "Dibuja y Adivina (Pictionary)"
   ↓
3. RONDA 1/5 (40 segundos)
   ├─ Host genera palabra aleatoria
   ├─ TODOS los jugadores ven la palabra oculta
   ├─ TODOS dibujan simultáneamente
   ├─ TODOS ven los dibujos de todos en tiempo real
   └─ Primer jugador en adivinar gana puntos
   ↓
4. Resultados de la Ronda
   ├─ Muestra ganador
   ├─ Revela la palabra
   └─ Actualiza puntuaciones
   ↓
5. Repetir pasos 3-4 para rondas 2, 3, 4 y 5
   ↓
6. JUEGO TERMINADO
   ├─ Muestra ganador final
   ├─ Resultados completos
   └─ Opción de volver al lobby
```

### 🌐 Sincronización Online

Todos los eventos se sincronizan en tiempo real vía Socket.IO:

- ✅ **Estado del juego**: Fase, tiempo, puntuaciones
- ✅ **Dibujos**: Cada trazo se transmite instantáneamente
- ✅ **Respuestas**: Las adivinanzas se procesan en tiempo real
- ✅ **Limpieza de canvas**: Sincronizada entre todos
- ✅ **Cambio de ronda**: Automático por el host

### 📊 Palabras y Categorías

El juego utiliza la API de Groq para generar palabras aleatorias:
- Dificultad: Mixta (fácil, media, difícil)
- Categorías: General (animales, objetos, acciones, etc.)
- Incluye emoji y categoría para dar contexto

### 🎯 Características Especiales

1. **No hay turnos**: Todos juegan simultáneamente
2. **Dibujos colaborativos**: Múltiples jugadores dibujan en el mismo canvas
3. **Velocidad recompensada**: Más rápido = más puntos
4. **Límite de tiempo**: Crea tensión y emoción
5. **5 oportunidades**: Todos tienen chance de ganar en diferentes rondas

### 🐛 Posibles Mejoras Futuras (Opcionales)

- [ ] Modo de equipos (2v2, 3v3)
- [ ] Categorías personalizadas
- [ ] Dificultad ajustable (más/menos tiempo)
- [ ] Chat de texto durante el juego
- [ ] Replay de dibujos ganadores
- [ ] Avatares personalizados
- [ ] Efectos de sonido

### ✅ Estado Actual

**TODO FUNCIONAL Y LISTO PARA JUGAR**

El modo Pictionary está completamente implementado y sincronizado. Todos los jugadores pueden:
- ✅ Dibujar simultáneamente
- ✅ Ver los dibujos de todos en tiempo real
- ✅ Adivinar escribiendo la respuesta
- ✅ Ganar puntos siendo el primero en acertar
- ✅ Jugar 5 rondas completas
- ✅ Ver ganador final con puntuaciones

---

**Creado**: 4 de Julio, 2026
**Estado**: ✅ Completado
