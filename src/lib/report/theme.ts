/* eslint-disable @typescript-eslint/no-explicit-any */
// Design tokens, fonts, and asset resolution for the Life Transformation Report PDF.
import path from 'path';
import fs from 'fs';

// ── Page geometry (A4) ───────────────────────────────────────────
export const PAGE_W = 595.28;
export const PAGE_H = 841.89;
export const IN = 72; // points per inch (Google-Slides A4 coordinates map ×72)

// ── Palette ──────────────────────────────────────────────────────
export const C = {
  indigo: '#201B4A',     // primary background
  indigoSoft: '#2E2660', // panels
  gold: '#E6A227',       // accent
  goldSoft: '#F0C25E',
  goldDim: '#6E5A2A',
  cream: '#FBF7EE',      // body page / table base
  creamRow: '#F4EEDF',   // zebra row
  text: '#2C2740',       // body text
  textOnDark: '#F3EFE6',
  muted: '#8A85A0',
  creamGold: '#FFEAC4',  // cover labels / values
  rule: '#E7DCC2',       // light table rule
  footerRule: '#DDD3BC',
};

// ── Asset paths (resolved at runtime from the deployed public/ dir) ──
const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

export const fontFile = (f: string) => path.join(FONTS_DIR, f);
export const imageFile = (f: string) => path.join(IMAGES_DIR, f);

/** Returns the absolute image path if the file exists, else null (callers skip it). */
export const assetIfExists = (f: string): string | null => {
  const p = imageFile(f);
  return fs.existsSync(p) ? p : null;
};

// pdfmake font registry (Node printer reads these TTFs at render time)
export const fonts = {
  Inter: {
    normal: fontFile('Inter-Regular.ttf'), bold: fontFile('Inter-Bold.ttf'),
    italics: fontFile('Inter-Regular.ttf'), bolditalics: fontFile('Inter-Bold.ttf'),
  },
  Serif: {
    normal: fontFile('NotoSerif-Regular.ttf'), bold: fontFile('NotoSerif-Bold.ttf'),
    italics: fontFile('NotoSerif-Regular.ttf'), bolditalics: fontFile('NotoSerif-Bold.ttf'),
  },
  Tamil: {
    normal: fontFile('BalooThambi2-Regular.ttf'), bold: fontFile('BalooThambi2-Bold.ttf'),
    italics: fontFile('BalooThambi2-Regular.ttf'), bolditalics: fontFile('BalooThambi2-Bold.ttf'),
  },
  Haskoy: {
    normal: fontFile('Haskoy-Regular.ttf'), bold: fontFile('Haskoy-Bold.ttf'),
    italics: fontFile('Haskoy-Regular.ttf'), bolditalics: fontFile('Haskoy-Bold.ttf'),
  },
  Outfit: {
    normal: fontFile('Outfit-Regular.ttf'), bold: fontFile('Outfit-Bold.ttf'),
    italics: fontFile('Outfit-Regular.ttf'), bolditalics: fontFile('Outfit-Bold.ttf'),
  },
  Georgia: {
    normal: fontFile('Georgia-Regular.ttf'), bold: fontFile('Georgia-Bold.ttf'),
    italics: fontFile('Georgia-Italic.ttf'), bolditalics: fontFile('Georgia-BoldItalic.ttf'),
  },
};
