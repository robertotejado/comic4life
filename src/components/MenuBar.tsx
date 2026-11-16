import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Globe } from 'lucide-react';
import { LANGUAGE_LABELS, LanguageCode, Translations } from '../i18n/translations';
import { PanelShape } from '../types/comic';
import { ExportMode } from './ExportModal';

interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  divider?: boolean;
  disabled?: boolean;
  checked?: boolean;
  action?: () => void;
  children?: MenuItem[];
}

export interface MenuBarProps {
  t: Translations;
  lang: LanguageCode;
  onChangeLang: (lang: LanguageCode) => void;
  docTitle: string;
  onRenameDoc: (title: string) => void;
  recentDocs: Array<{ id: string; title: string; updatedAt: number }>;

  // File menu
  onNewBlankComic: () => void;
  onStartComic: () => void;
  onOpenFile: () => void;
  onOpenRecent: (id: string) => void;
  onCloseDoc: () => void;
  onSave: () => void;
  onSaveAsFile: () => void;
  canAutoFill: boolean;
  onAutoFillImages: () => void;
  onImportScript: () => void;
  onSaveAsTemplate: () => void;
  onImportImageFile: () => void;
  onInsertImageUrl: () => void;
  onPageSetup: () => void;
  onExport: (tab?: ExportMode) => void;
  onPrint: () => void;
  onQuitApp?: () => void;

  // Edit menu
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onCutSelected: () => void;
  onCopySelected: () => void;
  onPasteSelected: () => void;
  canPaste: boolean;
  onPasteWithStyle: () => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  onDeleteCurrentPage: () => void;
  canDeletePage: boolean;
  onSelectFirstOrAll: () => void;
  onDeselect: () => void;
  onOpenFind: () => void;
  hasSelection: boolean;

  // View menu
  showLeftSidebar: boolean;
  onToggleLeftSidebar: () => void;
  showRightSidebar: boolean;
  onToggleRightSidebar: () => void;
  showBottomDock: boolean;
  onToggleBottomDock: () => void;
  showFormatBar: boolean;
  onToggleFormatBar: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onSetZoom: (z: number) => void;
  showRulers: boolean;
  onToggleRulers: () => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnapGrid: () => void;
  canPrevPage: boolean;
  canNextPage: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;

  // Insert menu
  onAddBlankPage: () => void;
  onAddPage: () => void;
  onDuplicateCurrentPage: () => void;
  onAddPageWithCurrentPanels: () => void;
  onInsertPageNumber: () => void;
  onInsertPageCount: () => void;
  onAddPanel: (shape?: PanelShape) => void;
  onAddSpeech: () => void;
  onAddThought: () => void;
  onAddCaption: () => void;
  onAddTextBox: () => void;
  onAddLettering: () => void;

  // Format menu
  isTextElementSelected: boolean;
  isPanelSelected: boolean;
  hasPanelImage: boolean;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
  onTextLarger: () => void;
  onTextSmaller: () => void;
  onSetTextAlign: (align: 'left' | 'center' | 'right' | 'justify') => void;
  onSetPanelShape: (shape: PanelShape) => void;
  onCopyStyle: () => void;
  onPasteStyle: () => void;
  canPasteStyle: boolean;
  onActualImageSize: () => void;
  onEnableInstantAlpha: () => void;
  onDisableInstantAlpha: () => void;

  // Arrange menu
  onBringForward: () => void;
  onBringToFront: () => void;
  onSendBackward: () => void;
  onSendToBack: () => void;
  onAlignSelected: (dir: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  isSelectedLocked: boolean;
  onToggleLock: (locked: boolean) => void;

  // Window & Help
  showInspector: boolean;
  showColors: boolean;
  showFonts: boolean;
  showScript: boolean;
  showStamps: boolean;
  onToggleInspector: () => void;
  onToggleColors: () => void;
  onToggleFonts: () => void;
  onToggleScript: () => void;
  onToggleStamps: () => void;
  onBringAllToFront: () => void;
  onTogglePreview: () => void;
  onShowShortcuts: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = (props) => {
  const {
    t,
    lang,
    onChangeLang,
    docTitle,
    onRenameDoc,
    recentDocs,
    hasSelection,
  } = props;

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [hoveredSubId, setHoveredSubId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(docTitle);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftTitle(docTitle);
  }, [docTitle]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setHoveredSubId(null);
      }
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, []);

