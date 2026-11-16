import React, { useState } from 'react';
import { FolderOpen, Trash2, X } from 'lucide-react';
import { ComicTemplate } from '../types/comic';
import { COMIC_TEMPLATES, PAGE_LAYOUT_PRESETS } from '../data/presets';
import { Translations } from '../i18n/translations';

interface TemplateChooserModalProps {
  t: Translations;
  isOpen: boolean;
  recentDocs: Array<{ id: string; title: string; updatedAt: number }>;
  userTemplates?: ComicTemplate[];
  showOnStartup: boolean;
  onToggleShowOnStartup: (value: boolean) => void;
  onClose: () => void;
  onChooseTemplate: (tpl: ComicTemplate) => void;
  onDeleteUserTemplate?: (id: string) => void;
  onOpenRecent: (id: string) => void;
  onOpenExistingFile: () => void;
}

interface TreeFilter {
  key: string;
  label: string;
  group?: ComicTemplate['group'];
  category?: ComicTemplate['category'];
}

const renderTemplateThumbnail = (tpl: ComicTemplate) => {
  if (tpl.savedPages?.length) {
    const first = tpl.savedPages[0];
    return (
      <div
        className="w-full h-full relative p-1.5 overflow-hidden"
        style={{ backgroundColor: first.backgroundColor || tpl.pageBg }}
      >
        <svg viewBox="0 0 680 960" className="w-full h-full">
          {first.elements.map((el) => (
            <rect
              key={el.id}
              x={el.x}
              y={el.y}
              width={Math.max(12, el.width)}
              height={Math.max(12, el.height)}
              rx={el.kind === 'balloon' ? 16 : el.kind === 'panel' ? el.cornerRadius : 4}
              fill={
                el.kind === 'lettering'
                  ? el.fillTopColor
                  : el.fillEnabled
                    ? el.fillColor
                    : 'transparent'
              }
              stroke={el.strokeEnabled ? el.strokeColor : 'none'}
              strokeWidth={el.strokeEnabled ? Math.max(4, el.strokeWidth * 2) : 0}
            />
          ))}
        </svg>
      </div>
    );
  }

  const layout =
    PAGE_LAYOUT_PRESETS.find((l) => l.id === tpl.layoutId) ||
    PAGE_LAYOUT_PRESETS[0];

  if (tpl.group === 'Scripts') {
    return (
      <div className="w-full h-full bg-white p-2.5 flex flex-col gap-1 text-left">
        <div className="h-1.5 w-10 bg-slate-500 rounded-xs mx-auto mb-1" />
        <div className="h-1 w-full bg-slate-300 rounded-xs" />
        <div className="h-1 w-11/12 bg-slate-300 rounded-xs" />
        <div className="h-1 w-4/5 bg-slate-300 rounded-xs" />
        {tpl.previewTheme !== 'script' && (
          <>
            <div className="h-1.5 w-8 bg-slate-600 rounded-xs mx-auto mt-1.5" />
            <div className="h-1 w-3/4 bg-slate-300 rounded-xs mx-auto" />
            <div className="h-1 w-2/3 bg-slate-300 rounded-xs mx-auto" />
            <div className="h-1 w-full bg-slate-200 rounded-xs mt-1" />
            <div className="h-1 w-5/6 bg-slate-200 rounded-xs" />
          </>
        )}
      </div>
    );
  }

  if (tpl.previewTheme === 'kdp') {
    return (
      <div className="w-full h-full bg-white relative flex flex-col justify-between p-2">
        <div className="flex-1 border border-dashed border-slate-300" />
        <div className="flex justify-end pt-1">
          <span className="text-[9px] text-black leading-none">▼</span>
        </div>
      </div>
    );
  }

  if (tpl.previewTheme === 'blank') {
    return (
      <div className="w-full h-full bg-white relative p-2">
        {tpl.id === 'tpl-blank-styles' && (
          <div className="w-full h-full border border-slate-200 grid grid-cols-2 gap-1 p-1">
            <div className="border border-slate-300 bg-slate-50" />
            <div className="border border-slate-300 bg-slate-50" />
            <div className="border border-slate-300 bg-slate-50" />
            <div className="border border-slate-300 bg-slate-50" />
          </div>
        )}
      </div>
    );
  }

  if (tpl.previewTheme === 'sunburst-gold') {
    return (
      <div
        className="w-full h-full relative flex flex-col items-center justify-between p-1.5 overflow-hidden"
        style={{
          background:
            'repeating-conic-gradient(from 0deg, #f97316 0deg 12deg, #fef08a 12deg 24deg)',
        }}
      >
        <div className="w-full bg-orange-600/95 border border-amber-200 text-amber-100 text-[7px] font-black text-center py-0.5 leading-tight shadow-xs">
          OUTSTANDING EFFORT
        </div>
        <div className="w-4/5 h-10 bg-white/95 border-2 border-orange-900 rounded-xs shadow-xs" />
        <div className="w-full h-3 bg-white/90 border border-orange-800 rounded-xs" />
      </div>
    );
  }

  if (tpl.previewTheme === 'sunburst-red') {
    return (
      <div
        className="w-full h-full relative flex flex-col items-center justify-between p-1.5 overflow-hidden"
        style={{
          background:
            'repeating-conic-gradient(from 0deg, #991b1b 0deg 14deg, #450a0a 14deg 28deg)',
        }}
      >
        <div className="text-[7px] font-black text-yellow-300 text-center drop-shadow">
          SUPERHERO AWARD
        </div>
        <div className="w-12 h-12 rounded-full bg-white border-2 border-yellow-400 shadow-md" />
        <div className="w-4/5 h-2.5 bg-yellow-400 text-red-900 text-[6px] font-bold text-center rounded-xs">
          AWARDED TO
        </div>
      </div>
    );
  }

  if (
    tpl.previewTheme === 'certificate-green' ||
    tpl.previewTheme === 'certificate-teal'
  ) {
    const borderCol =
      tpl.previewTheme === 'certificate-green' ? '#16a34a' : '#0f766e';
    return (
      <div
        className="w-full h-full bg-white p-1.5 flex flex-col justify-between"
        style={{ border: `4px solid ${borderCol}` }}
      >
        <div
          className="text-[7px] font-black text-center leading-tight py-0.5 text-white"
          style={{ backgroundColor: borderCol }}
        >
          {tpl.headerBanner?.text}
        </div>
        <div className="space-y-1 px-1">
          <div className="h-0.5 bg-slate-400 w-4/5 mx-auto" />
          <div className="h-0.5 bg-slate-300 w-3/5 mx-auto" />
        </div>
        <div className="flex justify-between px-1 pb-0.5">
          <div className="h-0.5 bg-slate-400 w-5" />
          <div className="h-0.5 bg-slate-400 w-5" />
        </div>
      </div>
    );
  }

  if (
    tpl.previewTheme === 'trading-hero' ||
    tpl.previewTheme === 'trading-player'
  ) {
    const quadColors =
      tpl.previewTheme === 'trading-hero'
        ? ['#ec4899', '#22c55e', '#facc15', '#06b6d4']
        : ['#22c55e', '#06b6d4', '#ec4899', '#facc15'];
    return (
      <div className="w-full h-full bg-slate-900 p-1 grid grid-cols-2 grid-rows-2 gap-1">
        {quadColors.map((col, idx) => (
          <div
            key={idx}
            className="rounded-[2px] p-1 flex flex-col justify-between border border-white/70"
            style={{ backgroundColor: col }}
          >
            <div className="h-1.5 w-full bg-black/70 rounded-xs" />
            <div className="flex-1 my-0.5 bg-white/90 border border-black/40" />
            <div className="h-1 w-2/3 bg-black/60 rounded-xs" />
          </div>
        ))}
      </div>
    );
  }

  if (
    tpl.previewTheme === 'newspaper-classic' ||
    tpl.previewTheme === 'newspaper-modern'
  ) {
    const isModern = tpl.previewTheme === 'newspaper-modern';
    return (
      <div
        className="w-full h-full p-1.5 flex flex-col gap-1"
        style={{ backgroundColor: tpl.pageBg }}
      >
        <div
          className="text-[7px] font-black text-center py-0.5 border-b-2 border-slate-900"
          style={{
            backgroundColor: isModern ? '#b91c1c' : '#1c1917',
            color: '#ffffff',
          }}
        >
          The Daily News
        </div>
        <div className="h-1.5 bg-slate-800 w-full" />
        <div className="flex-1 grid grid-cols-3 gap-1">
          <div className="col-span-2 bg-white border border-slate-400" />
          <div className="space-y-0.5">
            <div className="h-1 bg-slate-400" />
            <div className="h-1 bg-slate-400" />
            <div className="h-1 bg-slate-400 w-4/5" />
            <div className="h-4 bg-white border border-slate-400 mt-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full relative flex flex-col overflow-hidden"
      style={{
        backgroundColor: tpl.pageBg,
        background:
          tpl.previewTheme === 'cool-squad'
            ? 'linear-gradient(155deg, #2563eb 0%, #dc2626 42%, #ea580c 100%)'
            : tpl.previewTheme === 'tales'
              ? 'linear-gradient(180deg, #0f172a 0%, #0f766e 100%)'
              : tpl.pageBg,
      }}
    >
      {tpl.headerBanner && (
        <div
          className="py-1 px-1 text-center font-extrabold uppercase tracking-tight leading-none truncate shrink-0"
          style={{
            backgroundColor: tpl.headerBanner.bg,
            color: tpl.headerBanner.color,
            fontSize: '7.5px',
            fontFamily: tpl.defaultFontFamily || 'Bangers, sans-serif',
          }}
        >
          {tpl.headerBanner.text}
        </div>
      )}
      {tpl.previewTheme === 'super-story' && (
        <div className="absolute top-4 -right-3 w-10 h-3 bg-pink-500 rotate-45 shadow-xs" />
      )}
      <div className="flex-1 relative p-1.5">
        <svg viewBox="0 0 100 130" className="w-full h-full">
          {layout.slots.map((s, idx) => (
            <rect
              key={idx}
              x={s.nx * 100}
              y={s.ny * 130}
              width={Math.max(4, s.nw * 100)}
              height={Math.max(4, s.nh * 130)}
              rx={s.shape === 'ellipse' ? 40 : 1}
              fill="#ffffff"
              fillOpacity={0.94}
              stroke={tpl.defaultPanelStroke}
              strokeWidth="1.8"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export const TemplateChooserModal: React.FC<TemplateChooserModalProps> = ({
  t,
  isOpen,
  recentDocs,
  userTemplates = [],
  showOnStartup,
  onToggleShowOnStartup,
  onClose,
  onChooseTemplate,
  onDeleteUserTemplate,
  onOpenRecent,
  onOpenExistingFile,
}) => {
  const allTemplates = [...userTemplates, ...COMIC_TEMPLATES];
  const [activeFilter, setActiveFilter] = useState<TreeFilter>({
    key: 'all',
    label: t.treeAll,
  });
  const [selectedId, setSelectedId] = useState<string>(allTemplates[0].id);
  const [cardScale, setCardScale] = useState<number>(110);
  const [showRecentMenu, setShowRecentMenu] = useState(false);

  if (!isOpen) return null;

  const treeSections: Array<{
    key: string;
    title: string;
    filter: TreeFilter;
    children?: TreeFilter[];
  }> = [
    {
      key: 'all',
      title: t.treeAll,
      filter: { key: 'all', label: t.treeAll },
    },
    {
      key: 'my-templates',
      title: t.treeMyTemplates,
      filter: { key: 'my-templates', label: t.treeMyTemplates, group: 'My Templates' },
      children: [
        { key: 'my-various', label: t.treeVarious, group: 'My Templates', category: 'Various' },
      ],
    },
    {
      key: 'scripts',
      title: t.treeScripts,
      filter: { key: 'scripts', label: t.treeScripts, group: 'Scripts' },
      children: [
        { key: 'scripts-blank', label: t.treeBlank, group: 'Scripts', category: 'Blank' },
        { key: 'scripts-samples', label: t.treeSamples, group: 'Scripts', category: 'Samples' },
      ],
    },
    {
      key: 'comics',
      title: t.treeComics,
      filter: { key: 'comics', label: t.treeComics, group: 'Comics' },
      children: [
        { key: 'comics-blank', label: t.treeBlank, group: 'Comics', category: 'Blank' },
        { key: 'comics-certs', label: t.treeCertificates, group: 'Comics', category: 'Certificates' },
        { key: 'comics-creative', label: t.treeCreative, group: 'Comics', category: 'Creative' },
        { key: 'comics-edu', label: t.treeEducation, group: 'Comics', category: 'Education' },
        { key: 'comics-howto', label: t.treeHowTo, group: 'Comics', category: 'How To' },
        { key: 'comics-life', label: t.treeLifeStories, group: 'Comics', category: 'Life Stories' },
        { key: 'comics-single', label: t.treeSinglePanels, group: 'Comics', category: 'Single Panels' },
        { key: 'comics-classic', label: t.treeClassic, group: 'Comics', category: 'Classic' },
      ],
    },
  ];

  const filteredTemplates = allTemplates.filter((tpl) => {
    if (activeFilter.group && tpl.group !== activeFilter.group) return false;
    if (activeFilter.category && tpl.category !== activeFilter.category) return false;
    return true;
  });

  const selectedTemplate =
    filteredTemplates.find((tpl) => tpl.id === selectedId) ||
    filteredTemplates[0] ||
    allTemplates[0];

  const isSelectedFilter = (f: TreeFilter) => activeFilter.key === f.key;

  return (
    <div className="no-print fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-[1100px] h-[86vh] bg-[#e5e7eb] border border-slate-600 rounded shadow-2xl flex flex-col overflow-hidden">
        {/* Window Title Bar */}
        <div className="h-8 bg-[#f1f3f6] border-b border-slate-300 px-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-800">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-gradient-to-br from-amber-400 to-red-600 text-[9px] font-extrabold text-white">
              C4
            </span>
            <span>{t.templateChooserTitle}</span>
            <span className="text-[11px] font-normal text-slate-500 tabular-nums">
              · {filteredTemplates.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 text-slate-600"
            aria-label={t.cancel}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Split Area (matches Picture 2) */}
        <div className="flex-1 flex min-h-0">
          {/* Left Category Tree */}
          <div className="w-[195px] bg-white border-r border-slate-400/70 flex flex-col justify-between shrink-0">
            <div className="overflow-y-auto py-1 text-[12px]">
              {treeSections.map((sec) => (
                <div key={sec.key}>
                  <button
                    type="button"
                    onClick={() => setActiveFilter(sec.filter)}
                    className={`w-full text-left px-3 py-1 font-semibold transition-colors ${
                      isSelectedFilter(sec.filter)
                        ? 'bg-[#1d5ec4] text-white'
                        : 'text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {sec.title}
                  </button>
                  {sec.children?.map((child) => (
                    <button
                      key={child.key}
                      type="button"
                      onClick={() => setActiveFilter(child)}
                      className={`w-full text-left pl-6 pr-3 py-1 transition-colors ${
                        isSelectedFilter(child)
                          ? 'bg-[#1d5ec4] text-white font-medium'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Scale Slider bottom-left */}
            <div className="h-9 border-t border-slate-200 px-3 flex items-center justify-center gap-2 bg-[#f8fafc]">
              <span className="text-[10px] text-slate-500">▪</span>
              <input
                type="range"
                min={84}
                max={148}
                value={cardScale}
                onChange={(e) => setCardScale(Number(e.target.value))}
                className="w-24 accent-blue-600 cursor-pointer"
                title="Thumbnail Zoom"
              />
              <span className="text-[12px] text-slate-600">■</span>
            </div>
          </div>

          {/* Dark Slate Template Grid */}
          <div
            className="flex-1 bg-[#1b2430] overflow-y-auto p-5 grid gap-5 content-start justify-start"
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${cardScale}px, 1fr))`,
            }}
          >
            {filteredTemplates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;
              return (
                <div key={tpl.id} className="group relative flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedId(tpl.id)}
                    onDoubleClick={() => onChooseTemplate(tpl)}
                    className="w-full flex flex-col items-center focus:outline-none"
                  >
                    <div
                      className={`w-full aspect-[3/4] rounded-[2px] overflow-hidden shadow-lg transition-all relative flex flex-col ${
                        isSelected
                          ? 'ring-2 ring-amber-400 scale-[1.03]'
                          : 'ring-1 ring-white/25 group-hover:ring-white/65'
                      }`}
                    >
                      {renderTemplateThumbnail(tpl)}
                    </div>
                    <span
                      className={`mt-1.5 text-[11px] text-center leading-tight line-clamp-2 ${
                        isSelected ? 'text-amber-300 font-semibold' : 'text-slate-200'
                      }`}
                    >
                      {tpl.name}
                    </span>
                  </button>
                  {tpl.group === 'My Templates' && onDeleteUserTemplate && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteUserTemplate(tpl.id);
                      }}
                      title={t.deleteSelection}
                      className="absolute top-1 right-1 p-1 rounded bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="h-11 bg-[#dfe2e7] border-t border-slate-400 px-3 flex items-center justify-between shrink-0 text-[12px]">
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRecentMenu((v) => !v)}
                className="h-7 px-3 bg-white hover:bg-slate-50 border border-slate-400 rounded-xs text-slate-800 flex items-center gap-2 shadow-2xs"
              >
                <span>{t.openRecent}</span>
                <span className="text-[9px] text-slate-500">▼</span>
              </button>
              {showRecentMenu && (
                <div className="absolute left-0 bottom-full mb-1 w-64 bg-white border border-slate-400 rounded shadow-lg py-1 z-20">
                  {recentDocs.length === 0 ? (
                    <div className="px-3 py-2 text-[11px] text-slate-400">
                      {t.noRecentComics}
                    </div>
                  ) : (
                    recentDocs.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setShowRecentMenu(false);
                          onOpenRecent(r.id);
                        }}
                        className="w-full px-3 py-1.5 text-left text-[11px] hover:bg-blue-600 hover:text-white flex justify-between"
                      >
                        <span className="truncate font-medium">{r.title}</span>
                        <span className="opacity-65 tabular-nums ml-2">
                          {new Date(r.updatedAt).toLocaleDateString()}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenExistingFile}
              className="h-7 px-3 bg-white hover:bg-slate-50 border border-slate-400 rounded-xs text-slate-800 flex items-center gap-1.5 shadow-2xs"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.openExistingFile}</span>
            </button>

            <label className="ml-2 flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnStartup}
                onChange={(e) => onToggleShowOnStartup(e.target.checked)}
                className="accent-blue-600"
              />
              <span>{t.showOnStartupLabel}</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-7 px-4 bg-white hover:bg-slate-50 border border-slate-400 rounded-xs text-slate-800 shadow-2xs"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={() => selectedTemplate && onChooseTemplate(selectedTemplate)}
              className="h-7 px-5 bg-[#1d5ec4] hover:bg-blue-700 text-white font-semibold rounded-xs shadow-2xs"
            >
              {t.choose}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
