import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { profile } from './src/config.ts';

export default defineConfig({
  site: profile.siteUrl,
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'nl', locales: { nl: 'nl-NL', en: 'en-US' } },
    }),
  ],
});
