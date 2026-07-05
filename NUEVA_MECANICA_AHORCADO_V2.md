# 🎮 NUEVA MECÁNICA DE AHORCADO V2 - PICTIONARY COLOMBIANO

## ✅ CAMBIOS IMPLEMENTADOS

### 1. **Sistema de Puntos Mejorado**

#### Adivinar la Palabra:
- **🏆 Primer jugador en adivinar** → +200 puntos (sea por palabra completa o ahorcado)
- **✅ Siguientes jugadores** → +100 puntos (pueden seguir jugando ahorcado)

#### Bonus:
- **🎨 Adivinar el autor del dibujo** → +50 puntos

### 2. **Ahorcado con Letras Reveladas**

Antes:
```
_ _ _ _  (no mostraba letras)
```

Ahora:
```
G A _ O  (muestra letras correctas en su posición)
```

### 3. **Flujo de Juego Completo**

#### Fase de Dibujo (2 minutos):
1. Cada jugador dibuja su palabra
2. Todos los canvas son anónimos (Canvas A, B, C...)

#### Fase de Adivinanza:
1. **Opción 1: Ahorcado letra por letra**
   - Click en letras del alfabeto
   - Si la letra está → se revela en su posición
   - Si NO está → pierdes 1 intento
   - Completas la palabra → ganas puntos

2. **Opción 2: Adivinar palabra completa**
   - Escribir la palabra entera
   - Si es correcta → ganas puntos
   - Si es incorrecta → pierdes 1 intento

3. **Banner de ganadores**
   - Muestra quién ha adivinado cada palabra
   - Indica si hay más jugadores que completaron por ahorcado

4. **Bonus de autor**
   - Una vez adivinada la palabra
   - Puedes adivinar quién la dibujó
   - +50 puntos si aciertas

### 4. **Mensajes de Victoria**

Cuando adivinas:
- **🏆 ¡Fuiste el PRIMERO! +200 pts** (si eres el primero)
- **🔤 Completado por ahorcado +100 pts** (si completaste letra por letra después del primero)
- **✅ ¡Correcta! +100 pts** (si adivinaste completa después del primero)

### 5. **Información en Tiempo Real**

- **Banner verde** muestra las palabras ya resueltas
- Se indica quién fue el primer ganador de cada palabra
- Se muestra cuántos jugadores más la completaron

## 📊 EJEMPLO DE PARTIDA

### Escenario:
- 4 jugadores: Ana, Bob, Carlos, Diana
- Cada uno dibuja una palabra diferente

### Ronda 1: Adivinar palabra de Ana
1. **Bob** adivina letra por letra: G-A-T-O
   - Es el primero → **+200 puntos** 🏆
   - Banner muestra: "🎉 Canvas A - Bob"

2. **Carlos** también juega ahorcado en la misma palabra
   - Completa G-A-T-O → **+100 puntos** ✅
   - Banner ahora: "🎉 Canvas A - Bob (+1 más por ahorcado)"

3. **Diana** adivina que Ana dibujó eso
   - Selecciona "Canvas A"
   - **+50 puntos** bonus 🎨

### Resumen de puntos:
- Bob: 200 pts (primer ganador)
- Carlos: 100 pts (ahorcado secundario)
- Diana: 50 pts (bonus autor)
- Ana: 0 pts (era su dibujo)

## 🎯 VENTAJAS DEL NUEVO SISTEMA

1. **Más competitivo**: El primero gana más, pero otros pueden seguir jugando
2. **Más interactivo**: Ahorcado letra por letra es más dinámico
3. **Más estratégico**: Decides si arriesgar con palabra completa o ir letra por letra
4. **Más justo**: Todos tienen oportunidad de ganar puntos
5. **Más social**: Adivinar el autor fomenta la interacción

## 🔤 MECÁNICA DEL AHORCADO

### Teclado Virtual:
```
A B C D E F G H I J K L M N Ñ O P Q R S T U V W X Y Z
```

### Estados de las letras:
- **Blanca** → No intentada
- **Verde** → Letra correcta (encontrada en la palabra)
- **Gris** → Letra incorrecta (no está en la palabra)

### Progreso visual:
```
Palabra: GATO

Inicio:      _ _ _ _
Intentas G:  G _ _ _  ✅ (1 letra revelada)
Intentas A:  G A _ _  ✅ (2 letras reveladas)
Intentas X:  G A _ _  ❌ (pierdes 1 intento)
Intentas T:  G A T _  ✅ (3 letras reveladas)
Intentas O:  G A T O  ✅ (¡PALABRA COMPLETA!)
```

## 🎮 CONTROLES DE JUEGO

### Durante Adivinanza:

1. **💡 Ver Pista** (-1 intento)
   - Muestra pista de la palabra (ej: "Empieza con G")

2. **🔤 Teclado de Letras**
   - Click en letra para probarla
   - Las correctas se iluminan en verde
   - Las incorrectas se marcan en gris

3. **💬 Adivinar Palabra Completa**
   - Input de texto
   - Enter para enviar
   - Si fallas → pierdes 1 intento

4. **🎨 Adivinar Autor** (solo después de acertar)
   - Dropdown con canvas anónimos
   - Solo puedes intentar una vez
   - Feedback inmediato (✅ o ❌)

## 📈 TABLA DE PUNTOS

| Acción | Condición | Puntos |
|--------|-----------|--------|
| Adivinar primero | Palabra completa o ahorcado | +200 |
| Adivinar después | Palabra completa | +100 |
| Completar ahorcado | Después del primero | +100 |
| Adivinar autor | Correctamente | +50 |
| Adivinar autor | Incorrectamente | 0 |
| Usar pista | - | -1 intento |
| Fallar letra | - | -1 intento |
| Fallar palabra | - | -1 intento |

## 🚀 PRÓXIMOS PASOS

1. **Prueba local** con 2+ dispositivos
2. Verifica que:
   - ✅ Las letras se revelan correctamente
   - ✅ Los puntos se asignan bien (200 primero, 100 después)
   - ✅ El banner de ganadores se actualiza
   - ✅ El bonus de autor funciona
3. **Deploy a producción**
4. **Jugar en vivo** con amigos

## 🐛 POSIBLES MEJORAS FUTURAS

- Sonidos al acertar/fallar letras
- Animaciones al completar palabra
- Estadísticas de ronda (% de aciertos, letras más usadas)
- Power-ups especiales
- Modos de dificultad (fácil: 5 intentos, difícil: 2 intentos)

---

¡El juego ahora es mucho más dinámico y divertido! 🎉
