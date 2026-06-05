import type { APIRoute } from 'astro';
import sql from '../../../lib/db';
import { parsePhone } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, mobile } = await request.json();
    console.log('📬 [API check-exists] Request body:', { email, mobile });

    if (!email && !mobile) {
      return new Response(JSON.stringify({ error: 'Email or mobile number is required' }), { status: 400 });
    }

    if (email) {
      const existingEmail = await sql`SELECT id FROM users WHERE email = ${email.trim()} LIMIT 1`;
      if (existingEmail.length > 0) {
        return new Response(
          JSON.stringify({ exists: true, error: 'Email address is already registered.' }),
          { status: 200 }
        );
      }
    }

    if (mobile) {
      const { countryCode, mobileNumber } = parsePhone(mobile);
      const cleanedMobile = mobile.trim();
      const mobileWithPlus = cleanedMobile.startsWith('+') ? cleanedMobile : `+${cleanedMobile}`;
      const mobileWithoutPlus = cleanedMobile.startsWith('+') ? cleanedMobile.substring(1) : cleanedMobile;
      const last10Digits = cleanedMobile.slice(-10);

      const existingMobile = await sql`
        SELECT id FROM users 
        WHERE (country_code = ${countryCode} AND mobile_number = ${mobileNumber})
           OR mobile_number = ${mobileWithPlus} 
           OR mobile_number = ${mobileWithoutPlus}
           OR mobile_number LIKE ${'%' + last10Digits}
        LIMIT 1
      `;
      if (existingMobile.length > 0) {
        return new Response(
          JSON.stringify({ exists: true, error: 'Phone number is already registered.' }),
          { status: 200 }
        );
      }
    }

    return new Response(JSON.stringify({ exists: false }), { status: 200 });
  } catch (error: any) {
    console.error('Check Exists Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to check account availability' }), { status: 500 });
  }
};
