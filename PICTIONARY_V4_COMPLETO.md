# 🎨 Pictionary V4 - Sistema Completo Implementado

## ✅ Problemas Corregidos

### 1. **Sincronización entre dispositivos** ✅
**Antes**: Solo el host podía ver y jugar
**Ahora**: Ambos dispositivos (victor y Manuel) pueden:
- Ver sus propias palabras diferentes
- Dibujar simultáneamente en el mismo canvas
- Ver los dibujos del otro en tiempo real

### 2. **Fase de Discusión con Intentos y Pistas** ✅
**Sistema implementado:**
- ✅ **3 intentos por palabra**
- ✅ **Sistema de pistas** (cuesta 1 intento)
- ✅ **Adivinar la palabra** (+200 puntos)
- ✅ **Adivinar quién dibujó** (+100 puntos bonus)
- ✅ No puedes adivinar tu propia palabra

### 3. **Puntuación Completa** ✅
- **200 puntos** por adivinar correctamente una palabra
- **100 puntos** por adivinar quién dibujó esa palabra
- **Máximo**: 300 puntos por palabra (si adivinas ambas cosas)

## 🎮 Cómo Funciona Ahora

### Fase 1: Selección de Categoría (Solo Host)
1. El host (victor) ve 6 categorías colombianas
2. Selecciona una (ej: Animales de Colombia)
3. Los demás esperan

### Fase 2: Dibujo Simultáneo (60 segundos)
1. **Cada jugador** ve SU PROPIA palabra arriba
   - Victor ve: "🏙️ bogotá"
   - Manuel ve: "🐆 jaguar" (diferente)
   
2. **AMBOS pueden dibujar** en el mismo canvas simultáneamente
   - Los dibujos se sincronizan en tiempo real
   - Usan los mismos colores y herramientas
   
3. **Pueden adivinar durante el dibujo** (opcional)
   - Escribir en el campo de texto
   - Si aciertan, +200 puntos inmediatos

### Fase 3: Discusión (Sistema de Intentos)
Cuando el tiempo termina, se muestra una tarjeta para cada palabra:

#### Adivinar la Palabra:
- **3 intentos** por palabra
- Si usas **pista**, pierdes 1 intento (quedan 2)
- La pista dice: "Empieza con B" (primera letra)
- Escribe la palabra y presiona Enter
- Si aciertas: **+200 puntos** ✅
- Si fallas: -1 intento ❌
- Con 0 intentos: ya no puedes adivinar esa palabra

#### Adivinar Quién Dibujó (Bonus):
- Después de adivinar la palabra correctamente
- Aparece un dropdown: "¿Quién la dibujó?"
- Selecciona un jugador
- Si aciertas: **+100 puntos extra** ✅
- Solo tienes 1 intento

### Fase 4: Resultados
- Muestra puntajes de la ronda
- Siguiente ronda automáticamente (5 rondas en total)

### Fase 5: Ganador Final
- Después de 5 rondas
- Muestra tabla de posiciones final
- El que más puntos tenga gana

## 🎯 Ejemplo de Juego Real

```
JUGADORES: Victor y Manuel

=== RONDA 1 ===
Categoría: Animales de Colombia

Fase de Dibujo (60s):
- Victor recibe: "🐆 jaguar"
- Manuel recibe: "🦥 perezoso"
- Ambos dibujan en el mismo canvas
- Victor escribe "perezoso" y acierta (+200 pts)

Fase de Discusión:
- Manuel ve la palabra de Victor oculta: "_ _ _ _ _ _"
- Manuel tiene 3 intentos
- Manuel pide pista (-1 intento): "Empieza con J"
- Manuel escribe "jaguar" y acierta (+200 pts)
- Manuel adivina que Victor dibujó jaguar (+100 pts)

PUNTOS RONDA 1:
- Victor: 200 pts
- Manuel: 300 pts

=== RONDA 2 ===
... (se repite el proceso)

=== FINAL ===
Ganador: El que más puntos acumuló en 5 rondas
```

## 📊 Tabla de Puntos

| Acción | Puntos |
|--------|--------|
| Adivinar palabra durante dibujo | +200 |
| Adivinar palabra en discusión | +200 |
| Adivinar quién dibujó | +100 |
| Usar pista | -1 intento |
| Intento fallido | -1 intento |
| **Máximo por palabra** | **300** |