  const shapes: Array<{ id: PanelShape; label: string }> = [
    { id: 'rect', label: t.shapeRect },
    { id: 'rounded', label: t.shapeRounded },
    { id: 'ellipse', label: t.shapeEllipse },
    { id: 'pentagon', label: t.shapePentagon },
    { id: 'skew-left', label: t.shapeSkewLeft },
    { id: 'skew-right', label: t.shapeSkewRight },
  ];

  const menus: Record<string, MenuItem[]> = {
    [t.menuFile]: [
      { id: 'f-new', label: t.newBlankComic, shortcut: 'Ctrl+N', action: props.onNewBlankComic },
      { id: 'f-tpl', label: t.newFromTemplate, shortcut: 'Shift+Ctrl+N', action: props.onStartComic },
      { id: 'f-open', label: t.openProject, shortcut: 'Ctrl+O', action: props.onOpenFile },
      {
        id: 'f-recent',
        label: t.openRecentMenu,
        children:
          recentDocs.length > 0
            ? recentDocs.map((r) => ({
                id: `rec-${r.id}`,
                label: r.title,
                action: () => props.onOpenRecent(r.id),
              }))
            : [{ id: 'rec-empty', label: t.noRecentComics, disabled: true }],
      },
      { id: 'f-div1', label: '', divider: true },
      { id: 'f-close', label: t.closeDoc, shortcut: 'Ctrl+W', action: props.onCloseDoc },
      { id: 'f-save', label: t.saveToBrowser, shortcut: 'Ctrl+S', action: props.onSave },
      { id: 'f-saveas', label: t.saveAsFile, shortcut: 'Shift+Ctrl+S', action: props.onSaveAsFile },
      { id: 'f-div2', label: '', divider: true },
      { id: 'f-start', label: t.startComic + '...', action: props.onStartComic },
      { id: 'f-autofill', label: t.autoFillImages, disabled: !props.canAutoFill, action: props.onAutoFillImages },
      { id: 'f-div3', label: '', divider: true },
      { id: 'f-script', label: t.importScriptMenu, action: props.onImportScript },
      { id: 'f-img', label: t.insertImageFile, action: props.onImportImageFile },
      {
        id: 'f-export',
        label: t.exportMenu,
        children: [
          { id: 'exp-pdf', label: 'PDF...', action: () => props.onExport('pdf') },
          { id: 'exp-img', label: `${t.exportTabImages}...`, action: () => props.onExport('images') },
          { id: 'exp-epub', label: 'ePub...', action: () => props.onExport('epub') },
          { id: 'exp-cbz', label: 'CBZ...', action: () => props.onExport('cbz') },
        ],
      },
      { id: 'f-div4', label: '', divider: true },
      { id: 'f-savetpl', label: t.saveAsTemplateMenu, action: props.onSaveAsTemplate },
      { id: 'f-div5', label: '', divider: true },
      { id: 'f-setup', label: t.pageSetupMenu, action: props.onPageSetup },
      { id: 'f-print', label: t.printPdf, shortcut: 'Ctrl+P', action: props.onPrint },
      ...(props.onQuitApp
        ? [
            { id: 'f-div6', label: '', divider: true },
            { id: 'f-quit', label: t.quitApp, shortcut: 'Ctrl+Q', action: props.onQuitApp },
          ]
        : []),
    ],

    [t.menuEdit]: [
      { id: 'e-undo', label: t.undo, shortcut: 'Ctrl+Z', disabled: !props.canUndo, action: props.onUndo },
      { id: 'e-redo', label: t.redo, shortcut: 'Shift+Ctrl+Z', disabled: !props.canRedo, action: props.onRedo },
      { id: 'e-div1', label: '', divider: true },
      { id: 'e-cut', label: t.cut, shortcut: 'Ctrl+X', disabled: !hasSelection || props.isSelectedLocked, action: props.onCutSelected },
      { id: 'e-copy', label: t.copy, shortcut: 'Ctrl+C', disabled: !hasSelection, action: props.onCopySelected },
      { id: 'e-paste', label: t.paste, shortcut: 'Ctrl+V', disabled: !props.canPaste, action: props.onPasteSelected },
      { id: 'e-pastestyle', label: t.pasteStyle, shortcut: 'Shift+Ctrl+V', disabled: !hasSelection || !props.canPasteStyle, action: props.onPasteWithStyle },
      { id: 'e-del', label: t.deleteSelection, shortcut: 'Del', disabled: !hasSelection || props.isSelectedLocked, action: props.onDeleteSelected },
      { id: 'e-delpage', label: t.deletePageMenu, shortcut: 'Shift+Ctrl+D', disabled: !props.canDeletePage, action: props.onDeleteCurrentPage },
      { id: 'e-div2', label: '', divider: true },
      { id: 'e-dup', label: t.duplicateSelection, shortcut: 'Ctrl+D', disabled: !hasSelection, action: props.onDuplicateSelected },
      { id: 'e-div3', label: '', divider: true },
      { id: 'e-selall', label: t.selectAllMenu, shortcut: 'Ctrl+A', action: props.onSelectFirstOrAll },
      { id: 'e-desel', label: t.deselectMenu, disabled: !hasSelection, action: props.onDeselect },
      { id: 'e-div4', label: '', divider: true },
      { id: 'e-find', label: t.findMenu, shortcut: 'Ctrl+F', action: props.onOpenFind },
    ],

    [t.menuView]: [
      { id: 'v-left', label: t.togglePagesStyles, shortcut: 'Ctrl+1', checked: props.showLeftSidebar, action: props.onToggleLeftSidebar },
      { id: 'v-right', label: t.toggleLayoutsPhotos, shortcut: 'Ctrl+2', checked: props.showRightSidebar, action: props.onToggleRightSidebar },
      { id: 'v-dock', label: t.toggleElementDock, shortcut: 'Ctrl+3', checked: props.showBottomDock, action: props.onToggleBottomDock },
      { id: 'v-div1', label: '', divider: true },
      { id: 'v-script', label: t.scriptDrawer, checked: props.showScript, action: props.onToggleScript },
      { id: 'v-guides', label: t.showGuides, checked: props.showGuides, action: props.onToggleGuides },
      { id: 'v-rulers', label: t.showRulers, checked: props.showRulers, action: props.onToggleRulers },
      { id: 'v-div2', label: '', divider: true },
      { id: 'v-grid', label: t.showGridMenu, checked: props.showGrid, action: props.onToggleGrid },
      { id: 'v-snap', label: t.snapGridMenu, checked: props.snapToGrid, action: props.onToggleSnapGrid },
      { id: 'v-div3', label: '', divider: true },
      {
        id: 'v-zoom',
        label: 'Zoom',
        children: [
          { id: 'z-in', label: t.zoomIn, shortcut: 'Ctrl++', action: props.onZoomIn },
          { id: 'z-out', label: t.zoomOut, shortcut: 'Ctrl+-', action: props.onZoomOut },
          { id: 'z-fit', label: t.zoomToFit, shortcut: 'Ctrl+0', action: props.onZoomFit },
          { id: 'z-div', label: '', divider: true },
          { id: 'z-50', label: '50%', action: () => props.onSetZoom(0.5) },
          { id: 'z-100', label: '100%', action: () => props.onSetZoom(1) },
          { id: 'z-150', label: '150%', action: () => props.onSetZoom(1.5) },
        ],
      },
      { id: 'v-preview', label: t.previewComic, shortcut: 'F5', action: props.onTogglePreview },
      { id: 'v-div4', label: '', divider: true },
      { id: 'v-prev', label: t.prevPageMenu, disabled: !props.canPrevPage, action: props.onPrevPage },
      { id: 'v-next', label: t.nextPageMenu, disabled: !props.canNextPage, action: props.onNextPage },
      { id: 'v-div5', label: '', divider: true },
      { id: 'v-fmt', label: t.toggleFormatBar, checked: props.showFormatBar, action: props.onToggleFormatBar },
    ],

    [t.menuInsert]: [
      { id: 'i-blank', label: t.newBlankPage, shortcut: 'Shift+Ctrl+B', action: props.onAddBlankPage },
      { id: 'i-dup', label: t.duplicatePageMenu, action: props.onDuplicateCurrentPage },
      { id: 'i-div1', label: '', divider: true },
      { id: 'i-curpanels', label: t.pageWithCurrentPanels, action: props.onAddPageWithCurrentPanels },
      { id: 'i-div2', label: '', divider: true },
      { id: 'i-pnum', label: t.pageNumberMenu, action: props.onInsertPageNumber },
      { id: 'i-pcnt', label: t.pageCountMenu, action: props.onInsertPageCount },
      { id: 'i-div3', label: '', divider: true },
      { id: 'i-balloon', label: t.speechBalloon, action: props.onAddSpeech },
      { id: 'i-thought', label: t.thoughtBalloon, action: props.onAddThought },
      { id: 'i-caption', label: t.captionBox, action: props.onAddCaption },
      { id: 'i-text', label: t.textBox, action: props.onAddTextBox },
      { id: 'i-let', label: t.comicLettering, action: props.onAddLettering },
      { id: 'i-panel', label: t.panelFrame, action: () => props.onAddPanel() },
      {
        id: 'i-shape',
        label: t.shapeMenu,
        children: shapes.map((s) => ({
          id: `ins-sh-${s.id}`,
          label: s.label,
          action: () => props.onAddPanel(s.id),
        })),
      },
      { id: 'i-div4', label: '', divider: true },
      { id: 'i-imgfile', label: t.imageFromDevice, action: props.onImportImageFile },
      { id: 'i-imgurl', label: t.imageFromUrl, action: props.onInsertImageUrl },
    ],

    [t.menuFormat]: [
      {
        id: 'fmt-font',
        label: t.fontMenu,
        children: [
          { id: 'ff-bold', label: t.boldMenu, disabled: !props.isTextElementSelected, action: props.onToggleBold },
          { id: 'ff-italic', label: t.italicMenu, disabled: !props.isTextElementSelected, action: props.onToggleItalic },
          { id: 'ff-under', label: t.underlineMenu, disabled: !props.isTextElementSelected, action: props.onToggleUnderline },
          { id: 'ff-div', label: '', divider: true },
          { id: 'ff-big', label: t.larger, disabled: !props.isTextElementSelected && !props.hasPanelImage, action: props.onTextLarger },
          { id: 'ff-small', label: t.smaller, disabled: !props.isTextElementSelected && !props.hasPanelImage, action: props.onTextSmaller },
          { id: 'ff-win', label: `${t.fonts}...`, action: props.onToggleFonts },
        ],
      },
      {
        id: 'fmt-text',
        label: t.textAlignMenu,
        children: [
          { id: 'ta-l', label: t.alignLeftMenu, disabled: !props.isTextElementSelected, action: () => props.onSetTextAlign('left') },
          { id: 'ta-c', label: t.alignCenterMenu, disabled: !props.isTextElementSelected, action: () => props.onSetTextAlign('center') },
          { id: 'ta-r', label: t.alignRightMenu, disabled: !props.isTextElementSelected, action: () => props.onSetTextAlign('right') },
          { id: 'ta-j', label: t.alignJustifyMenu, disabled: !props.isTextElementSelected, action: () => props.onSetTextAlign('justify') },
        ],
      },
      { id: 'fmt-color', label: t.colors, shortcut: 'Shift+Ctrl+C', action: props.onToggleColors },
      { id: 'fmt-div1', label: '', divider: true },
      {
        id: 'fmt-shape',
        label: t.shapeMenu,
        children: shapes.map((s) => ({
          id: `fmt-sh-${s.id}`,
          label: s.label,
          disabled: !props.isPanelSelected,
          action: () => props.onSetPanelShape(s.id),
        })),
      },
      { id: 'fmt-div2', label: '', divider: true },
      { id: 'fmt-cpstyle', label: t.copyStyleMenu, disabled: !hasSelection, action: props.onCopyStyle },
      { id: 'fmt-ptstyle', label: t.pasteStyleMenu, disabled: !hasSelection || !props.canPasteStyle, action: props.onPasteStyle },
      { id: 'fmt-div3', label: '', divider: true },
      { id: 'fmt-img100', label: t.actualImageSizeMenu, shortcut: 'Shift+Ctrl+0', disabled: !props.hasPanelImage, action: props.onActualImageSize },
      { id: 'fmt-div4', label: '', divider: true },
      { id: 'fmt-alpha1', label: t.instantAlpha, disabled: !props.hasPanelImage, action: props.onEnableInstantAlpha },
      { id: 'fmt-alpha0', label: t.removeInstantAlphaMenu, disabled: !props.hasPanelImage, action: props.onDisableInstantAlpha },
    ],

    [t.menuArrange]: [
      { id: 'a-fwd', label: t.bringForward, shortcut: 'Ctrl+Alt+F', disabled: !hasSelection, action: props.onBringForward },
      { id: 'a-front', label: t.bringToFront, shortcut: 'Ctrl+[', disabled: !hasSelection, action: props.onBringToFront },
      { id: 'a-bwd', label: t.sendBackward, shortcut: 'Ctrl+Alt+B', disabled: !hasSelection, action: props.onSendBackward },
      { id: 'a-back', label: t.sendToBack, shortcut: 'Ctrl+]', disabled: !hasSelection, action: props.onSendToBack },
      { id: 'a-div1', label: '', divider: true },
      {
        id: 'a-align',
        label: t.alignObjectsMenu,
        children: [
          { id: 'al-l', label: t.alignLeftMenu, disabled: !hasSelection || props.isSelectedLocked, action: () => props.onAlignSelected('left') },
          { id: 'al-c', label: t.alignCenterMenu, disabled: !hasSelection || props.isSelectedLocked, action: () => props.onAlignSelected('center') },
          { id: 'al-r', label: t.alignRightMenu, disabled: !hasSelection || props.isSelectedLocked, action: () => props.onAlignSelected('right') },
          { id: 'al-div', label: '', divider: true },
          { id: 'al-t', label: t.marginTop, disabled: !hasSelection || props.isSelectedLocked, action: () => props.onAlignSelected('top') },
          { id: 'al-m', label: t.alignMiddleMenu, disabled: !hasSelection || props.isSelectedLocked, action: () => props.onAlignSelected('middle') },
          { id: 'al-b', label: t.marginBottom, disabled: !hasSelection || props.isSelectedLocked, action: () => props.onAlignSelected('bottom') },
        ],
      },
      { id: 'a-div2', label: '', divider: true },
      { id: 'a-lock', label: t.lockMenu, shortcut: 'Ctrl+L', disabled: !hasSelection || props.isSelectedLocked, action: () => props.onToggleLock(true) },
      { id: 'a-unlock', label: t.unlockMenu, shortcut: 'Shift+Ctrl+L', disabled: !hasSelection || !props.isSelectedLocked, action: () => props.onToggleLock(false) },
    ],

    [t.menuWindow]: [
      { id: 'w-zoom', label: 'Zoom', action: props.onZoomFit },
      { id: 'w-div1', label: '', divider: true },
      { id: 'w-insp', label: t.inspector, shortcut: 'Ctrl+I', checked: props.showInspector, action: props.onToggleInspector },
      { id: 'w-col', label: t.colors, checked: props.showColors, action: props.onToggleColors },
      { id: 'w-fnt', label: t.fonts, checked: props.showFonts, action: props.onToggleFonts },
      { id: 'w-scr', label: t.scriptDrawer, checked: props.showScript, action: props.onToggleScript },
      { id: 'w-stamps', label: t.stampsMenu, checked: props.showStamps, action: props.onToggleStamps },
      { id: 'w-div2', label: '', divider: true },
      { id: 'w-front', label: t.bringAllFrontMenu, action: props.onBringAllToFront },
      { id: 'w-div3', label: '', divider: true },
      { id: 'w-doc', label: docTitle, checked: true, action: () => setOpenMenu(null) },
    ],

    [t.menuHelp]: [
      { id: 'h-keys', label: t.shortcutsGuide, action: props.onShowShortcuts },
    ],
  };

