# 🎤 Solución de Problemas - Chat de Voz

## 🔍 Cómo Ver los Logs

Los logs se muestran en la **Consola del Navegador**:

### Abrir Consola:
- **Chrome/Edge**: Presiona `F12` o `Ctrl+Shift+I`
- **Firefox**: Presiona `F12` o `Ctrl+Shift+K`
- **Safari**: `Cmd+Option+C`

### Buscar Logs de VoiceChat:
En la consola, filtra por: `[VoiceChat]`

---

## 📊 Logs que Verás

### ✅ Inicio Exitoso:
```
🎤 [VoiceChat] Iniciando chat de voz...
🎤 [VoiceChat] RoomCode: ABC123
🎤 [VoiceChat] PlayerName: Juan
✅ [VoiceChat] Navegador soporta getUserMedia
🎤 [VoiceChat] Solicitando permiso de micrófono...
✅ [VoiceChat] Micrófono obtenido: [MediaStreamTrack]
🎤 [VoiceChat] Creando contexto de audio...
✅ [VoiceChat] Contexto de audio creado
🌐 [VoiceChat] Uniéndose a sala de voz...
✅ [VoiceChat] Chat de voz iniciado correctamente
```

### ❌ Errores Comunes:

#### 1. Permiso Denegado:
```
❌ [VoiceChat] Error al acceder al micrófono: NotAllowedError
❌ [VoiceChat] Error name: NotAllowedError
❌ [VoiceChat] Error message: Permission denied
```
**Solución**: Permitir acceso al micrófono en el navegador

#### 2. No Hay Micrófono:
```
❌ [VoiceChat] Error al acceder al micrófono: NotFoundError
❌ [VoiceChat] Error name: NotFoundError
```
**Solución**: Conectar un micrófono o verificar que esté habilitado

#### 3. Micrófono en Uso:
```
❌ [VoiceChat] Error al acceder al micrófono: NotReadableError
❌ [VoiceChat] Error name: NotReadableError
```
**Solución**: Cerrar otras aplicaciones que usen el micrófono

### 🔗 Conexión WebRTC:
```
🔗 [VoiceChat] Creando conexión peer con: socket-id-123
➕ [VoiceChat] Agregando track local: audio
✅ [VoiceChat] Conexión peer creada con: socket-id-123
🔌 [VoiceChat] Estado conexión con socket-id-123: connecting
🧊 [VoiceChat] Estado ICE con socket-id-123: checking
🔌 [VoiceChat] Estado conexión con socket-id-123: connected
🧊 [VoiceChat] Estado ICE con socket-id-123: connected
📥 [VoiceChat] Track remoto recibido de: socket-id-123
✅ [VoiceChat] Audio reproduciendo de: socket-id-123
```

---

## 🔧 Problemas y Soluciones

### 1. 🚫 "No se puede acceder al micrófono"

#### Causa: Permisos del navegador
**Solución**:
1. Click en el **candado** 🔒 en la barra de direcciones
2. Busca "Micrófono"
3. Selecciona "Permitir"
4. Recarga la página (`F5`)

#### Causa: Navegador bloqueado
**Solución**:
- **Chrome**: `chrome://settings/content/microphone`
- **Firefox**: `about:preferences#privacy` → Permisos → Micrófono
- Asegúrate que el sitio no esté bloqueado

---

### 2. 🔇 "No escucho a nadie"

#### Verificar:
```
1. ¿El botón "Deafen" está activado?
   → Desactívalo

2. ¿El volumen está en 0%?
   → Súbelo al 100%

3. ¿Los demás están conectados?
   → Verifica en los logs: "Track remoto recibido de: ..."
```

#### Logs para buscar:
```bash
# Deben aparecer estos logs:
📥 [VoiceChat] Track remoto recibido de: [usuario]
✅ [VoiceChat] Audio reproduciendo de: [usuario]
```

#### Si no aparecen:
- El otro usuario no activó su micrófono
- Problema de conexión WebRTC (firewall)
- Verificar servidor Socket.IO funcionando

---

### 3. 🎤 "Nadie me escucha"

#### Verificar:
```
1. ¿El botón "Mutear" está activado?
   → Desactívalo

2. ¿El micrófono está conectado físicamente?
   → Verifica conexión física

3. ¿Windows detecta el micrófono?
   → Configuración → Sistema → Sonido → Entrada
```

#### Logs para buscar:
```bash
🔇 [VoiceChat] Micrófono ACTIVO
➕ [VoiceChat] Agregando track local: audio
```

#### Si dice "MUTEADO":
- Click en "Mutear" para activar
- Verificar que el track esté enabled

---

### 4. 🌐 "Error de conexión WebRTC"

#### Logs de error:
```
🔌 [VoiceChat] Estado conexión: failed
🧊 [VoiceChat] Estado ICE: failed
```