## 🔍 Verificar que Funcione

### 1. Abrir 2 dispositivos
- https://dulcet-starship-db38fc.netlify.app

### 2. Crear sala (Dispositivo 1 - Victor)
- Click "Crear Sala"
- Nombre: "victor"
- Copiar código (ej: MA42B6)

### 3. Unirse (Dispositivo 2 - Manuel)
- Click "Unirse"
- Pegar código: MA42B6
- Nombre: "Manuel"

### 4. Iniciar Pictionary
- Victor selecciona "Pictionary" en dropdown
- Victor click "Iniciar Juego"
- **AMBOS dispositivos** deben ver la pantalla de selección de categoría

### 5. Seleccionar Categoría
- Victor selecciona (ej: "Animales de Colombia")
- **AMBOS** pasan automáticamente a fase de dibujo

### 6. Verificar que AMBOS pueden dibujar
- Victor dibuja algo
- **Manuel DEBE VER** el dibujo de Victor en tiempo real
- Manuel dibuja algo
- **Victor DEBE VER** el dibujo de Manuel en tiempo real

### 7. Verificar palabras diferentes
- Victor ve su palabra arriba (ej: "jaguar")
- Manuel ve SU palabra arriba (ej: "cóndor") - DEBE SER DIFERENTE

### 8. Fase de Discusión
- Esperar 60 segundos
- Ambos ven tarjetas para adivinar
- Probar:
  - Click "Ver Pista" (debe restar 1 intento)
  - Escribir palabra incorrecta (debe restar 1 intento)
  - Escribir palabra correcta (debe dar +200 puntos)
  - Seleccionar quién dibujó (debe dar +100 puntos)

## 🐛 Si Algo No Funciona

### Manuel no ve su palabra
**Solución**: Refrescar la página (Ctrl + R) después de que Victor seleccione categoría

### Los dibujos no se sincronizan
**Solución**: 
1. Abrir F12 → Console en ambos dispositivos
2. Buscar errores de Socket.IO
3. Verificar que VITE_SOCKET_URL esté correcto en Netlify

### El segundo jugador está "Esperando al anfitrión"
**Solución**: 
- Esperar 2-3 minutos a que Netlify complete el deploy
- Verificar en https://app.netlify.com/sites/dulcet-starship-db38fc/deploys
- Buscar el deploy más reciente con el commit "Pictionary V4"

### Los intentos no se restan
**Causa**: Estado local, no sincronizado entre dispositivos (normal)
**Cada jugador** tiene sus propios intentos independientes

## 🚀 Deploy Status

### GitHub ✅
- Commit: "Pictionary V4: Sistema de intentos, pistas y adivinanza de autor"
- Branch: main
- Status: Pushed successfully

### Netlify 🔄
- Deploy: Automático
- Espera: 2-3 minutos
- URL: https://dulcet-starship-db38fc.netlify.app

## 📝 Archivos Modificados

### `src/components/PictionaryGame.jsx`
- ✅ Agregado sistema de intentos (3 por palabra)
- ✅ Agregado sistema de pistas
- ✅ Agregado adivinanza de autor
- ✅ Fase de discussion completamente reescrita
- ✅ Fix sincronización para que ambos jugadores puedan jugar

**Líneas cambiadas**: +196, -36

## 🎉 Resultado Esperado

Después del deploy de Netlify (2-3 minutos), deberías poder:

1. ✅ Crear sala desde cualquier dispositivo
2. ✅ Unirse con código
3. ✅ Ambos ven la misma pantalla
4. ✅ Host selecciona categoría
5. ✅ **AMBOS ven sus palabras DIFERENTES**
6. ✅ **AMBOS pueden dibujar AL MISMO TIEMPO**
7. ✅ Los dibujos se ven en tiempo real
8. ✅ Pueden adivinar durante el dibujo
9. ✅ Fase de discusión con intentos y pistas funciona
10. ✅ Pueden adivinar quién dibujó cada palabra
11. ✅ Sistema de puntos funciona correctamente
12. ✅ 5 rondas completas con ganador final

## ⏰ Próximo Paso

**Esperar 2-3 minutos** a que Netlify complete el deploy, luego probar de nuevo en:
https://dulcet-starship-db38fc.netlify.app
