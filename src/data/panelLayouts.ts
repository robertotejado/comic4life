import { LayoutCategory, PageLayoutPreset } from '../types/comic';

export const LAYOUT_CATEGORIES: LayoutCategory[] = [
  'Basic',
  "00's Comic",
  "40's Comic",
  "60's Comic 1",
  "60's Comic 2",
  "80's Comic",
  'Conceptual',
  'Euro Comic 1',
  'Euro Comic 2',
  'Futuristic',
  'Graphic Novel',
  'Manga 1',
  'Manga 2',
  'Maps',
  'Picture-In-Picture',
  'Strips',
];

export const PAGE_LAYOUT_PRESETS: PageLayoutPreset[] = [
  // 1. BASIC
  {
    id: 'basic-6-grid',
    name: 'Basic 2×3 Grid',
    category: 'Basic',
    slots: [
      { nx: 0, ny: 0, nw: 0.485, nh: 0.32 },
      { nx: 0.515, ny: 0, nw: 0.485, nh: 0.32 },
      { nx: 0, ny: 0.34, nw: 0.485, nh: 0.32 },
      { nx: 0.515, ny: 0.34, nw: 0.485, nh: 0.32 },
      { nx: 0, ny: 0.68, nw: 0.485, nh: 0.32 },
      { nx: 0.515, ny: 0.68, nw: 0.485, nh: 0.32 },
    ],
  },
  {
    id: 'basic-3-rows',
    name: '3 Horizontal Tiers',
    category: 'Basic',
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.31 },
      { nx: 0, ny: 0.345, nw: 1, nh: 0.31 },
      { nx: 0, ny: 0.69, nw: 1, nh: 0.31 },
    ],
  },
  {
    id: 'basic-hero-top',
    name: 'Wide Hero + Dual Bottom',
    category: 'Basic',
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.48 },
      { nx: 0, ny: 0.51, nw: 0.54, nh: 0.49 },
      { nx: 0.57, ny: 0.51, nw: 0.43, nh: 0.49 },
    ],
  },
  {
    id: 'basic-2x2',
    name: '2×2 Classic Quad',
    category: 'Basic',
    slots: [
      { nx: 0, ny: 0, nw: 0.485, nh: 0.485 },
      { nx: 0.515, ny: 0, nw: 0.485, nh: 0.485 },
      { nx: 0, ny: 0.515, nw: 0.485, nh: 0.485 },
      { nx: 0.515, ny: 0.515, nw: 0.485, nh: 0.485 },
    ],
  },
  {
    id: 'basic-asymmetric-5',
    name: 'Storyteller 5-Panel',
    category: 'Basic',
    slots: [
      { nx: 0, ny: 0, nw: 0.64, nh: 0.34 },
      { nx: 0.665, ny: 0, nw: 0.335, nh: 0.34 },
      { nx: 0, ny: 0.365, nw: 1, nh: 0.3 },
      { nx: 0, ny: 0.69, nw: 0.38, nh: 0.31 },
      { nx: 0.405, ny: 0.69, nw: 0.595, nh: 0.31 },
    ],
  },
  {
    id: 'basic-single',
    name: 'Single Full Page',
    category: 'Basic',
    slots: [{ nx: 0, ny: 0, nw: 1, nh: 1 }],
  },
  {
    id: 'basic-9-grid',
    name: 'Watchmen 3×3 Grid',
    category: 'Basic',
    slots: [
      { nx: 0, ny: 0, nw: 0.315, nh: 0.315 },
      { nx: 0.342, ny: 0, nw: 0.315, nh: 0.315 },
      { nx: 0.685, ny: 0, nw: 0.315, nh: 0.315 },
      { nx: 0, ny: 0.342, nw: 0.315, nh: 0.315 },
      { nx: 0.342, ny: 0.342, nw: 0.315, nh: 0.315 },
      { nx: 0.685, ny: 0.342, nw: 0.315, nh: 0.315 },
      { nx: 0, ny: 0.685, nw: 0.315, nh: 0.315 },
      { nx: 0.342, ny: 0.685, nw: 0.315, nh: 0.315 },
      { nx: 0.685, ny: 0.685, nw: 0.315, nh: 0.315 },
    ],
  },
  {
    id: 'basic-2col-split',
    name: '2 Vertical Columns',
    category: 'Basic',
    slots: [
      { nx: 0, ny: 0, nw: 0.485, nh: 1 },
      { nx: 0.515, ny: 0, nw: 0.485, nh: 1 },
    ],
  },

  // 2. 00's COMIC (Modern Widescreen & Overlapping Action)
  {
    id: '00s-widescreen-4',
    name: '00s Widescreen 4',
    category: "00's Comic",
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.23 },
      { nx: 0, ny: 0.255, nw: 1, nh: 0.23 },
      { nx: 0, ny: 0.51, nw: 1, nh: 0.23 },
      { nx: 0, ny: 0.765, nw: 1, nh: 0.235 },
    ],
  },
  {
    id: '00s-cinema-cut',
    name: '00s Cinema Cut',
    category: "00's Comic",
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.36 },
      { nx: 0, ny: 0.385, nw: 0.32, nh: 0.26 },
      { nx: 0.345, ny: 0.385, nw: 0.655, nh: 0.26 },
      { nx: 0, ny: 0.67, nw: 0.655, nh: 0.33 },
      { nx: 0.68, ny: 0.67, nw: 0.32, nh: 0.33 },
    ],
  },
  {
    id: '00s-vertical-slice',
    name: '00s Vertical Slices',
    category: "00's Comic",
    slots: [
      { nx: 0, ny: 0, nw: 0.23, nh: 0.44 },
      { nx: 0.255, ny: 0, nw: 0.23, nh: 0.44 },
      { nx: 0.51, ny: 0, nw: 0.49, nh: 0.44 },
      { nx: 0, ny: 0.47, nw: 1, nh: 0.53 },
    ],
  },
  {
    id: '00s-splash-side',
    name: '00s Splash + Sidebars',
    category: "00's Comic",
    slots: [
      { nx: 0, ny: 0, nw: 0.7, nh: 1 },
      { nx: 0.725, ny: 0, nw: 0.275, nh: 0.315 },
      { nx: 0.725, ny: 0.34, nw: 0.275, nh: 0.315 },
      { nx: 0.725, ny: 0.68, nw: 0.275, nh: 0.32 },
    ],
  },

  // 3. 40's COMIC (Golden Age Balanced Tiers)
  {
    id: '40s-golden-6',
    name: '40s Golden Age 6',
    category: "40's Comic",
    slots: [
      { nx: 0, ny: 0, nw: 0.62, nh: 0.32 },
      { nx: 0.645, ny: 0, nw: 0.355, nh: 0.32 },
      { nx: 0, ny: 0.345, nw: 0.355, nh: 0.32 },
      { nx: 0.38, ny: 0.345, nw: 0.62, nh: 0.32 },
      { nx: 0, ny: 0.69, nw: 0.485, nh: 0.31 },
      { nx: 0.515, ny: 0.69, nw: 0.485, nh: 0.31 },
    ],
  },
  {
    id: '40s-splash-header',
    name: '40s Title Splash + 4',
    category: "40's Comic",
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.46 },
      { nx: 0, ny: 0.49, nw: 0.485, nh: 0.24 },
      { nx: 0.515, ny: 0.49, nw: 0.485, nh: 0.24 },
      { nx: 0, ny: 0.755, nw: 0.485, nh: 0.245 },
      { nx: 0.515, ny: 0.755, nw: 0.485, nh: 0.245 },
    ],
  },
  {
    id: '40s-eight-square',
    name: '40s 8-Panel Pulp',
    category: "40's Comic",
    slots: [
      { nx: 0, ny: 0, nw: 0.485, nh: 0.23 },
      { nx: 0.515, ny: 0, nw: 0.485, nh: 0.23 },
      { nx: 0, ny: 0.255, nw: 0.485, nh: 0.23 },
      { nx: 0.515, ny: 0.255, nw: 0.485, nh: 0.23 },
      { nx: 0, ny: 0.51, nw: 0.485, nh: 0.23 },
      { nx: 0.515, ny: 0.51, nw: 0.485, nh: 0.23 },
      { nx: 0, ny: 0.765, nw: 0.485, nh: 0.235 },
      { nx: 0.515, ny: 0.765, nw: 0.485, nh: 0.235 },
    ],
  },
  {
    id: '40s-classic-7',
    name: '40s Classic 7',
    category: "40's Comic",
    slots: [
      { nx: 0, ny: 0, nw: 0.485, nh: 0.24 },
      { nx: 0.515, ny: 0, nw: 0.485, nh: 0.24 },
      { nx: 0, ny: 0.265, nw: 0.315, nh: 0.25 },
      { nx: 0.34, ny: 0.265, nw: 0.32, nh: 0.25 },
      { nx: 0.685, ny: 0.265, nw: 0.315, nh: 0.25 },
      { nx: 0, ny: 0.54, nw: 1, nh: 0.22 },
      { nx: 0, ny: 0.785, nw: 1, nh: 0.215 },
    ],
  },

  // 4. 60's COMIC 1 (Silver Age Kirby-style Dynamic)
  {
    id: '60s1-hero-center',
    name: '60s Center Focus',
    category: "60's Comic 1",
    slots: [
      { nx: 0, ny: 0, nw: 0.32, nh: 0.3 },
      { nx: 0.345, ny: 0, nw: 0.655, nh: 0.3 },
      { nx: 0, ny: 0.325, nw: 0.58, nh: 0.36 },
      { nx: 0.605, ny: 0.325, nw: 0.395, nh: 0.36 },
      { nx: 0, ny: 0.71, nw: 0.485, nh: 0.29 },
      { nx: 0.515, ny: 0.71, nw: 0.485, nh: 0.29 },
    ],
  },
  {
    id: '60s1-l-shape',
    name: '60s Towering Vertical',
    category: "60's Comic 1",
    slots: [
      { nx: 0, ny: 0, nw: 0.38, nh: 0.66 },
      { nx: 0.405, ny: 0, nw: 0.595, nh: 0.315 },
      { nx: 0.405, ny: 0.34, nw: 0.285, nh: 0.32 },
      { nx: 0.715, ny: 0.34, nw: 0.285, nh: 0.32 },
      { nx: 0, ny: 0.685, nw: 0.485, nh: 0.315 },
      { nx: 0.515, ny: 0.685, nw: 0.485, nh: 0.315 },
    ],
  },
  {
    id: '60s1-action-5',
    name: '60s Cosmic 5',
    category: "60's Comic 1",
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.38 },
      { nx: 0, ny: 0.405, nw: 0.315, nh: 0.32 },
      { nx: 0.34, ny: 0.405, nw: 0.32, nh: 0.32 },
      { nx: 0.685, ny: 0.405, nw: 0.315, nh: 0.32 },
      { nx: 0, ny: 0.75, nw: 1, nh: 0.25 },
    ],
  },
  {
    id: '60s1-spotlight',
    name: '60s Oval Spotlight',
    category: "60's Comic 1",
    slots: [
      { nx: 0, ny: 0, nw: 0.56, nh: 0.45 },
      { nx: 0.59, ny: 0.02, nw: 0.4, nh: 0.41, shape: 'ellipse' },
      { nx: 0, ny: 0.48, nw: 1, nh: 0.52 },
    ],
  },

  // 5. 60's COMIC 2 (Silver Age Slants & Multi-Beat)
  {
    id: '60s2-slant-upper',
    name: '60s Diagonal Upper',
    category: "60's Comic 2",
    slots: [
      { nx: 0, ny: 0, nw: 0.58, nh: 0.34, shape: 'skew-right' },
      { nx: 0.54, ny: 0, nw: 0.46, nh: 0.34, shape: 'skew-left' },
      { nx: 0, ny: 0.365, nw: 0.485, nh: 0.3 },
      { nx: 0.515, ny: 0.365, nw: 0.485, nh: 0.3 },
      { nx: 0, ny: 0.69, nw: 1, nh: 0.31 },
    ],
  },
  {
    id: '60s2-6beat',
    name: '60s Triple + Duo',
    category: "60's Comic 2",
    slots: [
      { nx: 0, ny: 0, nw: 0.315, nh: 0.28 },
      { nx: 0.34, ny: 0, nw: 0.32, nh: 0.28 },
      { nx: 0.685, ny: 0, nw: 0.315, nh: 0.28 },
      { nx: 0, ny: 0.305, nw: 0.64, nh: 0.35 },
      { nx: 0.665, ny: 0.305, nw: 0.335, nh: 0.35 },
      { nx: 0, ny: 0.68, nw: 1, nh: 0.32 },
    ],
  },
  {
    id: '60s2-quad-split',
    name: '60s Tall Right Pillar',
    category: "60's Comic 2",
    slots: [
      { nx: 0, ny: 0, nw: 0.64, nh: 0.31 },
      { nx: 0, ny: 0.335, nw: 0.64, nh: 0.31 },
      { nx: 0.665, ny: 0, nw: 0.335, nh: 0.645 },
      { nx: 0, ny: 0.67, nw: 0.485, nh: 0.33 },
      { nx: 0.515, ny: 0.67, nw: 0.485, nh: 0.33 },
    ],
  },

  // 6. 80's COMIC (Bronze/Copper Tight Narrative)
  {
    id: '80s-tight-7',
    name: '80s Tight Narrative 7',
    category: "80's Comic",
    slots: [
      { nx: 0, ny: 0, nw: 0.32, nh: 0.32 },
      { nx: 0.345, ny: 0, nw: 0.32, nh: 0.32 },
      { nx: 0.69, ny: 0, nw: 0.31, nh: 0.665 },
      { nx: 0, ny: 0.345, nw: 0.665, nh: 0.32 },
      { nx: 0, ny: 0.69, nw: 0.32, nh: 0.31 },
      { nx: 0.345, ny: 0.69, nw: 0.32, nh: 0.31 },
      { nx: 0.69, ny: 0.69, nw: 0.31, nh: 0.31 },
    ],
  },
  {
    id: '80s-slash-action',
    name: '80s Dynamic Slash',
    category: "80's Comic",
    slots: [
      { nx: 0, ny: 0, nw: 0.58, nh: 0.44, shape: 'skew-right' },
      { nx: 0.54, ny: 0, nw: 0.46, nh: 0.44, shape: 'skew-left' },
      { nx: 0, ny: 0.465, nw: 1, nh: 0.25 },
      { nx: 0, ny: 0.74, nw: 0.48, nh: 0.26, shape: 'skew-left' },
      { nx: 0.52, ny: 0.74, nw: 0.48, nh: 0.26, shape: 'skew-right' },
    ],
  },
  {
    id: '80s-dark-knight',
    name: '80s 4×4 Micro Grid',
    category: "80's Comic",
    slots: [
      { nx: 0, ny: 0, nw: 0.23, nh: 0.23 },
      { nx: 0.255, ny: 0, nw: 0.23, nh: 0.23 },
      { nx: 0.51, ny: 0, nw: 0.23, nh: 0.23 },
      { nx: 0.765, ny: 0, nw: 0.235, nh: 0.23 },
      { nx: 0, ny: 0.255, nw: 0.485, nh: 0.35 },
      { nx: 0.515, ny: 0.255, nw: 0.485, nh: 0.35 },
      { nx: 0, ny: 0.63, nw: 1, nh: 0.37 },
    ],
  },

  // 7. CONCEPTUAL (Pentagons, Circles, Creative Geometric)
  {
    id: 'concept-center-burst',
    name: 'Conceptual Centerpiece',
    category: 'Conceptual',
    slots: [
      { nx: 0, ny: 0, nw: 0.48, nh: 0.48 },
      { nx: 0.52, ny: 0, nw: 0.48, nh: 0.48 },
      { nx: 0, ny: 0.52, nw: 0.48, nh: 0.48 },
      { nx: 0.52, ny: 0.52, nw: 0.48, nh: 0.48 },
      { nx: 0.26, ny: 0.28, nw: 0.48, nh: 0.44, shape: 'ellipse' },
    ],
  },
  {
    id: 'concept-pentagon-trio',
    name: 'Conceptual Pentagon Trio',
    category: 'Conceptual',
    slots: [
      { nx: 0.2, ny: 0, nw: 0.6, nh: 0.38, shape: 'pentagon' },
      { nx: 0, ny: 0.41, nw: 0.48, nh: 0.32, shape: 'rounded', cornerRadius: 20 },
      { nx: 0.52, ny: 0.41, nw: 0.48, nh: 0.32, shape: 'rounded', cornerRadius: 20 },
      { nx: 0, ny: 0.755, nw: 1, nh: 0.245, shape: 'rounded', cornerRadius: 16 },
    ],
  },
  {
    id: 'concept-orbit',
    name: 'Conceptual Bubbles',
    category: 'Conceptual',
    slots: [
      { nx: 0.04, ny: 0.02, nw: 0.44, nh: 0.32, shape: 'ellipse' },
      { nx: 0.52, ny: 0.08, nw: 0.44, nh: 0.32, shape: 'ellipse' },
      { nx: 0.18, ny: 0.36, nw: 0.64, nh: 0.34, shape: 'ellipse' },
      { nx: 0.02, ny: 0.72, nw: 0.96, nh: 0.26, shape: 'rounded', cornerRadius: 24 },
    ],
  },

  // 8. EURO COMIC 1 (Franco-Belgian Bande Dessinée 4-Tier)
  {
    id: 'euro1-4tier-8',
    name: 'Euro BD 4-Tier 8',
    category: 'Euro Comic 1',
    slots: [
      { nx: 0, ny: 0, nw: 0.485, nh: 0.23 },
      { nx: 0.515, ny: 0, nw: 0.485, nh: 0.23 },
      { nx: 0, ny: 0.252, nw: 0.315, nh: 0.23 },
      { nx: 0.34, ny: 0.252, nw: 0.66, nh: 0.23 },
      { nx: 0, ny: 0.505, nw: 0.66, nh: 0.23 },
      { nx: 0.685, ny: 0.505, nw: 0.315, nh: 0.23 },
      { nx: 0, ny: 0.758, nw: 0.485, nh: 0.242 },
      { nx: 0.515, ny: 0.758, nw: 0.485, nh: 0.242 },
    ],
  },
  {
    id: 'euro1-ligne-claire',
    name: 'Euro Ligne Claire 10',
    category: 'Euro Comic 1',
    slots: [
      { nx: 0, ny: 0, nw: 0.315, nh: 0.23 },
      { nx: 0.34, ny: 0, nw: 0.32, nh: 0.23 },
      { nx: 0.685, ny: 0, nw: 0.315, nh: 0.23 },
      { nx: 0, ny: 0.252, nw: 0.485, nh: 0.23 },
      { nx: 0.515, ny: 0.252, nw: 0.485, nh: 0.23 },
      { nx: 0, ny: 0.505, nw: 0.315, nh: 0.23 },
      { nx: 0.34, ny: 0.505, nw: 0.32, nh: 0.23 },
      { nx: 0.685, ny: 0.505, nw: 0.315, nh: 0.23 },
      { nx: 0, ny: 0.758, nw: 0.65, nh: 0.242 },
      { nx: 0.675, ny: 0.758, nw: 0.325, nh: 0.242 },
    ],
  },
  {
    id: 'euro1-4strips',
    name: 'Euro 4 Cinema Strips',
    category: 'Euro Comic 1',
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.23 },
      { nx: 0, ny: 0.255, nw: 0.485, nh: 0.23 },
      { nx: 0.515, ny: 0.255, nw: 0.485, nh: 0.23 },
      { nx: 0, ny: 0.51, nw: 0.32, nh: 0.23 },
      { nx: 0.345, ny: 0.51, nw: 0.32, nh: 0.23 },
      { nx: 0.69, ny: 0.51, nw: 0.31, nh: 0.23 },
      { nx: 0, ny: 0.765, nw: 1, nh: 0.235 },
    ],
  },

  // 9. EURO COMIC 2 (Euro Album Feature + Tiers)
  {
    id: 'euro2-grand-tier',
    name: 'Euro Album Grand',
    category: 'Euro Comic 2',
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.42 },
      { nx: 0, ny: 0.445, nw: 0.32, nh: 0.26 },
      { nx: 0.34, ny: 0.445, nw: 0.32, nh: 0.26 },
      { nx: 0.68, ny: 0.445, nw: 0.32, nh: 0.26 },
      { nx: 0, ny: 0.73, nw: 0.485, nh: 0.27 },
      { nx: 0.515, ny: 0.73, nw: 0.485, nh: 0.27 },
    ],
  },
  {
    id: 'euro2-corner-feature',
    name: 'Euro Corner Feature',
    category: 'Euro Comic 2',
    slots: [
      { nx: 0, ny: 0, nw: 0.64, nh: 0.48 },
      { nx: 0.665, ny: 0, nw: 0.335, nh: 0.228 },
      { nx: 0.665, ny: 0.252, nw: 0.335, nh: 0.228 },
      { nx: 0, ny: 0.505, nw: 0.32, nh: 0.235 },
      { nx: 0.34, ny: 0.505, nw: 0.66, nh: 0.235 },
      { nx: 0, ny: 0.765, nw: 1, nh: 0.235 },
    ],
  },
  {
    id: 'euro2-bottom-vista',
    name: 'Euro Bottom Panorama',
    category: 'Euro Comic 2',
    slots: [
      { nx: 0, ny: 0, nw: 0.485, nh: 0.24 },
      { nx: 0.515, ny: 0, nw: 0.485, nh: 0.24 },
      { nx: 0, ny: 0.265, nw: 0.32, nh: 0.24 },
      { nx: 0.34, ny: 0.265, nw: 0.32, nh: 0.24 },
      { nx: 0.68, ny: 0.265, nw: 0.32, nh: 0.24 },
      { nx: 0, ny: 0.53, nw: 1, nh: 0.47 },
    ],
  },

  // 10. FUTURISTIC (Sci-Fi Rounded & Angular HUD Frames)
  {
    id: 'future-hud-5',
    name: 'Futuristic HUD 5',
    category: 'Futuristic',
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.3, shape: 'rounded', cornerRadius: 20 },
      { nx: 0, ny: 0.325, nw: 0.56, nh: 0.34, shape: 'skew-right' },
      { nx: 0.54, ny: 0.325, nw: 0.46, nh: 0.34, shape: 'skew-left' },
      { nx: 0, ny: 0.69, nw: 0.38, nh: 0.31, shape: 'rounded', cornerRadius: 18 },
      { nx: 0.405, ny: 0.69, nw: 0.595, nh: 0.31, shape: 'rounded', cornerRadius: 18 },
    ],
  },
  {
    id: 'future-visor',
    name: 'Sci-Fi Visor Grid',
    category: 'Futuristic',
    slots: [
      { nx: 0, ny: 0, nw: 0.64, nh: 0.36, shape: 'rounded', cornerRadius: 24 },
      { nx: 0.665, ny: 0, nw: 0.335, nh: 0.36, shape: 'ellipse' },
      { nx: 0, ny: 0.385, nw: 0.335, nh: 0.3 },
      { nx: 0.36, ny: 0.385, nw: 0.64, nh: 0.3, shape: 'skew-left' },
      { nx: 0, ny: 0.71, nw: 1, nh: 0.29, shape: 'rounded', cornerRadius: 20 },
    ],
  },
  {
    id: 'future-cyber-diagonal',
    name: 'Cybernetic Diagonals',
    category: 'Futuristic',
    slots: [
      { nx: 0, ny: 0, nw: 0.48, nh: 0.48, shape: 'skew-left' },
      { nx: 0.52, ny: 0, nw: 0.48, nh: 0.48, shape: 'skew-right' },
      { nx: 0, ny: 0.52, nw: 1, nh: 0.48, shape: 'rounded', cornerRadius: 22 },
    ],
  },

  // 11. GRAPHIC NOVEL (Prestige Editorial & Cinematic Pacing)
  {
    id: 'gn-splash-bleed',
    name: 'Graphic Novel Splash',
    category: 'Graphic Novel',
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.64 },
      { nx: 0, ny: 0.665, nw: 0.315, nh: 0.335 },
      { nx: 0.342, ny: 0.665, nw: 0.315, nh: 0.335 },
      { nx: 0.685, ny: 0.665, nw: 0.315, nh: 0.335 },
    ],
  },
  {
    id: 'gn-wide-silent',
    name: 'Graphic Novel Cinema 3',
    category: 'Graphic Novel',
    slots: [
      { nx: 0, ny: 0, nw: 0.485, nh: 0.34 },
      { nx: 0.515, ny: 0, nw: 0.485, nh: 0.34 },
      { nx: 0, ny: 0.365, nw: 1, nh: 0.635 },
    ],
  },
  {
    id: 'gn-left-pillar',
    name: 'Graphic Novel Asymmetric',
    category: 'Graphic Novel',
    slots: [
      { nx: 0, ny: 0, nw: 0.42, nh: 1 },
      { nx: 0.445, ny: 0, nw: 0.555, nh: 0.31 },
      { nx: 0.445, ny: 0.335, nw: 0.555, nh: 0.31 },
      { nx: 0.445, ny: 0.67, nw: 0.555, nh: 0.33 },
    ],
  },

  // 12. MANGA 1 (Right-to-Left Tall Dramatic)
  {
    id: 'manga1-tall-beat',
    name: 'Manga Vertical Beat',
    category: 'Manga 1',
    slots: [
      { nx: 0, ny: 0, nw: 0.31, nh: 0.48 },
      { nx: 0.34, ny: 0, nw: 0.66, nh: 0.48 },
      { nx: 0, ny: 0.51, nw: 0.64, nh: 0.49 },
      { nx: 0.67, ny: 0.51, nw: 0.33, nh: 0.49 },
    ],
  },
  {
    id: 'manga1-shonen-clash',
    name: 'Shonen Impact 5',
    category: 'Manga 1',
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.28 },
      { nx: 0, ny: 0.305, nw: 0.44, nh: 0.36, shape: 'skew-right' },
      { nx: 0.465, ny: 0.305, nw: 0.535, nh: 0.36, shape: 'skew-left' },
      { nx: 0, ny: 0.69, nw: 0.62, nh: 0.31 },
      { nx: 0.645, ny: 0.69, nw: 0.355, nh: 0.31 },
    ],
  },
  {
    id: 'manga1-speed-stack',
    name: 'Manga Speed Stack',
    category: 'Manga 1',
    slots: [
      { nx: 0, ny: 0, nw: 0.52, nh: 0.45 },
      { nx: 0.545, ny: 0, nw: 0.455, nh: 0.215 },
      { nx: 0.545, ny: 0.235, nw: 0.455, nh: 0.215 },
      { nx: 0, ny: 0.475, nw: 1, nh: 0.24 },
      { nx: 0, ny: 0.74, nw: 0.485, nh: 0.26 },
      { nx: 0.515, ny: 0.74, nw: 0.485, nh: 0.26 },
    ],
  },

  // 13. MANGA 2 (Shojo / Dramatic Open Insets)
  {
    id: 'manga2-shojo-tall',
    name: 'Shojo Tall Reveal',
    category: 'Manga 2',
    slots: [
      { nx: 0.55, ny: 0, nw: 0.45, nh: 0.64 },
      { nx: 0, ny: 0.04, nw: 0.51, nh: 0.27 },
      { nx: 0, ny: 0.34, nw: 0.51, nh: 0.3 },
      { nx: 0, ny: 0.67, nw: 0.36, nh: 0.33 },
      { nx: 0.39, ny: 0.67, nw: 0.61, nh: 0.33 },
    ],
  },
  {
    id: 'manga2-diagonal-split',
    name: 'Manga Diagonal Action',
    category: 'Manga 2',
    slots: [
      { nx: 0, ny: 0, nw: 0.62, nh: 0.36, shape: 'skew-left' },
      { nx: 0.6, ny: 0, nw: 0.4, nh: 0.36, shape: 'skew-right' },
      { nx: 0, ny: 0.39, nw: 0.38, nh: 0.61 },
      { nx: 0.41, ny: 0.39, nw: 0.59, nh: 0.29 },
      { nx: 0.41, ny: 0.71, nw: 0.59, nh: 0.29 },
    ],
  },
  {
    id: 'manga2-emotional-3',
    name: 'Manga 3-Beat Silence',
    category: 'Manga 2',
    slots: [
      { nx: 0, ny: 0, nw: 0.29, nh: 1 },
      { nx: 0.32, ny: 0, nw: 0.68, nh: 0.48 },
      { nx: 0.32, ny: 0.51, nw: 0.68, nh: 0.49 },
    ],
  },

  // 14. MAPS (Adventure Map + Inset Detail Frames)
  {
    id: 'maps-world-insets',
    name: 'Adventure Map + 3 Insets',
    category: 'Maps',
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.68 },
      { nx: 0.03, ny: 0.04, nw: 0.28, nh: 0.22, shape: 'ellipse' },
      { nx: 0, ny: 0.705, nw: 0.32, nh: 0.295 },
      { nx: 0.34, ny: 0.705, nw: 0.32, nh: 0.295 },
      { nx: 0.68, ny: 0.705, nw: 0.32, nh: 0.295 },
    ],
  },
  {
    id: 'maps-route-tracker',
    name: 'Travel Route Guide',
    category: 'Maps',
    slots: [
      { nx: 0, ny: 0, nw: 0.62, nh: 0.58 },
      { nx: 0.645, ny: 0, nw: 0.355, nh: 0.275, shape: 'rounded', cornerRadius: 12 },
      { nx: 0.645, ny: 0.305, nw: 0.355, nh: 0.275, shape: 'rounded', cornerRadius: 12 },
      { nx: 0, ny: 0.605, nw: 0.485, nh: 0.395 },
      { nx: 0.515, ny: 0.605, nw: 0.485, nh: 0.395 },
    ],
  },
  {
    id: 'maps-dossier',
    name: 'Location Dossier',
    category: 'Maps',
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.52 },
      { nx: 0.62, ny: 0.26, nw: 0.34, nh: 0.24, shape: 'ellipse' },
      { nx: 0, ny: 0.55, nw: 0.485, nh: 0.45 },
      { nx: 0.515, ny: 0.55, nw: 0.485, nh: 0.45 },
    ],
  },

  // 15. PICTURE-IN-PICTURE
  {
    id: 'pip-splash-inset',
    name: 'Splash + Corner Inset',
    category: 'Picture-In-Picture',
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 1 },
      { nx: 0.56, ny: 0.62, nw: 0.4, nh: 0.34 },
    ],
  },
  {
    id: 'pip-dual-insets',
    name: 'Main Scene + 2 Insets',
    category: 'Picture-In-Picture',
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.7 },
      { nx: 0.04, ny: 0.04, nw: 0.3, nh: 0.22, shape: 'rounded', cornerRadius: 12 },
      { nx: 0.64, ny: 0.44, nw: 0.32, nh: 0.23, shape: 'ellipse' },
      { nx: 0, ny: 0.725, nw: 1, nh: 0.275 },
    ],
  },
  {
    id: 'pip-triple-overlay',
    name: 'Triple Reaction Inset',
    category: 'Picture-In-Picture',
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 1 },
      { nx: 0.04, ny: 0.04, nw: 0.34, nh: 0.24 },
      { nx: 0.62, ny: 0.36, nw: 0.34, nh: 0.24 },
      { nx: 0.04, ny: 0.7, nw: 0.38, nh: 0.26 },
    ],
  },
  {
    id: 'pip-center-callout',
    name: 'Split + Center Circle PiP',
    category: 'Picture-In-Picture',
    slots: [
      { nx: 0, ny: 0, nw: 1, nh: 0.485 },
      { nx: 0, ny: 0.515, nw: 1, nh: 0.485 },
      { nx: 0.31, ny: 0.32, nw: 0.38, nh: 0.36, shape: 'ellipse' },
    ],
  },

  // 16. STRIPS (Daily Newspaper & Sunday Funnies)
  {
    id: 'strips-3col-daily',
    name: '3-Panel Daily Strip',
    category: 'Strips',
    slots: [
      { nx: 0, ny: 0.28, nw: 0.315, nh: 0.42 },
      { nx: 0.342, ny: 0.28, nw: 0.315, nh: 0.42 },
      { nx: 0.685, ny: 0.28, nw: 0.315, nh: 0.42 },
    ],
  },
  {
    id: 'strips-4col-daily',
    name: '4-Panel Yonkoma Strip',
    category: 'Strips',
    slots: [
      { nx: 0.14, ny: 0, nw: 0.72, nh: 0.23 },
      { nx: 0.14, ny: 0.255, nw: 0.72, nh: 0.23 },
      { nx: 0.14, ny: 0.51, nw: 0.72, nh: 0.23 },
      { nx: 0.14, ny: 0.765, nw: 0.72, nh: 0.235 },
    ],
  },
  {
    id: 'strips-sunday-6',
    name: 'Sunday Comic Strip',
    category: 'Strips',
    slots: [
      { nx: 0, ny: 0.14, nw: 0.32, nh: 0.26 },
      { nx: 0.34, ny: 0.14, nw: 0.32, nh: 0.26 },
      { nx: 0.68, ny: 0.14, nw: 0.32, nh: 0.26 },
      { nx: 0, ny: 0.425, nw: 0.485, nh: 0.27 },
      { nx: 0.515, ny: 0.425, nw: 0.485, nh: 0.27 },
      { nx: 0, ny: 0.72, nw: 1, nh: 0.28 },
    ],
  },
  {
    id: 'strips-double-3',
    name: 'Two 3-Panel Strips',
    category: 'Strips',
    slots: [
      { nx: 0, ny: 0.04, nw: 0.315, nh: 0.42 },
      { nx: 0.342, ny: 0.04, nw: 0.315, nh: 0.42 },
      { nx: 0.685, ny: 0.04, nw: 0.315, nh: 0.42 },
      { nx: 0, ny: 0.52, nw: 0.315, nh: 0.42 },
      { nx: 0.342, ny: 0.52, nw: 0.315, nh: 0.42 },
      { nx: 0.685, ny: 0.52, nw: 0.315, nh: 0.42 },
    ],
  },
];
