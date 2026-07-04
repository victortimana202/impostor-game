# 🧪 Instrucciones de Prueba - Pictionary V3

## ✅ Cambios Implementados

### 1. **Cada jugador recibe su propia palabra**
- Ya NO es la misma palabra para todos
- Cada uno dibuja algo diferente

### 2. **Todos dibujan al mismo tiempo**
- En el MISMO canvas
- Ves los dibujos de otros en tiempo real

### 3. **Palabras 100% colombianas**
- 90+ palabras en 6 categorías
- Selector de categoría al inicio del juego

### 4. **Chat de voz WebRTC corregido**
- Ahora inicia conexiones automáticamente
- Logs completos para debugging

## 🎮 Cómo Probar

### Opción A: Producción (Netlify + Render)

1. **Dispositivo 1** - Ir a: https://dulcet-starship-db38fc.netlify.app
   - Click en "🌐 Modo Online"
   - Click en "🎨 Crear Sala"
   - Copiar el código de 6 letras
   - Seleccionar "Pictionary" en el dropdown
   - Click en "🚀 Iniciar Juego"

2. **Dispositivo 2** - Ir a: https://dulcet-starship-db38fc.netlify.app
   - Click en "🌐 Modo Online"
   - Pegar el código de sala
   - Click en "🚪 Unirse a Sala"
   - Esperar que el host inicie

3. **Verificar:**
   - ✅ Ambos ven pantalla de selección de categoría
   - ✅ Host selecciona (ej: Animales de Colombia)
   - ✅ Cada uno ve SU PROPIA palabra diferente arriba
   - ✅ Ambos pueden dibujar en el mismo canvas
   - ✅ Los dibujos aparecen en tiempo real en ambos dispositivos

### Opción B: Local (Desarrollo)

#### Terminal 1 - Backend
```bash
cd D:\impostor
node server.js
```
Debe decir: `🎮 Servidor de juego corriendo en puerto 3001`

#### Terminal 2 - Frontend
```bash
cd D:\impostor
npm run dev
```
Debe decir: `Local: http://localhost:5173/`

#### Probar con 2 ventanas
- Ventana 1: http://localhost:5173 (incógnito)
- Ventana 2: http://localhost:5173 (normal)

## 🔍 Qué Verificar

### ✅ Dibujos en tiempo real
1. Dibuja algo en Dispositivo 1
2. **DEBE aparecer inmediatamente en Dispositivo 2**
3. Si NO aparece:
   - Presiona F12
   - Ve a Console
   - Busca `🖊️ [PictionaryGame]` (debe estar enviando)
   - Busca `📥 [PictionaryGame] Dibujo recibido` (debe estar recibiendo)

### ✅ Palabras diferentes
1. En Dispositivo 1: Mira la palabra arriba (ej: "jaguar")
2. En Dispositivo 2: Debe ser DIFERENTE (ej: "cóndor")
3. Ambos dibujan en el mismo canvas

### ✅ Chat de voz
1. En AMBOS dispositivos:
   - Scroll hacia abajo
   - Click en "🎙️ Activar Chat de Voz"
   - Dar permiso al micrófono
2. Habla desde Dispositivo 1
3. **DEBE escucharse en Dispositivo 2**
4. Si NO funciona:
   - Presiona F12 → Console
   - Busca estos logs:
     - `✅ [VoiceChat] Micrófono obtenido`
     - `📤 [VoiceChat] Oferta enviada`
     - `📥 [VoiceChat] Recibiendo offer`
     - `✅ [VoiceChat] Audio reproduciendo`

### ✅ Fase de discusión
1. Espera a que termine el tiempo (60 segundos)
2. Pasa automáticamente a "💬 Fase de Discusión"
3. Muestra TODAS las palabras que había
4. Host puede terminar la ronda

### ✅ Selector de categorías
Al iniciar el juego, el HOST debe ver:
- 🎲 Todas las categorías
- 🐆 Animales de Colombia
- 🍊 Frutas de Colombia  
- 🎬 Películas/Series
- 🇨🇴 Cultura General
- 🗺️ Lugares de Colombia

## ❌ Problemas Conocidos y Soluciones

### Problema: Dibujos NO se sincronizan

**Síntomas:**
- Dibujas pero el otro no ve nada

**Solución:**
1. Abre F12 → Console en AMBOS dispositivos
2. Busca errores en rojo
3. Verifica que el servidor esté corriendo
4. Verifica la URL del socket en `.env`:
   ```
   VITE_SOCKET_URL=https://impostor-game-server-1ih5.onrender.com
   ```

### Problema: Micrófonos NO transmiten audio

**Síntomas:**
- Dice "Conectado" pero no se escucha nada

**Solución:**
1. Verifica permisos del navegador (icono de candado en la barra)
2. Abre F12 → Console
3. Busca `❌ [VoiceChat]` para ver errores
4. **IMPORTANTE**: WebRTC requiere HTTPS o localhost
   - Funciona en: localhost, Netlify (HTTPS)
   - NO funciona en: HTTP sin SSL

### Problema: No se ven las palabras

**Síntomas:**
- Pantalla en blanco o "undefined"

**Solución:**
1. Verifica que `colombianWords.js` esté en `src/services/`
2. Refresca la página (Ctrl + R)
3. Revisa console por errores de import

## 📱 Mejores Prácticas

### Para probar con 2 teléfonos:
1. Conecta ambos a la misma WiFi
2. Usa la URL de producción (Netlify)
3. Da permisos de micrófono cuando lo pida
4. Usa auriculares para evitar eco

### Para probar en PC:
1. Ventana normal + ventana incógnito
2. O Chrome + Firefox
3. Auriculares en uno, altavoz en otro
4. F12 siempre abierto para ver logs

## 🎯 Checklist Completo

- [ ] Servidor corriendo (local O Render)
- [ ] Frontend corriendo (local O Netlify)
- [ ] 2 dispositivos/ventanas conectados
- [ ] Ambos en el lobby
- [ ] Host inicia Pictionary
- [ ] Host selecciona categoría
- [ ] **Ambos ven palabras DIFERENTES**
- [ ] **Ambos pueden dibujar simultáneamente**
- [ ] **Dibujos aparecen en tiempo real**
- [ ] Pueden escribir y adivinar
- [ ] Chat de voz funciona
- [ ] Después de 60s pasa a discusión
- [ ] Se muestran todas las palabras
- [ ] Host puede terminar ronda

## 🆘 Si Nada Funciona

1. **Cierra TODO**
2. **Abre terminal nueva:**
   ```bash
   cd D:\impostor
   git pull origin main
   npm install
   node server.js
   ```
3. **Terminal nueva 2:**
   ```bash
   cd D:\impostor
   npm run dev
   ```
4. **Abre 2 ventanas en incógnito**
5. **Prueba de nuevo**

## 📞 URLs Importantes

- **Frontend Producción**: https://dulcet-starship-db38fc.netlify.app
- **Backend Producción**: https://impostor-game-server-1ih5.onrender.com
- **Frontend Local**: http://localhost:5173
- **Backend Local**: http://localhost:3001
- **Repositorio GitHub**: https://github.com/victortimana202/impostor-game

## 🎉 Resultado Esperado

Al final deberías ver:
- ✅ 2 dispositivos jugando al mismo tiempo
- ✅ Cada uno con una palabra diferente de Colombia
- ✅ Dibujos sincronizados en tiempo real
- ✅ Pueden hablar por voz mientras juegan
- ✅ 5 rondas completas con puntuaciones
