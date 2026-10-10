import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { parse, type HTMLElement } from 'node-html-parser';
import { beforeAll, describe, expect, it } from 'vitest';
import astroConfig from '../../astro.config.mjs';
import { profile } from '../../src/config';
import { localizeCases, type CaseEntry } from '../../src/lib/cases';
import { localePath } from '../../src/lib/i18n';
import { localizeTestimonials, type TestimonialEntry } from '../../src/lib/testimonials';
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

const testimonialEntries: TestimonialEntry[] = readdirSync('src/content/testimonials')
  .filter((f) => f.endsWith('.yml') && !f.startsWith('_'))
  .map((f) => ({
    id: f.replace(/\.yml$/, ''),
    data: load(readFileSync(`src/content/testimonials/${f}`, 'utf8')) as TestimonialEntry['data'],
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

  it('toont naam en rol samen in de H1, plus de pitch', () => {
    const h1 = doc.querySelectorAll('h1');
    expect(h1).toHaveLength(1);
    expect(h1[0].querySelector('.hero-name')?.text).toBe(profile.name);
    expect(h1[0].querySelector('.hero-title')?.text).toBe(t.hero.title);
    expect(raw).toContain(t.hero.pitch);
  });

  it('toont de over-mij-tekst als losse alinea\'s', () => {
    const expected = t.about.text.split(/\n+/).map((p) => p.replace(/\s+/g, ' ').trim());
    const paragraphs = doc.querySelectorAll('.about > p').map((p) => p.text.replace(/\s+/g, ' ').trim());
    expect(paragraphs).toEqual(expected);
    expect(expected.length).toBeGreaterThan(1);
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

  it('toont geen skill-tags in de over-mij-sectie', () => {
    expect(doc.querySelector('.about .tags')).toBeNull();
  });

  it('toont de diensten uit de vertaalbestanden', () => {
    expect(doc.querySelector('#services h2')?.text).toBe(t.services.heading);
    const cards = doc.querySelectorAll('#services .service');
    expect(cards.map((c) => c.querySelector('h3')?.text.trim())).toEqual(t.services.items.map((s) => s.title));
    expect(cards.map((c) => c.querySelector('p')?.text.trim())).toEqual(t.services.items.map((s) => s.text));
  });

  it('toont testimonials in volgorde, of geen sectie als er geen zijn', () => {
    const expected = localizeTestimonials(testimonialEntries, lang).map((item) => item.quote);
    if (expected.length === 0) {
      expect(doc.querySelector('#testimonials')).toBeNull();
      return;
    }
    expect(doc.querySelectorAll('#testimonials blockquote').map((q) => q.text.trim())).toEqual(expected);
  });

  it('toont de secties in een logische volgorde', () => {
    const order = ['.hero', '.about', '#services', '#cases', '#testimonials', '#contact']
      .map((sel) => doc.querySelector(`main ${sel}`))
      .filter((el) => el !== null)
      .map((el) => raw.indexOf(el!.outerHTML));
    expect(order).toEqual([...order].sort((a, b) => a - b));
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
    // Het adres staat alleen in de JSON-LD voor zoekmachines, niet in de zichtbare HTML.
    const withoutJsonLd = raw.replace(/<script type="application\/ld\+json">.*?<\/script>/s, '');
    expect(withoutJsonLd).not.toContain(profile.email);
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
    expect(og('site_name')).toBe(profile.name);
    expect(og('image:width')).toBe('1200');
    expect(og('image:height')).toBe('630');
    expect(og('image:alt')).toBe(`${profile.name} — ${t.hero.title}`);
    expect(og('locale')).toBe(lang === 'nl' ? 'nl_NL' : 'en_US');
    expect(og('locale:alternate')).toBe(lang === 'nl' ? 'en_US' : 'nl_NL');
  });

  it('heeft icon-links en een theme-color', () => {
    const href = (sel: string) => doc.querySelector(sel)?.getAttribute('href') ?? '';
    expect(href('link[rel="icon"][type="image/png"]')).toBe(`${nlPath}favicon-96.png`);
    expect(href('link[rel="apple-touch-icon"]')).toBe(`${nlPath}apple-touch-icon.png`);
    expect(doc.querySelectorAll('meta[name="theme-color"]')).toHaveLength(2);
  });

  it('heeft JSON-LD met Person, bedrijf en website', () => {
    const json = JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.text);
    const node = (type: string) => json['@graph'].find((n: { '@type': string }) => n['@type'] === type);
    const person = node('Person');
    expect(person.name).toBe(profile.name);
    expect(person.jobTitle).toBe(t.hero.title);
    expect(person.description).toBe(t.meta.description);
    expect(person.email).toBe(`mailto:${profile.email}`);
    expect(person.sameAs).toEqual([profile.githubUrl, profile.linkedinUrl]);
    expect(person.knowsAbout).toEqual(profile.technologies.map((tech) => tech.name));
    expect(person.address.addressCountry).toBe('NL');

    const business = node('ProfessionalService');
    expect(business.name).toBe(profile.businessName);
    expect(business.identifier).toEqual({ '@type': 'PropertyValue', propertyID: 'KvK', value: profile.kvk });
    expect(business.founder['@id']).toBe(person['@id']);
    expect(business.vatID).toBe(profile.vatNumber);

    const website = node('WebSite');
    expect(website.inLanguage).toBe(lang);
    expect(website.publisher['@id']).toBe(person['@id']);
  });

  it('toont KvK- en btw-nummer in de footer', () => {
    const footer = doc.querySelector('.site-footer')!.text.replace(/\s+/g, ' ');
    expect(footer).toContain(`${t.footer.kvkLabel} ${profile.kvk}`);
    expect(footer).toContain(`${t.footer.vatLabel} ${profile.vatNumber}`);
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
  it('heeft een sitemap met dezelfde taalcodes als de pagina\'s', () => {
    expect(existsSync('dist/sitemap-index.xml')).toBe(true);
    const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8');
    expect(sitemap).toContain('hreflang="nl"');
    expect(sitemap).toContain('hreflang="en"');
    expect(sitemap).not.toMatch(/hreflang="(nl-NL|en-US)"/);
  });

  it('heeft een robots.txt die naar de sitemap wijst', () => {
    const robots = readDist('dist/robots.txt');
    expect(robots).toContain('User-agent: *');
    const site = profile.siteUrl.replace(/\/$/, '');
    expect(robots).toContain(`Sitemap: ${site}${nlPath}sitemap-index.xml`);
  });

  it('heeft PNG-iconen in de juiste formaten', () => {
    const size = (path: string) => {
      const png = readFileSync(path);
      return [png.readUInt32BE(16), png.readUInt32BE(20)];
    };
    expect(size('dist/favicon-96.png')).toEqual([96, 96]);
    expect(size('dist/apple-touch-icon.png')).toEqual([180, 180]);
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
