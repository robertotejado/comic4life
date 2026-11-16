export type LanguageCode = 'es' | 'en' | 'fr' | 'pt';

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  pt: 'Português',
};

export interface Translations {
  // Menus
  menuFile: string;
  menuEdit: string;
  menuView: string;
  menuInsert: string;
  menuFormat: string;
  menuArrange: string;
  menuWindow: string;
  menuHelp: string;

  // File Menu Items
  newBlankComic: string;
  newFromTemplate: string;
  openProject: string;
  openRecentMenu: string;
  closeDoc: string;
  saveToBrowser: string;
  saveAsFile: string;
  autoFillImages: string;
  importScriptMenu: string;
  saveAsTemplateMenu: string;
  newPage: string;
  insertImageFile: string;
  pageSetupMenu: string;
  exportMenu: string;
  printPdf: string;
  quitApp: string;

  // Edit Menu Items
  undo: string;
  redo: string;
  cut: string;
  copy: string;
  paste: string;
  pasteStyle: string;
  duplicateSelection: string;
  deleteSelection: string;
  deletePageMenu: string;
  selectAllMenu: string;
  deselectMenu: string;
  findMenu: string;

  // View Menu Items
  togglePagesStyles: string;
  toggleLayoutsPhotos: string;
  toggleElementDock: string;
  previewComic: string;
  zoomIn: string;
  zoomOut: string;
  zoomToFit: string;
  showRulers: string;
  showGuides: string;
  showGridMenu: string;
  snapGridMenu: string;
  prevPageMenu: string;
  nextPageMenu: string;
  toggleFormatBar: string;
  languageLabel: string;

  // Insert Menu Items
  newBlankPage: string;
  duplicatePageMenu: string;
  pageWithCurrentPanels: string;
  pageNumberMenu: string;
  pageCountMenu: string;
  panelFrame: string;
  speechBalloon: string;
  thoughtBalloon: string;
  captionBox: string;
  textBox: string;
  comicLettering: string;
  shapeMenu: string;
  imageFromDevice: string;
  imageFromUrl: string;

  // Format Menu Items
  fontMenu: string;
  textAlignMenu: string;
  boldMenu: string;
  italicMenu: string;
  underlineMenu: string;
  alignLeftMenu: string;
  alignCenterMenu: string;
  alignRightMenu: string;
  alignJustifyMenu: string;
  copyStyleMenu: string;
  pasteStyleMenu: string;
  actualImageSizeMenu: string;
  removeInstantAlphaMenu: string;

  // Arrange Menu Items
  bringForward: string;
  sendBackward: string;
  bringToFront: string;
  sendToBack: string;
  alignObjectsMenu: string;
  alignMiddleMenu: string;
  lockMenu: string;
  unlockMenu: string;

  shapeRect: string;
  shapeRounded: string;
  shapeEllipse: string;
  shapePentagon: string;
  shapeSkewLeft: string;
  shapeSkewRight: string;

  findPlaceholder: string;
  replacePlaceholder: string;
  findNextBtn: string;
  replaceAllBtn: string;
  matchCaseLabel: string;
  matchesFound: string;

  // Window & Help
  inspector: string;
  colors: string;
  fonts: string;
  scriptDrawer: string;
  stampsMenu: string;
  stampsTitle: string;
  insertStampBtn: string;
  bringAllFrontMenu: string;
  shortcutsGuide: string;

  // Main Toolbar
  save: string;
  saved: string;
  print: string;
  preview: string;
  startComic: string;
  fit: string;
  front: string;
  back: string;
  style: string;
  larger: string;
  smaller: string;
  instantAlpha: string;
  script: string;
  exportBtn: string;
  templates: string;

  // Format Bar
  stroke: string;
  fill: string;
  pageFill: string;
  shadow: string;
  radius: string;
  pad: string;
  opacity: string;

  // Sidebars
  pages: string;
  styles: string;
  design: string;
  allDesigns: string;
  builtInPrefix: string;
  pageTemplates: string;
  panelLayouts: string;
  folder: string;
  allMedia: string;
  addMedia: string;
  addUrl: string;
  photos: string;
  explorer: string;
  camera: string;
  noPhotos: string;
  uploadImage: string;
  captureToPanel: string;

  // Canvas Status
  canvasHint: string;
  pageOf: string;
  currentZoom: string;
  panPhoto: string;
  panningImage: string;
  dropPhotoHere: string;

  // Inspector & Floating Windows
  tabDocument: string;
  tabPage: string;
  tabStyle: string;
  tabBalloon: string;
  tabImage: string;
  tabArrange: string;
  tabMetrics: string;
  tabText: string;

  pageDimensions: string;
  orientation: string;
  portrait: string;
  landscape: string;
  units: string;
  customSize: string;
  width: string;
  height: string;
  margins: string;
  gutter: string;
  backgroundColor: string;
  pagePattern: string;
  applyAllPages: string;

  fileInfo: string;
  sizeLabel: string;
  constrainProportions: string;
  originalSize: string;
  positionLabel: string;
  rotateLabel: string;
  angleLabel: string;

  selectElementHint: string;
  panelShape: string;
  photoFilter: string;
  photoZoom: string;
  brightness: string;
  contrast: string;
  saturation: string;
  clearPhoto: string;
  replacePhoto: string;
  imageFitLabel: string;
  imageFitCover: string;
  imageFitContain: string;
  imageFitFill: string;
  imageRotationLabel: string;
  imagePositionLabel: string;
  resetImageAdjust: string;
  doneAdjustImage: string;
  instantAlphaKnockout: string;
  keyColor: string;
  tolerance: string;

  balloonShape: string;
  tailStyle: string;
  tailWidth: string;
  warpStyle: string;
  topGradient: string;
  bottomGradient: string;

