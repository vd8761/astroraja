const PdfPrinter = require('pdfmake/js/Printer.js').default;
const URLResolver = require('pdfmake/js/URLResolver.js').default;
const path = require('path');
const fontsDir = path.join(process.cwd(), 'public', 'fonts');
const fonts = {
  Roboto: {
    normal:      path.join(fontsDir, 'NotoSans-Regular.ttf'),
    bold:        path.join(fontsDir, 'NotoSans-Bold.ttf'),
    italics:     path.join(fontsDir, 'NotoSans-Regular.ttf'),
    bolditalics: path.join(fontsDir, 'NotoSans-Bold.ttf'),
  }
};

async function test() {
  const urlResolver = new URLResolver();
  const printer = new PdfPrinter(fonts, null, urlResolver);
  const pdfDoc = await printer.createPdfKitDocument({ content: 'Hello' });

  const chunks = [];
  pdfDoc.on('data', chunk => chunks.push(chunk));
  pdfDoc.on('end', () => console.log('Buffer size:', Buffer.concat(chunks).length));
  pdfDoc.end();
}
test();