#### Causas posibles:
1. **Firewall bloqueando WebRTC**
   - Desactivar temporalmente firewall
   - Agregar excepción para el navegador

2. **Servidor Socket.IO caído**
   - Verificar: `http://localhost:3001` o tu URL de producción
   - Debe responder con estado 200

3. **STUN servers no accesibles**
   - Los logs mostrarán: `Estado ICE: failed`
   - Solución: Usar VPN o cambiar red

---

### 5. 🔊 "Audio entrecortado o con eco"

#### Solución:
1. **Usar auriculares** 🎧
   - Evita feedback del micrófono capturando el audio de las bocinas

2. **Verificar internet**
   - Speed test: ¿Más de 1 Mbps?
   - Ping: ¿Menos de 100ms?

3. **Cerrar otras apps**
   - Discord, Zoom, Skype, etc.
   - Liberar ancho de banda

4. **Reiniciar navegador**
   - Cerrar todas las pestañas
   - Abrir de nuevo

---

### 6. ⚠️ "No funciona en móvil"

#### Verificar:
1. **HTTPS requerido**
   - WebRTC requiere conexión segura
   - `http://` no funcionará en móviles
   - Usar `https://` o `localhost`

2. **Permisos del navegador**
   - Android: Chrome > Configuración > Permisos > Micrófono
   - iOS: Safari > Ajustes > Micrófono

3. **Bloqueo de audio automático**
   - iOS bloquea autoplay
   - Usuario debe dar click en "Activar Chat"

---

## 🧪 Cómo Probar

### Prueba Local (2 pestañas):
```bash
1. Abrir http://localhost:5173 en 2 pestañas
2. Crear sala en pestaña 1
3. Unirse en pestaña 2
4. Ambas: Activar chat de voz
5. Hablar en una pestaña
6. Escuchar en la otra
```

**Nota**: Usar auriculares para evitar feedback

### Prueba con 2 Dispositivos:
```bash
Dispositivo 1:
- Crear sala
- Activar chat de voz
- Hablar

Dispositivo 2:
- Unirse a sala
- Activar chat de voz
- Escuchar

Verificar bidireccionalmente
```

---

## 📋 Checklist de Debugging

### Antes de Reportar un Bug:

- [ ] ¿Abrí la consola del navegador? (F12)
- [ ] ¿Busqué logs de `[VoiceChat]`?
- [ ] ¿Aparecen errores rojos (❌)?
- [ ] ¿El micrófono tiene permisos?
- [ ] ¿Probé en otro navegador?
- [ ] ¿Probé con auriculares?
- [ ] ¿El servidor Socket.IO está corriendo?
- [ ] ¿Estoy usando HTTPS (o localhost)?
- [ ] ¿Otros jugadores están conectados?
- [ ] ¿Reinicié el navegador?

---

## 🎯 Estados de Conexión WebRTC

### Estados Normales:
```
connecting → checking → connected
```

### Estados de Error:
```
failed: Conexión falló completamente
disconnected: Conexión perdida (temporal)
closed: Conexión cerrada intencionalmente
```

### ICE Connection States:
```
new → checking → connected → completed
```

**Si se queda en "checking"**: Problema de red/firewall

---

## 🚀 Comandos Útiles para Debugging

### Ver dispositivos de audio:
```javascript
// En la consola del navegador:
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    devices.forEach(d => {
      if (d.kind === 'audioinput') {
        console.log('🎤', d.label, d.deviceId);
      }
    });
  });
```

### Probar micrófono:
```javascript
// Solicitar permiso y ver stream
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Micrófono funciona:', stream.getTracks());
    stream.getTracks().forEach(t => t.stop());
  })
  .catch(err => console.error('❌ Error:', err));
```

### Ver conexiones activas:
```javascript
// En la consola durante el juego:
console.log('Conexiones:', Object.keys(peerConnectionsRef.current).length);
```

---

## 📞 Soporte

Si ninguna solución funciona:

1. **Copia los logs** de la consola (todo el texto)
2. **Describe el problema**:
   - ¿Qué intentaste hacer?
   - ¿Qué esperabas que pasara?
   - ¿Qué pasó realmente?
3. **Información del sistema**:
   - Navegador y versión
   - Sistema operativo
   - ¿Local o producción?
4. **Pasos para reproducir**

---

## ✅ Verificación Final

Después de solucionar problemas:

```
✅ Consola sin errores rojos
✅ Mensaje: "Chat de voz iniciado correctamente"
✅ Indicador verde "En vivo" visible
✅ Al hablar, se detecta actividad de voz
✅ Otros jugadores me escuchan
✅ Yo escucho a otros jugadores
✅ Controles de mute/deafen funcionan
✅ Control de volumen funciona
```

---

**Actualizado**: 4 de Julio, 2026
**Versión**: 2.1.0
