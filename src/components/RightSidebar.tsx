import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  FolderOpen,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Search,
  Upload,
} from 'lucide-react';
import {
  ComicTemplate,
  LayoutSlot,
  MediaAsset,
  PageLayoutPreset,
} from '../types/comic';
import {
  COMIC_TEMPLATES,
  LAYOUT_CATEGORIES,
  PAGE_LAYOUT_PRESETS,
} from '../data/presets';
import { Translations } from '../i18n/translations';

interface RightSidebarProps {
  t: Translations;
  mediaAssets: MediaAsset[];
  userTemplates?: ComicTemplate[];
  onApplyLayout: (layout: PageLayoutPreset) => void;
  onAddPageWithLayout: (layout: PageLayoutPreset) => void;
  onApplyTemplateToPage: (template: ComicTemplate) => void;
  onSelectMediaAsset: (url: string) => void;
  onUploadMedia: (assets: MediaAsset[]) => void;
}

function renderSlotShape(slot: LayoutSlot, idx: number) {
  const x = 2 + slot.nx * 56;
  const y = 2 + slot.ny * 84;
  const w = Math.max(2, slot.nw * 56);
  const h = Math.max(2, slot.nh * 84);

  if (slot.shape === 'ellipse') {
    return (
      <ellipse
        key={idx}
        cx={x + w / 2}
        cy={y + h / 2}
        rx={w / 2}
        ry={h / 2}
        fill="#c4c9d1"
        stroke="#64748b"
        strokeWidth="0.9"
      />
    );
  }
  if (slot.shape === 'skew-left') {
    const sk = Math.min(4, w * 0.14);
    return (
      <polygon
        key={idx}
        points={`${x + sk},${y} ${x + w},${y} ${x + w - sk},${y + h} ${x},${y + h}`}
        fill="#c4c9d1"
        stroke="#64748b"
        strokeWidth="0.9"
      />
    );
  }
  if (slot.shape === 'skew-right') {
    const sk = Math.min(4, w * 0.14);
    return (
      <polygon
        key={idx}
        points={`${x},${y} ${x + w - sk},${y} ${x + w},${y + h} ${x + sk},${y + h}`}
        fill="#c4c9d1"
        stroke="#64748b"
        strokeWidth="0.9"
      />
    );
  }
  if (slot.shape === 'pentagon') {
    return (
      <polygon
        key={idx}
        points={`${x + w * 0.5},${y} ${x + w},${y + h * 0.36} ${x + w * 0.82},${y + h} ${x + w * 0.18},${y + h} ${x},${y + h * 0.36}`}
        fill="#c4c9d1"
        stroke="#64748b"
        strokeWidth="0.9"
      />
    );
  }
  return (
    <rect
      key={idx}
      x={x}
      y={y}
      width={w}
      height={h}
      rx={slot.shape === 'rounded' ? 3 : 1}
      fill="#c4c9d1"
      stroke="#64748b"
      strokeWidth="0.9"
    />
  );
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  t,
  mediaAssets,
  userTemplates = [],
  onApplyLayout,
  onAddPageWithLayout,
  onApplyTemplateToPage,
  onSelectMediaAsset,
  onUploadMedia,
}) => {
  const [topTab, setTopTab] = useState<'templates' | 'layouts'>('layouts');
  const [designFilter, setDesignFilter] = useState<string>('Basic');

  const [bottomTab, setBottomTab] = useState<'photos' | 'explorer' | 'camera'>('photos');
  const [folderFilter, setFolderFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [thumbSize, setThumbSize] = useState<number>(2);
  const [showUrlBar, setShowUrlBar] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [isMediaDragOver, setIsMediaDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (bottomTab !== 'camera') {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      return;
    }

    let cancelled = false;
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera API is unavailable in this browser context.');
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      })
      .catch(() => {
        if (!cancelled) {
          setCameraError('Camera permission denied or no webcam found.');
        }
      });

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
      }
    };
  }, [bottomTab]);

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const newAsset: MediaAsset = {
      id: `cam-${Date.now()}`,
      name: `CAM SNAP ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      url: dataUrl,
      folder: 'Camera Captures',
      createdAt: Date.now(),
    };
    onUploadMedia([newAsset]);
    onSelectMediaAsset(dataUrl);
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files?.length) return;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!imageFiles.length) return;

    Promise.all(
      imageFiles.map(
        (file) =>
          new Promise<MediaAsset>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                name: file.name.replace(/\.[^.]+$/, '').toUpperCase(),
                url: typeof reader.result === 'string' ? reader.result : '',
                folder: 'My Photos',
                createdAt: Date.now(),
              });
            };
            reader.readAsDataURL(file);
          })
      )
    ).then((loaded) => {
      onUploadMedia(loaded.filter((a) => Boolean(a.url)));
    });
  };

  const handleAddExternalUrl = () => {
    const clean = urlDraft.trim();
    if (!clean) return;
    const newAsset: MediaAsset = {
      id: `url-${Date.now()}`,
      name: clean.split('/').pop()?.slice(0, 18).toUpperCase() || 'WEB IMAGE',
      url: clean,
      folder: 'My Photos',
      createdAt: Date.now(),
    };
    onUploadMedia([newAsset]);
    onSelectMediaAsset(clean);
    setUrlDraft('');
    setShowUrlBar(false);
  };

  const filteredLayouts = PAGE_LAYOUT_PRESETS.filter(
    (l) => designFilter === 'All' || l.category === designFilter
  );

  const filteredTemplates = [
    ...userTemplates,
    ...COMIC_TEMPLATES.filter((tpl) => tpl.group === 'Comics'),
  ];

  const filteredMedia = mediaAssets.filter((m) => {
    const folderOk = folderFilter === 'All' || m.folder === folderFilter;
    const searchOk =
      !searchQuery.trim() ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return folderOk && searchOk;
  });

  return (
    <aside className="no-print w-[274px] bg-[#eceef1] border-l border-slate-400/80 flex flex-col shrink-0 select-none">
      {/* TOP HALF: Page Templates / Panel Layouts */}
      <div className="h-[46%] flex flex-col border-b border-slate-400/80 min-h-0">
        {/* Design Filter Bar (All 16 Comic Life Categories) */}
        <div className="h-9 px-2.5 bg-[#e5e8ec] border-b border-slate-300 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] font-medium text-slate-700 shrink-0">
            {t.design}
          </span>
          <select
            value={designFilter}
            onChange={(e) => setDesignFilter(e.target.value)}
            className="flex-1 h-6 bg-white border border-slate-400 rounded-xs px-1.5 text-[11px] text-slate-800 outline-none"
          >
            <option value="All">{t.allDesigns}</option>
            {LAYOUT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {`${t.builtInPrefix} ${cat}`}
              </option>
            ))}
          </select>
        </div>

        {/* Layouts / Page Templates Grid */}
        <div className="flex-1 overflow-y-auto p-2 bg-[#f5f6f8]">
          {topTab === 'layouts' ? (
            <div className="grid grid-cols-4 gap-1.5">
              {filteredLayouts.map((layout) => (
                <div
                  key={layout.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/x-comic-layout', layout.id);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className="group relative bg-white border border-slate-300 hover:border-blue-500 rounded-xs p-1 cursor-grab active:cursor-grabbing shadow-2xs transition-all"
                  title={`${layout.name} (${layout.category})`}
                  onClick={() => onApplyLayout(layout)}
                >
                  <svg viewBox="0 0 60 88" className="w-full h-16 block pointer-events-none">
                    {layout.slots.map((slot, i) => renderSlotShape(slot, i))}
                  </svg>
                  <button
                    type="button"
                    title={t.newPage}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPageWithLayout(layout);
                    }}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-blue-600 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-xs transition-opacity"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {filteredTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/x-comic-template', tpl.id);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => onApplyTemplateToPage(tpl)}
                  title={tpl.name}
                  className="flex flex-col items-center bg-white border border-slate-300 hover:border-blue-500 rounded-xs p-1 text-left shadow-2xs transition-all cursor-grab active:cursor-grabbing"
                >
                  <div
                    className="w-full h-14 rounded-2xs border border-slate-300 flex flex-col overflow-hidden pointer-events-none"
                    style={{ backgroundColor: tpl.pageBg }}
                  >
                    {tpl.headerBanner && (
                      <div
                        className="h-3 w-full text-[6px] font-bold flex items-center justify-center truncate px-0.5"
                        style={{
                          backgroundColor: tpl.headerBanner.bg,
                          color: tpl.headerBanner.color,
                        }}
                      >
                        {tpl.headerBanner.text}
                      </div>
                    )}
                    <div className="flex-1 p-1 grid grid-cols-2 gap-0.5">
                      <div className="bg-white/80 border border-slate-400/70" />
                      <div className="bg-white/80 border border-slate-400/70" />
                    </div>
                  </div>
                  <span className="mt-1 text-[9px] font-medium text-slate-700 truncate w-full text-center">
                    {tpl.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Top Pane Tab Bar */}
        <div className="h-7 bg-[#dfe2e7] border-t border-slate-300 flex text-[10px] font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setTopTab('templates')}
            className={`flex-1 uppercase tracking-tight border-r border-slate-300 transition-colors whitespace-nowrap px-1 truncate ${
              topTab === 'templates'
                ? 'bg-[#f5f6f8] text-slate-900'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {t.pageTemplates}
          </button>
          <button
            type="button"
            onClick={() => setTopTab('layouts')}
            className={`flex-1 uppercase tracking-tight transition-colors whitespace-nowrap px-1 truncate ${
              topTab === 'layouts'
                ? 'bg-[#f5f6f8] text-slate-900'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {t.panelLayouts}
          </button>
        </div>
      </div>

      {/* BOTTOM HALF: Photos / Explorer / Camera */}
      <div className="flex-1 flex flex-col min-h-0">
        {bottomTab !== 'camera' ? (
          <>
            <div className="px-2 py-1.5 bg-[#e5e8ec] border-b border-slate-300 flex flex-col gap-1.5 shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-700 shrink-0">
                  {t.folder}
                </span>
                <select
                  value={folderFilter}
                  onChange={(e) => setFolderFilter(e.target.value)}
                  className="flex-1 min-w-0 h-6 bg-white border border-slate-400 rounded-xs px-1 text-[10px] font-medium text-slate-800 outline-none"
                >
                  <option value="All">{t.allMedia}</option>
                  <option value="Comic Panels">Comic Panels</option>
                  <option value="My Photos">My Photos</option>
                  <option value="Camera Captures">Camera Captures</option>
                </select>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title={t.uploadImage}
                  className="h-6 px-1.5 bg-white hover:bg-blue-50 border border-slate-400 rounded-xs text-[10px] font-semibold text-slate-800 flex items-center gap-0.5 shrink-0"
                >
                  <Upload className="w-3 h-3 text-blue-600" />
                  <span>{t.addMedia}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlBar((v) => !v)}
                  title={t.imageFromUrl}
                  className={`h-6 px-1.5 border border-slate-400 rounded-xs text-[10px] font-semibold flex items-center shrink-0 ${
                    showUrlBar
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white hover:bg-blue-50 text-slate-800'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
              </div>

              {showUrlBar && (
                <div className="flex items-center gap-1">
                  <input
                    type="url"
                    placeholder="https://... image URL"
                    value={urlDraft}
                    onChange={(e) => setUrlDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddExternalUrl();
                    }}
                    className="flex-1 h-6 px-1.5 bg-white border border-slate-400 rounded-xs text-[10px] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddExternalUrl}
                    className="h-6 px-2 bg-[#1d5ec4] text-white rounded-xs text-[10px] font-semibold"
                  >
                    {t.loadFontBtn}
                  </button>
                </div>
              )}

              {bottomTab === 'explorer' && (
                <div className="relative">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1.5" />
                  <input
                    type="text"
                    placeholder="Filter assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-6 pl-6 pr-2 bg-white border border-slate-400 rounded-xs text-[11px] outline-none"
                  />
                </div>
              )}
            </div>

            <div
              className={`flex-1 overflow-y-auto p-2 bg-white transition-all ${
                isMediaDragOver ? 'ring-2 ring-inset ring-blue-500 bg-blue-50/40' : ''
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                if (!isMediaDragOver) setIsMediaDragOver(true);
              }}
              onDragLeave={() => setIsMediaDragOver(false)}
              onDrop={(e) => {
                setIsMediaDragOver(false);
                if (e.dataTransfer.files?.length) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFilesSelected(e.dataTransfer.files);
                  return;
                }
                const droppedUri =
                  e.dataTransfer.getData('text/uri-list') ||
                  e.dataTransfer.getData('text/plain');
                if (
                  droppedUri &&
                  (/^(https?:|data:image\/)/i.test(droppedUri.trim()))
                ) {
                  e.preventDefault();
                  e.stopPropagation();
                  const clean = droppedUri.trim().split('\n')[0];
                  onUploadMedia([
                    {
                      id: `url-${Date.now()}`,
                      name: clean.split('/').pop()?.slice(0, 18).toUpperCase() || 'WEB IMAGE',
                      url: clean,
                      folder: 'My Photos',
                      createdAt: Date.now(),
                    },
                  ]);
                }
              }}
            >
              {filteredMedia.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                  <ImageIcon className="w-7 h-7 mb-1.5 opacity-60" />
                  <p className="text-[11px] font-medium">{t.noPhotos}</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 px-2.5 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700"
                  >
                    {t.uploadImage}
                  </button>
                </div>
              ) : (
                <div
                  className={`grid gap-2 ${
                    thumbSize === 3 ? 'grid-cols-3' : 'grid-cols-2'
                  }`}
                >
                  {filteredMedia.map((asset) => (
                    <div
                      key={asset.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/x-comic-asset', asset.url);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => onSelectMediaAsset(asset.url)}
                      className="group cursor-grab active:cursor-grabbing flex flex-col items-center"
                    >
                      <div className="w-full aspect-[4/3] bg-slate-100 border-2 border-slate-300 group-hover:border-amber-500 rounded-2xs overflow-hidden shadow-xs transition-colors">
                        <img
                          src={asset.url}
                          alt={asset.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="mt-1 text-[9px] font-semibold text-slate-700 truncate w-full text-center tracking-tight">
                        {asset.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-6 px-4 bg-[#eef0f3] border-t border-slate-300 flex items-center justify-center gap-2 shrink-0">
              <span className="text-[9px] text-slate-500">▪▪▪</span>
              <input
                type="range"
                min={2}
                max={3}
                step={1}
                value={thumbSize === 3 ? 2 : 3}
                onChange={(e) => setThumbSize(Number(e.target.value) === 2 ? 3 : 2)}
                className="w-24 accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-600">■</span>
            </div>
          </>
        ) : (
          <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center p-3 text-white">
            {cameraError ? (
              <div className="text-center space-y-2 px-2">
                <Camera className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-[11px] text-slate-300 leading-snug">
                  {cameraError}
                </p>
                <button
                  type="button"
                  onClick={() => setBottomTab('photos')}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[11px]"
                >
                  {t.photos}
                </button>
              </div>
            ) : (
              <>
                <div className="w-full aspect-[4/3] bg-black rounded overflow-hidden border border-slate-700 mb-3 relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] text-slate-400">
                      Starting camera...
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!cameraActive}
                  onClick={handleCapturePhoto}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded text-[12px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t.captureToPanel}</span>
                </button>
              </>
            )}
          </div>
        )}

        <div className="h-8 bg-[#dfe2e7] border-t border-slate-400/80 flex items-center text-[10px] font-bold shrink-0">
          <button
            type="button"
            onClick={() => setBottomTab('photos')}
            className={`flex-1 h-full flex items-center justify-center gap-1 border-r border-slate-300 transition-colors whitespace-nowrap ${
              bottomTab === 'photos'
                ? 'bg-white text-slate-900'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.photos}</span>
          </button>
          <button
            type="button"
            onClick={() => setBottomTab('explorer')}
            className={`flex-1 h-full flex items-center justify-center gap-1 border-r border-slate-300 transition-colors whitespace-nowrap ${
              bottomTab === 'explorer'
                ? 'bg-white text-slate-900'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-sky-600" />
            <span>{t.explorer}</span>
          </button>
          <button
            type="button"
            onClick={() => setBottomTab('camera')}
            className={`flex-1 h-full flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
              bottomTab === 'camera'
                ? 'bg-white text-slate-900'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-slate-700" />
            <span>{t.camera}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
