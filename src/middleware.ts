import { defineMiddleware } from "astro:middleware";
import crypto from 'crypto';

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  
  // Only protect admin pages (excluding the login page itself and API routes which handle their own auth)
  if (url.pathname.startsWith('/admin/dashboard') || url.pathname.startsWith('/admin/report-preview')) {
    const adminPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return context.redirect('/admin');
    }
    
    const expectedHash = crypto.scryptSync(adminPassword, 'admin_salt', 64).toString('hex');
    const authCookie = context.cookies.get('astro_admin_auth')?.value;
    
    if (authCookie !== expectedHash) {
      return context.redirect('/admin');
    }
  }
  
  return next();
});
