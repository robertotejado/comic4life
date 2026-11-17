<div align="center">
  <img src="electron/assets/icon.png" alt="Comic4Life Logo" width="110" />
  <h1>Comic4Life</h1>
  <p>
    <strong>Estudio de creación de cómics, novelas gráficas, tiras y guiones gráficos para escritorio y web.</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-f59e0b?style=for-the-badge" alt="Version" />
    <img src="https://img.shields.io/badge/Electron-Windows%20%7C%20macOS%20%7C%20Linux-0f172a?style=for-the-badge&logo=electron" alt="Electron Multiplatform" />
    <img src="https://img.shields.io/badge/React%2019-TypeScript-2563eb?style=for-the-badge&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/i18n-ES%20%7C%20EN%20%7C%20FR%20%7C%20PT-16a34a?style=for-the-badge" alt="Multilingual" />
  </p>
</div>

---

## Acerca del proyecto

**Comic4Life** es una aplicación de diseño y maquetación de cómics pensada como estudio de escritorio completo: combina composiciones de viñetas listas para usar, globos de diálogo vectoriales con cola editable, rotulación estilizada (*lettering*), edición e integración directa de imágenes dentro de cada viñeta, inspector detallado de página y exportación multi-formato en alta resolución.

Funciona tanto en navegador como empaquetada de forma nativa con **Electron** para **Windows (`.exe`)**, **macOS (`.dmg` / `.zip` universal)** y **Linux (`.deb` / `.AppImage`)**.

---

## Características principales

### Maquetación, viñetas y plantillas
- **58 composiciones de página** organizadas por categorías (*Basic, Manga, Euro Comic, Graphic Novel, Strips, Futuristic, Picture-in-Picture, Maps* y más).
- **40 plantillas de inicio** en el *Selector de plantillas* (cómics clásicos, manga, certificados, periódicos, guiones, *storyboards*, tarjetas coleccionables y plantillas personalizadas).
- **Guardar como plantilla** conservando páginas, estilos y elementos reales para reutilizarlos desde *Mis plantillas*.
- **Configuración completa de página (*Ajustar página*)**: presets de papel ISO, Cómic EE. UU., Libro, Cuadrado, Vídeo, Web, Blog, Tablet y tamaños personalizados en `cm` con orientación vertical/horizontal y márgenes independientes (izquierda, derecha, arriba, abajo).

### Imágenes dentro de viñetas y filtros
- **Drag & Drop integral**: arrastra fotos del explorador del sistema o desde el panel lateral directamente sobre cualquier viñeta o sobre el lienzo.
- **Ajuste interno de imagen**: haz doble clic en una viñeta (o usa la barra/rueda del ratón) para **reencuadrar, escalar (hacer más grande o más pequeña), rotar y centrar** la foto sin deformar la viñeta.
- **Formas de viñeta**: rectángulo, redondeada, elipse, pentágono, diagonal izquierda y diagonal derecha.
- **Alfa instantáneo**: recorte por color con tolerancia ajustable para eliminar fondos de imágenes.

### Globos, rotulación y tipografía
- **Globos vectoriales** (*diálogo, pensamiento, susurro, grito/estallido, cartela, texto libre*) con **cola curvada/recta ajustable** directamente en el lienzo.
- **Rotulación (*Lettering*)** con degradado superior/inferior, contorno personalizable, sombra, alineación (`left`, `center`, `right`, `justify`) y estilos (`B / I / U`).
- **Fuentes externas**: importa archivos `.ttf`, `.otf`, `.woff` o `.woff2` para usarlas en globos y rotulación.
- **Selector de color avanzado**: rueda HSB interactiva, opacidad y códigos hexadecimales.

