import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import crypto from 'crypto';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1. Verify Admin Auth
    const adminPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return new Response(JSON.stringify({ success: false, error: 'Admin password not configured' }), { status: 401 });
    }

    const expectedHash = crypto.createHash('sha256').update(adminPassword).digest('hex');
    const authCookie = cookies.get('astro_admin_auth')?.value;

    if (authCookie !== expectedHash) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { id, name, email, country_code, mobile_number, password, currency, commissionType, commissionValue } = body;

    if (!id || !email) {
      return new Response(JSON.stringify({ success: false, error: 'ID and Email are required' }), { status: 400 });
    }

    // Ensure email or mobile is unique (excluding self)
    const existingUser = await sql`
      SELECT id FROM affiliates 
      WHERE (email = ${email.trim()} OR mobile_number = ${mobile_number?.trim() || null})
      AND id != ${id}
    `;
    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ success: false, error: 'Another affiliate with this email or mobile already exists' }), { status: 400 });
    }

    // 3. Update database
    if (password && password.trim().length >= 6) {
      const password_hash = crypto.createHash('sha256').update(password).digest('hex');
      await sql`
        UPDATE affiliates
        SET 
          name = ${name?.trim() || null},
          email = ${email.trim()},
          mobile_number = ${mobile_number?.trim() || null},
          country_code = ${country_code?.trim() || null},
          currency = ${currency || 'INR'},
          commission_type = ${commissionType || 'fixed'},
          commission_value = ${parseFloat(commissionValue) || 0},
          password_hash = ${password_hash}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE affiliates
        SET 
          name = ${name?.trim() || null},
          email = ${email.trim()},
          mobile_number = ${mobile_number?.trim() || null},
          country_code = ${country_code?.trim() || null},
          currency = ${currency || 'INR'},
          commission_type = ${commissionType || 'fixed'},
          commission_value = ${parseFloat(commissionValue) || 0}
        WHERE id = ${id}
      `;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Affiliate updated successfully.' 
    }), { status: 200 });

  } catch (error: any) {
    console.error('Update Affiliate Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message || 'Internal server error' }), { status: 500 });
  }
};
