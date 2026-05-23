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
