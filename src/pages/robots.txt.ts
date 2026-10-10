import type { APIRoute } from 'astro';
import { defaultLocale, localePath } from '../lib/i18n';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(`${localePath(defaultLocale)}sitemap-index.xml`, site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`);
};
