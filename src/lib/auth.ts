import { jwtVerify } from 'jose';

export async function verifyAuthHeader(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = new TextEncoder().encode(
    import.meta.env.JWT_SECRET || process.env.JWT_SECRET || 'fallback_secret'
  );

  try {
    const { payload } = await jwtVerify(token, jwtSecret);
    return payload; // { userId, mobile, ... }
  } catch (error) {
    return null; // Invalid or expired token
  }
}

export function parsePhone(mobile: string, customCountryCode?: string): { countryCode: string; mobileNumber: string } {
  const cleanMobile = mobile.trim();
  
  let countryCode = customCountryCode ? customCountryCode.trim() : '';
  let mobileNumber = cleanMobile;

  if (!countryCode) {
    if (cleanMobile.startsWith('+')) {
      if (cleanMobile.startsWith('+91')) {
        countryCode = '+91';
        mobileNumber = cleanMobile.substring(3);
      } else if (cleanMobile.length > 10) {
        const localLen = 10;
        mobileNumber = cleanMobile.slice(-localLen);
        countryCode = cleanMobile.slice(0, cleanMobile.length - localLen);
      } else {
        countryCode = '+91';
        mobileNumber = cleanMobile.replace('+', '');
      }
    } else {
      if (cleanMobile.startsWith('91') && cleanMobile.length === 12) {
        countryCode = '+91';
        mobileNumber = cleanMobile.substring(2);
      } else if (cleanMobile.length > 10) {
        const localLen = 10;
        mobileNumber = cleanMobile.slice(-localLen);
        countryCode = '+' + cleanMobile.slice(0, cleanMobile.length - localLen);
      } else {
        countryCode = '+91';
        mobileNumber = cleanMobile;
      }
    }
  } else {
    // If custom country code is provided, strip it from mobile if mobile starts with it
    const cleanCC = countryCode.replace('+', '');
    const cleanMob = cleanMobile.replace('+', '');
    if (cleanMob.startsWith(cleanCC)) {
      mobileNumber = cleanMob.substring(cleanCC.length);
    } else {
      mobileNumber = cleanMobile;
    }
  }

  // Ensure countryCode starts with '+'
  if (countryCode && !countryCode.startsWith('+')) {
    countryCode = '+' + countryCode;
  }
  if (!countryCode) {
    countryCode = '+91';
  }

  // Clean mobileNumber to keep only digits
  mobileNumber = mobileNumber.replace(/\D/g, '');

  return { countryCode, mobileNumber };
}
