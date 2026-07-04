# Corrección de Sincronización en Modo Online

## Problema Identificado
Cuando 3 jugadores probaban el juego en diferentes navegadores/dispositivos:
- El **anfitrión** veía la pantalla de votación
- Los **invitados** veían "Esperando al anfitrión"
- ❌ **No todos veían la misma pantalla simultáneamente**

## Causa Raíz
Los botones de control estaban visibles para TODOS los jugadores en modo online, permitiendo que:
1. Los invitados pudieran hacer clic en los botones
2. Cada jugador cambiaba su estado local independientemente
3. No había sincronización adecuada del temporizador
4. Solo el host sincronizaba cambios, pero los invitados podían crear desincronización

## Solución Implementada

### 1. **Botón "Iniciar Discusión"**
- ✅ **Host**: Ve el botón y puede iniciar el temporizador
- ✅ **Invitados**: Ven mensaje "Esperando que el anfitrión inicie la discusión..."
- ✅ Al hacer clic, el host sincroniza el estado del temporizador a todos

### 2. **Botón "Ir a Votar"**
- ✅ **Host**: Ve el botón y puede iniciar la votación
- ✅ **Invitados**: Ven mensaje "Esperando que el anfitrión inicie la votación..."
- ✅ Al cambiar de fase, todos los jugadores ven la pantalla de votación simultáneamente

### 3. **Botón "Continuar Discusión"**
- ✅ **Host**: Ve el botón después de eliminar un ciudadano
- ✅ **Invitados**: Ven mensaje "Esperando que el anfitrión continúe..."
- ✅ Al continuar, todos regresan a la fase de discusión sincronizados

### 4. **Pantalla de Votación**
- ✅ **TODOS** los jugadores ven la misma pantalla de votación
- ✅ Cada jugador puede emitir su voto en su turno
- ✅ Los votos se sincronizan en tiempo real
- ✅ Banner azul indica "Todos ven esta votación en tiempo real"

## Cambios Técnicos

### En `ImpostorGame.jsx`:

1. **Agregado condicional para botones de control:**
```javascript
{gameMode === 'online' && !isOnlineHost ? (
  <div>Esperando al anfitrión...</div>
) : (
  <button onClick={...}>Acción</button>
)}
```

2. **Sincronización del temporizador:**
```javascript
if (gameMode === 'online' && isOnlineHost) {
  socketService.syncGameState({ 
    timerOn: true, 
    timerKey: timerKey + 1 
  });
}
```

3. **Las fases ya sincronizadas:**
- `discussion` → `vote` → `continue` → `result`
- Todos reciben actualizaciones vía WebSocket

## Flujo de Sincronización

```
ANFITRIÓN                      SERVIDOR                    INVITADOS
   │                              │                            │
   │─────(click botón)──────>     │                            │
   │  setState local              │                            │
   │─────syncGameState()────>     │                            │
   │                              │──(broadcast)───────>       │
   │                              │                            │─setState
   │                              │                            │
   │ <────────────── TODOS VEN LA MISMA PANTALLA ──────────────>
```

## Cómo Probar

1. Abrir 3 ventanas de navegador (o 3 dispositivos)
2. Crear una sala en la primera ventana (será el anfitrión)
3. Unirse con las otras 2 ventanas
4. Iniciar el juego
5. ✅ **Verificar**: Todos ven la fase de discusión
6. ✅ **Verificar**: Solo el anfitrión ve el botón "Iniciar discusión"
7. ✅ **Verificar**: Cuando el anfitrión inicia, todos ven el temporizador
8. ✅ **Verificar**: Solo el anfitrión ve el botón "Ir a votar"
9. ✅ **Verificar**: Cuando se inicia votación, TODOS ven la pantalla de votación
10. ✅ **Verificar**: Cada jugador vota en su turno
11. ✅ **Verificar**: Si no era impostor, solo el anfitrión ve "Continuar"

## Resultado Final

✅ **TODOS los jugadores ven la misma pantalla al mismo tiempo**  
✅ **Solo el anfitrión controla el flujo del juego**  
✅ **Los invitados ven mensajes de espera claros**  
✅ **La sincronización funciona correctamente vía WebSocket**