  // Colors & Fonts
  colorTargetFill: string;
  colorTargetStroke: string;
  colorTargetText: string;
  colorTargetPage: string;
  setButton: string;
  addFontFile: string;
  addGoogleFont: string;
  googleFontPlaceholder: string;
  loadFontBtn: string;
  customFontsTitle: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  insertTextBtn: string;

  // Modals
  templateChooserTitle: string;
  treeAll: string;
  treeMyTemplates: string;
  treeVarious: string;
  treeScripts: string;
  treeBlank: string;
  treeSamples: string;
  treeComics: string;
  treeCertificates: string;
  treeCreative: string;
  treeEducation: string;
  treeHowTo: string;
  treeLifeStories: string;
  treeSinglePanels: string;
  treeClassic: string;
  showOnStartupLabel: string;
  noRecentComics: string;
  openRecent: string;
  openExistingFile: string;
  cancel: string;
  choose: string;
  exportComicTitle: string;
  exportTabPdf: string;
  exportTabImages: string;
  exportTabEpub: string;
  exportTabCbz: string;
  exportToPdfTitle: string;
  exportToImagesTitle: string;
  exportToEpubTitle: string;
  exportToCbzTitle: string;
  imageLimitLabel: string;
  pagesRangeLabel: string;
  allPagesRadio: string;
  fromPageLabel: string;
  toPageLabel: string;
  nextExportBtn: string;
  bookTitleLabel: string;
  authorLabel: string;
  qualityLabel: string;
  exportImagesHeader: string;
  imageFormat: string;
  resolutionScale: string;
  currentPageOnly: string;
  allPagesLabel: string;
  downloadBtn: string;
  rendering: string;
  saveProjectFile: string;
  pageSetupTitle: string;
  usePageSetupPrinter: string;
  pageSetupBtn: string;
  useCustomSettings: string;
  pageSizeLabel: string;
  docMarginsTitle: string;
  marginLeft: string;
  marginRight: string;
  marginTop: string;
  marginBottom: string;
  acceptBtn: string;
  customPresetPlaceholder: string;
  exitReader: string;
  readerHint: string;
}

