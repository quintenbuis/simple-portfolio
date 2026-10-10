import { z } from 'astro/zod';

const text = z.string().trim().min(1);

export const i18nSchema = z.strictObject({
  meta: z.strictObject({ title: text, description: text }),
  nav: z.strictObject({ switchLabel: text }),
  hero: z.strictObject({ title: text, pitch: text, cta: text }),
  about: z.strictObject({ heading: text, text: text, skills: z.array(text).min(1) }),
  cases: z.strictObject({ heading: text, roleLabel: text, linkLabel: text }),
  contact: z.strictObject({ heading: text, text: text, cta: text }),
  footer: z.strictObject({ kvkLabel: text }),
});

const caseLocaleSchema = z.strictObject({
  title: text,
  client: text,
  role: text,
  summary: text,
});

export const caseSchema = z.strictObject({
  order: z.number().int(),
  year: z.union([z.number().int(), text]).optional(),
  stack: z.array(text).min(1),
  link: z.url({ protocol: /^https?$/ }).optional(),
  nl: caseLocaleSchema,
  en: caseLocaleSchema,
});

export type I18nData = z.infer<typeof i18nSchema>;
export type CaseData = z.infer<typeof caseSchema>;
