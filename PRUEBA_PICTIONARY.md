# 🎨 Guía de Pruebas - Modo Pictionary

## 📋 Checklist de Funcionalidades

### ✅ Preparación

1. **Iniciar el servidor**
   ```bash
   npm run dev:full
   ```
   - Servidor debe estar corriendo en `http://localhost:3001`
   - Cliente debe estar en `http://localhost:5173`

2. **Abrir múltiples pestañas**
   - Abre al menos 2 pestañas del navegador
   - Puedes abrir hasta 5-6 para probar con más jugadores
   - En Chrome puedes usar ventanas de incógnito para simular usuarios diferentes

### 🎯 Crear y Unirse a Sala

**Pestaña 1 (Host):**
1. Selecciona "En Línea (Diferentes Lugares)"
2. Click en "Crear Sala"
3. Ingresa tu nombre (ej: "Jugador1")
4. Anota el código de sala de 6 dígitos

**Pestaña 2+ (Invitados):**
1. Selecciona "En Línea (Diferentes Lugares)"
2. Click en "Unirse a Sala"
3. Ingresa tu nombre (ej: "Jugador2", "Jugador3", etc.)
4. Ingresa el código de sala
5. Marca "Listo"

**Host (Pestaña 1):**
1. En "Tipo de Juego", selecciona **"🎨 Dibuja y Adivina"**
2. Verifica que veas a todos los jugadores en la lista
3. Click en "Iniciar Juego"

### 🎨 Pruebas de Funcionalidad

#### 1. ✅ Inicio del Juego
- [ ] Todos los jugadores ven la misma palabra oculta (solo guiones: _ _ _ _)
- [ ] Se muestra emoji y categoría de la palabra
- [ ] Temporizador inicia en 40 segundos
- [ ] Contador "Ronda 1 de 5" es visible

#### 2. ✅ Canvas de Dibujo
- [ ] Canvas es visible en todas las pestañas
- [ ] Puedes seleccionar colores (18 colores disponibles)
- [ ] Puedes cambiar el grosor del trazo (1-20px)
- [ ] Herramienta "Lápiz" funciona
- [ ] Herramienta "Borrador" funciona
- [ ] Botón "Limpiar" limpia el canvas

#### 3. ✅ Sincronización en Tiempo Real
**Prueba crucial:**
- [ ] Dibuja en Pestaña 1 → Debe aparecer INMEDIATAMENTE en Pestaña 2 y todas las demás
- [ ] Dibuja en Pestaña 2 → Debe aparecer INMEDIATAMENTE en Pestaña 1 y todas las demás
- [ ] Cambia de color en Pestaña 1 y dibuja → El color correcto aparece en otras pestañas
- [ ] Click en "Limpiar" en una pestaña → Canvas se limpia en TODAS las pestañas
- [ ] Múltiples jugadores dibujando simultáneamente → Todos los trazos aparecen

#### 4. ✅ Sistema de Adivinanza
- [ ] Campo de texto "Escribe tu respuesta..." es visible
- [ ] Escribe una respuesta incorrecta y presiona Enter → No pasa nada
- [ ] Escribe la respuesta correcta y presiona Enter → Mensaje de ganador aparece
- [ ] Solo el primer jugador en acertar recibe puntos
- [ ] Otros jugadores ya no pueden adivinar después del ganador

#### 5. ✅ Sistema de Puntuación
- [ ] Ganador recibe puntos basados en tiempo restante
- [ ] Fórmula: `puntos = max(100, tiempoRestante * 10)`
- [ ] Si adivinas con 30s restantes = 300 puntos
- [ ] Si adivinas con 5s restantes = 100 puntos (mínimo)
- [ ] Puntuaciones se actualizan en la tabla lateral

#### 6. ✅ Final de Ronda
- [ ] Al adivinar o llegar a 0s, aparece pantalla de resultados
- [ ] Muestra la palabra correcta con emoji
- [ ] Muestra el ganador de la ronda (si lo hay)
- [ ] Muestra puntos obtenidos
- [ ] Después de 5 segundos, inicia la siguiente ronda automáticamente

#### 7. ✅ Múltiples Rondas
- [ ] Ronda 1 → Resultados → Ronda 2 (automático)
- [ ] Ronda 2 → Resultados → Ronda 3 (automático)
- [ ] Ronda 3 → Resultados → Ronda 4 (automático)
- [ ] Ronda 4 → Resultados → Ronda 5 (automático)
- [ ] Ronda 5 → Resultados → **JUEGO TERMINADO**