const es: Translations = {
  menuFile: 'Archivo',
  menuEdit: 'Edición',
  menuView: 'Visualización',
  menuInsert: 'Insertar',
  menuFormat: 'Formato',
  menuArrange: 'Ordenar',
  menuWindow: 'Ventana',
  menuHelp: 'Ayuda',

  newBlankComic: 'Nuevo',
  newFromTemplate: 'Nuevo desde el selector de plantillas...',
  openProject: 'Abrir...',
  openRecentMenu: 'Abrir reciente',
  closeDoc: 'Cerrar',
  saveToBrowser: 'Guardar',
  saveAsFile: 'Guardar como...',
  autoFillImages: 'Rellenar con imágenes automáticamente',
  importScriptMenu: 'Importar guion...',
  saveAsTemplateMenu: 'Guardar como plantilla...',
  newPage: 'Nueva página',
  insertImageFile: 'Importar imagen...',
  pageSetupMenu: 'Ajustar página...',
  exportMenu: 'Exportar',
  printPdf: 'Imprimir...',
  quitApp: 'Salir',

  undo: 'Deshacer',
  redo: 'Rehacer',
  cut: 'Cortar',
  copy: 'Copiar',
  paste: 'Pegar',
  pasteStyle: 'Pegar con el mismo estilo',
  duplicateSelection: 'Duplicar',
  deleteSelection: 'Eliminar',
  deletePageMenu: 'Eliminar página...',
  selectAllMenu: 'Seleccionar todo',
  deselectMenu: 'Anular la selección',
  findMenu: 'Buscar...',

  togglePagesStyles: 'Páginas y estilos',
  toggleLayoutsPhotos: 'Diseños y fotos',
  toggleElementDock: 'Paleta de elementos',
  previewComic: 'Previsualizar cómic',
  zoomIn: 'Acercar',
  zoomOut: 'Alejar',
  zoomToFit: 'Ajustar',
  showRulers: 'Mostrar reglas',
  showGuides: 'Mostrar guías de alineación',
  showGridMenu: 'Mostrar cuadrícula',
  snapGridMenu: 'Ajustar a la cuadrícula',
  prevPageMenu: 'Página anterior',
  nextPageMenu: 'Página siguiente',
  toggleFormatBar: 'Barra de formato',
  languageLabel: 'Idioma',

  newBlankPage: 'Página en blanco',
  duplicatePageMenu: 'Duplicar página',
  pageWithCurrentPanels: 'Página con viñetas actuales',
  pageNumberMenu: 'Número de página',
  pageCountMenu: 'Número de páginas',
  panelFrame: 'Viñeta',
  speechBalloon: 'Globo',
  thoughtBalloon: 'Globo de pensamiento',
  captionBox: 'Pie de foto',
  textBox: 'Caja de texto libre',
  comicLettering: 'Rotulación',
  shapeMenu: 'Forma',
  imageFromDevice: 'Elegir imagen...',
  imageFromUrl: 'Imagen desde URL...',

  fontMenu: 'Fuente',
  textAlignMenu: 'Texto',
  boldMenu: 'Negrita',
  italicMenu: 'Cursiva',
  underlineMenu: 'Subrayado',
  alignLeftMenu: 'Alinear a la izquierda',
  alignCenterMenu: 'Centrar',
  alignRightMenu: 'Alinear a la derecha',
  alignJustifyMenu: 'Justificar',
  copyStyleMenu: 'Copiar estilo',
  pasteStyleMenu: 'Pegar estilo',
  actualImageSizeMenu: 'Cambiar imagen al tamaño real',
  removeInstantAlphaMenu: 'Quitar alfa instantáneo',

  bringForward: 'Traer adelante',
  sendBackward: 'Enviar atrás',
  bringToFront: 'Traer al frente',
  sendToBack: 'Enviar al fondo',
  alignObjectsMenu: 'Alinear',
  alignMiddleMenu: 'Centro vertical',
  lockMenu: 'Bloquear',
  unlockMenu: 'Desbloquear',

  shapeRect: 'Rectángulo',
  shapeRounded: 'Redondeado',
  shapeEllipse: 'Elipse',
  shapePentagon: 'Pentágono',
  shapeSkewLeft: 'Inclinada izq.',
  shapeSkewRight: 'Inclinada der.',

  findPlaceholder: 'Buscar texto en globos y rótulos...',
  replacePlaceholder: 'Reemplazar por...',
  findNextBtn: 'Buscar siguiente',
  replaceAllBtn: 'Reemplazar todo',
  matchCaseLabel: 'Mayús./minús.',
  matchesFound: '{count} coincidencias',

  inspector: 'Mostrar inspector',
  colors: 'Colores',
  fonts: 'Fuentes',
  scriptDrawer: 'Editor de guion',
  stampsMenu: 'Mostrar sellos',
  stampsTitle: 'Sellos y onomatopeyas',
  insertStampBtn: 'Insertar',
  bringAllFrontMenu: 'Traer todo al frente',
  shortcutsGuide: 'Atajos de teclado y guía',

  save: 'Guardar',
  saved: 'Guardado',
  print: 'Print',
  preview: 'Visualización',
  startComic: 'Empezar cómic',
  fit: 'Ajustar',
  front: 'Delante',
  back: 'Atrás',
  style: 'Estilo',
  larger: 'Más grande',
  smaller: 'Más pequeño',
  instantAlpha: 'Alfa instantáneo',
  script: 'Guion',
  exportBtn: 'Exportar',
  templates: 'Plantillas',

  stroke: 'Trazo:',
  fill: 'Relleno:',
  pageFill: 'Fondo pág:',
  shadow: 'Sombra',
  radius: 'Radio',
  pad: 'Margen',
  opacity: 'Opacidad',

  pages: 'PÁGINAS',
  styles: 'ESTILOS',
  design: 'Diseño:',
  allDesigns: 'Todos los diseños',
  builtInPrefix: 'Incorporado:',
  pageTemplates: 'PÁGINAS PLANTILLA',
  panelLayouts: 'DISEÑO DE VIÑETAS',
  folder: 'CARPETA:',
  allMedia: 'Todos los medios',
  addMedia: 'Subir',
  addUrl: 'URL',
  photos: 'FOTOS',
  explorer: 'EXPLORADOR',
  camera: 'CÁMARA',
  noPhotos: 'No hay imágenes en esta carpeta',
  uploadImage: 'Subir imagen',
  captureToPanel: 'Capturar a viñeta',

  canvasHint: 'Doble clic en globos/textos para editar · Alt+Arrastrar viñeta para mover foto',
  pageOf: 'Página {current} de {total}',
  currentZoom: 'Zoom: {pct}%',
  panPhoto: 'Encuadrar foto',
  panningImage: 'Encuadrando',
  dropPhotoHere: 'Suelta una imagen aquí',

  tabDocument: 'Documento',
  tabPage: 'Página',
  tabStyle: 'Estilo',
  tabBalloon: 'Globo',
  tabImage: 'Imagen',
  tabArrange: 'Orden',
  tabMetrics: 'Medición',
  tabText: 'Texto',

  pageDimensions: 'Dimensiones de página',
  orientation: 'Orientación',
  portrait: 'Vertical',
  landscape: 'Horizontal',
  units: 'Unidades',
  customSize: 'Personalizado',
  width: 'Anchura',
  height: 'Altura',
  margins: 'Márgenes',
  gutter: 'Medianil (Gutter)',
  backgroundColor: 'Color de fondo',
  pagePattern: 'Trama de página',
  applyAllPages: 'Aplicar tamaño a todo el cómic',

  fileInfo: 'Información de archivo',
  sizeLabel: 'Tamaño',
  constrainProportions: 'Restringir proporciones',
  originalSize: 'Tamaño original',
  positionLabel: 'Posición',
  rotateLabel: 'Girar',
  angleLabel: 'Ángulo',

  selectElementHint: 'Selecciona una viñeta, globo, texto o rotulación para inspeccionar sus propiedades.',
  panelShape: 'Forma de viñeta',
  photoFilter: 'Filtro de imagen',
  photoZoom: 'Escala de imagen',
  brightness: 'Brillo',
  contrast: 'Contraste',
  saturation: 'Saturación',
  clearPhoto: 'Quitar imagen',
  replacePhoto: 'Cambiar imagen...',
  imageFitLabel: 'Ajuste de imagen',
  imageFitCover: 'Rellenar',
  imageFitContain: 'Encajar',
  imageFitFill: 'Estirar',
  imageRotationLabel: 'Rotación de imagen',
  imagePositionLabel: 'Encuadre (X / Y)',
  resetImageAdjust: 'Restablecer',
  doneAdjustImage: 'Listo',
  instantAlphaKnockout: 'Alfa instantáneo (Transparencia)',
  keyColor: 'Color clave',
  tolerance: 'Tolerancia',

  balloonShape: 'Tipo de globo',
  tailStyle: 'Estilo de rabillo',
  tailWidth: 'Ancho de rabillo',
  warpStyle: 'Deformación (Warp)',
  topGradient: 'Color superior',
  bottomGradient: 'Color inferior',

  colorTargetFill: 'Relleno',
  colorTargetStroke: 'Trazo',
  colorTargetText: 'Texto',
  colorTargetPage: 'Página',
  setButton: 'Aplicar',
  addFontFile: 'Cargar fuente (.ttf/.otf/.woff)',
  addGoogleFont: 'Google Font por nombre',
  googleFontPlaceholder: 'Ej: Oswald, Anton, Creepster...',
  loadFontBtn: 'Cargar',
  customFontsTitle: 'Fuentes externas cargadas',
  fontSize: 'Tamaño',
  lineHeight: 'Interlineado',
  letterSpacing: 'Espaciado',
  insertTextBtn: '+ Insertar caja de texto',

  templateChooserTitle: 'Selector de plantillas',
  treeAll: 'Todo',
  treeMyTemplates: 'Mis plantillas',
  treeVarious: 'Varios',
  treeScripts: 'Guiones',
  treeBlank: 'En blanco',
  treeSamples: 'Muestras',
  treeComics: 'Cómics',
  treeCertificates: 'Certificados',
  treeCreative: 'Creativa',
  treeEducation: 'Educación',
  treeHowTo: 'Cómo',
  treeLifeStories: 'Historias de la vida',
  treeSinglePanels: 'Los paneles individuales',
  treeClassic: 'Classic',
  showOnStartupLabel: 'Mostrar al inicio',
  noRecentComics: 'Aún no hay cómics guardados',
  openRecent: 'Abrir reciente',
  openExistingFile: 'Abrir archivo existente...',
  cancel: 'Cancelar',
  choose: 'Elegir',
  exportComicTitle: 'Exportar',
  exportTabPdf: 'PDF',
  exportTabImages: 'Imágenes',
  exportTabEpub: 'ePub',
  exportTabCbz: 'CBZ',
  exportToPdfTitle: 'Exportar a PDF',
  exportToImagesTitle: 'Exportar a Imágenes',
  exportToEpubTitle: 'Exportar a ePub',
  exportToCbzTitle: 'Exportar a CBZ',
  imageLimitLabel: 'Límite de imagen:',
  pagesRangeLabel: 'Páginas:',
  allPagesRadio: 'Todo',
  fromPageLabel: 'De:',
  toPageLabel: 'a:',
  nextExportBtn: 'Exportar...',
  bookTitleLabel: 'Título:',
  authorLabel: 'Autor:',
  qualityLabel: 'Calidad:',
  exportImagesHeader: 'Exportar imágenes en alta resolución',
  imageFormat: 'Formato',
  resolutionScale: 'Resolución',
  currentPageOnly: 'Página actual',
  allPagesLabel: 'Todas las páginas',
  downloadBtn: 'Descargar',
  rendering: 'Exportando...',
  saveProjectFile: 'Guardar .comic4life',
  pageSetupTitle: 'Ajustar página',
  usePageSetupPrinter: 'Usar Ajustar página:',
  pageSetupBtn: 'Ajustar página...',
  useCustomSettings: 'Usar configuración personalizada',
  pageSizeLabel: 'Tamaño de página:',
  docMarginsTitle: 'Márgenes del documento',
  marginLeft: 'Izquierda',
  marginRight: 'Derecha',
  marginTop: 'Arriba',
  marginBottom: 'Abajo',
  acceptBtn: 'Aceptar',
  customPresetPlaceholder: 'Nombre del tamaño...',
  exitReader: 'Salir del lector',
  readerHint: 'Flechas (← / →) para pasar página · Esc para volver al editor',
};

