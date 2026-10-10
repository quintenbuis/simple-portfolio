import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { parse, type HTMLElement } from 'node-html-parser';
import { beforeAll, describe, expect, it } from 'vitest';
import astroConfig from '../../astro.config.mjs';
import { profile } from '../../src/config';
import { localizeCases, type CaseEntry } from '../../src/lib/cases';
import { localePath } from '../../src/lib/i18n';
import type { I18nData } from '../../src/lib/schemas';

const pages = { nl: 'dist/index.html', en: 'dist/en/index.html' } as const;
// Paden volgen de base uit astro.config.mjs (bijv. '/simple-portfolio' voor een project page).
const base = astroConfig.base ?? '/';
const nlPath = localePath('nl', base);
const enPath = localePath('en', base);

function readDist(path: string): string {
  if (!existsSync(path)) throw new Error(`${path} ontbreekt — draai eerst "npm run build"`);
  return readFileSync(path, 'utf8');
}

const caseEntries: CaseEntry[] = readdirSync('src/content/cases')
  .filter((f) => f.endsWith('.yml') && !f.startsWith('_'))
  .map((f) => ({
    id: f.replace(/\.yml$/, ''),
    data: load(readFileSync(`src/content/cases/${f}`, 'utf8')) as CaseEntry['data'],
  }));

describe.each(['nl', 'en'] as const)('dist %s', (lang) => {
  let raw: string;
  let doc: HTMLElement;
  const t = load(readFileSync(`src/content/i18n/${lang}.yml`, 'utf8')) as I18nData;

  beforeAll(() => {
    raw = readDist(pages[lang]);
    doc = parse(raw);
  });

  it('heeft het juiste lang-attribuut en title', () => {
    expect(doc.querySelector('html')?.getAttribute('lang')).toBe(lang);
    expect(doc.querySelector('title')?.text).toBe(t.meta.title);
  });

  it('toont naam, titel en pitch in de hero', () => {
    expect(doc.querySelector('h1')?.text.trim()).toBe(profile.name);
    expect(raw).toContain(t.hero.title);
    expect(raw).toContain(t.hero.pitch);
  });

  it('toont een beschikbaarheidsbadge die net als de CTA naar mail linkt', () => {
    const badge = doc.querySelector('.hero a.availability');
    const cta = doc.querySelector('.hero a.button');
    expect(badge?.text.trim()).toBe(t.hero.availability);
    expect(badge?.getAttribute('data-email-user')).toBe(cta?.getAttribute('data-email-user'));
    expect(badge?.getAttribute('data-email-domain')).toBe(cta?.getAttribute('data-email-domain'));
    expect(badge?.hasAttribute('data-email-show')).toBe(false);
    expect(badge?.querySelector('.availability-dot')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('toont de technologieën met icoon in de volgorde uit de config', () => {
    expect(doc.querySelector('#tech-heading')?.text).toBe(t.about.techHeading);
    const items = doc.querySelectorAll('.tech-list li');
    expect(items.map((li) => li.text.trim())).toEqual(profile.technologies.map((tech) => tech.name));
    for (const li of items) {
      // Ook technologieën zonder merkicoon (bijv. VPS) krijgen een (generiek) icoon.
      expect(li.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
      expect(li.querySelector('svg path')?.getAttribute('d')).toMatch(/^M/);
    }
  });

  it('toont alle skills', () => {
    for (const skill of t.about.skills) expect(raw).toContain(skill);
  });

  it('toont de cases in volgorde, of geen sectie als er geen zijn', () => {
    const expected = localizeCases(caseEntries, lang).map((c) => c.title);
    if (expected.length === 0) {
      expect(doc.querySelector('#cases')).toBeNull();
      return;
    }
    const titles = doc.querySelectorAll('.case-card h3').map((h) => h.text.trim());
    expect(titles).toEqual(expected);
  });

  it('linkt naar GitHub en LinkedIn', () => {
    const github = doc.querySelectorAll('a[data-social="github"]');
    const linkedin = doc.querySelectorAll('a[data-social="linkedin"]');
    expect(github.length).toBeGreaterThan(0);
    expect(linkedin.length).toBeGreaterThan(0);
    for (const a of github) expect(a.getAttribute('href')).toBe(profile.githubUrl);
    for (const a of linkedin) expect(a.getAttribute('href')).toBe(profile.linkedinUrl);
  });

  it('heeft mailto-elementen zonder het letterlijke adres in de HTML', () => {
    const links = doc.querySelectorAll('a[data-email-user]');
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(raw).not.toContain(profile.email);
    expect(raw).not.toContain(`mailto:${profile.email}`);
  });

  it('heeft canonical en wederzijdse hreflang-links', () => {
    const site = profile.siteUrl.replace(/\/$/, '');
    const href = (sel: string) => doc.querySelector(sel)?.getAttribute('href');
    expect(href('link[rel="canonical"]')).toBe(`${site}${lang === 'nl' ? nlPath : enPath}`);
    expect(href('link[rel="alternate"][hreflang="nl"]')).toBe(`${site}${nlPath}`);
    expect(href('link[rel="alternate"][hreflang="en"]')).toBe(`${site}${enPath}`);
    expect(href('link[rel="alternate"][hreflang="x-default"]')).toBe(`${site}${nlPath}`);
  });

  it('heeft Open Graph-tags', () => {
    const og = (p: string) => doc.querySelector(`meta[property="og:${p}"]`)?.getAttribute('content');
    expect(og('title')).toBe(t.meta.title);
    expect(og('description')).toBe(t.meta.description);
    expect(og('image')).toMatch(/\/og\.png$/);
  });

  it('heeft JSON-LD Person met sameAs en zonder e-mail', () => {
    const json = JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.text);
    expect(json['@type']).toBe('Person');
    expect(json.name).toBe(profile.name);
    expect(json.sameAs).toEqual([profile.githubUrl, profile.linkedinUrl]);
    expect(json.email).toBeUndefined();
  });

  it('heeft een taalwissel die naar beide talen linkt', () => {
    const links = doc.querySelectorAll('.lang-switch a');
    expect(links.map((a) => a.getAttribute('href'))).toEqual([nlPath, enPath]);
    const current = links.find((a) => a.getAttribute('aria-current') === 'page');
    expect(current?.getAttribute('href')).toBe(lang === 'nl' ? nlPath : enPath);
  });

  it('laadt geen externe scripts of stylesheets', () => {
    for (const el of doc.querySelectorAll('script[src], link[rel="stylesheet"]')) {
      const url = el.getAttribute('src') ?? el.getAttribute('href') ?? '';
      expect(url.startsWith('/')).toBe(true);
    }
  });
});

describe('dist algemeen', () => {
  it('heeft een sitemap', () => {
    expect(existsSync('dist/sitemap-index.xml')).toBe(true);
  });

  it('heeft een favicon', () => {
    expect(existsSync('dist/favicon.svg')).toBe(true);
  });

  it('heeft een OG-afbeelding van 1200×630', () => {
    const png = readFileSync('dist/og.png');
    expect(png.subarray(1, 4).toString()).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
