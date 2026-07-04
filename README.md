# 🎭 El Impostor - Juego de Cultura General

Juego completo tipo impostor con preguntas de cultura general generadas por IA usando Groq API.

## 🎮 Modos de Juego

### 🎭 Modo Impostor (Clásico)

#### 📱 Mismo Dispositivo (Local)
- Todos juegan desde el mismo teléfono/computadora
- Perfecto para reuniones presenciales
- Pasan el dispositivo de mano en mano

#### 🌐 En Línea (Multijugador)
- Cada jugador desde su propio dispositivo
- Juega desde diferentes lugares
- Ideal para videollamadas o a distancia
- Crea una sala y comparte el código
- **Incluye**:
  - 🎤 Chat de voz WebRTC
  - ✏️ Pizarra de dibujo colaborativa para discusiones

### 🎨 Modo Pictionary (Dibuja y Adivina) - NUEVO

**Solo disponible en modo En Línea**

- **Todos dibujan simultáneamente** en sus propios dispositivos
- **Todos ven todos los dibujos** en tiempo real
- Primer jugador en adivinar la palabra gana puntos
- 5 rondas de 40 segundos cada una
- Puntos basados en velocidad (más rápido = más puntos)
- Canvas profesional con 18 colores y herramientas
- Sistema de puntuación: 100-400 puntos por ronda

## 🚀 Instalación

```bash
npm install
```

## 🎯 Ejecutar el Juego

### Modo Local (solo navegador)
```bash
npm run dev
```
Abre: http://localhost:5173

### Modo Completo (Local + En Línea)
```bash
npm run dev:full
```
- Cliente: http://localhost:5173
- Servidor: http://localhost:3001

## 📖 Cómo jugar

### 🎭 Modo Impostor

1. **Selecciona el modo**: Mismo dispositivo o En línea
2. **Configura**: Jugadores, impostores, tiempo, dificultad, pista
3. **Revelar roles**: Cada jugador ve su rol en privado
4. **Discutir**: Describe tu palabra sin decirla directamente
5. **Votar**: Elimina a quien crees que es el impostor
6. **Ganar**: Ciudadanos eliminan al impostor, o impostor sobrevive

**🎯 Objetivo:**
- **Ciudadanos**: Todos tienen LA MISMA palabra - identificar al impostor
- **Impostor**: No tiene palabra (o recibe pista confusa) - actuar como ciudadano

### 🎨 Modo Pictionary

1. **Crea una sala en línea** y selecciona "Dibuja y Adivina"
2. **Espera a que todos se unan** (mínimo 2 jugadores)
3. **Ronda comienza**: Todos ven la palabra oculta (solo guiones)
4. **TODOS dibujan** intentando representar la palabra
5. **TODOS ven** los dibujos de todos en tiempo real
6. **Adivina escribiendo** la respuesta en el campo de texto
7. **Primer en acertar** gana puntos basados en tiempo restante
8. **5 rondas totales** - Jugador con más puntos gana

**🎯 Objetivo:**
- Ser el primero en adivinar la palabra secreta
- Ganar más puntos adivinando rápido
- Acumular más puntos al final de 5 rondas

## ⚙️ Configuración Disponible

- **Jugadores**: 2-12 personas
- **Impostores**: 1 a máx 1/3 de jugadores
- **Tiempo**: 30s - 3 min por discusión
- **Dificultad**: Fácil, Mixto, Difícil
- **Pista Impostor**: Con o sin pista

## 🛠️ Tecnologías

- React + Vite
- Socket.IO (multijugador)
- Groq API (Llama 3.1)
- Express (servidor)
- CSS-in-JS

## 🌐 Modo En Línea

### Para el Anfitrión:
1. Selecciona "En Línea (Diferentes Lugares)"
2. Click en "Crear Sala"
3. Ingresa tu nombre
4. Comparte el código de 6 dígitos con tus amigos
5. Espera a que todos se unan
6. Configura el juego (impostores, tiempo, etc.)
7. Click en "Iniciar Juego"

### Para los Invitados:
1. Selecciona "En Línea (Diferentes Lugares)"
2. Click en "Unirse a Sala"
3. Ingresa tu nombre
4. Ingresa el código de sala que te compartieron
5. Marca "Listo" cuando estés preparado
6. Espera a que el anfitrión inicie

### Durante el Juego:
- Todos ven la misma pantalla en tiempo real
- Pueden estar en videollamada mientras juegan
- Los votos se sincronizan automáticamente
- El anfitrión controla el flujo del juego

## 📱 Modo Local vs Online

| Característica | Local | Online |
|----------------|-------|--------|
| Dispositivos | 1 compartido | Cada uno el suyo |
| Ubicación | Mismo lugar | Cualquier lugar |
| Revelación de roles | Pasando el dispositivo | Cada uno ve en su pantalla |
| Mejor para | Reuniones presenciales | Videollamadas/distancia |
| Internet | No necesario | Requerido |
