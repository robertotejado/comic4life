export type PageSizeKey =
  | 'us-comic'
  | 'letter'
  | 'a4'
  | 'manga'
  | 'tabloid'
  | 'square'
  | 'custom';

export type BackgroundPattern = 'none' | 'halftone' | 'burst' | 'paper' | 'grid';

export type PanelShape =
  | 'rect'
  | 'rounded'
  | 'ellipse'
  | 'skew-left'
  | 'skew-right'
  | 'pentagon';

export type ImageFilterType =
  | 'none'
  | 'comic'
  | 'halftone'
  | 'bw-ink'
  | 'sepia'
  | 'sketch'
  | 'posterize'
  | 'vivid';

export type BalloonType =
  | 'speech'
  | 'thought'
  | 'whisper'
  | 'burst'
  | 'caption'
  | 'rect-speech'
  | 'exclaim'
  | 'text';

export type TailStyle = 'curved' | 'straight' | 'bubbles' | 'none';

export type LetteringWarp = 'none' | 'arc-up' | 'arc-down' | 'wave' | 'bulge' | 'slant';

export interface InstantAlphaConfig {
  enabled: boolean;
  color: string;
  tolerance: number; // 0 - 100
}

export interface BaseElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number; // 0 - 100
  zIndex: number;
  locked?: boolean;
}

export type ImageFitMode = 'cover' | 'contain' | 'fill';

export interface PanelElement extends BaseElement {
  kind: 'panel';
  shape: PanelShape;
  cornerRadius: number;
  strokeColor: string;
  strokeWidth: number;
  strokeEnabled: boolean;
  fillColor: string;
  fillEnabled: boolean;
  shadow: boolean;
  shadowColor: string;
  padding: number;
  imageUrl: string | null;
  imageScale: number; // 0.25 - 4
  imageOffsetX: number; // percentage -200 to 200
  imageOffsetY: number;
  imageRotation?: number; // degrees -180 to 180
  imageFit?: ImageFitMode;
  flipX?: boolean;
  flipY?: boolean;
  imageFilter: ImageFilterType;
  brightness: number; // 50 - 150
  contrast: number; // 50 - 150
  saturation: number; // 0 - 200
  instantAlpha: InstantAlphaConfig;
}

export interface BalloonTail {
  enabled: boolean;
  tipX: number; // relative to page coordinates
  tipY: number; // relative to page coordinates
  style: TailStyle;
  width: number;
}

export interface BalloonElement extends BaseElement {
  kind: 'balloon';
  balloonType: BalloonType;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  italic: boolean;
  underline: boolean;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textColor: string;
  fillColor: string;
  fillEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  strokeEnabled: boolean;
  shadow: boolean;
  cornerRadius: number;
  padding: number;
  tail: BalloonTail;
}

export interface LetteringElement extends BaseElement {
  kind: 'lettering';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  italic: boolean;
  underline: boolean;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  fillTopColor: string;
  fillBottomColor: string;
  strokeColor: string;
  strokeWidth: number;
  strokeEnabled: boolean;
  shadow: boolean;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  warp: LetteringWarp;
}

export type ComicElement = PanelElement | BalloonElement | LetteringElement;

export interface ComicPage {
  id: string;
  name?: string;
  backgroundColor: string;
  backgroundPattern: BackgroundPattern;
  margin: number;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  gutter: number;
  elements: ComicElement[];
}

export interface ScriptEntry {
  id: string;
  type: 'page' | 'panel' | 'dialogue' | 'caption' | 'sfx';
  speaker?: string;
  text: string;
}

export interface ComicDocument {
  id: string;
  title: string;
  pageSize: PageSizeKey;
  pageWidth: number;
  pageHeight: number;
  pages: ComicPage[];
  script: ScriptEntry[];
  updatedAt: number;
}

export type LayoutCategory =
  | 'Basic'
  | "00's Comic"
  | "40's Comic"
  | "60's Comic 1"
  | "60's Comic 2"
  | "80's Comic"
  | 'Conceptual'
  | 'Euro Comic 1'
  | 'Euro Comic 2'
  | 'Futuristic'
  | 'Graphic Novel'
  | 'Manga 1'
  | 'Manga 2'
  | 'Maps'
  | 'Picture-In-Picture'
  | 'Strips';

export interface LayoutSlot {
  nx: number; // 0..1 normalized inside content box
  ny: number;
  nw: number;
  nh: number;
  shape?: PanelShape;
  cornerRadius?: number;
}

export interface PageLayoutPreset {
  id: string;
  name: string;
  category: LayoutCategory;
  slots: LayoutSlot[];
}

export interface StylePreset {
  id: string;
  name: string;
  target: 'panel' | 'balloon' | 'lettering' | 'page';
  previewBg: string;
  previewBorder: string;
  previewText?: string;
  apply: Record<string, unknown>;
}

export interface ComicTemplate {
  id: string;
  name: string;
  category:
    | 'Various'
    | 'Blank'
    | 'Samples'
    | 'Certificates'
    | 'Creative'
    | 'Education'
    | 'How To'
    | 'Life Stories'
    | 'Single Panels'
    | 'Classic';
  group: 'My Templates' | 'Scripts' | 'Comics';
  accentColor: string;
  pageBg: string;
  pagePattern?: BackgroundPattern;
  defaultFontFamily?: string;
  previewTheme?: string;
  headerBanner?: {
    text: string;
    bg: string;
    color: string;
    stroke?: string;
  };
  layoutId: string;
  defaultPanelStroke: string;
  defaultPanelWidth: number;
  defaultBalloonFill: string;
  sampleElements?: Array<{
    kind: 'balloon' | 'lettering';
    text: string;
    x: number;
    y: number;
    w: number;
    h: number;
    balloonType?: BalloonType;
  }>;
  scriptLines?: ScriptEntry[];
  savedPages?: ComicPage[];
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  folder: string;
  createdAt: number;
}

export interface CustomFontAsset {
  id: string;
  family: string;
  source: 'file' | 'google';
  url: string; // dataUrl for uploaded font, css URL for Google Font
}
