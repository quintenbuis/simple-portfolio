import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { caseCollectionSchema, i18nSchema, testimonialSchema } from './lib/schemas';

export const collections = {
  i18n: defineCollection({
    loader: glob({ pattern: '*.yml', base: './src/content/i18n' }),
    schema: i18nSchema,
  }),
  cases: defineCollection({
    loader: glob({ pattern: ['**/*.yml', '!**/_*'], base: './src/content/cases' }),
    schema: ({ image }) => caseCollectionSchema(image),
  }),
  testimonials: defineCollection({
    loader: glob({ pattern: ['**/*.yml', '!**/_*'], base: './src/content/testimonials' }),
    schema: testimonialSchema,
  }),
};
