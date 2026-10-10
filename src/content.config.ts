import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { caseSchema, i18nSchema } from './lib/schemas';

export const collections = {
  i18n: defineCollection({
    loader: glob({ pattern: '*.yml', base: './src/content/i18n' }),
    schema: i18nSchema,
  }),
  cases: defineCollection({
    loader: glob({ pattern: ['**/*.yml', '!**/_*'], base: './src/content/cases' }),
    schema: caseSchema,
  }),
};
