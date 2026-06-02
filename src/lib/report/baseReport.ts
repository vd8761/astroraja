/* eslint-disable @typescript-eslint/no-explicit-any */
// BaseReport - turns report data + AI markdown into a styled A4 PDF (pdfmake).
// Element builders mirror the originbi authoring style (methods + options),
// but return pdfmake nodes since pdfmake is declarative.
import PdfPrinterPkg from 'pdfmake/js/Printer.js';
const PdfPrinter: any = (PdfPrinterPkg as any).default || PdfPrinterPkg;
import URLResolverPkg from 'pdfmake/js/URLResolver.js';
const URLResolver: any = (URLResolverPkg as any).default || URLResolverPkg;

import { C, PAGE_W, PAGE_H, IN, fonts, assetIfExists } from './theme';
import { getTamil } from './tamil';
import { parseMarkdown, type Block } from './markdownLoader';

export interface ReportData {
  reportId: string;
  name: string;
  raasi: string;
  lagnam: string;
  nakshatra: string;
  padam: string | number;
  markdown: string;
}

const ASSET = {
  logo: assetIfExists('askastroraja.png'),
  logoBlack: assetIfExists('askastrorajablack.png'),
  mandala: assetIfExists('mandala.png'),
  watermark: assetIfExists('watermark_background_cross.png'),
  noWatermark: assetIfExists('no_watermark_background.png'),
  tl: assetIfExists('corner_tl.png'),
  tr: assetIfExists('corner_tr.png'),
  bl: assetIfExists('corner_bl.png'),
  br: assetIfExists('corner_br.png'),
  top: assetIfExists('top.png'),
  bottom: assetIfExists('bottom.png'),
};

const VIVEKANANDA =
  'We are responsible for what we are, and whatever we wish ourselves to be, we have the power to make ourselves. ' +
  'If what we are now has been the result of our own past actions, it certainly follows that whatever we wish to be ' +
  'in future can be produced by our present actions; so we have to know how to act.';

const EXEC_PARAS = [
  'This document provides a structured evaluation and targeted advisory or simply reflect your characteristics.',
  'One important assumption is that astrology is a gift deeply rooted in Indian tradition. If we look back from ancient times, a vast amount of knowledge has been embedded within it. In many ways, we can say this is a combination of mathematics and science.',
  'When you observe how numbers have been used and interpreted in astrology, it almost feels magical. Considering the world’s massive population, this mathematical system has worked in such a way that every individual can still be understood as unique.',
  'The purpose of this report goes beyond predicting events. We believe that every person has a soul purpose. When you identify that purpose clearly and begin to align your life with it, your karmic patterns gradually start to clear.',
  'Going to temples and performing remedies may help on one side, but beyond all that, the best way is to consciously neutralize our karmic actions through awareness and right action.',
  'This analysis has been designed - to help you understand these deeper aspects of your life. Use this guidance, take action, and move forward with clarity.',
  'Prepared for your review. But remember - without taking action, it is impossible to achieve meaningful change.',
];

const DISCLAIMER =
  'This astrology report is generated using advanced AI and astrological algorithms based on your birth details. ' +
  'It is intended for entertainment, spiritual, and personal growth purposes only. Astrology is an ancient art, ' +
  'not an exact science, and should never replace professional medical, financial, or legal advice. By reading ' +
  'this report, you acknowledge that you have full free will. Any choices, actions, or major life decisions you ' +
  'make based on this content are entirely your own responsibility.';

export class BaseReport {
  protected data: ReportData;
  protected nameTitle: string;

