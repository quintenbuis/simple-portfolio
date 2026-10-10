import type { Locale } from './i18n';
import type { TestimonialData } from './schemas';

export interface TestimonialEntry {
  id: string;
  data: TestimonialData;
}

export interface LocalizedTestimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  company?: string;
  link?: string;
}

export function localizeTestimonials(entries: TestimonialEntry[], lang: Locale): LocalizedTestimonial[] {
  return [...entries]
    .sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id))
    .map(({ id, data }) => ({
      id,
      name: data.name,
      ...data[lang],
      company: data.company,
      link: data.link,
    }));
}
