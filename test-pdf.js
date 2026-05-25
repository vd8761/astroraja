import { marked } from 'marked';
import PdfPrinter from 'pdfmake/src/printer.js';
import htmlToPdfmake from 'html-to-pdfmake';
import { parseHTML } from 'linkedom';
import fs from 'fs';
import path from 'path';
import sql from './src/lib/db.js';

async function testPdf() {
  try {
    const reportId = 11; // Based on DB records? Wait, let's just fetch the last report.
    const rows = await sql`
      SELECT r.id, r.language, r.raw_markdown_report, p.name, p.raasi, p.lagnam, p.nakshatra
      FROM reports r
      JOIN profiles p ON r.profile_id = p.id
      WHERE r.raw_markdown_report IS NOT NULL
      ORDER BY r.id DESC
      LIMIT 1
    `;
    if (rows.length === 0) return console.log('No reports');
    const report = rows[0];

    const parsedMarkdown = await marked.parse(report.raw_markdown_report);
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

    const PdfPrinterClass = PdfPrinter.default || PdfPrinter;
    const printer = new PdfPrinterClass(fonts);
    const { window } = parseHTML('<html><body></body></html>');
    const pdfContent = htmlToPdfmake(parsedMarkdown, { window });

    const docDefinition = {
      pageSize: 'A4',
      content: [
        { text: 'TEST', fontSize: 20 },
        pdfContent
      ],
      defaultStyle: { font: 'Roboto' }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.on('data', () => {});
    pdfDoc.on('end', () => console.log('PDF generated successfully'));
    pdfDoc.on('error', (err) => console.error('pdfDoc error', err));
    pdfDoc.end();
  } catch (err) {
    console.error('Catch error', err);
  }
  process.exit();
}

testPdf();
