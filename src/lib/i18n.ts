export const locales = ['nl', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'nl';

export function localePath(lang: Locale, base: string = import.meta.env.BASE_URL): string {
  const root = base.endsWith('/') ? base : `${base}/`;
  return lang === defaultLocale ? root : `${root}${lang}/`;
}