const en: Translations = {
  menuFile: 'File',
  menuEdit: 'Edit',
  menuView: 'View',
  menuInsert: 'Insert',
  menuFormat: 'Format',
  menuArrange: 'Arrange',
  menuWindow: 'Window',
  menuHelp: 'Help',

  newBlankComic: 'New',
  newFromTemplate: 'New from Template Chooser...',
  openProject: 'Open...',
  openRecentMenu: 'Open Recent',
  closeDoc: 'Close',
  saveToBrowser: 'Save',
  saveAsFile: 'Save As...',
  autoFillImages: 'Auto-fill with Images',
  importScriptMenu: 'Import Script...',
  saveAsTemplateMenu: 'Save as Template...',
  newPage: 'New Page',
  insertImageFile: 'Import Image...',
  pageSetupMenu: 'Page Setup...',
  exportMenu: 'Export',
  printPdf: 'Print...',
  quitApp: 'Quit',

  undo: 'Undo',
  redo: 'Redo',
  cut: 'Cut',
  copy: 'Copy',
  paste: 'Paste',
  pasteStyle: 'Paste with Same Style',
  duplicateSelection: 'Duplicate',
  deleteSelection: 'Delete',
  deletePageMenu: 'Delete Page...',
  selectAllMenu: 'Select All',
  deselectMenu: 'Deselect',
  findMenu: 'Find...',

  togglePagesStyles: 'Pages & Styles',
  toggleLayoutsPhotos: 'Layouts & Photos',
  toggleElementDock: 'Element Palette',
  previewComic: 'Preview Comic',
  zoomIn: 'Zoom In',
  zoomOut: 'Zoom Out',
  zoomToFit: 'Zoom to Fit',
  showRulers: 'Show Rulers',
  showGuides: 'Show Alignment Guides',
  showGridMenu: 'Show Grid',
  snapGridMenu: 'Snap to Grid',
  prevPageMenu: 'Previous Page',
  nextPageMenu: 'Next Page',
  toggleFormatBar: 'Format Bar',
  languageLabel: 'Language',

  newBlankPage: 'Blank Page',
  duplicatePageMenu: 'Duplicate Page',
  pageWithCurrentPanels: 'Page with Current Panels',
  pageNumberMenu: 'Page Number',
  pageCountMenu: 'Page Count',
  panelFrame: 'Panel',
  speechBalloon: 'Balloon',
  thoughtBalloon: 'Thought Balloon',
  captionBox: 'Caption',
  textBox: 'Free Text Box',
  comicLettering: 'Lettering',
  shapeMenu: 'Shape',
  imageFromDevice: 'Choose Image...',
  imageFromUrl: 'Image from URL...',

  fontMenu: 'Font',
  textAlignMenu: 'Text',
  boldMenu: 'Bold',
  italicMenu: 'Italic',
  underlineMenu: 'Underline',
  alignLeftMenu: 'Align Left',
  alignCenterMenu: 'Center',
  alignRightMenu: 'Align Right',
  alignJustifyMenu: 'Justify',
  copyStyleMenu: 'Copy Style',
  pasteStyleMenu: 'Paste Style',
  actualImageSizeMenu: 'Resize Image to Actual Size',
  removeInstantAlphaMenu: 'Remove Instant Alpha',

  bringForward: 'Bring Forward',
  sendBackward: 'Send Backward',
  bringToFront: 'Bring to Front',
  sendToBack: 'Send to Back',
  alignObjectsMenu: 'Align',
  alignMiddleMenu: 'Vertical Center',
  lockMenu: 'Lock',
  unlockMenu: 'Unlock',

  shapeRect: 'Rectangle',
  shapeRounded: 'Rounded',
  shapeEllipse: 'Ellipse',
  shapePentagon: 'Pentagon',
  shapeSkewLeft: 'Skew Left',
  shapeSkewRight: 'Skew Right',

  findPlaceholder: 'Find text in balloons & lettering...',
  replacePlaceholder: 'Replace with...',
  findNextBtn: 'Find Next',
  replaceAllBtn: 'Replace All',
  matchCaseLabel: 'Match case',
  matchesFound: '{count} matches',

  inspector: 'Show Inspector',
  colors: 'Colors',
  fonts: 'Fonts',
  scriptDrawer: 'Script Editor',
  stampsMenu: 'Show Stamps',
  stampsTitle: 'Stamps',
  insertStampBtn: 'Insert',
  bringAllFrontMenu: 'Bring All to Front',
  shortcutsGuide: 'Keyboard Shortcuts & Guide',

  save: 'Save',
  saved: 'Saved',
  print: 'Print',
  preview: 'Preview',
  startComic: 'Start Comic',
  fit: 'Fit',
  front: 'Front',
  back: 'Back',
  style: 'Style',
  larger: 'Larger',
  smaller: 'Smaller',
  instantAlpha: 'Instant Alpha',
  script: 'Script',
  exportBtn: 'Export',
  templates: 'Templates',

  stroke: 'Stroke:',
  fill: 'Fill:',
  pageFill: 'Page Fill:',
  shadow: 'Shadow',
  radius: 'Radius',
  pad: 'Pad',
  opacity: 'Opacity',

  pages: 'PAGES',
  styles: 'STYLES',
  design: 'Design:',
  allDesigns: 'All Designs',
  builtInPrefix: 'Built-in:',
  pageTemplates: 'PAGE TEMPLATES',
  panelLayouts: 'PANEL LAYOUTS',
  folder: 'FOLDER:',
  allMedia: 'All Media',
  addMedia: 'Add',
  addUrl: 'URL',
  photos: 'PHOTOS',
  explorer: 'EXPLORER',
  camera: 'CAMERA',
  noPhotos: 'No photos in folder',
  uploadImage: 'Upload Image',
  captureToPanel: 'Capture to Panel',

  canvasHint: 'Double-click balloons/text to edit · Alt+Drag panel to pan photo',
  pageOf: 'Page {current} of {total}',
  currentZoom: 'Current: {pct}%',
  panPhoto: 'Pan Photo',
  panningImage: 'Panning Image',
  dropPhotoHere: 'Drop photo here',

  tabDocument: 'Document',
  tabPage: 'Page',
  tabStyle: 'Style',
  tabBalloon: 'Balloon',
  tabImage: 'Image',
  tabArrange: 'Arrange',
  tabMetrics: 'Metrics',
  tabText: 'Text',

  pageDimensions: 'Page Dimensions',
  orientation: 'Orientation',
  portrait: 'Portrait',
  landscape: 'Landscape',
  units: 'Units',
  customSize: 'Custom',
  width: 'Width',
  height: 'Height',
  margins: 'Margins',
  gutter: 'Gutter',
  backgroundColor: 'Background Color',
  pagePattern: 'Page Pattern',
  applyAllPages: 'Applies dimensions to entire document',

  fileInfo: 'File Info',
  sizeLabel: 'Size',
  constrainProportions: 'Constrain Proportions',
  originalSize: 'Original Size',
  positionLabel: 'Position',
  rotateLabel: 'Rotate',
  angleLabel: 'Angle',

  selectElementHint: 'Select a panel, balloon, text box, or lettering element to inspect.',
  panelShape: 'Panel Shape',
  photoFilter: 'Photo Filter',
  photoZoom: 'Photo Zoom',
  brightness: 'Brightness',
  contrast: 'Contrast',
  saturation: 'Saturation',
  clearPhoto: 'Clear Photo',
  replacePhoto: 'Replace Photo...',
  imageFitLabel: 'Image Fit',
  imageFitCover: 'Cover',
  imageFitContain: 'Contain',
  imageFitFill: 'Stretch',
  imageRotationLabel: 'Image Rotation',
  imagePositionLabel: 'Framing (X / Y)',
  resetImageAdjust: 'Reset',
  doneAdjustImage: 'Done',
  instantAlphaKnockout: 'Instant Alpha Knockout',
  keyColor: 'Key Color',
  tolerance: 'Tolerance',

  balloonShape: 'Balloon Shape',
  tailStyle: 'Tail Style',
  tailWidth: 'Tail Width',
  warpStyle: 'Warp Style',
  topGradient: 'Top Gradient',
  bottomGradient: 'Bottom Gradient',

  colorTargetFill: 'Fill',
  colorTargetStroke: 'Stroke',
  colorTargetText: 'Text',
  colorTargetPage: 'Page',
  setButton: 'Set',
  addFontFile: 'Load Font File (.ttf/.otf/.woff)',
  addGoogleFont: 'Google Font by Name',
  googleFontPlaceholder: 'e.g. Oswald, Anton, Creepster...',
  loadFontBtn: 'Load',
  customFontsTitle: 'Imported External Fonts',
  fontSize: 'Size',
  lineHeight: 'Line Height',
  letterSpacing: 'Spacing',
  insertTextBtn: '+ Insert Text Box',

  templateChooserTitle: 'Template Chooser',
  treeAll: 'All',
  treeMyTemplates: 'My Templates',
  treeVarious: 'Various',
  treeScripts: 'Scripts',
  treeBlank: 'Blank',
  treeSamples: 'Samples',
  treeComics: 'Comics',
  treeCertificates: 'Certificates',
  treeCreative: 'Creative',
  treeEducation: 'Education',
  treeHowTo: 'How To',
  treeLifeStories: 'Life Stories',
  treeSinglePanels: 'Single Panels',
  treeClassic: 'Classic',
  showOnStartupLabel: 'Show on startup',
  noRecentComics: 'No recent comics saved yet',
  openRecent: 'Open Recent',
  openExistingFile: 'Open Existing File...',
  cancel: 'Cancel',
  choose: 'Choose',
  exportComicTitle: 'Export',
  exportTabPdf: 'PDF',
  exportTabImages: 'Images',
  exportTabEpub: 'ePub',
  exportTabCbz: 'CBZ',
  exportToPdfTitle: 'Export to PDF',
  exportToImagesTitle: 'Export to Images',
  exportToEpubTitle: 'Export to ePub',
  exportToCbzTitle: 'Export to CBZ',
  imageLimitLabel: 'Image Limit:',
  pagesRangeLabel: 'Pages:',
  allPagesRadio: 'All',
  fromPageLabel: 'From:',
  toPageLabel: 'to:',
  nextExportBtn: 'Export...',
  bookTitleLabel: 'Title:',
  authorLabel: 'Author:',
  qualityLabel: 'Quality:',
  exportImagesHeader: 'Export High-Resolution Images',
  imageFormat: 'Image Format',
  resolutionScale: 'Resolution Scale',
  currentPageOnly: 'Current Page',
  allPagesLabel: 'All Pages',
  downloadBtn: 'Download',
  rendering: 'Exporting...',
  saveProjectFile: 'Save .comic4life',
  pageSetupTitle: 'Page Setup',
  usePageSetupPrinter: 'Use Page Setup:',
  pageSetupBtn: 'Page Setup...',
  useCustomSettings: 'Use custom settings',
  pageSizeLabel: 'Page Size:',
  docMarginsTitle: 'Document Margins',
  marginLeft: 'Left',
  marginRight: 'Right',
  marginTop: 'Top',
  marginBottom: 'Bottom',
  acceptBtn: 'OK',
  customPresetPlaceholder: 'Preset name...',
  exitReader: 'Exit Reader',
  readerHint: 'Use Arrow Keys (← / →) to flip pages · Esc to return to editor',
};

