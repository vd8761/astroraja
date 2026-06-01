import { Resend } from 'resend';

/**
 * Sends an urgent admin alert email
 * Used for critical failures like AI model deprecation.
 */
export async function sendAdminAlert(subject: string, body: string): Promise<void> {
  try {
    const resend = new Resend(import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY);
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'Astro Raja Alerts <reports@astroraja.com>';

    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: 'ariyappan@touchmarkdes.com',
      subject: `🚨 [Astro Raja Alert] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a4e; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #f5a623; margin: 0;">🚨 Astro Raja – Critical System Alert</h2>
          </div>
          <div style="background: #fff3f3; border: 2px solid #e74c3c; padding: 20px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #c0392b;">${subject}</h3>
            <pre style="background: #f8f8f8; padding: 16px; border-radius: 4px; font-size: 13px; overflow-x: auto; white-space: pre-wrap;">${body}</pre>
            <hr style="margin: 20px 0; border-color: #ddd;">
            <p style="color: #666; font-size: 13px;">
              <strong>Action Required:</strong> Check the system logs and API keys.
            </p>
            <p style="color: #999; font-size: 12px;">Sent automatically by Astro Raja at ${new Date().toISOString()}</p>
          </div>
        </div>
      `,
    });

    if (emailError) {
      throw new Error(emailError.message);
    }

    console.log('[Admin Alert] Email sent to ariyappan@touchmarkdes.com:', subject);
  } catch (err) {
    console.error('[Admin Alert] Failed to send alert email:', err);
  }
}

/**
 * Detects if an Anthropic API error is a model deprecation (404 not_found_error).
 */
export function isModelDeprecatedError(error: any): boolean {
  return (
    error?.status === 404 &&
    error?.error?.type === 'not_found_error' &&
    typeof error?.error?.message === 'string' &&
    error.error.message.startsWith('model:')
  );
}
