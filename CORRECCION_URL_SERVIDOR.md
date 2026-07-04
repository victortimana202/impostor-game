# 🔧 Corrección URL del Servidor

## ❌ Problema
El servidor de Render tiene la URL correcta:
```
https://impostor-game-server-i1h5.onrender.com
```

Pero la aplicación en Netlify puede tener configurada una URL incorrecta en las variables de entorno.

## ✅ Solución: Actualizar Variable de Entorno en Netlify

### Opción 1: Desde el Panel de Netlify (Recomendado)

1. **Ir a tu sitio en Netlify**
   - https://app.netlify.com/sites/dulcet-starship-db38fc

2. **Ir a Site Configuration → Environment Variables**

3. **Buscar la variable `VITE_SOCKET_URL`**

4. **Cambiar el valor a:**
   ```
   https://impostor-game-server-i1h5.onrender.com
   ```

5. **Guardar y hacer Re-deploy**
   - Ve a Deploys
   - Click en "Trigger deploy" → "Clear cache and deploy site"

6. **Esperar 2-3 minutos** para que se complete el deploy

7. **Probar de nuevo** en https://dulcet-starship-db38fc.netlify.app

### Opción 2: Desde el CLI (Alternativa)

```bash
# Instalar Netlify CLI (si no lo tienes)
npm install -g netlify-cli

# Login
netlify login

# Ver variables actuales
netlify env:list

# Actualizar la variable
netlify env:set VITE_SOCKET_URL https://impostor-game-server-i1h5.onrender.com

# Hacer deploy
netlify deploy --prod
```

## 🔍 Verificar que el Servidor está Arriba

Abre esta URL en tu navegador:
```
https://impostor-game-server-i1h5.onrender.com/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

Si ves un error o tarda mucho, es porque el servidor está despertando (tarda 30-50 segundos en el plan gratuito).

## 📝 Cambios Realizados en el Código

### 1. Timeout Aumentado (socketService.js)
- **Antes**: 5 segundos
- **Ahora**: 30 segundos
- **Motivo**: Dar tiempo al servidor de Render a despertar

### 2. Health Check Endpoint (server.js)
- **Nuevo endpoint**: `/health`
- **Propósito**: Verificar que el servidor está funcionando
- **También agregado**: `/` que muestra info del servidor

### 3. Mensaje de Espera (OnlineLobby.jsx)
- **Mensaje mejorado**: "⏳ Despertando servidor... Puede tardar hasta 30 segundos si está dormido."
- **Mejor feedback** al usuario mientras espera

## 🚀 Para Probar Localmente

Si quieres probar apuntando al servidor de producción desde tu localhost:

1. **Editar `.env`:**
   ```
   VITE_SOCKET_URL=https://impostor-game-server-i1h5.onrender.com
   VITE_GROQ_API_KEY=tu_api_key_de_groq_aqui
   ```

2. **Reiniciar el servidor de desarrollo:**
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

3. **Probar** en http://localhost:5173

## 🔄 Después de Actualizar Netlify

1. **Espera** 2-3 minutos para el deploy
2. **Refresca** la página en Netlify (Ctrl + Shift + R para forzar recarga)
3. **Abre F12** → Console para ver logs
4. **Intenta crear** una sala de nuevo
5. **Debería funcionar** (puede tardar 30 segundos la primera vez)

## ⏰ Importante sobre Render Free Tier

- El servidor **se duerme** después de 15 minutos de inactividad
- **Tarda 30-50 segundos** en despertar
- La **primera conexión** siempre será lenta
- **Solución**: Usar un servicio de "ping" o migrar a un plan de pago

## 🆘 Si Sigue Sin Funcionar

1. **Verifica** que el servidor esté arriba:
   - https://impostor-game-server-i1h5.onrender.com/health

2. **Verifica** la configuración en Netlify:
   - Site Configuration → Environment Variables
   - Debe decir: `https://impostor-game-server-i1h5.onrender.com`

3. **Limpia** caché del navegador:
   - Ctrl + Shift + Delete
   - Selecciona "Caché" y "Cookies"
   - Limpia y recarga

4. **Prueba** en modo incógnito

5. **Revisa** logs en consola (F12)
   - Busca `[SocketService]` para ver intentos de conexión
