import type { Locale } from './i18n';
import type { CaseData } from './schemas';

export interface CaseEntry {
  id: string;
  data: CaseData;
}

export interface LocalizedCase {
  id: string;
  title: string;
  client: string;
  role: string;
  summary: string;
  stack: string[];
  year?: string;
  link?: string;
}

export function localizeCases(entries: CaseEntry[], lang: Locale): LocalizedCase[] {
  return [...entries]
    .sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id))
    .map(({ id, data }) => ({
      id,
      ...data[lang],
      stack: data.stack,
      year: data.year === undefined ? undefined : String(data.year),
      link: data.link,
    }));
}
