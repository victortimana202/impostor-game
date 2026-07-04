# ✨ Características Completas del Juego

## 🎮 Funcionalidades Principales

### ✅ Dos Modos de Juego
- **📱 Mismo Dispositivo (Local)**
  - Un solo dispositivo compartido
  - Revelación de roles en privado con arrastre
  - Ideal para reuniones presenciales
  - No requiere internet para jugar

- **🌐 En Línea (Multijugador)**
  - Cada jugador en su dispositivo
  - Sistema de salas con códigos únicos de 6 dígitos
  - Sincronización en tiempo real con WebSocket
  - Ideal para videollamadas y juego remoto

### 🎯 Mecánicas del Juego
- **Roles dinámicos**: Ciudadanos e Impostores
- **Palabra secreta**: Todos los ciudadanos reciben la misma palabra
- **Impostor ciego**: Opción de darle pista o dejarlo sin información
- **Sistema de votación**: Turno por turno con eliminación
- **Rondas múltiples**: Continúa hasta encontrar al impostor
- **Condiciones de victoria**: Múltiples escenarios de finalización

### 🤖 Integración con IA
- **Groq API** con modelo Llama 3.1
- Generación dinámica de palabras únicas cada partida
- Tres niveles de dificultad
- Categorías variadas (animales, objetos, deportes, profesiones, etc.)
- Generación de pistas confusas para el impostor

### ⚙️ Configuración Completa
- **Jugadores**: 2 a 12 personas
- **Impostores**: 1 hasta ⅓ de los jugadores
- **Tiempo de discusión**: 30 segundos a 3 minutos
- **Dificultad**: Fácil, Mixto, Difícil
- **Pista para impostor**: Activar/desactivar

---

## 🎨 Interfaz y Diseño

### 💎 Diseño Moderno
- **Glassmorphism**: Efectos de vidrio esmerilado
- **Gradientes dinámicos**: Colores vibrantes y atractivos
- **Animaciones fluidas**: Transiciones suaves
- **Iconos expresivos**: Emojis para mejor UX
- **Dark theme**: Diseño oscuro moderno

### 📱 Responsive
- **Mobile-first**: Optimizado para teléfonos
- **Tablet-friendly**: Se adapta a tablets
- **Desktop**: Funciona perfectamente en computadoras
- **Touch-optimized**: Gestos táctiles suaves

### 🎭 Revelación de Roles Interactiva
- **Arrastre para revelar**: Gesto intuitivo
- **Barra de progreso**: Feedback visual
- **Animaciones**: Transición suave al revelar
- **Privacidad**: Se oculta automáticamente entre jugadores
- **Confirmación**: Botón para pasar al siguiente

### 🎨 Componentes Visuales
- **Avatares de colores**: 12 colores únicos para jugadores
- **Badges informativos**: Pills con categorías
- **Cards elevadas**: Profundidad con sombras
- **Timers circulares**: Cuenta regresiva animada
- **Progreso visual**: Dots para estados

---

## 🌐 Sistema Multijugador Online

### 🔌 WebSocket con Socket.IO
- **Conexión en tiempo real**: Latencia mínima
- **Sincronización automática**: Todos ven lo mismo
- **Reconexión**: Manejo de desconexiones
- **Eventos optimizados**: Solo envía cambios necesarios

### 🎯 Sistema de Salas
- **Códigos únicos**: 6 caracteres alfanuméricos
- **Creación fácil**: Un click para crear sala
- **Join rápido**: Código + nombre
- **Límite de jugadores**: Hasta 12 por sala
- **Lobby visual**: Ver quién está en la sala

### 👑 Roles en la Sala
- **Anfitrión**: 
  - Crea la sala
  - Configura el juego
  - Inicia la partida
  - Controla el flujo
  
- **Invitados**:
  - Se unen con código
  - Marcan "Listo"
  - Esperan inicio
  - Juegan sincronizados

### 📡 Sincronización
- **Estado del juego**: Fase actual compartida
- **Votos en tiempo real**: Todos ven los votos
- **Eliminaciones**: Actualización instantánea
- **Temporizador**: Compartido entre todos

---

## 🎲 Características del Gameplay

### 💬 Fase de Discusión
- **Temporizador visual**: Círculo animado con colores
- **Lista de jugadores vivos**: Quién sigue en juego
- **Historial de eliminados**: Quién fue eliminado y por qué
- **Categoría visible**: Pista del tipo de palabra

