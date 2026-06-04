import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { verifyAuthHeader } from '../../../lib/auth';
import Anthropic from '@anthropic-ai/sdk';
import { sendAdminAlert, isModelDeprecatedError, isLowCreditError } from '../../../lib/adminAlert';
import { buildChatSystemPrompt } from '../../../lib/chatSystemPrompt';

// In-memory rate limiting map (10 messages/minute per user)
const rateLimits = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);

  if (!userLimit) {
    rateLimits.set(userId, { count: 1, resetTime: now + 60000 });
    return false;
  }

  if (now > userLimit.resetTime) {
    userLimit.count = 1;
    userLimit.resetTime = now + 60000;
    return false;
  }

  userLimit.count++;
  return userLimit.count > 10;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Authenticate
    const user = await verifyAuthHeader(request);
    if (!user || !user.userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const userId = user.userId as string;

    // Rate Limit Check
    if (checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait a minute before sending another message.' }), 
        { status: 429 }
      );
    }

    // Parse Request Body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Malformed JSON body' }), { status: 400 });
    }

    const { profile_ids, query, conversation_history } = body;

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query' }), { status: 400 });
    }

    const profileIdsList = (profile_ids && Array.isArray(profile_ids)) ? profile_ids : [];

    // 2. Pre-flight Token Check (Minimum 300 buffer)
    const userRecord = await sql`SELECT token_balance FROM users WHERE id = ${userId}`;
    const tokenBalance = userRecord[0]?.token_balance || 0;

    if (tokenBalance < 300) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient tokens. Please purchase a token pack to continue chatting.',
        current_balance: tokenBalance
      }), { status: 402 }); // 402 Payment Required
    }

    // 3. Fetch Reports Context
    const fetchedReports = [];
    for (const pid of profileIdsList) {
      const reports = await sql`
        SELECT r.raw_markdown_report as "reportText", r.form_data, p.name, p.relationship, p.raasi, p.lagnam, p.nakshatra, p.padam, p.id as "profileId"
        FROM reports r 
        JOIN profiles p ON r.profile_id = p.id
        WHERE p.id = ${pid} AND p.user_id = ${userId} AND r.status = 'completed'
        ORDER BY r.created_at DESC LIMIT 1
      `;
      if (reports.length > 0) {
        fetchedReports.push(reports[0]);
      }
    }

    if (profileIdsList.length > 0 && fetchedReports.length < profileIdsList.length) {
      const fetchedProfileIds = fetchedReports.map(r => r.profileId);
      const missingProfileIds = profileIdsList.filter(id => !fetchedProfileIds.includes(id));
      
      const missingProfiles = await sql`
        SELECT name FROM profiles WHERE id = ANY(${missingProfileIds}) AND user_id = ${userId}
      `;
      const missingNames = missingProfiles.map((p: any) => p.name).join(', ');

      return new Response(
        JSON.stringify({ 
          error: `A completed birth chart report is required for all attached profiles to align their stars. Please generate a report first for: ${missingNames}.` 
        }), 
        { status: 400 }
      );
    }

    // 4. Validate & Format Conversation History
    const cleanHistory: { role: 'user' | 'assistant'; content: string }[] = [];
    if (Array.isArray(conversation_history)) {
      for (const msg of conversation_history) {
        if (msg && typeof msg === 'object' && (msg.role === 'user' || msg.role === 'assistant') && typeof msg.content === 'string') {
          cleanHistory.push({ role: msg.role, content: msg.content });
        }
      }
    }

    // Format history as JSON (cap at last 10 messages/5 turns to prevent JSON bloat)
    const recentHistory = cleanHistory.slice(-10);

    // Build System Prompt (inject profile data + compressed history JSON)
    const systemPrompt = buildChatSystemPrompt(fetchedReports, recentHistory);

    // Since past history is summarized in system instruction, the messages array only needs the current query
    const cappedHistory: { role: 'user' | 'assistant'; content: string }[] = [{ role: 'user', content: query }];

    // 5. Build System Prompt & Call AI
    
    // Detect if this is a new session (first message)
    const isNewSession = cleanHistory.length === 0;

    let aiResponse = '';
    let inputTokens = 0;
    let outputTokens = 0;

    const apiKey = import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      await sendAdminAlert(
        'Anthropic API Key Missing',
        'The ANTHROPIC_API_KEY is not defined in the backend environment variables. The chat service is currently down.'
      );
      return new Response(JSON.stringify({ error: 'Chat service is temporarily unavailable.' }), { status: 503 });
    }

    const claudeModel = import.meta.env.ANTHROPIC_MODEL || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
    const anthropic = new Anthropic({ apiKey });

    let message;
    try {
      message = await anthropic.messages.create({
        model: claudeModel,
        max_tokens: 2048,
        temperature: 0.5,
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" }
          }
        ],
        messages: cappedHistory
      }, {
        headers: { "anthropic-beta": "prompt-caching-2024-07-31" }
      });
    } catch (aiError: any) {
      console.error('Claude API Call Failed:', aiError);
      
      if (isModelDeprecatedError(aiError)) {
        await sendAdminAlert(
          'Claude Model Deprecated - Chat API Broken',
          `The Claude AI model used in the Chat API has been deprecated.\n\nDeprecated Model: ${claudeModel}\nError: ${aiError.error?.message || aiError.message}\n\nFix: Update ANTHROPIC_MODEL in your environment variables.`
        );
      } else if (isLowCreditError(aiError) || aiError.status === 401 || aiError.status === 403) {
        await sendAdminAlert(
          'Anthropic API Error - Check Billing/Credits',
          `Anthropic API call failed. This might be due to exhausted billing credits or an invalid key.\n\nError: ${aiError.message || aiError}`
        );
      }
      return new Response(JSON.stringify({ error: 'Failed to communicate with AI service. Please try again later.' }), { status: 503 });
    }

    aiResponse = message.content[0]?.type === 'text' ? message.content[0].text : '';
    inputTokens = message.usage.input_tokens;
    outputTokens = message.usage.output_tokens;

    if (!aiResponse || aiResponse.trim() === '') {
      return new Response(JSON.stringify({ error: 'I\'m having trouble right now. Please try again.' }), { status: 500 });
    }

    const totalTokensUsed = Math.ceil((inputTokens + outputTokens) * 0.5);

    // 6. Deduct Exact Tokens from Database (clamp token_balance to 0 minimum)
    const updatedUser = await sql`
      UPDATE users 
      SET token_balance = GREATEST(0, token_balance - ${totalTokensUsed}) 
      WHERE id = ${userId}
      RETURNING token_balance
    `;
    const remainingBalance = updatedUser[0]?.token_balance ?? 0;

    // 6.5. Aggregate Chat Token Usage per session
    try {
      if (isNewSession) {
        // Force start a brand new session card
        await sql`
          INSERT INTO transactions (user_id, transaction_type, tokens_added, status, amount, currency)
          VALUES (${userId}, 'chat_usage', ${-totalTokensUsed}, 'successful', 0, 'INR')
        `;
      } else {
        // Find existing transaction within the last 1 hour
        const lastSessionTx = await sql`
          SELECT id, tokens_added FROM transactions 
          WHERE user_id = ${userId} 
            AND transaction_type = 'chat_usage' 
            AND created_at >= NOW() - INTERVAL '1 hour'
            AND status = 'successful'
          ORDER BY created_at DESC LIMIT 1
        `;

        if (lastSessionTx.length > 0) {
          const currentTokens = lastSessionTx[0].tokens_added || 0;
          const updatedTokens = Number(currentTokens) - totalTokensUsed;
          await sql`
            UPDATE transactions 
            SET tokens_added = ${updatedTokens}, created_at = NOW() 
            WHERE id = ${lastSessionTx[0].id}
          `;
        } else {
          await sql`
            INSERT INTO transactions (user_id, transaction_type, tokens_added, status, amount, currency)
            VALUES (${userId}, 'chat_usage', ${-totalTokensUsed}, 'successful', 0, 'INR')
          `;
        }
      }
    } catch (txErr) {
      console.error('Failed to log session credit spend transaction:', txErr);
    }

    // 7. Return response to Mobile App
    return new Response(JSON.stringify({ 
      success: true, 
      response: aiResponse,
      tokens_used: {
        input: inputTokens,
        output: outputTokens,
        total: totalTokensUsed
      },
      remaining_balance: remainingBalance
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), { status: 500 });
  }
};
