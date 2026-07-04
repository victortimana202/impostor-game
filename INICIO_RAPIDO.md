# 🚀 Inicio Rápido - El Impostor

## ⚡ En 3 Pasos

### 1️⃣ Instalar
```bash
npm install
```

### 2️⃣ Ejecutar
```bash
# Para ambos modos (recomendado)
npm run dev:full

# O solo modo local
npm run dev
```

### 3️⃣ Abrir
Navega a: **http://localhost:5173**

---

## 🎮 Jugar Localmente (Mismo Dispositivo)

1. Selecciona **"Mismo Dispositivo"**
2. Agrega nombres de jugadores
3. Configura:
   - Número de impostores
   - Tiempo de discusión
   - Dificultad
   - Pista para impostor (Sí/No)
4. Click en **"¡Comenzar partida!"**
5. Cada jugador ve su rol en privado (arrastra hacia abajo)
6. ¡A discutir y votar!

---

## 🌐 Jugar Online (Diferentes Lugares)

### Como Anfitrión:
1. Selecciona **"En Línea"**
2. Click en **"Crear Sala"**
3. Ingresa tu nombre
4. Comparte el **código de 6 dígitos** con tus amigos
5. Espera a que se unan
6. Configura el juego
7. Click en **"Iniciar Juego"**

### Como Invitado:
1. Selecciona **"En Línea"**
2. Click en **"Unirse a Sala"**
3. Ingresa tu nombre
4. Ingresa el código de sala
5. Click en **"Marcar Listo"**
6. Espera al inicio

---

## 🎯 Reglas Básicas

### Objetivo
- **Ciudadanos**: Encontrar al impostor
- **Impostor**: No ser descubierto

### Cómo Jugar
1. Cada jugador recibe un rol (ciudadano o impostor)
2. Los ciudadanos ven una **palabra secreta** (todos la misma)
3. El impostor NO ve la palabra (o ve una pista falsa)
4. Discuten y describen sin decir la palabra
5. Votan para eliminar al sospechoso
6. Gana quien cumpla su objetivo primero

---

## ⚙️ Configuración Recomendada

### Para Principiantes
- **Jugadores**: 4-6
- **Impostores**: 1
- **Tiempo**: 90 segundos
- **Dificultad**: Fácil o Mixto
- **Pista**: ✅ Activada

### Para Expertos
- **Jugadores**: 6-10
- **Impostores**: 2
- **Tiempo**: 60 segundos
- **Dificultad**: Difícil
- **Pista**: ❌ Desactivada

---

## 📱 Requisitos

### Para Modo Local
- ✅ 1 dispositivo (celular o computadora)
- ✅ Navegador moderno
- ❌ No requiere internet (solo para generar palabras)

### Para Modo Online
- ✅ 1 dispositivo por jugador
- ✅ Navegador moderno
- ✅ Conexión a internet
- ✅ Servidor corriendo (automático con `npm run dev:full`)

---

## 🐛 Problemas Comunes

### No se genera la palabra
❌ **Problema**: Error al conectar con la IA
✅ **Solución**: Verifica tu conexión a internet

### No puedo unirme a la sala
❌ **Problema**: Código inválido o servidor no corriendo
✅ **Solución**: 
- Verifica el código (6 caracteres)
- Asegúrate de usar `npm run dev:full` (no solo `npm run dev`)

### Los jugadores no se sincronizan
❌ **Problema**: WebSocket desconectado
✅ **Solución**: Recarga la página en todos los dispositivos

---

## 💡 Tips

### Para Mejor Experiencia
1. **Usa videollamada** en modo online (Discord, Zoom, etc.)
2. **Ten paciencia** al revelar roles en modo local
3. **Lee las descripciones** con atención
4. **No reveles** la palabra directamente
5. **Diviértete** - es solo un juego

### Trucos de Estrategia
- **Ciudadanos**: Sé específico pero no obvio
- **Impostor**: Escucha primero, habla después
- **Observa** las dudas y gestos
- **Acusa** si ves algo sospechoso

---

## 📞 Soporte

### Recursos
- 📖 [README.md](README.md) - Documentación completa
- 🎮 [GUIA_JUEGO.md](GUIA_JUEGO.md) - Reglas detalladas
- 🚀 [DEPLOYMENT.md](DEPLOYMENT.md) - Despliegue en producción
- ✨ [CARACTERISTICAS.md](CARACTERISTICAS.md) - Lista de características

### ¿Encontraste un bug?
Revisa la consola del navegador (F12) para ver errores y repórtalos.

---

## 🎉 ¡A Jugar!

Ya está todo listo. ¡Disfruta del juego! 🎭

**Servidores corriendo:**
- 🎮 Cliente: http://localhost:5173
- 🔌 WebSocket: http://localhost:3001

---

**¡Que gane el mejor detective (o el mejor mentiroso)!** 🕵️✨
