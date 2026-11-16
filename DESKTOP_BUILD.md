# Comic4Life — Generación de ejecutables e instaladores nativos (Electron)

Este proyecto está configurado para generar ejecutables e instaladores nativos para **Windows**, **macOS** y **Linux** mediante `electron` y `electron-builder`.

## Formatos generados
- **Windows (`x64`)**:
  - `release/Comic4Life-1.0.0-win-x64.exe` (Instalador clásico NSIS con asistente y accesos directos)
  - `release/Comic4Life-1.0.0-win-x64-portable.exe` (Ejecutable portable sin instalación)
- **macOS (`universal`: Intel + Apple Silicon M1/M2/M3/M4)**:
  - `release/Comic4Life-1.0.0-mac-universal.dmg` (Imagen de disco instalable)
  - `release/Comic4Life-1.0.0-mac-universal.zip` (Aplicación `.app` comprimida)
- **Linux (`x64`)**:
  - `release/Comic4Life-1.0.0-linux-x64.deb` (Paquete instalable para Ubuntu / Debian / Mint)
  - `release/Comic4Life-1.0.0-linux-x64.AppImage` (Ejecutable portátil universal para Linux)

---

## Opción A: Compilación automática en la nube con GitHub Actions (sin necesitar Mac ni Windows)
1. Sube este proyecto a un repositorio en GitHub.
2. En GitHub, entra en **Actions → Build Desktop Installers (Windows, macOS, Linux)** y pulsa **Run workflow** (o crea un tag `git tag v1.0.0 && git push origin v1.0.0`).
3. GitHub compilará los 3 sistemas en paralelo (`windows-latest`, `macos-latest`, `ubuntu-latest`) y dejará los archivos `.exe`, `.dmg`, `.deb` y `.AppImage` listos para descargar en **Artifacts** (o en **Releases** si usaste un tag `v*`).

---

## Opción B: Compilación local en tu propio equipo
Requisitos: **Node.js 20+**

1. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
2. Genera el instalador según tu sistema operativo (el script descargará automáticamente Electron y `electron-builder` locales si no están instalados):
   - **Windows** (desde Windows):
     ```bash
     npm run dist:win
     ```
   - **macOS** (desde Mac):
     ```bash
     npm run dist:mac
     ```
   - **Linux** (desde Ubuntu/Debian):
     ```bash
     npm run dist:linux
     ```
3. Los ejecutables e instaladores aparecerán en la carpeta `release/`.

> **Nota en Windows**: si tienes una carpeta antigua `C:\Users\<TuUsuario>\node_modules\electron` rota de intentos anteriores, bórrala antes de ejecutar `npm run dist:win`, o ejecuta `node node_modules/electron/install.js` dentro de la carpeta del proyecto.

### Probar en ventana de escritorio en modo desarrollo
```bash
npm run dev
# En otra terminal:
npm run electron:dev
```
