import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { verifyAuthHeader } from '../../../lib/auth';
import PdfPrinter from 'pdfmake';
import htmlToPdfmake from 'html-to-pdfmake';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Authenticate
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { chat_history } = await request.json(); // Array of { role: 'user'|'ai', content: string }

    if (!chat_history || !Array.isArray(chat_history) || chat_history.length === 0) {
      return new Response(JSON.stringify({ error: 'Chat history is empty or invalid' }), { status: 400 });
    }

    // 2. Calculate Token Cost (Option B: Dynamic Fee)
    // Example: 100 Base Tokens + 1 Token per Word
    let totalWords = 0;
    let markdownString = "# Astro Raja - Chat History Backup\n\n";

    for (const msg of chat_history) {
      const words = msg.content.trim().split(/\s+/).length;
      totalWords += words;
      
      const roleName = msg.role === 'user' ? 'You' : 'Astro Raja AI';
      markdownString += `### ${roleName}:\n${msg.content}\n\n---\n\n`;
    }

    const tokenCost = 100 + totalWords; // Base 100 + 1 per word

    // 3. Pre-flight Token Check
    const userRecord = await sql`SELECT token_balance FROM users WHERE id = ${user.userId as string}`;
    const tokenBalance = userRecord[0]?.token_balance || 0;

    if (tokenBalance < tokenCost) {
      return new Response(JSON.stringify({ 
        error: `Insufficient tokens for backup. Cost: ${tokenCost} Tokens. Your Balance: ${tokenBalance} Tokens.`,
        required_tokens: tokenCost
      }), { status: 402 }); // 402 Payment Required
    }

    // 4. Generate PDF Document
    const parsedHtml = await marked.parse(markdownString);
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    const fonts = {
      Roboto: {
        normal: path.join(fontsDir, 'NotoSans-Regular.ttf'),
        bold: path.join(fontsDir, 'NotoSans-Bold.ttf'),
        italics: path.join(fontsDir, 'NotoSans-Regular.ttf'),
        bolditalics: path.join(fontsDir, 'NotoSans-Bold.ttf')
      }
    };

    const printer = new PdfPrinter(fonts);
    const { window } = new JSDOM("");
    const pdfContent = htmlToPdfmake(parsedHtml, { window });

    const docDefinition = {
      content: pdfContent,
      defaultStyle: { font: 'Roboto' }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];
    
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      pdfDoc.on('data', chunk => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });

    // 5. Deduct Tokens
    await sql`
      UPDATE users 
      SET token_balance = token_balance - ${tokenCost} 
      WHERE id = ${user.userId as string}
    `;

    // 6. Return PDF Buffer encoded as Base64 to Mobile App
    // The Mobile App can then natively write it to disk and upload to Google Drive using the OS SDK.
    return new Response(JSON.stringify({ 
      success: true, 
      pdf_base64: pdfBuffer.toString('base64'),
      tokens_deducted: tokenCost,
      words_exported: totalWords
    }), { status: 200 });

  } catch (error: any) {
    console.error('Drive Export Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate backup document' }), { status: 500 });
  }
};
