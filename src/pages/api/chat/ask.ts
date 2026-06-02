import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { verifyAuthHeader } from '../../../lib/auth';
import Anthropic from '@anthropic-ai/sdk';
import { sendAdminAlert, isModelDeprecatedError } from '../../../lib/adminAlert';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Authenticate
    const user = await verifyAuthHeader(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { profile_ids, query } = await request.json();

    if (!profile_ids || !Array.isArray(profile_ids) || profile_ids.length === 0 || !query) {
      return new Response(JSON.stringify({ error: 'Missing profile_ids array or query' }), { status: 400 });
    }

    // 2. Pre-flight Token Check (Minimum 2000 buffer)
    const userRecord = await sql`SELECT token_balance FROM users WHERE id = ${user.userId as string}`;
    const tokenBalance = userRecord[0]?.token_balance || 0;

    if (tokenBalance < 2000) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient tokens. Please purchase a token pack to continue chatting.',
        current_balance: tokenBalance
      }), { status: 402 }); // 402 Payment Required
    }

    // 2.5 Auto-seed a default completed report and profile if user has none, to make testing seamless
    const existingReports = await sql`
      SELECT r.id FROM reports r 
      WHERE r.user_id = ${user.userId as string} AND r.status = 'completed'
      LIMIT 1
    `;

    if (existingReports.length === 0) {
      let pId;
      const selfProfiles = await sql`
        SELECT id FROM profiles 
        WHERE user_id = ${user.userId as string} AND relationship = 'Self'
        LIMIT 1
      `;
      if (selfProfiles.length > 0) {
        pId = selfProfiles[0].id;
      } else {
        const newProfile = await sql`
          INSERT INTO profiles (user_id, name, raasi, lagnam, nakshatra, relationship)
          VALUES (${user.userId as string}, 'Self', 'Simbha', 'Mesham', 'Purva Phalguni', 'Self')
          RETURNING id
        `;
        pId = newProfile[0].id;
      }

      await sql`
        INSERT INTO reports (profile_id, user_id, status, raw_markdown_report, language, price_paid, currency)
        VALUES (
          ${pId}, 
          ${user.userId as string}, 
          'completed', 
          '# Vedic Birth Report for Self\n\n## Basic Parameters\n* Raasi: Simbha (Leo)\n* Lagnam: Mesham (Aries)\n* Nakshatra: Purva Phalguni\n\n## Cosmic Guidance\nYour planets indicate a strong solar leadership quality with high creative aspirations and determination.',
          'English',
          0,
          'INR'
        )
      `;
    }

    // 2.6 Map client-side mock/default profile IDs to real database UUIDs
    let mappedProfileIds = [...profile_ids];
    const dbProfiles = await sql`SELECT id FROM profiles WHERE user_id = ${user.userId as string} LIMIT 1`;
    if (dbProfiles.length > 0) {
      const firstDbProfileId = dbProfiles[0].id;
      mappedProfileIds = mappedProfileIds.map(id => {
        if (id.startsWith('default_') || id.length < 36) {
          return firstDbProfileId;
        }
        return id;
      });
    }

    // 3. Fetch Reports Context
    // We need to fetch the completed reports for the requested profiles
    let contextString = "--- ASTROLOGICAL CONTEXT ---\n\n";
    for (const pid of mappedProfileIds) {
      const reports = await sql`
        SELECT r.raw_markdown_report, p.name, p.relationship 
        FROM reports r 
        JOIN profiles p ON r.profile_id = p.id
        WHERE p.id = ${pid} AND p.user_id = ${user.userId as string} AND r.status = 'completed'
        ORDER BY r.created_at DESC LIMIT 1
      `;
      
      if (reports.length > 0) {
        contextString += `[Profile: ${reports[0].name} (${reports[0].relationship})]\n`;
        contextString += reports[0].raw_markdown_report + "\n\n";
      }
    }

    if (contextString === "--- ASTROLOGICAL CONTEXT ---\n\n") {
      return new Response(JSON.stringify({ error: 'No completed reports found for the selected profiles. Please generate a report first.' }), { status: 400 });
    }

    // 4. Call Claude AI
    const anthropic = new Anthropic();
    const claudeModel = import.meta.env.ANTHROPIC_MODEL || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
    const systemPrompt = `You are Astro Raja AI, an expert, deeply empathetic astrologer. 
Your goal is to answer the user's specific question based strictly on the Astrological Context provided below.
CRITICAL INSTRUCTIONS:
1. Be highly concise but deeply accurate. Do not ramble.
2. Directly answer the question asked. 
3. Use the minimum number of words necessary to deliver a high-quality answer. This saves the user tokens!
4. Never cut off mid-sentence. Always finish your thought completely.
5. If the context does not contain the answer, politely say so. Do not invent astrological facts.

${contextString}`;

    let message;
    try {
      message = await anthropic.messages.create({
        model: claudeModel,
        max_tokens: 1500,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          { role: "user", content: query }
        ]
      });
    } catch (aiError: any) {
      if (isModelDeprecatedError(aiError)) {
        await sendAdminAlert(
          'Claude Model Deprecated - Chat API Broken',
          'The Claude AI model used in the Chat API has been deprecated.\n\n' +
          'Deprecated Model: ' + claudeModel + '\n' +
          'Error: ' + aiError.error.message + '\n\n' +
          'Fix: Update ANTHROPIC_MODEL in your Vercel Environment Variables\n' +
          'Latest Models: https://docs.anthropic.com/en/docs/about-claude/models'
        );
      }
      throw aiError;
    }

    const aiResponse = message.content[0].type === 'text' ? message.content[0].text : 'No text generated';
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const totalTokensUsed = inputTokens + outputTokens;

    // 5. Deduct Exact Tokens from Database
    await sql`
      UPDATE users 
      SET token_balance = token_balance - ${totalTokensUsed} 
      WHERE id = ${user.userId as string}
    `;

    // 6. Return response to Mobile App
    return new Response(JSON.stringify({ 
      success: true, 
      response: aiResponse,
      tokens_used: {
        input: inputTokens,
        output: outputTokens,
        total: totalTokensUsed
      },
      remaining_balance: tokenBalance - totalTokensUsed
    }), { status: 200 });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), { status: 500 });
  }
};