  constructor(data: ReportData) {
    this.data = data;
    this.nameTitle = (data.name || 'Report').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // ── Inline text: **bold**, *italic*, and Tamil-run detection ────
  protected splitTamil(text: string, extra: any): any[] {
    return text
      .split(/([஀-௿]+)/)
      .filter((p) => p !== '')
      .map((p) => (/[஀-௿]/.test(p) ? { text: p, font: 'Tamil', ...extra } : { text: p, ...extra }));
  }

  protected inline(str: string): any[] {
    const out: any[] = [];
    const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__/g;
    let last = 0; let m: RegExpExecArray | null;
    const push = (t: string, ex: any) => { if (t) this.splitTamil(t, ex).forEach((s) => out.push(s)); };
    while ((m = re.exec(str))) {
      if (m.index > last) push(str.slice(last, m.index), {});
      if (m[1] !== undefined) push(m[1], { bold: true });
      else if (m[2] !== undefined) push(m[2], { italics: true });
      else push(m[3], { bold: true });
      last = re.lastIndex;
    }
    if (last < str.length) push(str.slice(last), {});
    return out.length ? out : [{ text: '' }];
  }

  // ── Element builders ────────────────────────────────────────────
  /** Thin gold rule (table border, not canvas - canvas corrupts on re-pagination). */
  protected goldRule(width: number, marginTop = 0): any {
    return {
      table: { widths: [width], body: [[{ text: '', fontSize: 1, border: [false, false, false, true] }]] },
      layout: {
        hLineWidth: (i: number, node: any) => (i === node.table.body.length ? 1 : 0),
        hLineColor: () => C.gold,
        paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0,
      },
      margin: [0, marginTop, 0, 0],
    };
  }

  protected sectionHeader(num: string, title: string, breakBefore = false): any {
    const NUM_W = 52, GAP = 12;
    const lineW = PAGE_W - 80 - NUM_W - GAP;
    return {
      // number + title + divider stay together: one small columns block, and the
      // >50%-page-left rule (pageBreakBefore) guarantees room to render it whole.
      id: 'sectionHeader',
      columns: [
        // lineHeight 1 keeps the big digit from being pushed down inside its box
        { width: NUM_W, text: String(num).padStart(2, '0'), font: 'Serif', bold: true, fontSize: 46, lineHeight: 1, color: C.gold },
        { width: '*', stack: [
          { text: title.toUpperCase(), font: 'Serif', bold: true, fontSize: 16, lineHeight: 1, color: C.indigo, characterSpacing: 1, margin: [0, 22, 0, 0] },
          this.goldRule(lineW, -1),
        ] },
      ],
      columnGap: GAP,
      margin: [0, 14, 0, 6],
      pageBreak: breakBefore ? 'before' : undefined,
    };
  }

  protected subHead(text: string): any {
    // headlineLevel keeps the heading on the same page as the content that follows.
    return { text: this.inline(text), font: 'Serif', bold: true, fontSize: 11.5, color: C.indigo, margin: [0, 7, 0, 5], headlineLevel: 1 };
  }

  protected para(text: string): any {
    return { text: this.inline(text), font: 'Inter', fontSize: 9.5, color: C.text, lineHeight: 1.55, alignment: 'justify', margin: [0, 0, 0, 8] };
  }

  protected quote(text: string): any {
    return {
      table: { widths: [3, '*'], body: [[
        { text: '', fillColor: C.gold, border: [false, false, false, false] },
        { text: this.inline(text), font: 'Serif', italics: true, fontSize: 11, color: C.indigo, lineHeight: 1.5, alignment: 'center', fillColor: '#F6F1E4', margin: [16, 14, 16, 14], border: [false, false, false, false] },
      ]] },
      layout: { hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0 },
      margin: [0, 8, 0, 16], unbreakable: true,
    };
  }

  protected table(headers: string[], rows: string[][]): any {
    const n = headers.length;
    return {
      table: {
        widths: headers.map(() => '*'), headerRows: 1, keepWithHeaderRows: 1, dontBreakRows: true,
        body: [
          headers.map((h) => ({ text: this.inline(String(h).toUpperCase()), font: 'Serif', bold: true, fontSize: 8.5, color: C.creamGold, characterSpacing: 0.6, fillColor: C.indigo, alignment: 'center', margin: [7, 9, 7, 9], border: [false, false, false, false] })),
          ...rows.map((row, ri) => {
            const r = [...row]; while (r.length < n) r.push('');
            return r.slice(0, n).map((cell) => ({ text: this.inline(cell), font: 'Inter', fontSize: 8.7, color: C.text, lineHeight: 1.35, fillColor: ri % 2 === 0 ? C.cream : C.creamRow, margin: [9, 7, 9, 7], border: [false, false, false, false] }));
          }),
        ],
      },
      layout: {
        hLineWidth: (i: number, node: any) => (i === 0 ? 0 : (i === 1 ? 1.5 : (i === node.table.body.length ? 1.2 : 0.4))),
        hLineColor: (i: number, node: any) => (i === 1 || i === node.table.body.length ? C.gold : C.rule),
        vLineWidth: () => 0,
      },
      margin: [0, 6, 0, 16],
    };
  }

  protected list(items: string[], ordered: boolean, start = 1): any {
    const node: any = {
      [ordered ? 'ol' : 'ul']: items.map((it) => ({ text: this.inline(it) })),
      font: 'Inter', fontSize: 9.3, color: C.text, lineHeight: 1.45, markerColor: C.gold, margin: [6, 2, 0, 12],
    };
    if (ordered && start > 1) node.start = start;
    return node;
  }

  // ── Cover ────────────────────────────────────────────────────────
  protected astroChip(main: string, tam: string, label: string): any {
    return { stack: [
      { text: main, font: 'Georgia', bold: true, fontSize: 12, color: C.creamGold, alignment: 'center', margin: [0, 0, 0, 1] },
      ...(tam ? [{ text: `(${tam})`, font: 'Tamil', fontSize: 10, color: '#FFFFFF', alignment: 'center', lineHeight: 0.9, margin: [0, 1, 0, 0] }] : []),
      { text: label, font: 'Inter', bold: true, fontSize: 14, color: '#FFFFFF', alignment: 'center', lineHeight: 1, margin: [0, 1, 0, 0] },
    ] };
  }

  protected buildCover(tagline: string): any[] {
    const { raasi, lagnam, nakshatra, padam } = this.data;
    const logoRow: any[] = [{ width: '*', text: '' }];
    if (ASSET.logo) logoRow.push({ width: 24, image: ASSET.logo, fit: [23, 23], margin: [0, 7, 0, 0] });
    logoRow.push({ width: 'auto', text: 'Ask Astro Raja', font: 'Outfit', bold: true, fontSize: 23, color: C.gold, margin: [8, 3, 0, 0] });
    logoRow.push({ width: '*', text: '' });

    return [
      { columns: logoRow, margin: [0, 0, 0, 0] },
      { text: 'LIFE TRANSFORMATION\nREPORT', font: 'Outfit', bold: true, fontSize: 26.5, color: C.textOnDark, alignment: 'center', characterSpacing: 1.5, lineHeight: 1.12, margin: [0, 42, 0, 0] },
      { text: 'Prepared exclusively for', font: 'Georgia', italics: true, fontSize: 16.5, color: C.creamGold, alignment: 'center', margin: [0, 34, 0, 6] },
      { text: this.nameTitle, font: 'Georgia', fontSize: 26.5, color: C.creamGold, alignment: 'center' },
      ...(tagline ? [{ text: tagline, font: 'Georgia', italics: true, fontSize: 16.5, color: C.creamGold, alignment: 'center', lineHeight: 1.45, margin: [40, 26, 40, 0] }] : []),
      { columns: [
        this.astroChip(raasi, getTamil(raasi, 'raasi'), 'Raasi'),
        this.astroChip(lagnam, getTamil(lagnam, 'raasi'), 'Lagnam'),
        this.astroChip(nakshatra, getTamil(nakshatra, 'nakshatra'), 'Nakshathra'),
      ], columnGap: 10, margin: [40, 28, 40, 0] },
      { stack: [
        { text: String(padam ?? ''), font: 'Georgia', bold: true, fontSize: 12, color: C.creamGold, alignment: 'center', lineHeight: 1, margin: [0, 0, 0, 0] },
        { text: '(பாதம்)', font: 'Tamil', fontSize: 10, color: '#FFFFFF', alignment: 'center', lineHeight: 0.9, margin: [0, 1, 0, 0] },
        { text: 'Paadham', font: 'Inter', bold: true, fontSize: 14, color: '#FFFFFF', alignment: 'center', lineHeight: 1, margin: [0, 1, 0, 0] },
      ], margin: [0, 8, 0, 0] },
      { text: '', pageBreak: 'after' },
    ];
  }

  /** Vivekananda quote framed between top/bottom ornamental border images. */
  protected buildVivekananda(): any[] {
    const out: any[] = [];
    if (ASSET.top) out.push({ image: ASSET.top, width: 515, alignment: 'center', margin: [0, 150, 0, 0] });
    else out.push({ text: '', margin: [0, 150, 0, 0] });
    out.push({ text: `“${VIVEKANANDA}”`, font: 'Serif', italics: true, fontSize: 13.5, color: C.indigo, alignment: 'center', lineHeight: 1.7, margin: [36, 30, 36, 28] });
    out.push({ text: '- Swami Vivekananda', font: 'Serif', bold: true, fontSize: 11.5, color: C.gold, alignment: 'center', margin: [0, 4, 0, 30] });
    if (ASSET.bottom) out.push({ image: ASSET.bottom, width: 515, alignment: 'center' });
    out.push({ text: '', pageBreak: 'after' });
    return out;
  }

  protected buildMessage(): any[] {
    return [
      { text: 'A Message Before You Begin', font: 'Serif', bold: true, fontSize: 21, color: C.indigo, margin: [0, 6, 0, 4] },
      this.goldRule(515, 0),
      { text: '', margin: [0, 0, 0, 12] },
      ...EXEC_PARAS.map((p) => this.para(p)),
      { text: '- Thank you.', font: 'Serif', bold: true, fontSize: 11.5, color: C.indigo, margin: [0, 10, 0, 0] },
    ];
  }

  protected buildDisclaimer(): any[] {
    return [
      { text: 'DISCLAIMER', font: 'Outfit', bold: true, fontSize: 26.5, color: C.indigo, alignment: 'center', characterSpacing: 1.5, lineHeight: 1.12, margin: [0, 170, 0, 18], pageBreak: 'before' },
      { ...this.goldRule(250, 0), margin: [132.5, 0, 132.5, 0] },
      { text: DISCLAIMER, font: 'Inter', fontSize: 10.5, color: C.text, lineHeight: 1.7, alignment: 'center', margin: [60, 30, 60, 0] },
    ];
  }

  protected renderOne(b: Block): any {
    switch (b.type) {
      case 'para': return this.para(b.text);
      case 'list': return this.list(b.items, b.ordered);
      case 'quote': return this.quote(b.text);
      case 'table': return this.table(b.headers, b.rows);
      default: return { text: '' };
    }
  }

  // ── Map parsed markdown blocks → pdfmake nodes ──────────────────
  protected renderBlocks(blocks: Block[]): any[] {
    let secCount = 0;
    const out: any[] = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.type === 'section') {
        secCount++;
        out.push(this.sectionHeader(b.num, b.title, secCount === 1)); // chapter 1 → new page
        continue;
      }
      if (b.type === 'subhead') {
        // Gather this title + any consecutive titles + the first (small enough)
        // content block into one unbreakable group, so a title is never stranded
        // on a page away from the content it introduces.
        const group: any[] = [this.subHead(b.text)];
        let j = i;
        while ((blocks[j + 1] as any)?.type === 'subhead') {
          group.push(this.subHead((blocks[j + 1] as any).text));
          j++;
        }
        const next: any = blocks[j + 1];
        let afterGroup: any | null = null;
        if (next) {
          const compactTable =
            next.type === 'table' &&
            next.rows.length <= 4 &&
            [...next.headers, ...next.rows.flat()].join(' ').length <= 900;
          const small = next.type === 'para' || next.type === 'quote' || compactTable;
          if (small) { group.push(this.renderOne(next)); j++; }
          else if (next.type === 'list' && next.items.length > 0) {
            group.push(this.list([next.items[0]], next.ordered));
            const rest = next.items.slice(1);
            if (rest.length) afterGroup = this.list(rest, next.ordered, next.ordered ? 2 : 1);
            j++;
          }
        }
        out.push({ stack: group, unbreakable: true });
        if (afterGroup) out.push(afterGroup);
        i = j;
        continue;
      }
      out.push(this.renderOne(b));
    }
    return out;
  }

  // ── Page chrome ─────────────────────────────────────────────────
  protected coverBackground(): any {
    const nodes: any[] = [{ canvas: [{ type: 'rect', x: 0, y: 0, w: PAGE_W, h: PAGE_H, color: C.indigo }] }];
    if (ASSET.tl) nodes.push({ image: ASSET.tl, width: 72, absolutePosition: { x: 22, y: 22 } });
    if (ASSET.tr) nodes.push({ image: ASSET.tr, width: 72, absolutePosition: { x: PAGE_W - 94, y: 22 } });
    if (ASSET.bl) nodes.push({ image: ASSET.bl, width: 72, absolutePosition: { x: 22, y: PAGE_H - 94 } });
    if (ASSET.br) nodes.push({ image: ASSET.br, width: 72, absolutePosition: { x: PAGE_W - 94, y: PAGE_H - 94 } });
    if (ASSET.mandala) nodes.push({ image: ASSET.mandala, width: 3.52 * IN, absolutePosition: { x: 2.4 * IN, y: 7.9 * IN } });
    return nodes;
  }

  protected bodyBackground(): any {
    if (ASSET.watermark) return { image: ASSET.watermark, width: PAGE_W, height: PAGE_H, absolutePosition: { x: 0, y: 0 } };
    return { canvas: [{ type: 'rect', x: 0, y: 0, w: PAGE_W, h: PAGE_H, color: C.cream }] };
  }

  // The Vivekananda quote (page 2) uses its own, watermark-free background.
  protected vivekanandaBackground(): any {
    if (ASSET.noWatermark) return { image: ASSET.noWatermark, width: PAGE_W, height: PAGE_H, absolutePosition: { x: 0, y: 0 } };
    return { canvas: [{ type: 'rect', x: 0, y: 0, w: PAGE_W, h: PAGE_H, color: C.cream }] };
  }

  protected header(page: number): any {
    if (page === 1) return null;
    const cols: any[] = [];
    if (ASSET.logoBlack) cols.push({ width: 13, image: ASSET.logoBlack, fit: [11, 11], margin: [0, 1, 0, 0] });
    cols.push({ width: '*', text: 'Ask Astro Raja  ·  Life Transformation Report', font: 'Inter', fontSize: 7.5, color: C.muted, margin: [ASSET.logoBlack ? 5 : 0, 2, 0, 0] });
    cols.push({ width: 'auto', text: this.nameTitle, font: 'Inter', fontSize: 7.5, color: C.gold, bold: true, alignment: 'right', margin: [0, 2, 0, 0] });
    return { margin: [40, 20, 40, 0], columns: cols };
  }

  protected footer(page: number, pageCount: number): any {
    if (page === 1) return null;
    const { raasi, lagnam, nakshatra, padam } = this.data;
    const bits = [raasi, lagnam, nakshatra].filter(Boolean).join('  ·  ');
    const padBit = padam !== '' && padam != null ? `  ·  Paadham ${padam}` : '';
    // Page numbers ignore the cover: page 2 shows "1", total excludes the cover.
    return {
      margin: [40, 8, 40, 0],
      stack: [
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.4, lineColor: C.footerRule }], margin: [0, 0, 0, 5] },
        { columns: [
          { text: `${bits}${padBit}  |  Confidential`, font: 'Inter', fontSize: 7, color: C.muted, width: '*' },
          { text: `${page - 1} of ${pageCount - 1}`, font: 'Serif', fontSize: 8, color: C.gold, alignment: 'right', width: 'auto' },
        ] },
      ],
    };
  }

  // ── Assemble + render ───────────────────────────────────────────
  protected buildDocDefinition(): any {
    const { tagline, blocks } = parseMarkdown(this.data.markdown);
    const content = [
      ...this.buildCover(tagline),
      ...this.buildVivekananda(),
      ...this.buildMessage(),
      ...this.renderBlocks(blocks),
      ...this.buildDisclaimer(),
    ];
    return {
      pageSize: 'A4',
      pageMargins: [40, 58, 40, 50],
      // A new chapter continues on the same page only if >50% remains, else new page.
      pageBreakBefore: (currentNode: any) => {
        if (currentNode.id !== 'sectionHeader') return false;
        const sp = currentNode.startPosition;
        if (sp && typeof sp.verticalRatio === 'number') return sp.verticalRatio >= 0.5;
        return false;
      },
      // page 1 = cover, page 2 = Vivekananda quote (no-watermark bg), page 3+ = body watermark
      background: (page: number) => (page === 1 ? this.coverBackground() : page === 2 ? this.vivekanandaBackground() : this.bodyBackground()),
      header: (page: number) => this.header(page),
      footer: (page: number, pageCount: number) => this.footer(page, pageCount),
      content,
      defaultStyle: { font: 'Inter', fontSize: 9.5, color: C.text, lineHeight: 1.4 },
    };
  }

  async toBuffer(): Promise<Buffer> {
    const printer = new PdfPrinter(fonts, null, new URLResolver());
    const pdfDoc = await printer.createPdfKitDocument(this.buildDocDefinition());
    return await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (c: Buffer) => chunks.push(c));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }
}
