# 🇨🇴 Palabras Colombianas - Pictionary

## ✅ IMPLEMENTACIÓN COMPLETADA

### 🎯 Cambios Realizados

#### 1. Base de Datos de Palabras Colombianas
Se creó un archivo `src/services/colombianWords.js` con **más de 80 palabras** organizadas en categorías:

##### 🐆 Animales de Colombia (15 palabras)
- Oso de anteojos, Cóndor, Jaguar, Delfín rosado
- Perezoso, Tucán, Guacamaya, Ballena jorobada
- Tortuga caguama, Armadillo, Rana dorada, Caimán
- Nutria, Mono tití, Colibrí

##### 🍊 Frutas de Colombia (15 palabras)
- Lulo, Guanábana, Maracuyá, Curuba
- Pitaya, Borojó, Uchuva, Tomate de árbol
- Papaya, Zapote, Chontaduro, Mangostino
- Granadilla, Guayaba, Mamey

##### 🎬 Películas/Series de Colombia (15 palabras)
- Encanto, El abrazo de la serpiente, La vendedora de rosas
- Rosario Tijeras, El Paseo, El Carro
- Betty la Fea, Yo soy Betty, Narcos
- El Patrón del Mal, Tres Caínes, La Reina del Flow
- El Man es Germán, Sin Senos no hay Paraíso, Café con Aroma de Mujer

##### 🇨🇴 Cultura General de Colombia (35+ palabras)
**Comida:**
- Arepas, Bandeja Paisa, Ajiaco, Sancocho
- Empanadas, Buñuelos, Natilla, Tamal
- Lechona, Changua, Obleas, Chocoramo
- Colombina, Aguapanela

**Música y Artistas:**
- Cumbia, Vallenato, Shakira, Juanes, Maluma

**Símbolos:**
- Sombrero Vueltiao, Poncho, Mochila Wayuu
- Guadua, Café, Aguardiente, Esmeralda

**Arte y Literatura:**
- Botero, Gabriel García Márquez, Cien Años de Soledad

**Ciudades:**
- Cartagena, Bogotá, Medellín, Cali, Barranquilla

**Tradiciones:**
- Carnaval, Tejo

##### 🗺️ Lugares de Colombia (10 palabras)
- Caño Cristales, Sierra Nevada, Amazonas
- San Andrés, Tayrona, Cocora, Guatapé
- Zipaquirá, Villa de Leyva, Desierto Tatacoa

### 📊 Total: 90+ palabras colombianas

---

## 🎮 Selector de Categorías

### Pantalla Inicial
Antes de comenzar el juego, el **host selecciona** una categoría:

```
🇨🇴 Selecciona una Categoría

[🎲 Todas las categorías]  [🐆 Animales de Colombia]
[🍊 Frutas de Colombia]    [🎬 Películas/Series]
[🇨🇴 Cultura General]      [🗺️ Lugares de Colombia]
```

### Opciones:
1. **🎲 Todas las categorías**: Palabras aleatorias de todas las categorías
2. **🐆 Animales**: Solo animales colombianos
3. **🍊 Frutas**: Solo frutas colombianas
4. **🎬 Películas/Series**: Películas y series colombianas
5. **🇨🇴 Cultura General**: Comida, música, símbolos, ciudades, etc.
6. **🗺️ Lugares**: Lugares turísticos de Colombia

---

## 🕵️ Anonimato del Dibujante

### Cambios en la Interfaz

#### Antes:
```
Ronda 2 de 5 • Turno de: JUAN
👀 Juan está dibujando... ¡Adivina la palabra!
```

#### Ahora:
```
Ronda 2 de 5 • Alguien está dibujando... 🤔
👀 Alguien está dibujando... ¿Qué será? ¿Quién será?
```

### Beneficios:
- **Doble desafío**: Adivinar QUÉ está dibujando Y QUIÉN lo dibuja
- **Más puntos**: +100 pts por adivinar correctamente el autor
- **Mayor estrategia**: Los jugadores deben reconocer el estilo de dibujo

---

## 🎯 Flujo del Juego Actualizado

### 1. Selección de Categoría (Solo Host)
```
Host selecciona: 🍊 Frutas de Colombia
↓
Sistema carga solo palabras de frutas
```

### 2. Turno de Dibujo
```
Dibujante:
  Ve: 🍊 LULO
  Dibuja durante 60 segundos

Otros jugadores:
  Ven: _ _ _ _ (4 letras)
  No saben quién está dibujando
  Pueden adivinar en tiempo real
```

### 3. Sistema de Intentos
```
Jugador A:
  Intento 1: "naranja" ❌ → 2 intentos restantes
  Pide pista 💡 → "Empieza con L" → 1 intento restante
  Intento 2: "lulo" ✅ → Gana 500 pts
```

