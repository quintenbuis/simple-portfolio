import { getCollection, getEntry } from 'astro:content';
import { localizeCases, type LocalizedCase } from './cases';
import type { Locale } from './i18n';
import type { I18nData } from './schemas';

export async function getTranslations(lang: Locale): Promise<I18nData> {
  const entry = await getEntry('i18n', lang);
  if (!entry) throw new Error(`Vertaalbestand src/content/i18n/${lang}.yml ontbreekt`);
  return entry.data;
}

export async function getCases(lang: Locale): Promise<LocalizedCase[]> {
  return localizeCases(await getCollection('cases'), lang);
}
