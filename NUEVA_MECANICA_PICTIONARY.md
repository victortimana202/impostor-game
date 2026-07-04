# 🎨 Nueva Mecánica Pictionary - Sistema de Turnos

## ✅ NUEVA IMPLEMENTACIÓN

### 🎯 Mecánica del Juego

#### 1. Sistema de Turnos
- **Cada jugador dibuja en su turno** (1 minuto)
- Solo el dibujante puede dibujar en el canvas
- Los demás jugadores solo pueden ver

#### 2. Revelación de Palabras
- **Solo el dibujante ve su palabra**
- Los demás ven el canvas en blanco
- Palabra generada por IA con emoji y categoría

#### 3. Fase de Dibujo (60 segundos)
**Dibujante:**
- Ve su palabra claramente: 🎯 "PALABRA"
- Tiene 60 segundos para dibujar
- Herramientas completas: lápiz, borrador, colores, limpi ar
- Canvas sincronizado en tiempo real

**Adivinadores:**
- Ven el dibujo en tiempo real mientras se crea
- Pueden adivinar EN CUALQUIER MOMENTO (mientras dibuja o después)
- No ven la palabra, solo guiones: _ _ _ _ _

#### 4. Sistema de Intentos
- **3 intentos por defecto** para adivinar
- Cada respuesta incorrecta = -1 intento
- Al quedarse sin intentos, no puede seguir adivinando

#### 5. Sistema de Pistas
- **Botón "💡 Pedir Pista"** disponible
- Costo: -1 intento (solo si tienes más de 1 intento)
- Pista: Primera letra o hint generado por IA
- Solo se puede usar una pista por ronda

#### 6. Puntuación

**Por Adivinar la Palabra:**
- Primer adivinador: 500 puntos
- Segundo adivinador: 400 puntos
- Tercer adivinador: 300 puntos
- Cuarto+: 200 puntos
- Mínimo: 100 puntos

**Por Dibujar:**
- El dibujante gana +50 puntos por cada persona que adivine
- Incentivo para dibujar bien

**Fase de Discusión - Adivinar Autor:**
- Después de que termina el tiempo, se entra en fase de discusión
- Se muestra el dibujo completo
- **Nuevo desafío**: ¿Quién dibujó esto?
- Aciertos al adivinar autor: +100 puntos
- Se puede usar el chat de voz para discutir

#### 7. Flujo del Juego

```
RONDA 1:
├─ Turno de Jugador 1 (60s)
│  ├─ Jugador 1 dibuja su palabra
│  ├─ Los demás adivinan en tiempo real
│  └─ Puntos asignados a los que adivinan
├─ Fase Discusión
│  ├─ Mostrar dibujo completo
│  ├─ Chat de voz activo
│  ├─ Adivinar quién dibujó (+100pts)
│  └─ Host avanza al siguiente
├─ Turno de Jugador 2 (60s)
│  └─ (Repetir proceso)
├─ ...
└─ Turno de Jugador N (60s)

RONDA 2:
└─ (Repetir todos los turnos)

...

RONDA N:
└─ (Última ronda)

FINAL:
└─ Ganador = Más puntos totales
```

#### 8. Duración del Juego
- **Cada jugador dibuja**: 1 vez por ronda
- **Total de rondas**: Igual al número de jugadores
- **Ejemplo con 4 jugadores**:
  - 4 rondas × 4 turnos = 16 dibujos totales
  - ~16 minutos de dibujo + discusiones

#### 9. Chat de Voz Integrado
- **Siempre disponible** durante el juego
- Especialmente útil en fase de discusión
- WebRTC peer-to-peer
- Controles de mute/volumen

### 🎮 Diferencias con Versión Anterior

| Aspecto | Versión Anterior | Nueva Versión |
|---------|------------------|---------------|
| **Dibujo** | Todos simultáneamente | Por turnos (1 a la vez) |
| **Palabra** | Todos ven la misma palabra oculta | Solo el dibujante ve su palabra |
| **Tiempo** | 40 segundos por ronda | 60 segundos por turno |
| **Adivinanza** | Primera respuesta correcta gana | Sistema de intentos (3 máximo) |
| **Pistas** | No disponibles | Sí, cuesta 1 intento |
| **Fase Discusión** | No existe | Sí, para adivinar autor |
| **Duración** | 5 rondas fijas | N jugadores × N rondas |
| **Puntos Dibujante** | No recibe | +50 por cada acierto |

### 🎯 Sistema de Puntuación Completo

