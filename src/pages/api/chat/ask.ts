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

    if (!profile_ids || !Array.isArray(profile_ids) || profile_ids.length === 0 || !query) {
      return new Response(JSON.stringify({ error: 'Missing profile_ids array or query' }), { status: 400 });
    }

    // 2. Pre-flight Token Check (Minimum 2000 buffer)
    const userRecord = await sql`SELECT token_balance FROM users WHERE id = ${userId}`;
    const tokenBalance = userRecord[0]?.token_balance || 0;

    if (tokenBalance < 2000) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient tokens. Please purchase a token pack to continue chatting.',
        current_balance: tokenBalance
      }), { status: 402 }); // 402 Payment Required
    }

    // 3. Fetch Reports Context
    const fetchedReports = [];
    for (const pid of profile_ids) {
      const reports = await sql`
        SELECT r.raw_markdown_report as "reportText", r.form_data, p.name, p.relationship, p.raasi, p.lagnam, p.nakshatra, p.padam
        FROM reports r 
        JOIN profiles p ON r.profile_id = p.id
        WHERE p.id = ${pid} AND p.user_id = ${userId} AND r.status = 'completed'
        ORDER BY r.created_at DESC LIMIT 1
      `;
      if (reports.length > 0) {
        fetchedReports.push(reports[0]);
      }
    }

    if (fetchedReports.length === 0) {
      return new Response(JSON.stringify({ error: 'No completed reports found for the selected profiles. Please generate a report first.' }), { status: 400 });
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

    // Cap history at 20 messages to prevent token explosion
    const cappedHistory = cleanHistory.slice(-20);

    // Append the new user query
    cappedHistory.push({ role: 'user', content: query });

    // 5. Build System Prompt & Call Claude AI
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
    const systemPrompt = buildChatSystemPrompt(fetchedReports);

    let message;
    try {
      message = await anthropic.messages.create({
        model: claudeModel,
        max_tokens: 800,
        temperature: 0.5,
        system: systemPrompt,
        messages: cappedHistory
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

    const aiResponse = message.content[0]?.type === 'text' ? message.content[0].text : '';
    
    if (!aiResponse || aiResponse.trim() === '') {
      return new Response(JSON.stringify({ error: 'I\'m having trouble right now. Please try again.' }), { status: 500 });
    }

    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const totalTokensUsed = inputTokens + outputTokens;

    // 6. Deduct Exact Tokens from Database (clamp token_balance to 0 minimum)
    const updatedUser = await sql`
      UPDATE users 
      SET token_balance = GREATEST(0, token_balance - ${totalTokensUsed}) 
      WHERE id = ${userId}
      RETURNING token_balance
    `;
    const remainingBalance = updatedUser[0]?.token_balance ?? 0;

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