#### 8. ✅ Pantalla Final
- [ ] Muestra "🎉 ¡Juego Terminado!"
- [ ] Muestra ganador final con corona 👑
- [ ] Muestra puntuaciones finales ordenadas de mayor a menor
- [ ] Botón "🏠 Volver al Lobby" funciona

### 🐛 Casos de Borde a Probar

#### Desconexión
- [ ] Si un jugador cierra la pestaña, los demás continúan
- [ ] Si el host se desconecta, el juego continúa (nuevo host automático)

#### Sin Ganador
- [ ] Si nadie adivina en 40s, ronda termina sin ganador
- [ ] Todos los jugadores avanzan a la siguiente ronda
- [ ] Puntuaciones permanecen igual

#### Respuestas Simultáneas
- [ ] Si dos jugadores envían respuesta al mismo tiempo
- [ ] Solo el que llegó primero al servidor gana
- [ ] El segundo ve que alguien más ya ganó

#### Canvas Sobrecargado
- [ ] Dibuja mucho en múltiples pestañas
- [ ] Verifica que no haya lag excesivo
- [ ] Verifica que todos los trazos aparezcan

### 📊 Escenarios de Prueba Sugeridos

#### Escenario 1: Juego Rápido
1. 2 jugadores
2. Primera ronda: Uno adivina inmediatamente (400 puntos)
3. Segunda ronda: El otro adivina tarde (150 puntos)
4. Continuar 3 rondas más
5. Verificar ganador final

#### Escenario 2: Nadie Adivina
1. 3 jugadores
2. Dejar que el tiempo llegue a 0 sin adivinar
3. Verificar que pase a siguiente ronda
4. Verificar puntuaciones siguen en 0

#### Escenario 3: Dibujo Intenso
1. 4+ jugadores
2. Todos dibujan simultáneamente
3. Cambiar colores frecuentemente
4. Usar borrador
5. Limpiar canvas
6. Verificar sincronización perfecta

#### Escenario 4: Adivinanzas Rápidas
1. 3 jugadores
2. Todos intentan adivinar al mismo tiempo
3. Verificar que solo uno gane
4. Verificar puntos correctos

### 🔍 Problemas Conocidos a Verificar

- [ ] ¿Los trazos aparecen suaves o hay saltos?
- [ ] ¿El temporizador se sincroniza bien en todas las pestañas?
- [ ] ¿Las palabras generadas son apropiadas y variadas?
- [ ] ¿La tabla de puntuaciones se actualiza correctamente?
- [ ] ¿El botón "Limpiar" funciona para todos?

### ✅ Checklist Final

Antes de dar por terminado:

- [ ] El juego puede jugarse de principio a fin sin errores
- [ ] Todas las pestañas ven lo mismo en tiempo real
- [ ] Los dibujos se sincronizan instantáneamente
- [ ] Las adivinanzas funcionan correctamente
- [ ] Los puntos se calculan bien
- [ ] Las 5 rondas se completan
- [ ] La pantalla final muestra el ganador
- [ ] Puedes volver al lobby y jugar otra vez

### 🎯 Métricas de Éxito

**El modo Pictionary funciona correctamente si:**

1. ✅ Puedes jugar 5 rondas completas sin errores
2. ✅ Los dibujos aparecen en tiempo real (< 100ms de delay)
3. ✅ Las adivinanzas se procesan correctamente
4. ✅ Los puntos se calculan según la fórmula
5. ✅ Múltiples jugadores pueden jugar simultáneamente

---

## 🚀 Comandos Útiles

### Reiniciar el servidor
```bash
# Ctrl+C para detener
npm run dev:full
```

### Ver logs del servidor
```bash
# Los logs aparecen en la consola donde ejecutaste dev:full
# Busca mensajes como: "📤 Sincronizando estado en sala..."
```

### Ver logs del cliente
```bash
# Abre DevTools en el navegador (F12)
# Pestaña "Console"
# Busca mensajes de Socket.IO y dibujos
```

### Limpiar cache del navegador
```bash
# Si algo no funciona, prueba:
# Chrome: Ctrl+Shift+Delete → Limpiar todo
# Luego recarga con Ctrl+F5
```

---

**¡Disfruta probando el modo Pictionary!** 🎨🎉