### Herramientas de estudio y exportación
- **Inspector flotante completo**: estilo, relleno/trazo, filtros de imagen, dimensiones exactas (`X`, `Y`, ancho, alto, ángulo), bloqueo de elementos, orden Z paso a paso (`±1`) y alineación respecto a los márgenes de página.
- **Editor de guion integrado** e importación de guiones en texto plano.
- **Buscar y reemplazar** en todo el cómic con contador de coincidencias, navegación directa (*Buscar siguiente*) y sensibilidad a mayúsculas.
- **Modo lectura / pantalla completa (`F5`)** a página simple o doble página.
- **Exportación profesional**:
  - **PDF** (hasta 300 dpi, documento completo o rango de páginas)
  - **Imágenes** (PNG / JPEG empaquetadas en `.zip`)
  - **CBZ** (archivo estándar de cómic digital)
  - **ePub** (libro electrónico)
  - **Proyecto `.comic4life`** e impresión directa.
- **Interfaz multilingüe**: Español, Inglés, Francés y Portugués.

---

## Descarga e instaladores nativos (Windows, macOS, Linux)

Este repositorio incluye un flujo automático de **GitHub Actions** que compila instaladores nativos en servidores reales de los tres sistemas operativos:

| Plataforma | Formatos generados |
| :--- | :--- |
| **Windows (`x64`)** | Instalador asistente `.exe` (NSIS) y ejecutable portátil (`portable.exe`) |
| **macOS (`universal`)** | Imagen de disco `.dmg` y `.zip` (Intel + Apple Silicon) |
| **Linux (`x64`)** | Paquete `.deb` (Ubuntu/Debian) y `.AppImage` |

### Cómo generar los instaladores desde GitHub
1. Ve a la pestaña **Actions** de este repositorio.
2. Selecciona **Build Desktop Installers (Windows, macOS, Linux)**.
3. Pulsa **Run workflow** (o publica un tag como `git tag v1.0.0 && git push origin v1.0.0` para crear una *Release* automática).
4. Descarga los instaladores desde **Artifacts** o desde la sección **Releases**.

---

## Desarrollo y compilación local

Requisitos: **Node.js 20+**

```bash
# 1. Clonar el repositorio e instalar dependencias
npm install

# 2. Iniciar entorno de desarrollo web (http://localhost:3000)
npm run dev

# 3. Probar la app dentro de ventana de escritorio Electron (en otra terminal)
npm run electron:dev
```

### Generar instalador local según tu sistema operativo
```bash
# Windows (.exe NSIS + portable) — ejecutar en Windows
npm run dist:win

# macOS (.dmg + .zip universal) — ejecutar en macOS
npm run dist:mac

# Linux (.deb + .AppImage) — ejecutar en Linux
npm run dist:linux
```

Los instaladores generados aparecerán en la carpeta `release/`. Para más detalles o resolución de incidencias en Windows, consulta [`DESKTOP_BUILD.md`](DESKTOP_BUILD.md).

---

## Atajos de teclado principales

| Atajo | Acción |
| :--- | :--- |
| `Ctrl + N` / `Shift + Ctrl + N` | Nuevo cómic / Selector de plantillas |
| `Ctrl + O` / `Ctrl + S` | Abrir proyecto / Guardar |
| `Ctrl + Z` / `Shift + Ctrl + Z` | Deshacer / Rehacer |
| `Ctrl + C` / `Ctrl + V` / `Ctrl + D` | Copiar / Pegar / Duplicar |
| `Shift + Ctrl + V` | Pegar con el mismo estilo |
| `Ctrl + F` | Buscar y reemplazar en todo el cómic |
| `Shift + Ctrl + B` | Insertar página en blanco |
| `Ctrl + L` / `Shift + Ctrl + L` | Bloquear / Desbloquear elemento |
| `Ctrl + 1` / `2` / `3` | Mostrar u ocultar paneles laterales y dock |
| `Ctrl + 0` / `Shift + Ctrl + 0` | Ajustar zoom / Imagen al tamaño real |
| `F5` | Modo lectura / vista previa |

---

## Stack técnico

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Build**: Vite 8
- **Exportación**: `jsPDF`, `JSZip`, renderizado SVG/Canvas de alta resolución
- **Escritorio**: Electron 35 + `electron-builder` 25
