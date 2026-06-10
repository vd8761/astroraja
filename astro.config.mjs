// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://askastroraja.com',
  output: 'server',
  security: {
    checkOrigin: false
  },
  adapter: vercel({
    maxDuration: 300
  }),
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});