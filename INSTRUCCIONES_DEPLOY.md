# 🚀 Instrucciones para Re-Deploy (Versión 2.0.0)

## 📋 Cambios en esta Versión

Esta versión incluye el **nuevo modo Pictionary** y requiere re-despliegue tanto del frontend como del backend.

---

## 🔄 Actualizar Código en GitHub

### 1. Verificar cambios locales
```bash
git status
```

### 2. Agregar todos los archivos nuevos y modificados
```bash
git add .
```

### 3. Commit con mensaje descriptivo
```bash
git commit -m "feat: Modo Pictionary completo + Voice Chat + Drawing Board profesional

- Nuevo modo de juego Pictionary (todos dibujan y adivinan)
- Chat de voz WebRTC funcional
- Pizarra de dibujo profesional con 32 colores
- Fix bug Nueva Ronda en modo online
- Sincronización en tiempo real vía Socket.IO
- Documentación completa

Version: 2.0.0"
```

### 4. Push a GitHub
```bash
git push origin main
```

---

## ☁️ Re-Deploy Frontend (Netlify)

### Opción A: Deploy Automático (Recomendado)
Si conectaste Netlify con tu repositorio de GitHub:
1. **Netlify detectará el push automáticamente**
2. Iniciará un nuevo build
3. Desplegará en 2-3 minutos
4. Verifica en: https://app.netlify.com/sites/TU_SITIO/deploys

### Opción B: Deploy Manual
Si no conectaste GitHub:
1. Construye el proyecto localmente:
   ```bash
   npm run build
   ```
2. Ve a https://app.netlify.com
3. Arrastra la carpeta `dist/` al área de deploy
4. Espera a que se complete

### ✅ Verificar Variables de Entorno
1. Ve a: https://app.netlify.com/sites/TU_SITIO/settings/deploys
2. Click en "Environment variables"
3. Verifica que estén configuradas:
   ```
   VITE_GROQ_API_KEY = tu_api_key
   VITE_SOCKET_URL = https://impostor-game-server-1ih5.onrender.com
   ```

---

## 🖥️ Re-Deploy Backend (Render)

### Opción A: Deploy Automático (Recomendado)
Si conectaste Render con tu repositorio de GitHub:
1. **Render detectará el push automáticamente**
2. Iniciará un nuevo deploy
3. Desplegará en 3-5 minutos
4. Verifica en: https://dashboard.render.com/web/TU_SERVICIO

### Opción B: Deploy Manual
Si no conectaste GitHub:
1. Ve a: https://dashboard.render.com
2. Selecciona tu servicio
3. Click en "Manual Deploy" → "Deploy latest commit"
4. Espera a que se complete

### ✅ Verificar Configuración del Servidor
1. Ve a: https://dashboard.render.com/web/TU_SERVICIO/settings
2. Verifica:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node
   - **Port**: 3001 (o el que asignó Render)

---

## 🧪 Probar el Deploy

### 1. Verificar Frontend
```bash
# Abre en el navegador
https://dulcet-starship-db38fc.netlify.app
```
**Debe verse:**
- La página principal sin errores
- Selector de modo de juego
- Sin errores en la consola (F12)

### 2. Verificar Backend
```bash
# En la terminal o en el navegador
curl https://impostor-game-server-1ih5.onrender.com
```
**Debe responder:**
- Estado HTTP 200 o similar
- El servidor está corriendo

### 3. Probar Modo Online
1. Abre el juego en el navegador
2. Selecciona "En Línea (Diferentes Lugares)"
3. Crea una sala
4. Abre otra pestaña o dispositivo
5. Únete a la sala
6. Verifica que ambos se vean en la lista

### 4. Probar Modo Pictionary
1. Desde el lobby, selecciona "🎨 Dibuja y Adivina"
2. Inicia el juego
3. Verifica que aparezca la palabra oculta
4. Dibuja algo y verifica en otra pestaña
5. Intenta adivinar la palabra
6. Verifica que los puntos se actualicen

### 5. Probar Chat de Voz
1. Inicia un juego en modo Impostor
2. Habilita el micrófono
3. Habla en una pestaña
4. Escucha en otra pestaña
5. Prueba los controles de mute/volumen

---

## 🐛 Solución de Problemas

### Frontend no se actualiza
```bash
# Limpia cache del navegador
Ctrl + Shift + Delete → Limpiar todo

# O fuerza recarga
Ctrl + F5
```

### Backend no responde
```bash
# Verifica logs en Render
https://dashboard.render.com/web/TU_SERVICIO/logs

# Busca errores como:
# - Module not found
# - Syntax errors
# - Port binding errors
```

### Socket.IO no conecta
```bash
# Verifica en la consola del navegador (F12)
# Debe ver:
"Conectado al servidor"

# Si ves:
"Error de conexión" o "ERR_CONNECTION_REFUSED"

# Revisa VITE_SOCKET_URL en Netlify
```

### Variables de entorno incorrectas
```bash
# Netlify
1. Site settings → Environment variables
2. Edita VITE_GROQ_API_KEY y VITE_SOCKET_URL
3. Redeploy: Deploys → Trigger deploy → Clear cache and deploy

# Render
1. Dashboard → Environment
2. Edita las variables
3. Guarda → Auto-redeploy
```

---

## 📊 Checklist Post-Deploy

- [ ] Frontend accesible sin errores
- [ ] Backend responde correctamente
- [ ] Socket.IO conecta sin problemas
- [ ] Modo Impostor funciona (local y online)
- [ ] Modo Pictionary funciona completamente
- [ ] Chat de voz funciona
- [ ] Pizarra de dibujo sincroniza
- [ ] Nueva ronda funciona sin bugs
- [ ] No hay errores en consola
- [ ] Todas las imágenes/recursos cargan

---

## 🔍 Monitoreo Post-Deploy

### Primeros 30 minutos
1. Verifica que el sitio cargue rápidamente
2. Prueba crear/unirse a salas
3. Juega al menos 1 partida completa de cada modo
4. Verifica logs del servidor (Render) para errores

### Primera semana
1. Revisa analytics de Netlify (si configurado)
2. Monitorea uso de ancho de banda en Render
3. Verifica tiempo de carga y uptime
4. Busca feedback de usuarios

---

## 🎉 ¡Deploy Completado!

Si todos los checks pasan, el deploy está completo y funcional.

**URLs de Producción:**
- 🌐 Frontend: https://dulcet-starship-db38fc.netlify.app
- 🖥️ Backend: https://impostor-game-server-1ih5.onrender.com

**Comparte el enlace y disfruta jugando! 🎮**

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de Render
2. Revisa la consola del navegador (F12)
3. Verifica que las variables de entorno estén correctas
4. Intenta un redeploy limpio (Clear cache and deploy)

---

**Última actualización**: 4 de Julio, 2026
**Versión desplegada**: 2.0.0
