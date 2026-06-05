import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const freeCreditsEnv = import.meta.env.FREE_CREDITS || process.env.FREE_CREDITS;
    const freeCreditsLimit = freeCreditsEnv ? parseInt(freeCreditsEnv, 10) : 100;

    return new Response(JSON.stringify({
      success: true,
      freeCreditsLimit: freeCreditsLimit
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error: any) {
    console.error('Config Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch config' }), { status: 500 });
  }
};
