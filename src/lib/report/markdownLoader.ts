// Markdown → semantic blocks. Pure parsing (no pdfmake/theme dependency).
// The renderer (BaseReport) turns these blocks into styled PDF nodes.
import { marked } from 'marked';

export type Block =
  | { type: 'section'; num: string; title: string }
  | { type: 'subhead'; text: string }
  | { type: 'para'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'quote'; text: string };

export interface ParsedReport {
  tagline: string;
  blocks: Block[];
}

/**
/**
 * Strip glyphs the report fonts can't render. The skill file instructs the AI not
 * to emit these, but this also cleans up reports already stored in the DB.
 *  - arrows → / ⇒ become "->", ← becomes "<-"
 *  - emoji / pictographs / decorative symbols are removed
 */
function sanitizeGlyphs(s: string): string {
  return s
    .replace(/[→⇒➡➜➞⮕➔]/g, '->')
    .replace(/[←⇐]/g, '<-')
    .replace(/[—–]/g, '-') // em/en dash -> plain hyphen (render-time only; DB unchanged)
    .replace(/[✅❌⭐⭕✔✖✨]/g, '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/️|⃣/g, '')
    .replace(/[ \t]{2,}/g, ' ');
}

/**
 * Normalize AI markdown:
 *  - strip backslash-escaping (\#, \*\*, \|, \---, …) some models emit
 *  - remove unsupported emoji/unicode glyphs
 *  - collapse blank lines *between* table rows so double-spaced markdown
 *    still parses as a real table (marked needs contiguous | rows)
 */
export function normalize(md: string): string {
  let s = sanitizeGlyphs((md || '').replace(/\r\n/g, '\n').replace(/\\([#*_`>\-|.\[\]()~+&!:;'"])/g, '$1'));
  const lines = s.split('\n');
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    if (/^\s*\|/.test(lines[i])) {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;
      if (j < lines.length && /^\s*\|/.test(lines[j])) i = j - 1; // drop the blanks
    }
  }
  return out.join('\n');
}

// Headings that duplicate the hardcoded Executive Summary - skipped.
const SKIP_HEADINGS = ['COMPREHENSIVE ANALYSIS', 'A MESSAGE BEFORE YOU BEGIN'];

export function parseMarkdown(md: string): ParsedReport {
  const tokens = marked.lexer(normalize(md)) as any[];
  let tagline = '';
  let started = false;   // becomes true at the first ## section heading
  let skipping = false;  // inside a skipped intro section
  let secCount = 0;
  const blocks: Block[] = [];

  for (const t of tokens) {
    // The poetic H1 title is not shown on the cover (fixed title is used).
    if (t.type === 'heading' && t.depth === 1) continue;

    if (!started) {
      // Capture the first italic tagline paragraph for the cover.
      if (t.type === 'paragraph' && !tagline && /^[*_]/.test((t.raw || '').trim())) {
        tagline = t.text.replace(/[*_]/g, '').trim();
        continue;
      }
      if (t.type === 'heading' && t.depth === 2) started = true;
      else continue; // ignore everything else before the first section
    }

    if (t.type === 'heading' && t.depth === 2) {
      const title = (t.text || '').trim();
      if (SKIP_HEADINGS.some((h) => title.toUpperCase().includes(h))) { skipping = true; continue; }
      skipping = false;
      const m = title.match(/SECTION\s+(\d+)\s*:?\s*(.*)/i);
      secCount++;
      blocks.push({ type: 'section', num: m ? m[1] : String(secCount), title: m ? m[2] : title });
    } else if (skipping) {
      continue;
    } else if (t.type === 'heading' && t.depth >= 3) {
      blocks.push({ type: 'subhead', text: t.text });
    } else if (t.type === 'paragraph') {
      // A paragraph that is entirely bold reads as a sub-heading.
      if (/^\*\*[^*]+\*\*$/.test((t.text || '').trim())) {
        blocks.push({ type: 'subhead', text: t.text.replace(/\*\*/g, '') });
      } else {
        blocks.push({ type: 'para', text: t.text });
      }
    } else if (t.type === 'blockquote') {
      blocks.push({ type: 'quote', text: (t.text || '').replace(/^>\s?/gm, '').replace(/["“”]/g, '').trim() });
    } else if (t.type === 'table') {
      blocks.push({
        type: 'table',
        headers: t.header.map((h: any) => h.text),
        rows: t.rows.map((r: any[]) => r.map((c) => c.text)),
      });
    } else if (t.type === 'list') {
      blocks.push({ type: 'list', ordered: !!t.ordered, items: t.items.map((it: any) => it.text) });
    }
  }

  return { tagline, blocks };
}