const fr: Translations = {
  ...en,
  menuFile: 'Fichier',
  menuEdit: 'Édition',
  menuView: 'Affichage',
  menuInsert: 'Insérer',
  menuFormat: 'Format',
  menuArrange: 'Disposition',
  menuWindow: 'Fenêtre',
  menuHelp: 'Aide',
  newBlankComic: 'Nouveau',
  newFromTemplate: 'Nouveau depuis modèle...',
  openProject: 'Ouvrir...',
  openRecentMenu: 'Ouvrir récent',
  closeDoc: 'Fermer',
  saveToBrowser: 'Enregistrer',
  saveAsFile: 'Enregistrer sous...',
  autoFillImages: 'Remplir automatiquement',
  importScriptMenu: 'Importer un scénario...',
  saveAsTemplateMenu: 'Enregistrer comme modèle...',
  newPage: 'Nouvelle page',
  insertImageFile: 'Importer une image...',
  pageSetupMenu: 'Format d’impression...',
  exportMenu: 'Exporter',
  printPdf: 'Imprimer...',
  quitApp: 'Quitter',
  stampsMenu: 'Afficher les tampons',
  stampsTitle: 'Tampons',
  insertStampBtn: 'Insérer',
  undo: 'Annuler',
  redo: 'Rétablir',
  alignMiddleMenu: 'Centre vertical',
  shapeRect: 'Rectangle',
  shapeRounded: 'Arrondi',
  shapeEllipse: 'Ellipse',
  shapePentagon: 'Pentagone',
  shapeSkewLeft: 'Incliné gauche',
  shapeSkewRight: 'Incliné droite',
  findPlaceholder: 'Rechercher dans les bulles...',
  replacePlaceholder: 'Remplacer par...',
  findNextBtn: 'Suivant',
  replaceAllBtn: 'Tout remplacer',
  matchCaseLabel: 'Respecter la casse',
  matchesFound: '{count} résultats',
  duplicateSelection: 'Dupliquer',
  deleteSelection: 'Supprimer',
  previewComic: 'Aperçu BD',
  zoomIn: 'Zoom +',
  zoomOut: 'Zoom -',
  zoomToFit: 'Ajuster',
  showRulers: 'Afficher les règles',
  showGuides: 'Afficher les repères',
  languageLabel: 'Langue',
  save: 'Enregistrer',
  saved: 'Enregistré',
  print: 'Imprimer',
  preview: 'Aperçu',
  startComic: 'Créer BD',
  fit: 'Ajuster',
  front: 'Avant',
  back: 'Arrière',
  style: 'Style',
  larger: 'Plus grand',
  smaller: 'Plus petit',
  instantAlpha: 'Alpha instantané',
  script: 'Scénario',
  exportBtn: 'Exporter',
  templates: 'Modèles',
  stroke: 'Contour:',
  fill: 'Fond:',
  pageFill: 'Fond page:',
  shadow: 'Ombre',
  radius: 'Rayon',
  pad: 'Marge',
  opacity: 'Opacité',
  pages: 'PAGES',
  styles: 'STYLES',
  design: 'Style:',
  allDesigns: 'Tous les modèles',
  builtInPrefix: 'Intégré :',
  pageTemplates: 'MODÈLES DE PAGE',
  panelLayouts: 'MISES EN PAGE',
  folder: 'DOSSIER:',
  photos: 'PHOTOS',
  explorer: 'EXPLORATEUR',
  camera: 'CAMÉRA',
  tabDocument: 'Document',
  tabPage: 'Page',
  tabStyle: 'Style',
  tabBalloon: 'Bulle',
  tabImage: 'Image',
  tabArrange: 'Ordre',
  tabMetrics: 'Mesures',
  tabText: 'Texte',
  width: 'Largeur',
  height: 'Hauteur',
  constrainProportions: 'Conserver les proportions',
  originalSize: 'Taille d’origine',
  positionLabel: 'Position',
  rotateLabel: 'Rotation',
  angleLabel: 'Angle',
  imageFitLabel: 'Ajustement',
  imageFitCover: 'Remplir',
  imageFitContain: 'Ajuster',
  imageFitFill: 'Étirer',
  imageRotationLabel: 'Rotation image',
  imagePositionLabel: 'Cadrage (X / Y)',
  resetImageAdjust: 'Réinitialiser',
  doneAdjustImage: 'Terminé',
  colorTargetFill: 'Fond',
  colorTargetStroke: 'Contour',
  colorTargetText: 'Texte',
  colorTargetPage: 'Page',
  setButton: 'Appliquer',
  templateChooserTitle: 'Sélecteur de modèles',
  treeAll: 'Tout',
  treeMyTemplates: 'Mes modèles',
  treeVarious: 'Divers',
  treeScripts: 'Scénarios',
  treeBlank: 'Vierge',
  treeSamples: 'Exemples',
  treeComics: 'BD',
  treeCertificates: 'Certificats',
  treeCreative: 'Créatif',
  treeEducation: 'Éducation',
  treeHowTo: 'Tutoriels',
  treeLifeStories: 'Histoires de vie',
  treeSinglePanels: 'Panneaux simples',
  treeClassic: 'Classique',
  showOnStartupLabel: 'Afficher au démarrage',
  noRecentComics: 'Aucune BD récente enregistrée',
  cancel: 'Annuler',
  choose: 'Choisir',
  exportComicTitle: 'Exporter',
  exportTabPdf: 'PDF',
  exportTabImages: 'Images',
  exportTabEpub: 'ePub',
  exportTabCbz: 'CBZ',
  exportToPdfTitle: 'Exporter en PDF',
  exportToImagesTitle: 'Exporter en Images',
  exportToEpubTitle: 'Exporter en ePub',
  exportToCbzTitle: 'Exporter en CBZ',
  imageLimitLabel: 'Limite d’image :',
  pagesRangeLabel: 'Pages :',
  allPagesRadio: 'Toutes',
  fromPageLabel: 'De :',
  toPageLabel: 'à :',
  nextExportBtn: 'Exporter...',
  bookTitleLabel: 'Titre :',
  authorLabel: 'Auteur :',
  qualityLabel: 'Qualité :',
  rendering: 'Exportation...',
  saveProjectFile: 'Enregistrer .comic4life',
  pageSetupTitle: 'Format d’impression',
  usePageSetupPrinter: 'Utiliser le format :',
  pageSetupBtn: 'Format d’impression...',
  useCustomSettings: 'Utiliser la configuration personnalisée',
  pageSizeLabel: 'Taille de page :',
  docMarginsTitle: 'Marges du document',
  marginLeft: 'Gauche',
  marginRight: 'Droite',
  marginTop: 'Haut',
  marginBottom: 'Bas',
  acceptBtn: 'Accepter',
  customPresetPlaceholder: 'Nom du format...',
};

