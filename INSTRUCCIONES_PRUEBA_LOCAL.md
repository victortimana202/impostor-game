# 🧪 INSTRUCCIONES DE PRUEBA LOCAL - PICTIONARY COLOMBIANO

## ✅ Estado del Servidor
- **Backend**: Running en http://localhost:3001
- **Frontend**: Running en http://localhost:5173

## 🎮 CÓMO PROBAR CON MÚLTIPLES DISPOSITIVOS

### Opción 1: Múltiples ventanas del navegador (MISMO PC)
1. Abre el juego en **http://localhost:5173**
2. Crea una sala y copia el código
3. Abre otra ventana en modo incógnito: **Ctrl + Shift + N** (Chrome) o **Ctrl + Shift + P** (Firefox)
4. Ve a **http://localhost:5173** en esa ventana
5. Únete a la sala con el código
6. Repite para más jugadores (hasta 8)

### Opción 2: Múltiples dispositivos en la MISMA RED WiFi
1. En tu PC, encuentra tu IP local:
   ```bash
   ipconfig
   ```
   Busca "Dirección IPv4" (ejemplo: 192.168.1.10)

2. En tu celular/tablet conectado a la MISMA WiFi:
   - Abre el navegador
   - Ve a: **http://192.168.1.10:5173** (usa TU IP)

3. En el celular: únete a la sala con el código

## 🎨 CARACTERÍSTICAS A PROBAR

### ✅ 1. DIBUJO SIMULTÁNEO
- **TODOS los jugadores** deben poder dibujar al mismo tiempo
- Cada jugador dibuja en su propio canvas
- Los canvas NO tienen nombres de jugadores, solo "Canvas A", "Canvas B", etc.

### ✅ 2. TIEMPO DE DIBUJO
- Debe durar **2 minutos (120 segundos)**
- El timer cuenta regresivo

### ✅ 3. PALABRAS CORTAS
- Todas las palabras son cortas (máximo 2-3 sílabas)
- Ejemplos: "oso", "pez", "lulo", "arepa", "Cali"

### ✅ 4. AHORCADO DIFÍCIL
- Las pistas muestran SOLO guiones bajos: `_ _ _ _`
- NO se revelan letras automáticamente
- Ejemplo: palabra "gato" → muestra `_ _ _ _` (no "g a t o")

### ✅ 5. SISTEMA DE INTENTOS
- Cada jugador tiene **3 intentos** por palabra
- Si pide una pista → **PIERDE 1 INTENTO** (queda con 2)
- Si falla al adivinar → **PIERDE 1 INTENTO**
- Con 0 intentos → no puede adivinar más esa palabra

### ✅ 6. FASE DE DISCUSIÓN
- Después de 2 minutos de dibujo
- Se muestran todos los canvas **anónimos**
- Los jugadores deben:
  1. **Adivinar la PALABRA** → +200 puntos
  2. **Adivinar QUIÉN dibujó** → +100 puntos bonus

## 🐛 PROBLEMAS CONOCIDOS A VERIFICAR

### ¿El dibujo se sincroniza en TODOS los dispositivos?
- ✅ Si: Cada jugador ve los dibujos de otros en tiempo real
- ❌ No: Solo el anfitrión ve todos los dibujos

### ¿Los canvas están bien organizados?
- ✅ Si: Se ven todos sin hacer scroll
- ❌ No: Necesitas hacer scroll para ver algunos canvas

### ¿Las pistas funcionan correctamente?
- ✅ Si: Al pedir pista, resta 1 intento
- ❌ No: Los intentos no se reducen

## 📝 FLUJO COMPLETO DE PRUEBA

1. **Crear sala** (Jugador 1 - Host)
   - Seleccionar modo "Pictionary Colombiano"
   - Crear sala
   - Copiar código (ejemplo: ABC123)

2. **Unirse a la sala** (Jugador 2, 3, etc.)
   - Ingresar el código ABC123
   - Poner un nombre diferente

3. **Seleccionar categoría** (Host)
   - Elegir categoría (animales, frutas, etc.)
   - Iniciar juego

4. **Fase de Dibujo** (2 minutos)
   - Cada jugador ve su palabra asignada
   - TODOS dibujan al mismo tiempo
   - Verificar que los dibujos se sincronizan entre dispositivos

5. **Fase de Discusión**
   - Ver todos los canvas (Canvas A, B, C...)
   - Intentar adivinar cada palabra
   - Pedir pista si es necesario (cuesta 1 intento)
   - Adivinar quién dibujó cada canvas

6. **Ver resultados**
   - Verificar puntuación
   - Iniciar siguiente ronda

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Servidor corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] Puedo conectar 2+ dispositivos
- [ ] TODOS pueden dibujar simultáneamente
- [ ] Los dibujos se sincronizan en tiempo real
- [ ] Los canvas son anónimos (Canvas A, B, C...)
- [ ] El timer dura 2 minutos
- [ ] Las palabras son cortas
- [ ] El ahorcado muestra solo guiones: `_ _ _ _`
- [ ] Pedir pista resta 1 intento
- [ ] Fallar al adivinar resta 1 intento
- [ ] Con 0 intentos no puedo adivinar
- [ ] Puedo adivinar la palabra (+200 pts)
- [ ] Puedo adivinar el autor (+100 pts)

## 🚀 SIGUIENTE PASO

Una vez que TODO funcione localmente:
1. Hacer commit de los cambios
2. Subir a GitHub
3. Desplegar en Render (backend)
4. Desplegar en Vercel (frontend)
5. Probar en producción

## 📞 SOPORTE

Si algo no funciona:
1. Revisar consola del navegador (F12)
2. Buscar errores en rojo
3. Verificar que el servidor esté corriendo
4. Verificar que la IP sea correcta (si usas celular)
