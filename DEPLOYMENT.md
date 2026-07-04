# 🚀 Guía de Despliegue

## Despliegue Local (Desarrollo)

### Requisitos Previos
- Node.js 16+ instalado
- npm o yarn

### Instalación
```bash
npm install
```

### Ejecutar

#### Solo Modo Local
```bash
npm run dev
```
Abre: http://localhost:5173

#### Modo Completo (Local + Online)
```bash
npm run dev:full
```
- Cliente: http://localhost:5173
- Servidor WebSocket: http://localhost:3001

---

## Despliegue en Producción

### Opción 1: Vercel (Solo Frontend - Modo Local)

1. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
npm run build
vercel --prod
```

**Nota**: Solo funciona el modo "Mismo Dispositivo" sin el servidor.

### Opción 2: Heroku (Frontend + Backend - Ambos Modos)

1. **Crear `Procfile`**
```
web: concurrently "node server.js" "npm run preview -- --port $PORT"
```

2. **Configurar variables de entorno**
```bash
heroku config:set NODE_ENV=production
```

3. **Deploy**
```bash
git push heroku main
```

### Opción 3: Railway (Recomendado - Ambos Modos)

1. **Conecta tu repositorio a Railway**
2. **Configura el comando de inicio**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run dev:full`
3. **Railway asigna automáticamente el puerto**

### Opción 4: Render (Dos servicios separados)

#### Servicio 1: Backend (WebSocket)
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Port**: 3001

#### Servicio 2: Frontend
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview`
- **Environment Variable**: 
  - `VITE_SOCKET_URL=https://tu-backend.onrender.com`

---

## Variables de Entorno

### Para Producción

Crea un archivo `.env` con:

```env
# URL del servidor WebSocket (producción)
VITE_SOCKET_URL=https://tu-servidor.com

# Puerto del servidor (opcional)
PORT=3001
```

---

## Configuración de CORS

Si despliega frontend y backend en diferentes dominios, actualiza `server.js`:

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://tu-dominio-frontend.com"
    ],
    methods: ["GET", "POST"]
  }
});
```

---

## Verificación Post-Deploy

### Checklist
- [ ] El sitio carga correctamente
- [ ] Modo "Mismo Dispositivo" funciona
- [ ] Se puede crear una sala en modo "En Línea"
- [ ] Se puede unir a una sala con código
- [ ] La sincronización funciona entre dispositivos
- [ ] La API de Groq responde correctamente

### Probar Modo Online
1. Abre el sitio en dos navegadores/dispositivos diferentes
2. Crea una sala en uno
3. Únete con el código en el otro
4. Inicia el juego y verifica que se sincronice

---

## Solución de Problemas

### El modo online no conecta
- Verifica que el servidor WebSocket esté corriendo
- Revisa la variable `VITE_SOCKET_URL`
- Comprueba la configuración de CORS
- Revisa los logs del servidor

### Error de API Groq
- Verifica que la clave API sea válida
- Comprueba límites de rate en Groq
- Revisa la conexión a internet

### Problemas de WebSocket en producción
- Algunos proveedores requieren configuración especial para WebSockets
- Asegúrate de que el puerto esté expuesto correctamente
- Considera usar `wss://` (WebSocket Secure) en producción

---

## Monitoreo

### Logs importantes
```bash
# Ver logs del servidor
heroku logs --tail

# O en Railway/Render desde el dashboard
```

### Métricas a monitorear
- Número de salas activas
- Conexiones WebSocket concurrentes
- Tiempo de respuesta de Groq API
- Errores de conexión

---

## Escalabilidad

Para escalar el modo online:

### Opción 1: Redis Adapter (Socket.IO)
```javascript
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

### Opción 2: Múltiples instancias
- Usa un balanceador de carga
- Implementa sticky sessions
- Considera servicios como Socket.IO Redis

---

## Seguridad

### Recomendaciones
1. **Rate Limiting**: Limita solicitudes a la API
2. **Validación**: Valida todos los datos del cliente
3. **HTTPS**: Siempre usa HTTPS en producción
4. **WebSocket Secure**: Usa `wss://` en lugar de `ws://`
5. **Secrets**: Nunca expongas la clave de Groq en el frontend

### Implementar Rate Limiting
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de requests
});

app.use('/api/', limiter);
```