const pt: Translations = {
  ...en,
  menuFile: 'Arquivo',
  menuEdit: 'Editar',
  menuView: 'Visualizar',
  menuInsert: 'Inserir',
  menuFormat: 'Formato',
  menuArrange: 'Organizar',
  menuWindow: 'Janela',
  menuHelp: 'Ajuda',
  newBlankComic: 'Novo',
  newFromTemplate: 'Novo a partir de modelo...',
  openProject: 'Abrir...',
  openRecentMenu: 'Abrir recente',
  closeDoc: 'Fechar',
  saveToBrowser: 'Salvar',
  saveAsFile: 'Salvar como...',
  autoFillImages: 'Preencher automaticamente',
  importScriptMenu: 'Importar roteiro...',
  saveAsTemplateMenu: 'Salvar como modelo...',
  newPage: 'Nova página',
  insertImageFile: 'Importar imagem...',
  pageSetupMenu: 'Configurar página...',
  exportMenu: 'Exportar',
  printPdf: 'Imprimir...',
  quitApp: 'Sair',
  stampsMenu: 'Mostrar selos',
  stampsTitle: 'Selos',
  insertStampBtn: 'Inserir',
  undo: 'Desfazer',
  redo: 'Refazer',
  alignMiddleMenu: 'Centro vertical',
  shapeRect: 'Retângulo',
  shapeRounded: 'Arredondado',
  shapeEllipse: 'Elipse',
  shapePentagon: 'Pentágono',
  shapeSkewLeft: 'Inclinado esq.',
  shapeSkewRight: 'Inclinado dir.',
  findPlaceholder: 'Buscar texto em balões...',
  replacePlaceholder: 'Substituir por...',
  findNextBtn: 'Próximo',
  replaceAllBtn: 'Substituir tudo',
  matchCaseLabel: 'Diferenciar maiúsc.',
  matchesFound: '{count} resultados',
  duplicateSelection: 'Duplicar seleção',
  deleteSelection: 'Excluir seleção',
  previewComic: 'Visualizar HQ',
  zoomIn: 'Mais zoom',
  zoomOut: 'Menos zoom',
  zoomToFit: 'Ajustar',
  showRulers: 'Mostrar réguas',
  showGuides: 'Mostrar guias',
  languageLabel: 'Idioma',
  save: 'Salvar',
  saved: 'Salvo',
  print: 'Imprimir',
  preview: 'Visualizar',
  startComic: 'Novo quadrinho',
  fit: 'Ajustar',
  front: 'Frente',
  back: 'Trás',
  style: 'Estilo',
  larger: 'Maior',
  smaller: 'Menor',
  instantAlpha: 'Alfa instantâneo',
  script: 'Roteiro',
  exportBtn: 'Exportar',
  templates: 'Modelos',
  stroke: 'Borda:',
  fill: 'Preench.:',
  pageFill: 'Fundo:',
  shadow: 'Sombra',
  radius: 'Raio',
  pad: 'Margem',
  opacity: 'Opacidade',
  pages: 'PÁGINAS',
  styles: 'ESTILOS',
  design: 'Design:',
  allDesigns: 'Todos os designs',
  builtInPrefix: 'Integrado:',
  pageTemplates: 'MODELOS DE PÁGINA',
  panelLayouts: 'LAYOUTS DE QUADROS',
  folder: 'PASTA:',
  photos: 'FOTOS',
  explorer: 'EXPLORADOR',
  camera: 'CÂMERA',
  tabDocument: 'Documento',
  tabPage: 'Página',
  tabStyle: 'Estilo',
  tabBalloon: 'Balão',
  tabImage: 'Imagem',
  tabArrange: 'Ordem',
  tabMetrics: 'Medidas',
  tabText: 'Texto',
  width: 'Largura',
  height: 'Altura',
  constrainProportions: 'Restringir proporções',
  originalSize: 'Tamanho original',
  positionLabel: 'Posição',
  rotateLabel: 'Girar',
  angleLabel: 'Ângulo',
  imageFitLabel: 'Ajuste da imagem',
  imageFitCover: 'Preencher',
  imageFitContain: 'Encaixar',
  imageFitFill: 'Esticar',
  imageRotationLabel: 'Rotação da imagem',
  imagePositionLabel: 'Enquadramento (X / Y)',
  resetImageAdjust: 'Redefinir',
  doneAdjustImage: 'Concluído',
  colorTargetFill: 'Preench.',
  colorTargetStroke: 'Borda',
  colorTargetText: 'Texto',
  colorTargetPage: 'Página',
  setButton: 'Aplicar',
  templateChooserTitle: 'Seletor de modelos',
  treeAll: 'Tudo',
  treeMyTemplates: 'Meus modelos',
  treeVarious: 'Vários',
  treeScripts: 'Roteiros',
  treeBlank: 'Em branco',
  treeSamples: 'Amostras',
  treeComics: 'Quadrinhos',
  treeCertificates: 'Certificados',
  treeCreative: 'Criativo',
  treeEducation: 'Educação',
  treeHowTo: 'Como fazer',
  treeLifeStories: 'Histórias de vida',
  treeSinglePanels: 'Quadros individuais',
  treeClassic: 'Clássico',
  showOnStartupLabel: 'Mostrar ao iniciar',
  noRecentComics: 'Nenhuma HQ recente salva',
  cancel: 'Cancelar',
  choose: 'Escolher',
  exportComicTitle: 'Exportar',
  exportTabPdf: 'PDF',
  exportTabImages: 'Imagens',
  exportTabEpub: 'ePub',
  exportTabCbz: 'CBZ',
  exportToPdfTitle: 'Exportar para PDF',
  exportToImagesTitle: 'Exportar para Imagens',
  exportToEpubTitle: 'Exportar para ePub',
  exportToCbzTitle: 'Exportar para CBZ',
  imageLimitLabel: 'Limite de imagem:',
  pagesRangeLabel: 'Páginas:',
  allPagesRadio: 'Todas',
  fromPageLabel: 'De:',
  toPageLabel: 'a:',
  nextExportBtn: 'Exportar...',
  bookTitleLabel: 'Título:',
  authorLabel: 'Autor:',
  qualityLabel: 'Qualidade:',
  rendering: 'Exportando...',
  saveProjectFile: 'Salvar .comic4life',
  pageSetupTitle: 'Configurar página',
  usePageSetupPrinter: 'Usar Configurar página:',
  pageSetupBtn: 'Configurar página...',
  useCustomSettings: 'Usar configuração personalizada',
  pageSizeLabel: 'Tamanho da página:',
  docMarginsTitle: 'Margens do documento',
  marginLeft: 'Esquerda',
  marginRight: 'Direita',
  marginTop: 'Superior',
  marginBottom: 'Inferior',
  acceptBtn: 'Aceitar',
  customPresetPlaceholder: 'Nome do tamanho...',
};

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  es,
  en,
  fr,
  pt,
};

export function detectInitialLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem('comic4life_lang_v1');
    if (saved === 'es' || saved === 'en' || saved === 'fr' || saved === 'pt') {
      return saved;
    }
    const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
    if (nav === 'es' || nav === 'en' || nav === 'fr' || nav === 'pt') {
      return nav;
    }
  } catch {
    // ignore
  }
  return 'es';
}
