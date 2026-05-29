import PdfPrinterPkg from 'pdfmake/js/Printer.js';
const PdfPrinter = PdfPrinterPkg.default || PdfPrinterPkg;
import URLResolverPkg from 'pdfmake/js/URLResolver.js';
const URLResolver = URLResolverPkg.default || URLResolverPkg;
import path from 'path';
import type { APIRoute } from 'astro';

export const config = {
  maxDuration: 300,
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');

    const fonts = {
      // Heading font — Serif, premium editorial feel
      Lora: {
        normal:      path.join(fontsDir, 'NotoSerif-Regular.ttf'),
        bold:        path.join(fontsDir, 'NotoSerif-Bold.ttf'),
        italics:     path.join(fontsDir, 'NotoSerif-Regular.ttf'),
        bolditalics: path.join(fontsDir, 'NotoSerif-Bold.ttf'),
      },
      // Body font — clean, modern
      Outfit: {
        normal:      path.join(fontsDir, 'NotoSans-Regular.ttf'),
        bold:        path.join(fontsDir, 'NotoSans-Bold.ttf'),
        italics:     path.join(fontsDir, 'NotoSans-Regular.ttf'),
        bolditalics: path.join(fontsDir, 'NotoSans-Bold.ttf'),
      },
      // Tamil font for Tamil text spans
      Tamil: {
        normal:      path.join(fontsDir, 'NotoSansTamil-Regular.ttf'),
        bold:        path.join(fontsDir, 'NotoSansTamil-Bold.ttf'),
        italics:     path.join(fontsDir, 'NotoSansTamil-Regular.ttf'),
        bolditalics: path.join(fontsDir, 'NotoSansTamil-Bold.ttf'),
      },
    };

    // ── Brand Color System (matches website exactly) ──────────────────────
    const C = {
      navy:       '#1e1b4b',   // brand-navy
      navyLight:  '#312e81',   // brand-navy-light
      purple:     '#4c1d95',   // brand-purple
      purpleLight:'#7c3aed',   // brand-purple-light
      saffron:    '#f59e0b',   // brand-saffron
      saffronDark:'#d97706',   // brand-saffron-dark
      text:       '#334155',   // brand-text
      textDark:   '#0f172a',   // brand-text-dark
      muted:      '#64748b',   // brand-text-muted
      border:     '#e2e8f0',   // brand-border
      bg:         '#faf8f5',   // brand-light-bg
      white:      '#ffffff',
      rowAlt:     '#faf8f5',   // use brand light bg for alternate rows
      // Section header colors
      sec1:  '#1e1b4b', sec2: '#1e1b4b', sec3: '#1e1b4b',
      sec4:  '#1e1b4b', sec5: '#1e1b4b', sec6: '#1e1b4b',
      sec7:  '#1e1b4b', sec8: '#1e1b4b', sec9: '#1e1b4b',
      sec10: '#1e1b4b', sec11:'#1e1b4b', sec12:'#1e1b4b',
      sec13: '#1e1b4b', sec14:'#1e1b4b', sec15:'#1e1b4b',
      sec16: '#1e1b4b', sec17:'#1e1b4b', sec18:'#1e1b4b',
      sec19: '#1e1b4b', sec20:'#1e1b4b'
    };

    const sectionColors = [
      C.sec1, C.sec2, C.sec3, C.sec4, C.sec5, C.sec6, C.sec7,
      C.sec8, C.sec9, C.sec10, C.sec11, C.sec12, C.sec13, C.sec14,
      C.sec15, C.sec16, C.sec17, C.sec18, C.sec19, C.sec20
    ];

    // ── Tamil-aware inline text ───────────────────────────────────────────
    const T = (text: string, extra: any = {}) => ({
      text, font: 'Tamil', fontSize: 9, ...extra,
    });

    const parseText = (rawText: string) => {
      if (typeof rawText !== 'string') return rawText;
      const clean = rawText
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/☐/g, '[  ]')
        .replace(/☑/g, '[x]');
      const parts = clean.split(/([\u0B80-\u0BFF]+)/);
      if (parts.length === 1) return clean;
      return parts.map(p => p.match(/[\u0B80-\u0BFF]/) ? { text: p, font: 'Tamil' } : { text: p });
    };

    // ── Design components ─────────────────────────────────────────────────
    const sectionHeader = (num: number, title: string, subtitle?: string, breakBefore = false) => {
      const numStr = String(num).padStart(2, '0');
      return {
        table: {
          widths: [3, '*'],
          body: [[
            { text: '', fillColor: C.saffron, border: [false, false, false, false], margin: [0, 0, 0, 0] },
            {
              stack: [
                { text: `SECTION ${numStr}`, font: 'Outfit', fontSize: 9, color: C.saffronDark, bold: true, tracking: 1 },
                { text: title.toUpperCase(), font: 'Lora', fontSize: 18, color: C.navy, bold: true, margin: [0, 2, 0, 0] },
                subtitle ? { text: subtitle, font: 'Outfit', fontSize: 10, color: C.muted, margin: [0, 4, 0, 0] } : null,
              ].filter(Boolean),
              fillColor: C.bg, // using brand-light-bg
              border: [false, false, false, false],
              margin: [12, 10, 10, 10],
            },
          ]],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        margin: [0, 25, 0, 25],
        pageBreak: breakBefore || num > 1 ? 'before' : undefined, // Force a page break for every section to give it proper importance
      } as any;
    };

    const keyValue = (label: string, value: string | any[]) => ({
      columns: [
        { text: label, font: 'Outfit', bold: true, fontSize: 9, color: C.navy, width: 120 },
        { text: value, font: 'Outfit', fontSize: 9, color: C.text, width: '*' },
      ],
      margin: [0, 2, 0, 2],
    } as any);

    const para = (text: string | any[], opts: any = {}) => ({
      text,
      font: 'Outfit', fontSize: 9.5, color: C.text,
      lineHeight: 1.5, margin: [0, 0, 0, 8],
      ...opts,
    } as any);

    const subHead = (text: string, color = C.navy) => ({
      text,
      font: 'Lora', bold: true, fontSize: 11.5, color,
      margin: [0, 14, 0, 6],
    } as any);

    // Sub-label: for numbered sub-sections like A, B, C inside a section
    const subLabel = (letter: string, title: string) => ({
      table: {
        widths: [18, '*'],
        body: [[
          {
            text: letter,
            font: 'Lora', bold: true, fontSize: 9, color: C.white,
            fillColor: C.saffron,
            alignment: 'center',
            margin: [0, 5, 0, 0],
            border: [false, false, false, false],
          },
          {
            text: title.toUpperCase(),
            font: 'Lora', bold: true, fontSize: 10, color: C.navy,
            fillColor: '#fef9ee',
            margin: [8, 5, 8, 5],
            border: [false, false, false, false],
          },
        ]],
      },
      layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
      margin: [0, 12, 0, 6],
    } as any);

    const quoteBlock = (text: string) => {
      const parsed = parseText(text);
      const styledText = Array.isArray(parsed)
        ? parsed.map(p => ({ ...p, font: p.font === 'Tamil' ? 'Tamil' : 'Lora', italics: true, fontSize: 10.5, color: C.navy, bold: true }))
        : { text: parsed, font: 'Lora', italics: true, fontSize: 10.5, color: C.navy, bold: true };

      return {
        table: {
          widths: [5, '*'],
          body: [[
            { text: '', fillColor: C.saffron, border: [false, false, false, false] },
            {
              text: [
                { text: '\u201c', font: 'Lora', fontSize: 12, color: C.saffron, bold: true },
                ...(Array.isArray(styledText) ? styledText : [styledText]),
                { text: '\u201d', font: 'Lora', fontSize: 12, color: C.saffron, bold: true },
              ],
              fillColor: '#f5f3ff',
              lineHeight: 1.35,
              margin: [10, 10, 10, 10],
              border: [false, false, false, false],
            },
          ]],
        },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      margin: [0, 12, 0, 16],
      unbreakable: true,
      } as any;
    };

    const infoBox = (text: string, bgColor = '#f5f3ff') => ({
      table: {
        widths: [5, '*'],
        body: [[
          { text: '', fillColor: C.saffron, border: [false, false, false, false] },
          {
            text,
            font: 'Outfit', fontSize: 9.5, color: C.navy,
            fillColor: bgColor,
            margin: [10, 9, 10, 9],
            border: [false, false, false, false],
            lineHeight: 1.5,
          },
        ]],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      margin: [0, 4, 0, 12],
    } as any);

    // Premium table builder
    const table = (headers: string[], rows: (string | any[])[][], widths?: any[]) => {
      const w = widths || headers.map(() => '*');
      return {
        table: {
          widths: w,
          headerRows: 1,
          keepWithHeaderRows: 1,
          dontBreakRows: true,
          body: [
            headers.map((h, i) => {
              const parsed = parseText(h);
              const applyStyle = (t: any) => ({ ...t, font: t.font === 'Tamil' ? 'Tamil' : 'Lora', bold: true, fontSize: 10.5, color: C.navy, fillColor: C.bg, margin: [8, 8, 8, 8], border: [false, false, false, true] });
              return {
                text: Array.isArray(parsed) ? parsed.map(applyStyle) : [applyStyle({ text: parsed })],
              };
            }),
            ...rows.map((row, ri) => {
              const paddedRow = [...row];
              while (paddedRow.length < headers.length) paddedRow.push('');
              return paddedRow.slice(0, headers.length).map((cell, ci) => ({
                text: parseText(cell),
                font: 'Outfit', fontSize: 9.5,
                color: ci === 0 ? C.navy : C.text,
                bold: ci === 0,
                fillColor: ri % 2 === 0 ? C.white : C.rowAlt,
                margin: [8, 8, 8, 8],
                border: [false, false, false, true],
              }));
            }),
          ],
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 0 : 1,
          vLineWidth: () => 0, // No vertical lines for a cleaner, modern look
          hLineColor: (i: number, node: any) => (i === 1) ? C.navy : C.border, // Dark line under header, light lines between rows
        },
        margin: [0, 10, 0, 20],
      } as any;
    };

    const divider = () => ({
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: C.border }],
      margin: [0, 6, 0, 6],
    } as any);

    const karmicLoop = (num: string, title: string, steps: string[]) => ({
      stack: [
        // Title band
        {
          table: {
            widths: ['*'],
            body: [[{
              text: [
                { text: 'LOOP #' + num + '  ', font: 'Outfit', fontSize: 8, color: C.saffron, bold: true },
                { text: title, font: 'Outfit', fontSize: 10, color: C.white, bold: true },
              ],
              fillColor: C.navy,
              margin: [10, 7, 10, 7],
              border: [false, false, false, false],
            }]],
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 0],
        },
        // Steps as flow rows
        {
          table: {
            widths: [22, '*'],
            headerRows: 0,
            body: steps.map((step, i) => [
              {
                table: { widths: [18], body: [[{ text: String(i + 1), font: 'Outfit', bold: true, fontSize: 8, color: C.saffron, fillColor: '#1e1b4b', alignment: 'center', margin: [0, 3, 0, 0], border: [false, false, false, false] }]] },
                layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
                fillColor: i % 2 === 0 ? C.white : '#f5f3ff',
                border: [false, false, false, false],
                margin: [4, 4, 0, 4],
              },
              {
                text: step.trim(),
                font: 'Outfit', fontSize: 9, color: C.text,
                lineHeight: 1.4,
                fillColor: i % 2 === 0 ? C.white : '#f5f3ff',
                border: [false, false, false, false],
                margin: [4, 5, 6, 5],
              },
            ]),
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: () => 0,
          },
          margin: [0, 0, 0, 0],
        },
      ],
      margin: [0, 8, 0, 14],
      unbreakable: true,
    } as any);

    const numberedAction = (num: number, title: string, desc: string) => ({
      columns: [
        {
          // Navy square badge with centered saffron number
          table: {
            widths: [28],
            heights: [28],
            body: [[{
              text: String(num),
              font: 'Lora', bold: true, fontSize: 12,
              color: C.saffron,
              fillColor: C.navy,
              alignment: 'center',
              margin: [0, 8, 0, 0],
              border: [false, false, false, false],
            }]],
          },
          layout: { hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0 },
          width: 38,
        },
        {
          stack: [
            { text: title, font: 'Lora', bold: true, fontSize: 10.5, color: C.navy, margin: [0, 2, 0, 3] },
            { text: desc, font: 'Outfit', fontSize: 9.5, color: C.text, lineHeight: 1.5 },
          ],
          width: '*',
        },
      ],
      margin: [0, 8, 0, 12],
    } as any);

    const checklist = (items: string[]) => ({
      stack: items.map(item => ({
        columns: [
          {
            canvas: [{ type: 'ellipse', x: 4, y: 5, r1: 3.5, r2: 3.5, color: C.saffron }],
            width: 14,
            margin: [0, 0, 0, 0],
          },
          { text: item, font: 'Outfit', fontSize: 9.5, color: C.text, width: '*', lineHeight: 1.4 },
        ],
        margin: [0, 4, 0, 4],
      })),
    } as any);

    // ── DYNAMIC REPORT DATA ────────────────────────────────────────────────
    const url = new URL(request.url);
    const reportId = url.searchParams.get('report_id');
    let reportName = 'MOHANRAAJ';
    let reportRaasi = 'Simbha';
    let reportLagnam = 'Kanni';
    let reportNakshatra = 'Puram';
    let reportPadam = '4';
    let reportRulingPlanet = 'Sun + Mercury';
    let reportSubtitle = '';
    let useRealContent = false;
    let realContent: any[] = [];

    const getRulingPlanet = (r: string, l: string) => {
      const map: Record<string, string> = {
        'mesham': 'Mars', 'aries': 'Mars',
        'rishabam': 'Venus', 'taurus': 'Venus',
        'mithunam': 'Mercury', 'gemini': 'Mercury',
        'kadagam': 'Moon', 'cancer': 'Moon',
        'simbham': 'Sun', 'simbha': 'Sun', 'leo': 'Sun',
        'kanni': 'Mercury', 'virgo': 'Mercury',
        'thulaam': 'Venus', 'libra': 'Venus',
        'viruchigam': 'Mars', 'scorpio': 'Mars',
        'dhanusu': 'Jupiter', 'sagittarius': 'Jupiter',
        'magaram': 'Saturn', 'capricorn': 'Saturn',
        'kumbam': 'Saturn', 'aquarius': 'Saturn',
        'meenam': 'Jupiter', 'pisces': 'Jupiter'
      };
      const getLord = (sign: string) => {
        if (!sign) return '';
        const s = sign.toLowerCase();
        for (const k in map) { if (s.includes(k)) return map[k]; }
        return '';
      };
      const rl = getLord(r);
      const ll = getLord(l);
      if (rl && ll && rl !== ll) return `${rl} + ${ll}`;
      if (rl) return rl;
      if (ll) return ll;
      return '—';
    };

    const getTamil = (str: string, type: string) => {
      if (!str) return '';
      const s = str.toLowerCase();
      const maps: any = {
        raasi: {
          'mesham': 'மேஷம்', 'aries': 'மேஷம்', 'rishabam': 'ரிஷபம்', 'taurus': 'ரிஷபம்',
          'mithunam': 'மிதுனம்', 'midhunam': 'மிதுனம்', 'gemini': 'மிதுனம்',
          'kadagam': 'கடகம்', 'cancer': 'கடகம்', 'simbham': 'சிம்மம்', 'simbha': 'சிம்மம்', 'leo': 'சிம்மம்',
          'kanni': 'கன்னி', 'virgo': 'கன்னி', 'thulam': 'துலாம்', 'thulaam': 'துலாம்', 'libra': 'துலாம்',
          'vrichigam': 'விருச்சிகம்', 'viruchigam': 'விருச்சிகம்', 'scorpio': 'விருச்சிகம்',
          'dhanusu': 'தனுசு', 'sagittarius': 'தனுசு', 'magaram': 'மகரம்', 'capricorn': 'மகரம்',
          'kumbam': 'கும்பம்', 'aquarius': 'கும்பம்', 'meenam': 'மீனம்', 'pisces': 'மீனம்'
        },
        nakshatra: {
          'ashwini': 'அஸ்வினி', 'bharani': 'பரணி', 'karthikai': 'கார்த்திகை', 'rohini': 'ரோகிணி', 'mrigashira': 'மிருகசீரிடம்',
          'ardra': 'திருவாதிரை', 'thiruvadhirai': 'திருவாதிரை', 'punarvasu': 'புனர்பூசம்', 'punarpoosam': 'புனர்பூசம்',
          'pushya': 'பூசம்', 'poosam': 'பூசம்', 'ashlesha': 'ஆயில்யம்', 'ayilyam': 'ஆயில்யம்', 'magha': 'மகம்', 'magam': 'மகம்',
          'purva phalguni': 'பூரம்', 'pooram': 'பூரம்', 'uttara phalguni': 'உத்திரம்', 'uthiram': 'உத்திரம்',
          'hasta': 'அஸ்தம்', 'astham': 'அஸ்தம்', 'chitra': 'சித்திரை', 'chithirai': 'சித்திரை', 'swathi': 'சுவாதி', 'swati': 'சுவாதி',
          'vishakha': 'விசாகம்', 'visakam': 'விசாகம்', 'anuradha': 'அனுஷம்', 'anusham': 'அனுஷம்', 'jyeshta': 'கேட்டை', 'kettai': 'கேட்டை',
          'mula': 'மூலம்', 'moolam': 'மூலம்', 'purva ashadha': 'பூராடம்', 'pooradam': 'பூராடம்', 'uttara ashadha': 'உத்திராடம்', 'uthiradam': 'உத்திராடம்',
          'shravana': 'திருவோணம்', 'thiruvonam': 'திருவோணம்', 'dhanishta': 'அவிட்டம்', 'avittam': 'அவிட்டம்',
          'shatabhisha': 'சதயம்', 'sadayam': 'சதயம்', 'purva bhadrapada': 'பூரட்டாதி', 'poorattadhi': 'பூரட்டாதி',
          'uttara bhadrapada': 'உத்திரட்டாதி', 'uthirattadhi': 'உத்திரட்டாதி', 'revati': 'ரேவதி'
        }
      };
      const map = maps[type];
      if (!map) return '';
      for (const k in map) { if (s.includes(k)) return map[k]; }
      return '';
    };

    if (reportId) {
      try {
        const { neon } = await import('@neondatabase/serverless');
        const dbUrl = process.env.DATABASE_URL || (import.meta as any).env?.DATABASE_URL;
        if (!dbUrl) throw new Error('DATABASE_URL not set');
        const sql = neon(dbUrl);
        const rows = await sql`
          SELECT r.raw_markdown_report, p.name, p.raasi, p.lagnam, p.nakshatra, p.padam
          FROM reports r
          JOIN profiles p ON r.profile_id = p.id
          WHERE r.id = ${reportId} AND r.status = 'completed'
        ` as any[];
      if (rows.length > 0) {
        const row = rows[0];
        reportName = (row.name || 'Report').toUpperCase();
        reportRaasi = row.raasi || 'Simbha';
        reportLagnam = row.lagnam || 'Kanni';
        reportNakshatra = row.nakshatra || 'Puram';
        reportPadam = row.padam || '';
        reportRulingPlanet = getRulingPlanet(reportRaasi, reportLagnam);
        useRealContent = true;
        // ── Markdown → pdfmake parser ─────────────────────────────────────
        const md = (row.raw_markdown_report || '').split('\n');
        let secNum = 0;
        let mi = 0;
        while (mi < md.length) {
          const l = md[mi];
          if (l.match(/^## /)) {
            secNum++;
            const title = l.replace(/^## /, '').replace(/^Section\s*\d+:?\s*/i, '').trim();
            realContent.push(sectionHeader(secNum, title.toUpperCase()));
          } else if (l.match(/^### /)) {
            realContent.push(subHead(l.replace(/^### /, '').trim()));
          } else if (l.match(/^#### /)) {
            realContent.push({ text: l.replace(/^#### /, '').trim(), font: 'Outfit', bold: true, fontSize: 10, color: C.navy, margin: [0, 8, 0, 4] });
          } else if (l.startsWith('> ')) {
            const q = l.replace(/^> /, '').replace(/^["'\s*]+|["'\s*]+$/g, '').trim();
            if (q) realContent.push(quoteBlock(q));
          } else if (l.startsWith('|') && mi + 1 < md.length && md[mi + 1].match(/^\|[-:\s|]+\|/)) {
            const hdrs = l.split('|').filter(h => h.trim()).map(h => h.trim());
            mi += 2;
            const rws: string[][] = [];
            while (mi < md.length && md[mi].startsWith('|')) { rws.push(md[mi].split('|').filter(c => c.trim()).map(c => c.trim())); mi++; }
            if (hdrs.length > 0 && rws.length > 0) realContent.push(table(hdrs, rws));
            continue;
          } else if (l.match(/^[-*] /)) {
            const items: any[] = [];
            while (mi < md.length && md[mi].match(/^[-*] /)) { items.push(parseText(md[mi].replace(/^[-*] /, '').replace(/\*\*/g, '').trim())); mi++; }
            if (items.length > 0) realContent.push({ ul: items, font: 'Outfit', fontSize: 9.5, color: C.text, margin: [8, 4, 0, 10] });
            continue;
          } else if (l.match(/^\d+\.\s/)) {
            const items: any[] = [];
            while (mi < md.length && md[mi].match(/^\d+\.\s/)) { items.push(parseText(md[mi].replace(/^\d+\.\s+/, '').replace(/\*\*/g, '').trim())); mi++; }
            if (items.length > 0) realContent.push({ ol: items, font: 'Outfit', fontSize: 9.5, color: C.text, margin: [8, 4, 0, 10] });
            continue;
          } else if (l.trim() && !l.match(/^#{1,6} /) && !l.match(/^[-=]{3,}/)) {
            const clean = l.trim().replace(/\*\*/g, '').replace(/\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
            if (clean) {
              if (!reportSubtitle && secNum === 0) {
                // Extract the very first non-heading text as the report subtitle
                reportSubtitle = clean;
              } else {
                realContent.push({ text: parseText(clean), font: 'Outfit', fontSize: 9.5, color: C.text, lineHeight: 1.45, margin: [0, 2, 0, 6] });
              }
            }
          }
          mi++;
        }
      }
        const introMessage = [
          // 1. The Quote Box (On the Cover Page)
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      { 
                        text: parseText('"We are responsible for what we are, and whatever we wish ourselves to be, we have the power to make ourselves. If what we are now has been the result of our own past actions, it certainly follows that whatever we wish to be in future can be produced by our present actions; so we have to know how to act."'), 
                        font: 'Lora', 
                        italics: true, 
                        fontSize: 12, 
                        color: C.navy, 
                        alignment: 'center', 
                        lineHeight: 1.6,
                        margin: [0, 0, 0, 12]
                      },
                      { 
                        text: '— Swami Vivekananda', 
                        font: 'Outfit', 
                        bold: true, 
                        fontSize: 10, 
                        color: C.saffronDark, 
                        alignment: 'center',
                        letterSpacing: 1
                      }
                    ],
                    fillColor: C.bg,
                    margin: [30, 25, 30, 25],
                    border: [true, true, true, true]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => C.saffron,
              vLineColor: () => C.saffron,
            },
            margin: [0, 10, 0, 10]
          },
          
          // 2. The Preamble Text (On the Next Page)
          { text: 'A Message Before You Begin', font: 'Lora', bold: true, fontSize: 18, color: C.navy, alignment: 'center', margin: [0, 0, 0, 20], pageBreak: 'before' },
          { text: 'The whole idea behind this report is not just to provide astrological guidance or simply reflect your characteristics.', font: 'Outfit', fontSize: 10.5, color: C.text, lineHeight: 1.6, margin: [0, 0, 0, 10] },
          { text: 'One important assumption is that astrology is a gift deeply rooted in Indian tradition. If we look back from ancient times, a vast amount of knowledge has been embedded within it. In many ways, we can say this is a combination of mathematics and science.', font: 'Outfit', fontSize: 10.5, color: C.text, lineHeight: 1.6, margin: [0, 0, 0, 10] },
          { text: 'When you observe how numbers have been used and interpreted in astrology, it almost feels magical. Considering the world\'s massive population, this mathematical system has worked in such a way that every individual can still be understood as unique.', font: 'Outfit', fontSize: 10.5, color: C.text, lineHeight: 1.6, margin: [0, 0, 0, 10] },
          { text: 'The purpose of this report goes beyond predicting events. We believe that every person has a soul purpose. When you identify that purpose clearly and begin to align your life with it, your karmic patterns gradually start to clear.', font: 'Outfit', fontSize: 10.5, color: C.text, lineHeight: 1.6, margin: [0, 0, 0, 10] },
          { text: 'Going to temples and performing remedies may help on one side, but beyond all that, the best way is to consciously neutralize our karmic actions through awareness and right action.', font: 'Outfit', fontSize: 10.5, color: C.text, lineHeight: 1.6, margin: [0, 0, 0, 10] },
          { text: 'This report has been designed with that intention — to help you understand these deeper aspects of your life. Use this guidance, take action, and move forward with clarity.', font: 'Outfit', fontSize: 10.5, color: C.text, lineHeight: 1.6, margin: [0, 0, 0, 10] },
          { text: 'Our best wishes to you. But remember — without taking action, it is impossible to achieve meaningful change.', font: 'Outfit', fontSize: 10.5, color: C.text, lineHeight: 1.6, margin: [0, 0, 0, 15] },
          { text: '— Thank you.', font: 'Outfit', bold: true, fontSize: 11, color: C.navy, margin: [0, 0, 0, 10] }
        ];
        realContent.unshift(...introMessage);
      } catch (dbErr) { console.error('DB fetch for PDF failed:', dbErr); }
    }

    // ── DOCUMENT CONTENT ──────────────────────────────────────────────────
    const content: any[] = [

      // ══ COVER PAGE ═══════════════════════════════════════════════════════
      {
        stack: [
          // Top branding
          { text: 'ASK ASTRO RAJA', font: 'Outfit', bold: true, fontSize: 10, color: C.saffronDark, alignment: 'center', letterSpacing: 4, margin: [0, 0, 0, 40] },
          
          // Main Title
          { text: 'LIFE TRANSFORMATION', font: 'Lora', bold: true, fontSize: 32, color: C.navy, alignment: 'center', margin: [0, 0, 0, 8] },
          { text: 'REPORT', font: 'Lora', bold: true, fontSize: 32, color: C.saffron, alignment: 'center', margin: [0, 0, 0, 30] },
          
          // Separator
          { canvas: [{ type: 'line', x1: 157.5, y1: 0, x2: 357.5, y2: 0, lineWidth: 1, lineColor: C.border }], margin: [0, 0, 0, 30] },
          
          // For Label
          { text: 'PREPARED EXCLUSIVELY FOR', font: 'Outfit', fontSize: 9, color: C.muted, alignment: 'center', letterSpacing: 2, margin: [0, 0, 0, 10] },
          
          // Name
          { text: reportName, font: 'Lora', bold: true, fontSize: 24, color: C.navy, alignment: 'center', margin: [0, 0, 0, 40] },
        ],
        margin: [0, 40, 0, 10],
      },

      // Extracted AI Subtitle
      ...(reportSubtitle ? [{
        text: reportSubtitle,
        font: 'Lora',
        fontSize: 14,
        color: C.saffron,
        alignment: 'center',
        margin: [0, 24, 0, 14]
      }] : []),

      // Astro key summary bar — navy background, white label, saffron value
      {
        columns: [
          {
            table: {
              widths: ['*'],
              body: [[{
                stack: [
                  { text: 'RAASI', font: 'Outfit', fontSize: 7, color: '#a5b4fc', bold: true, alignment: 'center', letterSpacing: 1 },
                  { text: parseText(reportRaasi + (getTamil(reportRaasi, 'raasi') ? `\n(${getTamil(reportRaasi, 'raasi')})` : '')), font: 'Lora', fontSize: 8.5, color: C.saffron, bold: true, alignment: 'center', margin: [0, 3, 0, 0] },
                ],
                fillColor: C.navy, margin: [8, 10, 8, 10], border: [false, false, false, false],
              }]],
            },
            layout: 'noBorders',
          },
          { width: 6, text: '' },
          {
            table: {
              widths: ['*'],
              body: [[{
                stack: [
                  { text: 'LAGNAM', font: 'Outfit', fontSize: 7, color: '#a5b4fc', bold: true, alignment: 'center', letterSpacing: 1 },
                  { text: parseText(reportLagnam + (getTamil(reportLagnam, 'raasi') ? `\n(${getTamil(reportLagnam, 'raasi')})` : '')), font: 'Lora', fontSize: 8.5, color: C.saffron, bold: true, alignment: 'center', margin: [0, 3, 0, 0] },
                ],
                fillColor: C.navy, margin: [8, 10, 8, 10], border: [false, false, false, false],
              }]],
            },
            layout: 'noBorders',
          },
          { width: 6, text: '' },
          {
            table: {
              widths: ['*'],
              body: [[{
                stack: [
                  { text: 'NAKSHATRA', font: 'Outfit', fontSize: 7, color: '#a5b4fc', bold: true, alignment: 'center', letterSpacing: 1 },
                  { text: parseText(reportNakshatra + (getTamil(reportNakshatra, 'nakshatra') ? `\n(${getTamil(reportNakshatra, 'nakshatra')})` : '')), font: 'Lora', fontSize: 8.5, color: C.saffron, bold: true, alignment: 'center', margin: [0, 3, 0, 0] },
                ],
                fillColor: C.navy, margin: [8, 10, 8, 10], border: [false, false, false, false],
              }]],
            },
            layout: 'noBorders',
          },
          { width: 6, text: '' },
          {
            table: {
              widths: ['*'],
              body: [[{
                stack: [
                  { text: 'PATHAM', font: 'Outfit', fontSize: 7, color: '#a5b4fc', bold: true, alignment: 'center', letterSpacing: 1 },
                  { text: parseText(reportPadam ? `${reportPadam}\n(${reportPadam}ம் பாதம்)` : '—\n(—)'), font: 'Lora', fontSize: 8.5, color: C.saffron, bold: true, alignment: 'center', margin: [0, 3, 0, 0] },
                ],
                fillColor: C.navy, margin: [8, 10, 8, 10], border: [false, false, false, false],
              }]],
            },
            layout: 'noBorders',
          },
        ],
        margin: [0, 14, 0, 6],
      },

      ...(useRealContent ? realContent : [
      // ══ SECTION 1 ═════════════════════════════════════════════════════════
      sectionHeader(1, 'Astro Foundation', 'Your cosmic blueprint — the stars that shape your inner and outer world'),
      table(
        ['Aspect', ['Raasi — Simbham (', T('சிம்மம்'), ')'], ['Lagnam — Kanni (', T('கன்னி'), ')']],
        [
          [['Sign'], ['Leo — ', T('சிம்மம்')], ['Virgo — ', T('கன்னி')]],
          [['Symbol'], ['Lion — ', T('சிங்கம்')], ['Virgin / Maiden — ', T('கன்னி')]],
          [['Element'], ['Fire — ', T('நெருப்பு')], ['Earth — ', T('பூமி')]],
          [['Ruling Planet'], ['Sun / Surya — ', T('சூரியன்')], ['Mercury / Budhan — ', T('புதன்')]],
          [['Nakshatra'], ['Puram 4th Padam — ', T('பூரம்'), '\n(Ruled by Venus — Royal star of luxury & creativity)'], ['']],
          [['Core Nature'], ['Pride, leadership, warmth, generosity, craves recognition'], ['Analytical, perfectionist, critical, anxious, over-thinks everything']],
          [['Thinking Style'], ['"I deserve this." — feels grand, thinks big, wants to be center'], ['"Is this good enough?" — analyzes every angle, finds every flaw']],
        ]
      ),
      subHead('The Lion and The Maiden — Symbol Connection'),
      para('The Lion is the king of the jungle. It walks with majesty, demands respect, and expects to be admired. It was BORN to rule. The Maiden is meticulous, careful, humble, always checking, always correcting, always worried about imperfection. Now put them in one body. Inside, Mohanraaj feels like a king — he KNOWS he\'s meant for something great. He has the vision, the warmth, the leadership instinct. Outside, the Maiden makes him second-guess every step, over-analyze every decision, and paralyze himself with perfectionism before the Lion can even roar.'),
      subHead('Puram 4th Padam — The Royal Star in the House of Emotion'),
      para('Puram nakshatra is the star of royalty, creativity, and public life. It\'s ruled by Venus, giving Mohanraaj a natural love for beauty, comfort, art, and meaningful connections. The 4th padam falls in Cancer navamsa — adding an emotional, nurturing, family-oriented depth to the royal energy. This means Mohanraaj doesn\'t just want success — he wants success that MEANS something. He wants recognition not for ego but for validation that his life MATTERS.'),
      quoteBlock('I am a king who forgot his crown — because the perfectionist inside keeps telling him it\'s not polished enough to wear.'),

      // ══ SECTION 2 ═════════════════════════════════════════════════════════
      sectionHeader(2, 'Core Combination Truth', 'The painful gap between your inner world and outer appearance'),
      table(
        ['INNER WORLD (Simbha Raasi)', 'OUTER APPROACH (Kanni Lagnam)'],
        [
          ['Feels like a leader — born to shine, guide, and inspire', 'Appears analytical, careful, self-doubting, overly cautious'],
          ['Craves recognition: "See me. Value me. Admire me."', 'Hides from the spotlight because "I\'m not ready yet"'],
          ['Thinks big — grand visions, majestic plans', 'Thinks small — micro-details, flaws, risks, what could go wrong'],
          ['Generous, warm, big-hearted', 'Critical, judgmental — of self first, then others'],
          ['Wants to take bold action and lead', 'Over-analyzes until the moment passes. Then regrets.'],
          ['Needs love, admiration, and emotional warmth', 'Pushes people away with criticism and emotional distance'],
          ['"I am special. I have a gift."', '"Who am I to think I\'m special?"'],
        ]
      ),
      subHead('The Conflict'),
      para('This is one of the most PAINFUL combinations in the zodiac — because the gap between what Mohanraaj feels inside and what he shows outside is enormous. Inside, the Lion ROARS. He knows he\'s meant for greatness. Outside, the Maiden whispers: "But what if you fail? What if it\'s not perfect?" The Lion wants to leap. The Maiden wants to check the landing spot 47 times first. By the time the analysis is done, the opportunity is gone.'),
      para('The deepest pain: Mohanraaj is MISUNDERSTOOD. People see the Virgo exterior — quiet, analytical, critical, reserved. They have no idea that inside there is a Lion starving for recognition, love, and a chance to shine.'),
      quoteBlock('The world sees a quiet analyst. Inside lives a roaring king. The tragedy is not that I can\'t lead — it\'s that I won\'t let myself.'),

      // ══ SECTION 3 ═════════════════════════════════════════════════════════
      sectionHeader(3, 'Character Profile', 'Your strengths and uncomfortable truths side by side'),
      table(
        ['STRENGTHS', 'SHADOW WEAKNESSES'],
        [
          ['Natural leader — people WANT to follow him when he steps up', 'Rarely steps up because he\'s waiting to be "ready." Ready never comes.'],
          ['Brilliant analytical mind — sees details others miss', 'Uses analysis as a disguise for fear. "I\'m still researching" = "I\'m too scared to start."'],
          ['Deeply creative — Puram gives artistic, aesthetic sensibility', 'Creates in private but never shares because it\'s "not good enough yet."'],
          ['Extremely loyal and devoted to family', 'Devotion becomes suffocation. Expectations become resentment.'],
          ['High standards — everything he does has quality', 'Standards so high that nothing ever meets them. Perfectionism is his prison.'],
          ['Warm and generous when comfortable', 'Cold and critical when stressed. The warmth vanishes.'],
          ['Can see the big picture AND the small details', 'Gets lost in small details and forgets the big picture.'],
          ['Deeply wants to serve and help others', 'Helps everyone except himself. Self-neglect is his default setting.'],
          ['Resilient — quiet endurance under enormous pressure', 'Endures when he should exit. Stays in destroying situations hoping for better.'],
        ]
      ),

      // ══ SECTION 4 ═════════════════════════════════════════════════════════
      sectionHeader(4, 'Life Area Impact', 'How your combination shows up across every domain of life'),
      table(
        ['Life Area', 'How it Shows Up', 'The Hidden Cost'],
        [
          ['Career', 'No clear direction. Leo wants to lead but Virgo says "not yet." Overqualified for current reality.', 'Years pass. Talent wasted. The Lion gets smaller every year it doesn\'t roar.'],
          ['Money', 'Leo wants luxury. Virgo anxious about every rupee. Earns inconsistently because career has no direction.', 'Financial anxiety is constant. Not because he can\'t earn — but never commits to ONE path.'],
          ['Marriage', 'Leo wants admiration from partner. Virgo makes him critical. Wife feels she can never be good enough.', 'Emotional distance. Wife stops trying. Leo feels unloved. Virgo blames. Nobody wins.'],
          ['Family', 'Deep duty (Puram 4th padam = family-oriented). Does everything for family, expects recognition.', 'Quiet resentment builds. "I sacrifice everything and nobody notices."'],
          ['Health', 'Virgo rules nervous system. Overthinking = acidity, gut problems, sleep issues, anxiety.', 'The body whispers first, then shouts, then screams. By the time he listens — it\'s screaming.'],
          ['Mental', 'Brutal inner critic attacking a sensitive ego. The mind is a courtroom with Mohanraaj always on trial.', 'Mental exhaustion. Loneliness. Nobody sees the Lion. He feels invisible in his own life.'],
        ],
        [60, '*', '*']
      ),

      // ══ SECTION 5 ═════════════════════════════════════════════════════════
      sectionHeader(5, 'Core Life Loop', 'The cycle that keeps you trapped — not fate, not karma, a pattern you feed'),
      table(
        ['#', 'Stage Name', 'What\'s Really Happening'],
        [
          ['(1)', 'The Vision', 'Leo sees a grand possibility. The heart KNOWS this is right. "This could be my moment."'],
          ['(2)', 'The Analysis', 'Virgo takes over. "But what about this risk? Let me make sure it\'s PERFECT before I start."'],
          ['(3)', 'Paralysis', 'Weeks → months. Still planning. Still perfecting. Others who are less talented but more decisive move ahead.'],
          ['(4)', 'Wounded Pride', '"I\'m better than them — why are THEY succeeding?" Frustration. Jealousy. Humiliation by inaction.'],
          ['(5)', 'Self-Spiral', '"You\'re a fraud. You\'ll never do it." The inner critic destroys what\'s left of the Lion\'s confidence.'],
          ['(6)', 'Retreat', 'Gives up. Goes quiet. Retreats into routine. Until the next vision appears. The graveyard of ideas grows.'],
        ],
        [35, 90, '*']
      ),
      subHead('Why this happens for Leo + Virgo + Puram:'),
      para('Leo\'s Sun gives the VISION. Virgo\'s Mercury gives the DOUBT. Puram\'s Venus adds the desire for everything to be BEAUTIFUL and PERFECT before it\'s shared. Together: king-level vision, servant-level self-doubt, and artist-level perfectionism. The vision is grand. The standards are impossible. The gap is where life is stuck.'),
      quoteBlock('I am not failing because I lack talent. I am failing because I won\'t let imperfect talent see the light of day. My perfectionism is not quality control — it is fear wearing a lab coat.'),

      // ══ SECTION 6 ═════════════════════════════════════════════════════════
      sectionHeader(6, 'Karmic Pattern Analysis', 'Behavioral grooves carved so deep they feel like destiny'),
      para('These are not curses from past lives. These are patterns carved so deep they feel like fate.'),
      karmicLoop('4', 'The Lonely Lion', [
        'Want deep connection',
        'Show Virgo exterior — critical, reserved',
        'People feel judged, they withdraw',
        '"Nobody gets me" — withdraw further',
        'Loneliness deepens',
        'Repeat. The warmth of the Lion is trapped behind the walls of the Maiden.',
      ]),
      infoBox('Root Cause: His inner Leo says "I am the Sun. I was born to shine." His outer Virgo says "But what if the light isn\'t bright enough?" This battle has run his entire life. The karma is simple: SHINE ANYWAY. Imperfectly. Messily. Humanly.'),
      quoteBlock('My karma is not suffering. My karma is the refusal to shine until conditions are perfect. Conditions will NEVER be perfect. The Sun doesn\'t wait for a cloudless sky. It rises every day regardless.'),

      // ══ SECTION 7 ═════════════════════════════════════════════════════════
      sectionHeader(7, 'Root Problems', 'The core issues running every area of life'),
      table(
        ['Problem', 'How It Shows Up in Mohanraaj\'s Life'],
        [
          ['Analysis Paralysis', 'Can\'t make decisions. Over-researches everything. Uses "I need more information" as a shield against the fear of action.'],
          ['Perfectionism', 'Nothing is ever good enough to ship, share, or start. The project is 90% done but the last 10% takes forever. Perfectionism is fear in a tuxedo.'],
          ['Self-Criticism', 'The Virgo inner critic is merciless. "You\'re not good enough. You\'re a fraud." This voice is loudest at 2 AM.'],
          ['Need for Recognition', 'Does good work but NEEDS someone to notice. No praise = no fuel. Motivation depends entirely on external validation.'],
          ['Career Confusion', 'Has 10 ideas but can\'t commit to one. Talented enough for many paths but committed to none.'],
          ['Relationship Criticism', 'Virgo sees every flaw in partner, family, friends. Points them out "for their own good." People feel judged, not loved.'],
          ['Health Anxiety', 'Overthinking = physical symptoms: gut problems, headaches, sleep issues, chest tightness. Every symptom is googled and catastrophized.'],
          ['Loneliness', 'Shows the Virgo exterior and wonders why people think he\'s cold. Wants warmth but projects walls.'],
          ['Financial Anxiety', 'Wants a wealthy life, feels guilty about wanting it, can\'t build it because of career paralysis, stresses about money constantly.'],
        ]
      ),

      // ══ SECTION 8 ═════════════════════════════════════════════════════════
      sectionHeader(8, 'What Must Be Let Go', 'The beliefs to release and the practices to replace them'),
      table(
        ['Let Go Of', 'Wrong Belief', 'The Truth', 'Daily Practice'],
        [
          ['Perfectionism', '"It has to be perfect before I share it."', 'Done at 80% beats perfect at 0%. The world rewards shipped, not polished.', 'Ship ONE thing today — good enough, not perfect.'],
          ['Needing Approval', '"If nobody notices, it wasn\'t worth doing."', 'Worth is not measured by applause.', 'Do one valuable thing without telling anyone.'],
          ['Self-Criticism', '"I\'m not good enough. I\'m a fraud."', 'The inner critic is paralyzing, not protecting.', 'Write ONE thing you did well tonight.'],
          ['Over-Analysis', '"I need more data before deciding."', 'After 70% information, more analysis is just delay.', '10-minute cap: research, then DECIDE.'],
          ['Criticizing Others', '"I\'m helping them by pointing out mistakes."', 'Unsolicited criticism pushes people away.', 'For every flaw you see, say one strength out loud.'],
          ['Hiding the Lion', '"People will judge me if I show who I really am."', 'Show the Lion — people will see warmth and heart.', 'Once per day: one genuine warm expression.'],
          ['Comparing to Others', '"They\'re less talented but more successful."', 'They\'re not more talented. They\'re more DECISIVE.', 'Compete only with yesterday\'s version of yourself.'],
        ],
        [60, 85, 85, '*']
      ),
      quoteBlock('The Lion doesn\'t need a perfect mane to roar. It just needs to open its mouth. Mohanraaj — open yours.'),

      // ══ SECTION 9 ═════════════════════════════════════════════════════════
      sectionHeader(9, 'React Mode vs Create Mode', 'Where you are now — and where you must go'),
      table(
        ['REACT MODE — Current State', 'CREATE MODE — Required State'],
        [
          ['Waits for perfect conditions to start', 'Starts in imperfect conditions. Perfects along the way.'],
          ['Needs validation before acting', 'Acts first. Validation comes from results, not applause.'],
          ['Analyzes until the opportunity dies', 'Analyzes for 10 minutes, then MOVES. Adjusts in flight.'],
          ['Criticizes self and others when stressed', 'Observes flaws but leads with encouragement.'],
          ['Hides talent behind "I\'m not ready"', 'Shows talent before it\'s polished. Let the world see.'],
          ['Compares to others and feels bitter', 'Competes only with yesterday\'s version of himself.'],
        ]
      ),
      para('Virgo lagnam is the most analytically REACTIVE sign. Leo raasi COULD be the engine of action — Lions are born leaders and doers. But the Virgo gatekeeper won\'t let the Lion out until every variable is checked. The transformation: OPEN THE GATE. Let the Lion out. Messy, imperfect, unpolished. The world needs his roar, not his analysis.'),

      // ══ SECTION 10 ════════════════════════════════════════════════════════
      sectionHeader(10, 'Complete Solution System', 'The operating system to break every karmic loop'),

      subLabel('A', 'Mind Rules — Non-Negotiable'),
      table(
        ['#', 'Rule'],
        [
          ['1', 'SHIP BEFORE IT\'S PERFECT. 80% done and shared beats 100% done and hidden. Every time. No exceptions.'],
          ['2', 'The inner critic is NOT my friend. It\'s the Virgo cage. When it speaks: "Thank you. The Lion is driving now."'],
          ['3', 'I don\'t need permission to shine. I need COURAGE. Courage is acting while the Virgo voice is still talking.'],
          ['4', 'My worth is measured by what I CREATE today, not by other people\'s recognition.'],
          ['5', 'Criticize less. Encourage more. Kindness to others = kindness to self.'],
        ],
        [32, '*']
      ),

      subLabel('B', 'Daily Operating System'),
      table(
        ['Time', 'Activity', 'Purpose'],
        [
          ['5:30 AM', 'Wake up', 'Claim the day before the critic wakes up'],
          ['5:45–6:15 AM', 'Walk + sunlight. 30 min. No phone.', 'Leo is ruled by the Sun. Morning sunlight literally fuels this sign. Vitamin D + movement = anxiety down.'],
          ['6:15–6:30 AM', 'Affirmation: "Today, the Lion leads." + Write 3 tasks.', 'Set the identity BEFORE the day tests it'],
          ['9:00 AM–1:00 PM', 'TASK 1: The SCARY task. Do it FIRST.', 'Hardest action while willpower is highest. Once done, the day is already a win.'],
          ['2:00–4:00 PM', 'TASK 2: Income / career progress.', 'Direction. Movement. Money follows action, not analysis.'],
          ['4:00–5:30 PM', 'TASK 3: Creative / share something publicly.', 'The Lion needs a stage. Even a small one.'],
          ['7:00–7:30 PM', 'Family time — ONE kind word. No criticism.', 'Retrain the Virgo eye to see beauty, not flaws.'],
          ['9:00–9:15 PM', 'Night review: What did I SHIP? What was I kind?', 'Track courage, not perfection.'],
          ['10:00 PM', 'Sleep. No phone after 9:30.', 'The anxious mind NEEDS shutdown time.'],
        ],
        [100, '*', '*']
      ),

      subLabel('C', 'Money System'),
      infoBox('Current: No clear income path → no career commitment → earns inconsistently → financial anxiety.\n\nFix: COMMIT to one income path for 90 days. Stop researching alternatives. Pick the best option TODAY and go deep.\n\nPuram\'s Gift (Venus): Natural ability with aesthetics, creativity, people skills, luxury markets. Fields: design, consulting, content, hospitality, wellness, art, coaching, branding.\n\nDaily Rule: ONE income action per day. "Did I move closer to money today?" If yes, the day counts.'),

      subLabel('D', 'Overthinking Control'),
      infoBox('The 10-minute cap: Set a timer. Research for max 10 minutes. When it rings: DECIDE. Even if imperfect. Adjust tomorrow.\n\nThe body hack: When the Virgo spiral starts — STAND UP. Walk 5 minutes. Drink water. The spiral lives in stillness. Movement breaks it.\n\nThe truth mantra: "This thought is not a fact. It\'s just the Maiden worrying. The Lion has work to do."'),

      subLabel('E', 'Loneliness Fix'),
      infoBox('The cause: Shows Virgo exterior (critical, reserved) while Leo inside starves for connection.\n\nThe fix: Show the Lion. Once per day — compliment someone genuinely, share something personal, laugh loudly, express affection directly. Each warm act is a crack in the Virgo wall.\n\nThe rule: "If I want warmth from others, I must radiate it first. The Sun doesn\'t wait for someone else to shine."'),

      // ══ SECTION 11 ════════════════════════════════════════════════════════
      sectionHeader(11, 'How to Break the Karmic Pattern', '5 steps to permanently end the loops'),
      numberedAction(1, 'Recognize the Maiden taking over',
        'When you hear: "I need more time, it\'s not ready, what if it fails, let me check one more thing" — say OUT LOUD: "The Maiden is worried. But the Lion is ready. I\'m going." Then act within 60 seconds.'),
      numberedAction(2, 'Ship something imperfect every day',
        'Every day, put something into the world that is not 100%. A message. A post. An email. A conversation. A decision. After 30 days: imperfect shipped > perfect imagined.'),
      numberedAction(3, 'Stop tracking who noticed',
        'Create for the work, not for the applause. When you stop needing recognition, ironically, recognition finds you. Do the work. Let go of the scoreboard.'),
      numberedAction(4, 'Replace criticism with curiosity',
        'When the Virgo eye spots a flaw, ask: "What can I learn?" instead of judging. 90 days of this rewires the critical brain into a growth brain. The inner critic becomes an inner coach.'),
      numberedAction(5, 'Claim the throne',
        'Stop waiting to be invited. Stop waiting for permission. YOU are the king of your life. Nobody is going to crown you. Crown yourself. Imperfect crown. Messy throne. But YOURS. Today.'),
      quoteBlock('My karma breaks the day I stop waiting to be perfect and start choosing to be present. The Sun doesn\'t apologize for its spots. It just shines.'),

      // ══ SECTION 12 ════════════════════════════════════════════════════════
      sectionHeader(12, 'Identity Shift', 'The old identity to bury — the new one to build daily'),
      table(
        ['OLD IDENTITY — Let This Die', 'NEW IDENTITY — Build This Daily'],
        [
          ['"I\'m not ready yet"', '"I start before I\'m ready. Readiness is an illusion."'],
          ['"Nobody sees my talent"', '"I haven\'t shown my talent. That\'s on me, not them."'],
          ['"It has to be perfect"', '"Done and shared beats perfect and hidden. Every time."'],
          ['"I\'m a critic who sees what\'s wrong"', '"I\'m a leader who sees what\'s possible."'],
          ['"I\'m misunderstood — nobody gets me"', '"I haven\'t shown the real me. When I do, the right people will see."'],
          ['"I need recognition to feel worthy"', '"My worth comes from what I create, not what others applaud."'],
          ['"I\'m an analyst"', '"I\'m a king who uses analysis as a tool — not a cage."'],
          ['"I\'m a failure"', '"I\'m a man of immense potential who is finally choosing to ACT."'],
        ]
      ),

      // ══ SECTION 13 ════════════════════════════════════════════════════════
      sectionHeader(13, 'Final Truths', 'Read these every morning — before the Maiden wakes up'),
      para('Read these while the Lion is still in charge.', { bold: true, color: C.navy }),
      table(
        ['#', 'Truth'],
        [
          ['1', 'Perfectionism is not quality control. It is FEAR wearing a lab coat. I see it now.'],
          ['2', 'The people succeeding ahead of me are not more talented. They are more DECISIVE. They shipped at 60% while I polished at 95%.'],
          ['3', 'Nobody will crown me. I must crown myself. Imperfect crown. Messy throne. But MINE.'],
          ['4', 'The world doesn\'t need a perfect version of me. It needs a PRESENT version of me.'],
          ['5', 'My inner critic has had the microphone for years. Today I take it back. The Lion speaks now.'],
          ['6', 'I am not invisible. I have been hiding. One is fate. The other is a choice I can change.'],
          ['7', 'Criticism without kindness is cruelty with an alibi. I will lead with warmth.'],
          ['8', 'The Sun doesn\'t wait for a cloudless sky. It rises every morning regardless. I am the Sun. I rise today.'],
          ['9', 'My body is screaming because my feelings have been whispering for too long.'],
          ['10', 'Today I choose to be imperfect, visible, and alive — rather than perfect, hidden, and dying slowly.'],
        ],
        [32, '*']
      ),

      // ══ SECTION 14 ════════════════════════════════════════════════════════
      sectionHeader(14, 'Daily Checklist', 'Your non-negotiable daily accountability system'),
      {
        columns: [
          {
            stack: [
              subHead('MORNING & WORK EXECUTION', C.saffron),
              checklist([
                'Wrote down top 3 priorities',
                'Said affirmation: "The Lion leads today"',
                'Walked + got morning sunlight (30 min)',
                'Made one fast, aggressive decision',
                'Task 1 (Scary action) completed',
                'Task 2 (Income/career) completed',
                'Task 3 (Creative/share publicly) completed',
                'Shipped something imperfect today',
                'One income action done',
                'Did NOT compare myself to anyone',
              ]),
            ],
            width: '*',
          },
          { width: 16, text: '' },
          {
            stack: [
              subHead('EVENING & MINDSET PROTECTION', C.saffron),
              checklist([
                'Said one kind word to wife/family — no criticism',
                'Quality family time (30 min, phone off)',
                'Wrote ONE thing I did well today',
                'Stopped analysis in 10 min — then decided',
                'Did NOT seek validation before acting',
                'Showed warmth to someone',
                'Replaced one criticism with one encouragement',
                'Chose imperfect action over perfect paralysis',
                'Sleep by 10 PM, no phone after 9:30',
                'Let the Lion lead, not the Maiden',
              ]),
            ],
            width: '*',
          },
        ],
        margin: [0, 0, 0, 16],
      },

      // ══ CLOSING PANEL — built as a table so content is guaranteed inside the box
      {
        table: {
          widths: ['*'],
          body: [[
            {
              stack: [
                // Top gold accent bar via canvas
                { canvas: [{ type: 'rect', x: 0, y: 0, w: 435, h: 3, color: C.saffron }], margin: [0, 0, 0, 12] },
                { text: 'MOHANRAAJ — REMEMBER THIS EVERY SINGLE DAY', font: 'Lora', bold: true, fontSize: 12, color: C.saffron, alignment: 'center', margin: [0, 0, 0, 8] },
                { canvas: [{ type: 'line', x1: 40, y1: 0, x2: 435, y2: 0, lineWidth: 0.5, lineColor: '#4338ca' }], margin: [0, 0, 0, 10] },
                { text: 'I am not a perfectionist. I am a king who forgot his crown.\nThe crown was never missing. I was just too busy polishing it to put it on.', font: 'Outfit', fontSize: 10, color: '#e0e7ff', alignment: 'center', lineHeight: 1.55, margin: [0, 0, 0, 12] },
                { text: '"The Sun does not wait for a cloudless sky. It rises every morning. I am the Sun."', font: 'Lora', italics: true, fontSize: 9.5, color: '#a5b4fc', alignment: 'center', margin: [0, 0, 0, 4] },
                { text: '"Done and shared beats perfect and hidden. Every single time."', font: 'Lora', italics: true, fontSize: 9.5, color: '#a5b4fc', alignment: 'center', margin: [0, 0, 0, 4] },
                { text: '"My life is not what I analyze — it\'s what I create."', font: 'Lora', italics: true, fontSize: 9.5, color: '#a5b4fc', alignment: 'center', margin: [0, 0, 0, 12] },
                { canvas: [{ type: 'line', x1: 40, y1: 0, x2: 435, y2: 0, lineWidth: 0.5, lineColor: '#4338ca' }], margin: [0, 0, 0, 10] },
                { text: 'THE LION LEADS  |  THE MAIDEN ADVISES  |  THE SUN RISES', font: 'Lora', bold: true, fontSize: 11, color: C.saffron, alignment: 'center', margin: [0, 0, 0, 10] },
                // Bottom gold accent bar
                { canvas: [{ type: 'rect', x: 0, y: 0, w: 435, h: 3, color: C.saffron }], margin: [0, 0, 0, 0] },
              ],
              fillColor: C.navy,
              margin: [20, 12, 20, 12],
              border: [false, false, false, false],
            }
          ]],
        },
        layout: 'noBorders',
        margin: [0, 16, 0, 0],
      },
      ]), // end of Mohanraaj preview sections
    ];

    // ── Document Definition ───────────────────────────────────────────────
    const docDefinition: any = {
      pageSize: 'A4',
      pageBreakBefore: function(currentNode, followingNodesOnPage) {
        if (currentNode.id === 'sectionHeader' && followingNodesOnPage.length === 0) {
          return true;
        }
        return false;
      },
      // top=65 reserves space for header bar, bottom=55 reserves space for footer bar
      pageMargins: [40, 65, 40, 55],

      header: (currentPage: number, pageCount: number) => currentPage === 1 ? null : ({
        // margin: [left, top, right, bottom] — positions the header block
        margin: [40, 20, 40, 0],
        stack: [
          {
            columns: [
              { text: 'Ask Astro Raja  |  Life Transformation Report', font: 'Outfit', fontSize: 8, color: C.saffron, bold: true, width: '*' },
              { text: reportName + '  |  Personalized Report', font: 'Outfit', fontSize: 8, color: C.muted, alignment: 'right', width: 'auto' },
            ],
            margin: [0, 0, 0, 6],
          },
          // Thin separator line drawn relative to header block (x1=0, x2=full usable width)
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: C.border }] },
        ],
      }),

      footer: (currentPage: number, pageCount: number) => ({
        // margin positions footer block from bottom of page
        margin: [40, 10, 40, 0],
        stack: [
          // Thin separator line
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: C.border }], margin: [0, 0, 0, 5] },
          {
            columns: [
              {
                // Break Tamil into simple segments to prevent wrapping
                text: useRealContent
                  ? reportRaasi + '  ·  ' + reportLagnam + '  ·  ' + reportNakshatra + '  |  Confidential & Personalized'
                  : [
                    { text: 'Simbha (', font: 'Outfit', fontSize: 7.5, color: C.muted },
                    T('சிம்மம்', { fontSize: 7.5, color: C.muted }),
                    { text: ')  Kanni (', font: 'Outfit', fontSize: 7.5, color: C.muted },
                    T('கன்னி', { fontSize: 7.5, color: C.muted }),
                    { text: ')  Puram (', font: 'Outfit', fontSize: 7.5, color: C.muted },
                    T('பூரம்', { fontSize: 7.5, color: C.muted }),
                    { text: ')  |  Confidential & Personalized', font: 'Outfit', fontSize: 7.5, color: C.muted },
                  ],
              font: 'Outfit', fontSize: 7.5, color: C.muted,
              width: '*',
              },
              { text: currentPage + ' / ' + pageCount, font: 'Outfit', fontSize: 7.5, color: C.muted, alignment: 'right', width: 40 },
            ],
          },
        ],
      }),

      content,

      defaultStyle: {
        font: 'Outfit',
        fontSize: 9.5,
        lineHeight: 1.4,
        color: C.text,
      },
    };

    const urlResolver = new URLResolver();
    const printer = new PdfPrinter(fonts, null, urlResolver);
    const pdfDoc = await printer.createPdfKitDocument(docDefinition);

    const chunks: Buffer[] = [];
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Mohanraaj_Life_Transformation_Premium.pdf"',
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('PDF preview error:', err);
    return new Response(
      JSON.stringify({ error: 'PDF preview failed', detail: err.message }),
      { status: 500 }
    );
  }
};
