# 🚀 Deploy en Vercel (100% GRATIS)

## ¿Por qué Vercel?
- ✅ 300 GB ancho de banda/mes GRATIS
- ✅ Despliegues ilimitados
- ✅ Deploy automático desde GitHub
- ✅ Más rápido que Netlify
- ✅ Perfecto para React + Vite

## 📋 Paso a Paso

### 1. Crear cuenta en Vercel
1. Ve a https://vercel.com
2. Click en **"Sign Up"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel

### 2. Importar tu proyecto
1. En el dashboard de Vercel, click **"Add New"** → **"Project"**
2. Busca el repositorio: `victortimana202/impostor-game`
3. Click **"Import"**

### 3. Configurar el proyecto
En la pantalla de configuración:

**Framework Preset:** Vite
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

### 4. Agregar Variables de Entorno
Click en **"Environment Variables"** y agrega:

```
VITE_GROQ_API_KEY=tu_clave_de_groq_aquí
VITE_SOCKET_URL=https://impostor-game-server-i1h5.onrender.com
```

### 5. Deploy
1. Click **"Deploy"**
2. Espera 1-2 minutos
3. ¡Listo! Tu juego estará en: `https://impostor-game-xxxxx.vercel.app`

## 🔄 Deploys Automáticos
Cada vez que hagas `git push` a GitHub, Vercel desplegará automáticamente.

## 🎯 URL Final
Tu juego estará disponible en una URL como:
- `https://impostor-game.vercel.app` (si conectas dominio personalizado)
- `https://impostor-game-victortimana202.vercel.app` (URL por defecto)

## ⚙️ Configuración Adicional (opcional)

### Archivo vercel.json
Ya tienes el archivo `vercel.json` en tu proyecto:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```
Esto asegura que las rutas del SPA funcionen correctamente.

## 📊 Límites Gratuitos de Vercel
- ✅ 100 GB ancho de banda/mes
- ✅ Despliegues ilimitados
- ✅ 100 dominios
- ✅ SSL automático
- ✅ CDN global

## 🆚 Comparación con Netlify
| Feature | Netlify Free | Vercel Free |
|---------|--------------|-------------|
| Ancho de banda | 100 GB/mes | 100 GB/mes |
| Build minutes | 300 min/mes | 6000 min/mes |
| Deploys | Ilimitados | Ilimitados |
| Mejor para | Static sites | React/Next.js |

## 🐛 Troubleshooting

### Error: "Build failed"
- Verifica que las variables de entorno estén configuradas
- Revisa los logs de build en Vercel

### Error: "Socket connection failed"
- Asegúrate de que `VITE_SOCKET_URL` apunte a tu servidor Render
- El servidor debe estar corriendo

### La app se ve en blanco
- Verifica que el Output Directory sea `dist`
- Revisa la consola del navegador para errores

## 📞 Soporte
- Documentación: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Twitter: @vercel

---

**¡Tu juego estará online en menos de 5 minutos!** 🎮
