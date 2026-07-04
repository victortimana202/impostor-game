# 🔄 Cómo Actualizar GitHub

## ❌ Problema Actual

El push está fallando con error 403 porque las credenciales de Git no coinciden con el repositorio.

```
remote: Permission to victortimana202/impostor-game.git denied to victorzt96.
fatal: unable to access 'https://github.com/victortimana202/impostor-game.git/': The requested URL returned error: 403
```

---

## ✅ Solución 1: Usar Token de Acceso Personal (Recomendado)

### Paso 1: Crear Token en GitHub
1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token" → "Generate new token (classic)"
3. Nombre: `impostor-game-deploy`
4. Permisos: Marca `repo` (todos los sub-permisos)
5. Expiración: 90 días (o sin expiración)
6. Click en "Generate token"
7. **¡COPIA EL TOKEN!** (solo se muestra una vez)

### Paso 2: Actualizar Credenciales en Git
```bash
# Elimina las credenciales antiguas
git credential reject https://github.com/victortimana202/impostor-game.git

# Actualiza el remote con el token
git remote set-url origin https://TU_TOKEN@github.com/victortimana202/impostor-game.git
```

### Paso 3: Push
```bash
git push origin main
```

---

## ✅ Solución 2: Usar GitHub CLI (Más Fácil)

### Paso 1: Instalar GitHub CLI
```bash
# Windows (con winget)
winget install --id GitHub.cli

# O descarga desde: https://cli.github.com/
```

### Paso 2: Autenticar
```bash
gh auth login
```
Sigue las instrucciones:
- Selecciona: GitHub.com
- Protocolo: HTTPS
- Autenticar: Login con navegador
- Se abrirá el navegador → Inicia sesión → Autoriza

### Paso 3: Push
```bash
git push origin main
```

---

## ✅ Solución 3: Usar SSH (Más Seguro)

### Paso 1: Generar SSH Key
```bash
ssh-keygen -t ed25519 -C "tu_email@ejemplo.com"
```
- Presiona Enter (acepta ubicación por defecto)
- Ingresa contraseña (opcional)

### Paso 2: Agregar SSH Key a GitHub
```bash
# Copiar la clave pública
cat ~/.ssh/id_ed25519.pub
```

1. Copia todo el contenido
2. Ve a: https://github.com/settings/keys
3. Click en "New SSH key"
4. Título: `impostor-game-ssh`
5. Pega la clave
6. Click en "Add SSH key"

### Paso 3: Cambiar Remote a SSH
```bash
git remote set-url origin git@github.com:victortimana202/impostor-game.git
```

### Paso 4: Push
```bash
git push origin main
```

---

## ✅ Solución 4: Push Manual (Rápido pero no ideal)

Si necesitas subir los cambios AHORA y lidiar con autenticación después:

### Opción A: Usar GitHub Web
1. Ve a: https://github.com/victortimana202/impostor-game
2. Click en "Add file" → "Upload files"
3. Arrastra todos los archivos modificados:
   - `README.md`
   - `package.json`
   - `server.js`
   - `src/components/PictionaryGame.jsx`
   - `src/services/socketService.js`
   - `CHANGELOG.md`
   - `FAQ.md`
   - `GUIA_COMPLETA_JUEGOS.md`
   - `INSTRUCCIONES_DEPLOY.md`
   - `MODO_PICTIONARY.md`
   - `PRUEBA_PICTIONARY.md`
   - `RESUMEN_FINAL.md`
4. Commit message: "feat: Version 2.0.0 - Modo Pictionary"
5. Click en "Commit changes"

### Opción B: Usar GitHub Desktop
1. Descarga: https://desktop.github.com/
2. Instala y abre
3. File → Add Local Repository → Selecciona `D:\impostor`
4. Inicia sesión en GitHub
5. Click en "Push origin"

---

## 🔍 Verificar Configuración Actual

### Usuario de Git
```bash
git config user.name
git config user.email
```

Si no coinciden con tu cuenta de GitHub:
```bash
git config user.name "victortimana202"
git config user.email "tu_email@ejemplo.com"
```

### Remote URL
```bash
git remote -v
```

Debe mostrar:
```
origin  https://github.com/victortimana202/impostor-game.git (fetch)
origin  https://github.com/victortimana202/impostor-game.git (push)
```

---

## 📊 Estado Actual del Commit

El commit local ya está hecho:
```
commit dbcb7fe
feat: Version 2.0.0 - Modo Pictionary completo + Voice Chat + Drawing Board profesional

12 archivos cambiados
1745 inserciones
320 eliminaciones
```

**Solo falta hacer push a GitHub.**

---

## 🎯 Recomendación

**La forma más rápida:**
1. Instala GitHub CLI: `winget install --id GitHub.cli`
2. Autentica: `gh auth login`
3. Push: `git push origin main`

**La forma más segura:**
1. Usa SSH keys (Solución 3)
2. Nunca expones tokens en la URL

**La forma más fácil (si tienes prisa):**
1. Usa GitHub Desktop
2. Interfaz visual, sin comandos

---

## ❓ ¿Qué Solución Prefieres?

Dime cuál prefieres y te guío paso a paso.

---

**Actualizado**: 4 de Julio, 2026