#### Durante el Dibujo:
```
Adivinador 1: 500 pts
Adivinador 2: 400 pts  
Adivinador 3: 300 pts
Adivinador 4+: 200 pts

Dibujante: +50 pts × (# de adivinadores)
```

#### Fase de Discusión:
```
Adivinar autor correctamente: +100 pts
```

#### Ejemplo Completo:
```
Jugador A dibuja "GATO"
- Jugador B adivina primero → B: +500, A: +50
- Jugador C adivina segundo → C: +400, A: +50
- Jugador D adivina tercero → D: +300, A: +50

Resultado del turno:
A (dibujante): 150 pts
B: 500 pts
C: 400 pts
D: 300 pts

Fase Discusión:
- B adivina que A dibujó → B: +100
- C y D no adivinan → 0 pts

Total turno:
A: 150 pts
B: 600 pts
C: 400 pts
D: 300 pts
```

### 📊 Interfaz de Usuario

#### Para el Dibujante:
```
┌─────────────────────────────────────────┐
│ 🎨 ¡ES TU TURNO! Dibuja: 🐱 GATO       │
├─────────────────────────────────────────┤
│           ⏱️ 45s restantes               │
├─────────────────────────────────────────┤
│                                         │
│         [Canvas 700x500]                │
│                                         │
├─────────────────────────────────────────┤
│ [✏️ Lápiz] [🧹 Borrador] [🗑️ Limpiar]   │
│ [Paleta de 18 colores]                  │
│ [Control de grosor 1-20px]              │
└─────────────────────────────────────────┘
```

#### Para los Adivinadores:
```
┌─────────────────────────────────────────┐
│ 👀 Juan está dibujando...               │
├─────────────────────────────────────────┤
│           ⏱️ 45s restantes               │
├─────────────────────────────────────────┤
│                                         │
│         [Canvas 700x500]                │
│      (solo ver, no dibujar)             │
│                                         │
├─────────────────────────────────────────┤
│  🎯 Adivina la Palabra                  │
│  ┌───────────────────────────────┐     │
│  │ INTENTOS RESTANTES: 3         │     │
│  └───────────────────────────────┘     │
│  [💡 Pedir Pista (-1 intento)]         │
│  [_____________] [📤 Enviar]            │
└─────────────────────────────────────────┘
```

### 🔧 Archivos Implementados

1. **`src/components/PictionaryGameV2.jsx`** (NUEVO)
   - Componente principal con sistema de turnos
   - Gestión de intentos y pistas
   - Fase de discusión
   - Integración con chat de voz

2. **`src/services/socketService.js`** (ACTUALIZADO)
   - Métodos para Pictionary V2
   - Eventos sincronizados:
     - `pictionary-v2-sync-state`
     - `pictionary-v2-guess`
     - `pictionary-v2-drawing`
     - `pictionary-v2-clear-canvas`

3. **`server.js`** (ACTUALIZADO)
   - Manejadores de eventos V2
   - Sincronización de turnos
   - Gestión de puntuaciones

4. **`src/components/ImpostorGame.jsx`** (ACTUALIZADO)
   - Importa PictionaryGameV2
   - Mantiene integración con lobby

### ✅ Estado de Implementación

- [x] Sistema de turnos
- [x] Solo dibujante puede dibujar
- [x] Sistema de 3 intentos
- [x] Sistema de pistas (-1 intento)
- [x] Puntuación por orden de adivinanza
- [x] Puntos para el dibujante
- [x] Fase de discusión
- [x] Adivinar autor del dibujo
- [x] Chat de voz integrado
- [x] Sincronización Socket.IO
- [x] Canvas en tiempo real
- [x] Temporizador de 60s

### 🚀 Próximos Pasos

1. **Probar el juego**:
   ```bash
   npm run dev:full
   ```

2. **Abrir múltiples pestañas**
3. **Crear sala y seleccionar Pictionary**
4. **Verificar**:
   - Solo el dibujante puede dibujar
   - Los demás ven en tiempo real
   - Sistema de intentos funciona
   - Pistas funcionan
   - Puntuaciones correctas
   - Chat de voz activo

### 📝 Notas Importantes

- **Requisitos mínimos**: 2 jugadores
- **Tiempo total**: ~15-30 minutos (depende de # jugadores)
- **Chat de voz**: Requiere permisos de micrófono
- **Sincronización**: Require conexión estable a internet

---

**Versión**: 2.1.0
**Fecha**: 4 de Julio, 2026
**Estado**: ✅ Implementado y listo para probar
