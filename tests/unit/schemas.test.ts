import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { caseCollectionSchema, caseSchema, i18nSchema } from '../../src/lib/schemas';

const readYaml = (path: string) => load(readFileSync(path, 'utf8'));

const validCase = {
  order: 1,
  stack: ['Laravel'],
  nl: { title: 'T', client: 'K', role: 'R', summary: 'S' },
  en: { title: 'T', client: 'C', role: 'R', summary: 'S' },
};

describe('caseSchema', () => {
  it('accepteert een minimale geldige case', () => {
    expect(caseSchema.safeParse(validCase).success).toBe(true);
  });

  it('accepteert year als getal of tekst', () => {
    expect(caseSchema.safeParse({ ...validCase, year: 2024 }).success).toBe(true);
    expect(caseSchema.safeParse({ ...validCase, year: '2023–2024' }).success).toBe(true);
  });

  it('weigert een case zonder Engels blok', () => {
    const { en: _en, ...withoutEn } = validCase;
    expect(caseSchema.safeParse(withoutEn).success).toBe(false);
  });

  it('weigert onbekende velden', () => {
    expect(caseSchema.safeParse({ ...validCase, extra: true }).success).toBe(false);
    expect(caseSchema.safeParse({ ...validCase, nl: { ...validCase.nl, extra: 'x' } }).success).toBe(false);
  });

  it('weigert lege teksten', () => {
    expect(caseSchema.safeParse({ ...validCase, nl: { ...validCase.nl, title: '  ' } }).success).toBe(false);
  });

  it('accepteert alleen http(s)-links', () => {
    expect(caseSchema.safeParse({ ...validCase, link: 'https://example.com' }).success).toBe(true);
    expect(caseSchema.safeParse({ ...validCase, link: 'http://example.com' }).success).toBe(true);
    expect(caseSchema.safeParse({ ...validCase, link: 'javascript:alert(1)' }).success).toBe(false);
    expect(caseSchema.safeParse({ ...validCase, link: 'ftp://example.com' }).success).toBe(false);
  });

  it('_template.yml is een geldige case', () => {
    const result = caseSchema.safeParse(readYaml('src/content/cases/_template.yml'));
    expect(result.error).toBeUndefined();
  });
});

describe('caseCollectionSchema', () => {
  // Astro geeft in de content config een image()-helper mee; hier volstaat een string.
  const schema = caseCollectionSchema(() => z.string());

  it('accepteert een optioneel logo', () => {
    expect(schema.safeParse(validCase).success).toBe(true);
    expect(schema.safeParse({ ...validCase, logo: './klant.svg' }).success).toBe(true);
  });

  it('blijft onbekende velden weigeren', () => {
    expect(schema.safeParse({ ...validCase, extra: true }).success).toBe(false);
  });
});

describe('i18nSchema', () => {
  it.each(['nl', 'en'])('%s.yml is geldig', (lang) => {
    const result = i18nSchema.safeParse(readYaml(`src/content/i18n/${lang}.yml`));
    expect(result.error).toBeUndefined();
  });

  it('weigert extra sleutels', () => {
    const nl = readYaml('src/content/i18n/nl.yml') as Record<string, unknown>;
    expect(i18nSchema.safeParse({ ...nl, onbekend: 'x' }).success).toBe(false);
  });
});