### 🗳️ Sistema de Votación
- **Turno por turno**: Un voto a la vez
- **Indicador visual**: Quién está votando ahora
- **Progreso**: Dots mostrando avance
- **Selección clara**: Feedback visual al votar
- **No auto-voto**: No puedes votarte a ti mismo

### 📊 Resultados y Estadísticas
- **Revelación del impostor**: Quién era realmente
- **Palabra secreta**: Mostrar la palabra al final
- **Historial de votaciones**: Todas las rondas
- **Resumen de votos**: Quién votó por quién
- **Pista del impostor**: Si tuvo ayuda, mostrarla

### 🔄 Continuidad del Juego
- **Rondas múltiples**: Si no aciertan, continúa
- **Eliminaciones progresivas**: Reducir jugadores
- **Victoria por mayoría**: Impostores ≥ Ciudadanos
- **Mensaje intermedio**: Feedback al eliminar jugador

---

## 🛡️ Seguridad y Privacidad

### 🔒 Privacidad
- **Roles privados**: Solo cada jugador ve su rol
- **Reseteo automático**: Cartas se ocultan entre turnos
- **Sin historial visible**: No se guarda info sensible

### 🔐 Validaciones
- **Nombres únicos**: No repetir en misma sala
- **Códigos válidos**: 6 caracteres alfanuméricos
- **Límites de jugadores**: Mínimo 2, máximo 12
- **Configuración válida**: Impostores no pueden exceder ⅓

---

## ⚡ Performance

### 🚀 Optimizaciones
- **Code splitting**: Carga solo lo necesario
- **Lazy loading**: Componentes bajo demanda
- **Memoization**: Evita re-renders innecesarios
- **WebSocket eficiente**: Solo eventos relevantes

### 📦 Bundle
- **Vite**: Build ultra rápido
- **Tree shaking**: Elimina código no usado
- **Minificación**: Código comprimido
- **Caché optimizado**: Recursos en caché

---

## 🎯 Accesibilidad

### ♿ Características
- **Alto contraste**: Textos legibles
- **Tamaños grandes**: Botones táctiles amplios
- **Feedback visual**: Siempre información clara
- **Instrucciones claras**: Texto descriptivo
- **Iconos universales**: Emojis reconocibles

---

## 📱 Compatibilidad

### 🌍 Navegadores
- ✅ Chrome/Edge (Chromium) 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+
- ✅ Navegadores móviles modernos

### 📱 Dispositivos
- ✅ iPhone (iOS 14+)
- ✅ Android (7.0+)
- ✅ Tablets
- ✅ Desktop/Laptop
- ✅ Pantallas táctiles

---

## 🔧 Tecnologías Utilizadas

### Frontend
- **React 18**: UI library
- **Vite**: Build tool ultra rápido
- **CSS-in-JS**: Estilos en componentes
- **Socket.IO Client**: WebSocket cliente

### Backend
- **Node.js**: Runtime
- **Express**: Servidor HTTP
- **Socket.IO**: WebSocket servidor
- **Groq API**: Generación de IA

### DevOps
- **Concurrently**: Múltiples procesos
- **Hot Module Replacement**: Recarga en caliente
- **Git**: Control de versiones

---

## 📈 Escalabilidad

### 💪 Capacidades
- **Múltiples salas**: Sin límite teórico
- **Jugadores simultáneos**: Escalable con Redis
- **API eficiente**: Caché de respuestas
- **Load balancing**: Preparado para escalar

---

## 🎊 Extras

### 🎨 Personalización
- 12 colores de avatar únicos
- Emojis dinámicos por categoría
- Mensajes contextuales
- Feedback animado

### 📚 Documentación
- README completo
- Guía de juego detallada
- Guía de despliegue
- Comentarios en código

### 🐛 Manejo de Errores
- Mensajes de error claros
- Reconexión automática
- Fallbacks elegantes
- Logs detallados

---

## 🚀 Estado del Proyecto

### ✅ Completado
- [x] Modo local completamente funcional
- [x] Modo online con WebSocket
- [x] Integración con Groq API
- [x] Sistema de salas
- [x] Sincronización en tiempo real
- [x] UI/UX completa y pulida
- [x] Responsive design
- [x] Documentación completa

### 🎯 Funcionando Perfectamente
- Revelación de roles
- Sistema de votación
- Eliminación de jugadores
- Detección de ganador
- Múltiples rondas
- Sincronización online
- Generación de palabras por IA

---

## 🎮 ¡Listo para Jugar!

El juego está **100% funcional** y listo para ser disfrutado tanto en modo local como online. Todos los sistemas están integrados y probados.

**¡Que comience la diversión!** 🎭🕵️