### 4. Fase de Discusión
```
Mostrar dibujo completo
Pregunta: ¿Quién dibujó esto?

[Botón: Juan]  [Botón: María]
[Botón: Pedro] [Botón: Ana]

Si acierta → +100 pts adicionales
```

### 5. Siguiente Turno
```
Siguiente jugador dibuja
Nueva palabra de la categoría seleccionada
Se repite el proceso
```

---

## 📝 Ejemplos de Palabras por Categoría

### Ejemplo 1: Animales
```
Palabra: 🐻 OSO DE ANTEOJOS
Categoría: Animales de Colombia
Pista: Empieza con "O"
```

### Ejemplo 2: Frutas
```
Palabra: 🍊 LULO
Categoría: Frutas de Colombia
Pista: Empieza con "L"
```

### Ejemplo 3: Películas
```
Palabra: 🦋 ENCANTO
Categoría: Películas/Series Colombia
Pista: Empieza con "E"
```

### Ejemplo 4: Cultura
```
Palabra: 🫓 AREPAS
Categoría: Cultura General Colombia
Pista: Empieza con "A"
```

### Ejemplo 5: Lugares
```
Palabra: 🌈 CAÑO CRISTALES
Categoría: Lugares de Colombia
Pista: Empieza con "C"
```

---

## 🔧 Archivos Modificados

### Nuevos:
- ✅ `src/services/colombianWords.js` - Base de datos de palabras

### Actualizados:
- ✅ `src/components/PictionaryGameV2.jsx` 
  - Importa palabras colombianas
  - Agrega selector de categoría
  - Oculta nombre del dibujante
  - Fase de adivinanza de autor

---

## 🎨 Categorías Disponibles en el Juego

```javascript
getCategories() retorna:
[
  { id: 'all', name: 'Todas las categorías', emoji: '🎲' },
  { id: 'animales', name: 'Animales de Colombia', emoji: '🐆' },
  { id: 'frutas', name: 'Frutas de Colombia', emoji: '🍊' },
  { id: 'peliculas', name: 'Películas/Series', emoji: '🎬' },
  { id: 'cultura', name: 'Cultura General', emoji: '🇨🇴' },
  { id: 'lugares', name: 'Lugares de Colombia', emoji: '🗺️' },
]
```

---

## ✅ Checklist de Funcionalidades

- [x] Base de datos con 90+ palabras colombianas
- [x] 6 categorías diferentes
- [x] Selector de categoría al inicio (solo host)
- [x] Palabras filtradas por categoría seleccionada
- [x] Nombre del dibujante oculto durante el juego
- [x] Fase de discusión para adivinar autor
- [x] Puntos adicionales por adivinar autor (+100)
- [x] Pistas muestran primera letra
- [x] Emojis representativos para cada palabra
- [x] Chat de voz siempre disponible

---

## 🚀 Cómo Probar

1. **Iniciar el juego**:
   ```bash
   npm run dev:full
   ```

2. **Crear sala** y seleccionar "Pictionary"

3. **Seleccionar categoría**:
   - Host elige categoría (ej: 🍊 Frutas)
   - Todos los jugadores ven la selección

4. **Jugar un turno**:
   - Dibujante ve su palabra (ej: LULO)
   - Otros ven: _ _ _ _
   - No ven quién está dibujando
   - Intentan adivinar la palabra

5. **Fase de discusión**:
   - Ver dibujo completo
   - Adivinar quién lo dibujó
   - Ganar puntos adicionales

---

## 🎯 Palabras Más Difíciles

### Desafío Alto:
- Gabriel García Márquez (nombre largo)
- Cien Años de Soledad (libro)
- El Abrazo de la Serpiente (película)
- Desierto Tatacoa (lugar)

### Desafío Medio:
- Chontaduro (fruta exótica)
- Borojó (fruta poco conocida)
- Mangostino (fruta)
- Lechona (comida)

### Desafío Bajo:
- Café ☕
- Arepas 🫓
- Shakira 🎤
- Encanto 🦋

---

## 💡 Ideas para Expandir

### Más Categorías Posibles:
- 🏃 Deportes Colombianos (James Rodríguez, Nairo Quintana)
- 🎭 Personajes Históricos (Simón Bolívar, etc.)
- 🌺 Flora Colombiana (Orquídeas, Palma de Cera)
- 🎪 Festivales (Feria de Cali, Festival de Flores)
- ⚽ Equipos de Fútbol (Nacional, Millonarios, América)

### Dificultades:
- Fácil: Palabras comunes y cortas
- Medio: Palabras específicas
- Difícil: Nombres largos y conceptos abstractos

---

**Versión**: 2.1.0
**Fecha**: 4 de Julio, 2026
**Estado**: ✅ Listo para jugar con palabras colombianas
