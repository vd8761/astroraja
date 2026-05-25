// @ts-ignore
import PdfPrinterPkg from 'pdfmake/src/printer.js';
const PdfPrinter = PdfPrinterPkg.default || PdfPrinterPkg;
import htmlToPdfmake from 'html-to-pdfmake';
import { parseHTML } from 'linkedom';
import { marked } from 'marked';
import path from 'path';

export const GET = async () => {
  try {
    // ── Sample Content for Layout Testing ─────────────────────────────────────────
    const sampleMarkdown = `
# 1. ASTRO FOUNDATION

| Feature | Inner World (Raasi) | Outer Approach (Lagnam) |
|---|---|---|
| **Sign** | Thulam *(Libra)* | Thulam *(Libra)* |
| **Element** | Air | Air |
| **Ruling Planet**| Venus | Venus |
| **Core Nature** | Balance | Balance |

> "The scales that measure everything, but struggle to measure their own worth."

The influence of Swathi Nakshatra brings a restless ambition to this Double Thulam combination. You are driven by a need for independence and often find yourself caught between wanting to please others and needing to forge your own path.

## 2. CORE COMBINATION TRUTH

| Inner World | Outer Approach |
|---|---|
| Craves harmony at all costs | Projects diplomacy and fairness |
| Fears making the wrong choice | Analyzes every angle endlessly |
| Needs aesthetic beauty and peace | Builds environments of comfort |

The core conflict here is the loop of overthinking. Because your inner and outer worlds are identical, there is no counterbalance. You weigh every option until the opportunity passes.

> "I am the judge who listens to every argument but refuses to drop the gavel."

## 3. CHARACTER PROFILE

| Strengths | Shadow Weaknesses |
|---|---|
| Incredible diplomacy | Inability to take a hard stance |
| Deep sense of justice | Judgmental when others fail |
| Highly adaptable | Loses own identity in groups |
| Peacemaker | Avoids necessary conflict |

## 4. LIFE AREA IMPACT

| Life Area | How it Shows Up | Hidden Cost |
|---|---|---|
| **Career** | Excellent team player, well-liked | Passed over for leadership due to hesitation |
| **Money** | Enjoys luxury, spends on comfort | Lack of aggressive wealth building |
| **Relationships**| Bends over backwards to keep peace | Slowly builds resentment over time |

## 5. CORE LIFE LOOP

| # | Stage | What's Really Happening |
|---|---|---|
| 1 | **The Ideal** | You envision the perfect, balanced outcome |
| 2 | **The Analysis** | You research and weigh every possible variable |
| 3 | **The Paralysis** | Overwhelmed by options, you freeze |
| 4 | **The Compromise**| You let someone else decide or take the easiest path |
| 5 | **The Resentment**| You feel dissatisfied with the outcome |
| 6 | **The Vow** | You promise next time will be different (Restart) |

Because Thulam is an Air sign ruled by Venus, your mind is constantly seeking the most beautiful, harmonious outcome. But perfection does not exist, so you trap yourself in the analysis phase.

> "To decide is to kill all other options. You must learn to be a killer of options."

## 6. KARMIC PATTERN ANALYSIS

**The Peacekeeper's Burden**
Trigger (Conflict arises) → Behavior (You absorb the anger to keep peace) → Consequence (You carry the stress physically) → Trigger (You become exhausted and withdraw).

## 7. ROOT PROBLEMS

| Problem | How It Shows Up |
|---|---|
| **Analysis Paralysis** | Taking weeks to make decisions others make in minutes |
| **People Pleasing** | Saying yes when every bone in your body screams no |
| **Avoidance** | Ghosting situations instead of confronting them |

## 8. WHAT MUST BE LET GO

| Let Go Of | Wrong Belief | Truth | Daily Practice |
|---|---|---|---|
| The Perfect Choice | "If I think longer, I'll find the flawless path." | Action creates clarity. | Make one trivial decision in 5 seconds daily. |
| Keeping Everyone Happy| "Conflict means I failed." | Conflict is the price of boundaries. | Say no to one small request weekly. |

> "Your peace is not found in their approval."

## 9. REACT VS CREATE

| React Mode | Create Mode |
|---|---|
| Waiting for others to lead | Initiating the conversation |
| Absorbing their stress | Setting a hard boundary |
| Overthinking | Executing the first step immediately |

## 10. COMPLETE SOLUTION SYSTEM

### A. Mind Rules
| # | Rule |
|---|---|
| 1 | I will not negotiate my boundaries. |
| 2 | Done is better than perfect. |

### B. Daily System
| Time | Activity | Purpose |
|---|---|---|
| 7:00 AM | 10 Min Silent Walk | Ground the Air energy |
| 8:00 AM | Brain Dump | Get the overthinking out of the head |

## 11. KARMIC BREAK METHOD

1. **Recognize:** Catch yourself weighing options for more than 5 minutes.
2. **Opposite Action:** Flip a coin if the decision is low-stakes. Just move.
3. **90-Day Commitment:** Practice aggressive decision making.

## 12. IDENTITY SHIFT

| Old Identity | New Identity |
|---|---|
| "I need everyone to be okay." | "I am responsible for my own peace first." |
| "I am confused." | "I know exactly what I want." |

## 13. FINAL TRUTHS

| # | Truth |
|---|---|
| 1 | Your inability to decide is a decision to fail. |
| 2 | People respect boundaries more than they respect compliance. |

## 14. DAILY CHECKLIST

| Morning & Work | Evening & Mindset |
|---|---|
| [ ] Wrote down top 3 priorities | [ ] Disconnected from work emails |
| [ ] Made one fast decision | [ ] Did not agree to anything out of guilt |

***

REMEMBER THIS EVERY SINGLE DAY

I am not here to balance everyone else's scales.
I am here to weigh my own worth.
The air must move to have power.

**THE SCALES MEASURE. THE WIND BLOWS. THE SWORD CUTS.**

START TODAY.
`;

    // ── PDF Generation Logic ──────────────────────────────────────────────────
    const parsedMarkdown = await marked.parse(sampleMarkdown);
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');

    const fonts = {
      Roboto: {
        normal:      path.join(fontsDir, 'NotoSans-Regular.ttf'),
        bold:        path.join(fontsDir, 'NotoSans-Bold.ttf'),
        italics:     path.join(fontsDir, 'NotoSans-Regular.ttf'),
        bolditalics: path.join(fontsDir, 'NotoSans-Bold.ttf'),
      },
      Tamil: {
        normal:      path.join(fontsDir, 'NotoSansTamil-Regular.ttf'),
        bold:        path.join(fontsDir, 'NotoSansTamil-Bold.ttf'),
        italics:     path.join(fontsDir, 'NotoSansTamil-Regular.ttf'),
        bolditalics: path.join(fontsDir, 'NotoSansTamil-Bold.ttf'),
      },
    };

    const printer = new PdfPrinter(fonts);
    const { window } = parseHTML('<html><body></body></html>');
    const pdfContent = htmlToPdfmake(parsedMarkdown, { window });

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [50, 60, 50, 60],
      header: (currentPage: number, pageCount: number) => ({
        columns: [
          {
            text: '✦ Ask Astro Raja — Life Transformation Report',
            fontSize: 9,
            color: '#2E6B9E',
            bold: true,
            margin: [50, 18, 0, 0],
          },
          {
            text: \`Mohanraaj (Preview)  |  Page \${currentPage} of \${pageCount}\`,
            fontSize: 9,
            color: '#94A3B8',
            alignment: 'right',
            margin: [0, 18, 50, 0],
          }
        ]
      }),
      footer: (_currentPage: number, _pageCount: number) => ({
        text: \`Thulam · Thulam · Swathi  —  Confidential & Personalized\`,
        fontSize: 8,
        color: '#CBD5E1',
        alignment: 'center',
        margin: [50, 0, 50, 18],
      }),
      content: [
        {
          stack: [
            { text: 'LIFE TRANSFORMATION REPORT', fontSize: 10, color: '#C5952A', bold: true, letterSpacing: 2, margin: [0, 0, 0, 8] },
            { text: 'Mohanraaj (Layout Preview)', fontSize: 28, bold: true, color: '#1A3C5E', font: 'Roboto', margin: [0, 0, 0, 6] },
            {
              columns: [
                { text: \`Raasi: Thulam (Libra)\`, fontSize: 12, color: '#475569' },
                { text: \`Lagnam: Thulam (Libra)\`, fontSize: 12, color: '#475569' },
                { text: \`Nakshatra: Swathi\`, fontSize: 12, color: '#475569' },
              ],
              margin: [0, 0, 0, 4],
            },
            { text: \`Language: English\`, fontSize: 11, color: '#94A3B8', margin: [0, 0, 0, 20] },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 495, y2: 0, lineWidth: 1.5, lineColor: '#C5952A' }] },
          ],
          margin: [0, 20, 0, 24],
        },
        pdfContent,
      ],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 11,
        lineHeight: 1.55,
        color: '#1e293b',
      },
      styles: {
        'html-h1': {
          fontSize: 18,
          bold: true,
          color: '#1A3C5E',
          margin: [0, 20, 0, 8],
          decoration: 'underline',
          decorationColor: '#C5952A',
          font: 'Roboto',
        },
        'html-h2': {
          fontSize: 14,
          bold: true,
          color: '#2E6B9E',
          margin: [0, 16, 0, 6],
          font: 'Roboto',
        },
        'html-h3': {
          fontSize: 12,
          bold: true,
          color: '#475569',
          margin: [0, 12, 0, 4],
        },
        'html-p': {
          margin: [0, 4, 0, 8],
          lineHeight: 1.6,
        },
        'html-blockquote': {
          margin: [12, 6, 0, 12],
          italics: true,
          color: '#1A3C5E',
          fontSize: 12,
          bold: true,
        },
        'html-strong': {
          bold: true,
          color: '#1A3C5E',
        },
        'html-table': {
          margin: [0, 6, 0, 14],
        },
        'html-th': {
          bold: true,
          fillColor: '#1A3C5E',
          color: '#FFFFFF',
          fontSize: 10,
        },
        'html-td': {
          fontSize: 10,
          margin: [4, 4, 4, 4],
        },
        'html-li': {
          margin: [0, 3, 0, 3],
        },
      },
    };

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
        'Content-Disposition': 'inline; filename="Preview_Template.pdf"',
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