  return (
    <div
      ref={barRef}
      className="no-print h-7 bg-[#f1f3f6] border-b border-slate-300 flex items-center justify-between px-2 text-[12px] text-slate-800 select-none shrink-0 z-50"
    >
      <div className="flex items-center gap-0.5">
        <div className="flex items-center gap-1.5 pr-3 pl-1 font-semibold text-slate-900 whitespace-nowrap shrink-0">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-gradient-to-br from-amber-400 to-red-600 text-[9px] font-extrabold text-white shadow-xs">
            C4
          </span>
          <span>Comic4Life</span>
        </div>

        {Object.keys(menus).map((menuName) => (
          <div key={menuName} className="relative">
            <button
              type="button"
              onClick={() => {
                setOpenMenu(openMenu === menuName ? null : menuName);
                setHoveredSubId(null);
              }}
              onMouseEnter={() => {
                if (openMenu) {
                  setOpenMenu(menuName);
                  setHoveredSubId(null);
                }
              }}
              className={`px-2 py-0.5 rounded-sm transition-colors whitespace-nowrap shrink-0 ${
                openMenu === menuName
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-200 text-slate-800'
              }`}
            >
              {menuName}
            </button>

            {openMenu === menuName && (
              <div className="absolute left-0 top-full mt-0.5 min-w-[260px] bg-white border border-slate-300 shadow-xl rounded-sm py-1 z-50">
                {menus[menuName].map((item) =>
                  item.divider ? (
                    <div key={item.id} className="my-1 border-t border-slate-200" />
                  ) : (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() =>
                        setHoveredSubId(item.children ? item.id : null)
                      }
                    >
                      <button
                        type="button"
                        disabled={item.disabled}
                        onClick={() => {
                          if (item.children) {
                            setHoveredSubId(item.id);
                            return;
                          }
                          setOpenMenu(null);
                          setHoveredSubId(null);
                          item.action?.();
                        }}
                        className={`w-full px-3 py-1 text-left flex items-center justify-between text-[12px] ${
                          item.disabled
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'text-slate-800 hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="w-3 inline-block text-center">
                            {item.checked ? '✓' : ''}
                          </span>
                          <span>{item.label}</span>
                        </span>

                        {item.children ? (
                          <ChevronRight className="w-3.5 h-3.5 opacity-75 ml-4" />
                        ) : item.shortcut ? (
                          <span className="text-[11px] opacity-65 font-mono ml-5 whitespace-nowrap">
                            {item.shortcut}
                          </span>
                        ) : null}
                      </button>

                      {/* Flyout Submenu */}
                      {item.children && hoveredSubId === item.id && (
                        <div className="absolute left-full top-0 -ml-0.5 min-w-[200px] bg-white border border-slate-300 shadow-xl rounded-sm py-1 z-50">
                          {item.children.map((sub) =>
                            sub.divider ? (
                              <div
                                key={sub.id}
                                className="my-1 border-t border-slate-200"
                              />
                            ) : (
                              <button
                                key={sub.id}
                                type="button"
                                disabled={sub.disabled}
                                onClick={() => {
                                  setOpenMenu(null);
                                  setHoveredSubId(null);
                                  sub.action?.();
                                }}
                                className={`w-full px-3 py-1 text-left flex items-center justify-between text-[12px] ${
                                  sub.disabled
                                    ? 'text-slate-400 cursor-not-allowed'
                                    : 'text-slate-800 hover:bg-blue-600 hover:text-white'
                                }`}
                              >
                                <span className="truncate">{sub.label}</span>
                                {sub.shortcut && (
                                  <span className="text-[11px] opacity-65 font-mono ml-4 whitespace-nowrap">
                                    {sub.shortcut}
                                  </span>
                                )}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right side: Language Switcher + Document Title */}
      <div className="flex items-center gap-3 text-[12px] text-slate-600 pr-2">
        <label className="flex items-center gap-1 text-[11px] text-slate-700" title={t.languageLabel}>
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <select
            value={lang}
            onChange={(e) => onChangeLang(e.target.value as LanguageCode)}
            className="bg-white border border-slate-300 rounded-xs px-1.5 py-0 text-[11px] font-medium text-slate-800 outline-none cursor-pointer"
          >
            {(Object.keys(LANGUAGE_LABELS) as LanguageCode[]).map((code) => (
              <option key={code} value={code}>
                {LANGUAGE_LABELS[code]}
              </option>
            ))}
          </select>
        </label>

        {editingTitle ? (
          <input
            autoFocus
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={() => {
              setEditingTitle(false);
              onRenameDoc(draftTitle.trim() || 'untitled.comic4life');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditingTitle(false);
                onRenameDoc(draftTitle.trim() || 'untitled.comic4life');
              }
            }}
            className="bg-white border border-blue-500 rounded px-1.5 py-0 text-slate-900 text-[12px] outline-none w-44"
          />
        ) : (
          <button
            type="button"
            title="Click to rename document"
            onClick={() => setEditingTitle(true)}
            className="hover:text-slate-950 hover:underline font-medium truncate max-w-[200px]"
          >
            {docTitle}
          </button>
        )}
      </div>
    </div>
  );
};
