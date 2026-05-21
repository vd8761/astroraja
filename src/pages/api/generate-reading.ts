import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import skillTemplate from '../../lib/skill.md?raw';
import * as fs from 'fs';
import * as path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    if (!data.name || !data.raasi || !data.lagnam) {
      return new Response(JSON.stringify({ error: 'Missing required fields: name, raasi, lagnam' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Anthropic API key is not configured on the server.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const userPrompt = `
Generate a life transformation report:
Name: ${data.name}
Raasi: ${data.raasi}
Lagnam: ${data.lagnam}
Nakshatra: ${data.nakshatra}
Struggles: ${data.struggles?.join(', ') || 'None specified'}
Daily Life: ${data.dailyLife || 'Not specified'}
Biggest Goal: ${data.goals?.join(', ') || 'Not specified'}
Spiritual Orientation: ${data.spiritual || 'Not specified'}
`;

    // The SKILL.md actually asks for output in .docx format by default, but we'll 
    // ask Claude to output plain text markdown so we can easily save it as a .txt file.
    const systemPrompt = skillTemplate + "\n\nCRITICAL INSTRUCTION: Output the final report as raw Markdown text. You MUST complete the entire report from Section 1 to Section 14. Keep each section concise and punchy so that the full report easily fits within token limits (aim for ~3000 words total). Do NOT cut off the end of the report.";

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": userPrompt
            }
          ]
        }
      ]
    });

    // Extract the text content from the response
    let textContent = '';
    for (const block of msg.content) {
      if (block.type === 'text') {
        textContent += block.text;
      }
    }

    // --- Token Usage Logging ---
    try {
      const inputTokens = msg.usage.input_tokens;
      const outputTokens = msg.usage.output_tokens;
      const totalTokens = inputTokens + outputTokens;
      
      const logEntry = `[TOKEN USAGE] User: ${data.name || 'Unknown'} | Raasi: ${data.raasi || 'N/A'} | Input Tokens: ${inputTokens} | Output Tokens: ${outputTokens} | Total Tokens: ${totalTokens}`;
      
      // On Vercel, we must log to the console because the filesystem is read-only.
      // You can view these logs securely in the Vercel Dashboard -> Logs tab.
      console.log(logEntry);
    } catch (logErr) {
      console.error("Failed to calculate tokens:", logErr);
    }
    // --------------------------------------------------

    return new Response(JSON.stringify({ success: true, report: textContent }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error("Error generating report:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
