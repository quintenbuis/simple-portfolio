# Portfolio / visitekaartje — implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Een tweetalige (NL/EN) one-page portfolio-site als statische Astro-site, waarvan alle tekst en cases in YAML-bestanden staan.

**Architecture:** Astro 7 bouwt `/` (NL) en `/en/` (EN) uit één `HomePage`-component. Teksten en cases komen uit Astro content collections (YAML, gevalideerd met Zod-schema's die in een los module staan zodat ze ook unit-testbaar zijn). Pure helpers (`i18n`, `cases`, `email`) bevatten alle logica; componenten zijn dunne templates. Tests: Vitest-unit-tests op helpers/schema's en Vitest-tests op de gebouwde HTML in `dist/`.

**Tech Stack:** Node ≥ 22.12 (CI: 24), Astro 7.3.8, @astrojs/sitemap 3.7.4, Zod 4 (via `astro/zod`), Vitest 5.0.3, js-yaml 5.4.3, node-html-parser 9.0.4, @resvg/resvg-js 2.6.2, GitHub Actions (checkout v7, setup-node v7, upload-pages-artifact v5, deploy-pages v5).

**Spec:** `docs/superpowers/specs/2026-10-10-portfolio-design.md`

## Global Constraints

- Routes: `/` = Nederlands, `/en/` = Engels; geen automatische taaldetectie of redirect.
- Geen foto, geen contactformulier, geen backend, geen detailpagina's per case, geen CMS, geen analytics/trackers, geen beschikbaarheidsvermelding.
- Contact uitsluitend via mailto; het e-mailadres staat nooit letterlijk in de gebouwde HTML (ook niet in JSON-LD).
- Geen externe resources (fonts, CDN's); systeemfonts.
- Plain CSS in één bestand (`src/styles/global.css`) met CSS-variabelen; automatische licht/donkermodus via `prefers-color-scheme`.
- Geen client-side JavaScript behalve het inline mailto-script.
- Case-velden: verplicht `order`, `stack`, `nl.{title,client,role,summary}`, `en.{title,client,role,summary}`; optioneel `year`, `link`. Onbekende velden laten de build falen.
- Case-bestanden waarvan de naam met `_` begint worden genegeerd.
- `nl.yml` en `en.yml` hebben exact dezelfde sleutels; ontbrekende of extra sleutels laten de build falen.
- OG-afbeelding: statische `public/og.png` (1200×630) gemaakt uit `public/og.svg`; geen generatie tijdens de build.
- Per taal: `<title>`, meta description, Open Graph/Twitter-tags, canonical, `hreflang` (incl. `x-default` → `/`), sitemap, JSON-LD `Person` met `sameAs` naar GitHub en LinkedIn.
- Alle in te vullen persoonsgegevens staan in `src/config.ts`; dit plan gebruikt duidelijke voorbeeldwaarden die de eigenaar zelf vervangt.

## Review Focus

1. **Case-`link` met een `javascript:`- of ander niet-http(s)-schema** → build moet falen in plaats van een klikbare XSS-link te renderen. (Test in Task 1.)
2. **`_template.yml` raakt uit sync met het schema** (bijv. na een schemawijziging) → wie de template kopieert moet altijd een geldige case krijgen. (Test in Task 1.)
3. **Twee cases met dezelfde `order`** → volgorde moet stabiel en voorspelbaar zijn (tie-break op bestandsnaam), niet afhankelijk van de bestandssysteemvolgorde. (Test in Task 2.)
4. **E-mailadres met `+`, subdomein of meerdere punten** (`naam+web@mail.domein.nl`) → mailto moet exact dat adres opleveren. (Test in Task 2.)
5. **Deploy als GitHub *project* page onder een base path** (`/simple-portfolio/`) → taalwissel, logo-link, canonical en hreflang moeten de base path meenemen. (Test in Task 2.)

---

## Bestandsstructuur

```
astro.config.mjs                 # site-URL, sitemap-integratie
package.json / tsconfig.json / vitest.config.ts / .gitignore
src/
  config.ts                      # profile: naam, e-mail, GitHub, LinkedIn, KvK, siteUrl
  content.config.ts              # collections i18n + cases
  content/
    i18n/nl.yml, i18n/en.yml     # UI-teksten
    cases/_template.yml          # template (niet getoond)
    cases/voorbeeld-case.yml     # voorbeeldcase (te vervangen)
  lib/
    schemas.ts                   # Zod-schema's + types (I18nData, CaseData)
    i18n.ts                      # locales, localePath
    cases.ts                     # localizeCases (puur)
    content.ts                   # getTranslations, getCases (astro:content)
    email.ts                     # splitEmail, obfuscateEmail
  layouts/Base.astro             # <html>, head/SEO, mailto-script
  components/
    HomePage.astro               # stelt de pagina samen per taal
    Header.astro, Hero.astro, About.astro, Cases.astro, CaseCard.astro,
    Contact.astro, Footer.astro, SocialLinks.astro, EmailLink.astro
  pages/index.astro, pages/en/index.astro
  styles/global.css
public/favicon.svg, public/og.svg, public/og.png
scripts/og.mjs                   # og.svg → og.png
tests/unit/*.test.ts, tests/dist/pages.test.ts
.github/workflows/deploy.yml
README.md
```

---

### Task 1: Project-scaffold, config, schema's en content

**Files:**
- Create: `package.json`, `tsconfig.json`, `astro.config.mjs`, `vitest.config.ts`, `.gitignore`
- Create: `src/config.ts`, `src/lib/schemas.ts`, `src/content.config.ts`
- Create: `src/content/i18n/nl.yml`, `src/content/i18n/en.yml`, `src/content/cases/_template.yml`, `src/content/cases/voorbeeld-case.yml`
- Create: `src/pages/index.astro` (tijdelijk, wordt in Task 3 vervangen)
- Test: `tests/unit/schemas.test.ts`

**Interfaces:**
- Produces:
  - `profile` uit `src/config.ts`: `{ name: string; email: string; githubUrl: string; linkedinUrl: string; kvk: string; siteUrl: string }`
  - `i18nSchema`, `caseSchema` uit `src/lib/schemas.ts`; types `I18nData = z.infer<typeof i18nSchema>`, `CaseData = z.infer<typeof caseSchema>`
  - Collections `i18n` (ids `nl`, `en`) en `cases` (id = bestandsnaam zonder `.yml`)

- [ ] **Step 1: Init npm en installeer dependencies**

```bash
npm init -y
npm i astro@7.3.8 @astrojs/sitemap@3.7.4
npm i -D vitest@5.0.3 js-yaml@5.4.3 node-html-parser@9.0.4 @resvg/resvg-js@2.6.2
```

Vervang daarna `package.json` volledig door (versies behouden zoals npm ze schreef):

```json
{
  "name": "simple-portfolio",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:unit": "vitest run tests/unit",
    "check": "astro build && vitest run",
    "og": "node scripts/og.mjs"
  },
  "dependencies": {
    "@astrojs/sitemap": "3.7.4",
    "astro": "7.3.8"
  },
  "devDependencies": {
    "@resvg/resvg-js": "2.6.2",
    "js-yaml": "5.4.3",
    "node-html-parser": "9.0.4",
    "vitest": "5.0.3"
  }
}
```

- [ ] **Step 2: Configbestanden**

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/**/*.test.ts'] },
});
```

`.gitignore`:

```
node_modules/
dist/
.astro/
.DS_Store
```

`src/config.ts`:

```ts
// Persoonlijke gegevens — taalonafhankelijk. Vervang de voorbeeldwaarden.
export const profile = {
  name: 'Jouw Naam',
  email: 'hallo@example.com',
  githubUrl: 'https://github.com/jouw-gebruikersnaam',
  linkedinUrl: 'https://www.linkedin.com/in/jouw-profiel/',
  // Leeg laten om het KvK-nummer niet te tonen.
  kvk: '',
  // Productie-URL zonder base path, bijv. 'https://jouwnaam.nl'.
  siteUrl: 'https://example.com',
};
```

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { profile } from './src/config.ts';

export default defineConfig({
  site: profile.siteUrl,
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'nl', locales: { nl: 'nl-NL', en: 'en-US' } },
    }),
  ],
});
```

- [ ] **Step 3: Schrijf de falende schema-tests**

`tests/unit/schemas.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { caseSchema, i18nSchema } from '../../src/lib/schemas';

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
```

- [ ] **Step 4: Draai de tests en zie ze falen**

Run: `npx vitest run tests/unit/schemas.test.ts`
Expected: FAIL — `Failed to resolve import "../../src/lib/schemas"`.

- [ ] **Step 5: Schrijf de schema's**

`src/lib/schemas.ts`:

```ts
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
```

- [ ] **Step 6: Schrijf de content**

`src/content/i18n/nl.yml`:

```yaml
meta:
  title: Jouw Naam — Senior Software Developer
  description: Freelance senior software developer. Bekijk mijn werk en neem contact op.
nav:
  switchLabel: Taal
hero:
  title: Senior Software Developer
  pitch: Ik bouw betrouwbare, onderhoudbare software en help teams complexe problemen eenvoudig op te lossen.
  cta: Neem contact op
about:
  heading: Wat ik doe
  text: >-
    Ik heb ruime ervaring met het ontwerpen en bouwen van webapplicaties en koppelingen,
    van architectuur tot oplevering. Ik pak freelance opdrachten op naast mijn vaste werk.
  skills:
    - PHP
    - Laravel
    - TypeScript
    - Vue
    - Software-architectuur
cases:
  heading: Cases
  roleLabel: Rol
  linkLabel: Bekijk project
contact:
  heading: Samenwerken?
  text: Stuur me een mail met een korte omschrijving van je project, dan neem ik snel contact met je op.
  cta: Mail me
footer:
  kvkLabel: KvK
```

`src/content/i18n/en.yml`:

```yaml
meta:
  title: Jouw Naam — Senior Software Developer
  description: Freelance senior software developer. See my work and get in touch.
nav:
  switchLabel: Language
hero:
  title: Senior Software Developer
  pitch: I build reliable, maintainable software and help teams solve complex problems simply.
  cta: Get in touch
about:
  heading: What I do
  text: >-
    I have extensive experience designing and building web applications and integrations,
    from architecture to delivery. I take on freelance projects alongside my regular job.
  skills:
    - PHP
    - Laravel
    - TypeScript
    - Vue
    - Software architecture
cases:
  heading: Cases
  roleLabel: Role
  linkLabel: View project
contact:
  heading: Work together?
  text: Send me an email with a short description of your project and I'll get back to you soon.
  cta: Email me
footer:
  kvkLabel: CoC
```

`src/content/cases/_template.yml`:

```yaml
# Kopieer dit bestand naar een nieuwe naam zonder underscore, bijv. mijn-case.yml.
# Bestanden die met _ beginnen worden niet getoond.
#
# order: volgorde op de pagina (laag = eerst)
# year:  optioneel, getal (2024) of tekst ('2023–2024')
# link:  optioneel, moet met http:// of https:// beginnen
# Tip: gebruik `>-` voor langere teksten, dan hoef je niets te escapen.
order: 99
# year: 2024
# link: https://example.com
stack:
  - Laravel
  - Vue
nl:
  title: Titel van de case
  client: Klant of sector
  role: Jouw rol
  summary: >-
    Twee tot drie zinnen: wat was het probleem, wat heb je gedaan
    en wat was het resultaat?
en:
  title: Case title
  client: Client or sector
  role: Your role
  summary: >-
    Two to three sentences: what was the problem, what did you do
    and what was the result?
```

`src/content/cases/voorbeeld-case.yml`:

```yaml
# Voorbeeldcase — vervang of verwijder vóór livegang.
order: 1
year: 2025
stack:
  - Laravel
  - PostgreSQL
  - Vue
nl:
  title: Koppeling tussen ERP en webshop
  client: Groothandel in de bouw
  role: Lead developer
  summary: >-
    Orders en voorraad liepen handmatig tussen ERP en webshop. Ik bouwde een
    robuuste synchronisatie met wachtrijen en monitoring, waardoor handwerk verdween
    en voorraadfouten tot vrijwel nul daalden.
en:
  title: ERP to webshop integration
  client: Construction wholesaler
  role: Lead developer
  summary: >-
    Orders and stock were moved manually between ERP and webshop. I built a
    robust synchronisation with queues and monitoring, removing manual work and
    reducing stock errors to almost zero.
```

- [ ] **Step 7: Content collections en tijdelijke pagina**

`src/content.config.ts`:

```ts
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
```

`src/pages/index.astro` (tijdelijk, bewijst dat de collections laden):

```astro
---
import { getCollection } from 'astro:content';
const cases = await getCollection('cases');
---
<p>{cases.map((c) => c.id).join(',')}</p>
```

- [ ] **Step 8: Draai tests en build**

Run: `npx vitest run tests/unit/schemas.test.ts`
Expected: PASS (alle tests).

Run: `npm run build && cat dist/index.html`
Expected: build slaagt; output bevat `voorbeeld-case` en **niet** `_template`.

Run (negatieve controle): `printf 'order: 2\nextra: 1\n' > src/content/cases/kapot.yml && npm run build; rm src/content/cases/kapot.yml`
Expected: build faalt met `InvalidContentEntryDataError` voor `kapot`.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: scaffold Astro project with validated content collections"
```

---

### Task 2: Pure helpers — i18n-paden, cases, e-mail

**Files:**
- Create: `src/lib/i18n.ts`, `src/lib/cases.ts`, `src/lib/email.ts`, `src/lib/content.ts`
- Test: `tests/unit/i18n.test.ts`, `tests/unit/cases.test.ts`, `tests/unit/email.test.ts`

**Interfaces:**
- Consumes: `CaseData`, `I18nData` uit `src/lib/schemas.ts`
- Produces:
  - `src/lib/i18n.ts`: `locales: readonly ['nl','en']`, `type Locale = 'nl' | 'en'`, `defaultLocale: Locale` (`'nl'`), `localePath(lang: Locale, base?: string): string`
  - `src/lib/cases.ts`: `interface CaseEntry { id: string; data: CaseData }`, `interface LocalizedCase { id: string; title: string; client: string; role: string; summary: string; stack: string[]; year?: string; link?: string }`, `localizeCases(entries: CaseEntry[], lang: Locale): LocalizedCase[]`
  - `src/lib/email.ts`: `splitEmail(email: string): { user: string; domain: string }`, `obfuscateEmail(email: string): string`
  - `src/lib/content.ts`: `getTranslations(lang: Locale): Promise<I18nData>`, `getCases(lang: Locale): Promise<LocalizedCase[]>`

- [ ] **Step 1: Schrijf de falende tests**

`tests/unit/i18n.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { localePath } from '../../src/lib/i18n';

describe('localePath', () => {
  it('geeft root voor Nederlands en /en/ voor Engels', () => {
    expect(localePath('nl', '/')).toBe('/');
    expect(localePath('en', '/')).toBe('/en/');
  });

  it('neemt een base path mee, met of zonder slash', () => {
    expect(localePath('nl', '/simple-portfolio/')).toBe('/simple-portfolio/');
    expect(localePath('en', '/simple-portfolio/')).toBe('/simple-portfolio/en/');
    expect(localePath('en', '/simple-portfolio')).toBe('/simple-portfolio/en/');
  });
});
```

`tests/unit/cases.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { localizeCases, type CaseEntry } from '../../src/lib/cases';

const entry = (id: string, order: number, extra: Partial<CaseEntry['data']> = {}): CaseEntry => ({
  id,
  data: {
    order,
    stack: ['Laravel'],
    nl: { title: `NL ${id}`, client: 'Klant', role: 'Rol', summary: 'Samenvatting' },
    en: { title: `EN ${id}`, client: 'Client', role: 'Role', summary: 'Summary' },
    ...extra,
  },
});

describe('localizeCases', () => {
  it('sorteert op order', () => {
    const result = localizeCases([entry('b', 2), entry('a', 1)], 'nl');
    expect(result.map((c) => c.id)).toEqual(['a', 'b']);
  });

  it('sorteert gelijke order stabiel op id', () => {
    const result = localizeCases([entry('zeta', 1), entry('alpha', 1), entry('mid', 0)], 'nl');
    expect(result.map((c) => c.id)).toEqual(['mid', 'alpha', 'zeta']);
  });

  it('kiest de teksten van de gevraagde taal', () => {
    const [nl] = localizeCases([entry('a', 1)], 'nl');
    const [en] = localizeCases([entry('a', 1)], 'en');
    expect(nl.title).toBe('NL a');
    expect(en.title).toBe('EN a');
    expect(en.client).toBe('Client');
  });

  it('zet year om naar tekst en laat optionele velden weg als ze ontbreken', () => {
    const [withYear] = localizeCases([entry('a', 1, { year: 2024, link: 'https://x.nl' })], 'nl');
    const [without] = localizeCases([entry('b', 1)], 'nl');
    expect(withYear.year).toBe('2024');
    expect(withYear.link).toBe('https://x.nl');
    expect(without.year).toBeUndefined();
    expect(without.link).toBeUndefined();
  });

  it('muteert de invoer niet', () => {
    const input = [entry('b', 2), entry('a', 1)];
    localizeCases(input, 'nl');
    expect(input.map((c) => c.id)).toEqual(['b', 'a']);
  });
});
```

`tests/unit/email.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { obfuscateEmail, splitEmail } from '../../src/lib/email';

describe('splitEmail', () => {
  it('splitst een gewoon adres', () => {
    expect(splitEmail('hallo@example.com')).toEqual({ user: 'hallo', domain: 'example.com' });
  });

  it('behoudt plus-adressen en subdomeinen', () => {
    expect(splitEmail('naam+web@mail.domein.nl')).toEqual({ user: 'naam+web', domain: 'mail.domein.nl' });
  });

  it.each(['geen-at', '@example.com', 'naam@'])('weigert ongeldig adres %s', (email) => {
    expect(() => splitEmail(email)).toThrow(/Ongeldig e-mailadres/);
  });
});

describe('obfuscateEmail', () => {
  it('vervangt @ en punten in het domein', () => {
    expect(obfuscateEmail('hallo@mail.example.com')).toBe('hallo [at] mail [dot] example [dot] com');
  });

  it('bevat het letterlijke adres niet', () => {
    expect(obfuscateEmail('hallo@example.com')).not.toContain('hallo@example.com');
  });
});
```

- [ ] **Step 2: Draai de tests en zie ze falen**

Run: `npx vitest run tests/unit`
Expected: FAIL — imports van `src/lib/i18n`, `src/lib/cases`, `src/lib/email` niet gevonden. `schemas.test.ts` blijft PASS.

- [ ] **Step 3: Implementeer de helpers**

`src/lib/i18n.ts`:

```ts
export const locales = ['nl', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'nl';

export function localePath(lang: Locale, base: string = import.meta.env.BASE_URL): string {
  const root = base.endsWith('/') ? base : `${base}/`;
  return lang === defaultLocale ? root : `${root}${lang}/`;
}
```

`src/lib/cases.ts`:

```ts
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
```

`src/lib/email.ts`:

```ts
export function splitEmail(email: string): { user: string; domain: string } {
  const at = email.lastIndexOf('@');
  if (at <= 0 || at === email.length - 1) {
    throw new Error(`Ongeldig e-mailadres in src/config.ts: "${email}"`);
  }
  return { user: email.slice(0, at), domain: email.slice(at + 1) };
}

export function obfuscateEmail(email: string): string {
  const { user, domain } = splitEmail(email);
  return `${user} [at] ${domain.replaceAll('.', ' [dot] ')}`;
}
```

`src/lib/content.ts` (wordt via de build getest in Task 3):

```ts
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
```

- [ ] **Step 4: Draai de tests**

Run: `npx vitest run tests/unit`
Expected: PASS (alle unit-tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib tests/unit
git commit -m "feat: add i18n, case and email helpers"
```

---

### Task 3: Layout, componenten, pagina's en styling

**Files:**
- Create: `src/layouts/Base.astro`, `src/components/HomePage.astro`, `src/components/Header.astro`, `src/components/Hero.astro`, `src/components/About.astro`, `src/components/Cases.astro`, `src/components/CaseCard.astro`, `src/components/Contact.astro`, `src/components/Footer.astro`, `src/components/SocialLinks.astro`, `src/components/EmailLink.astro`, `src/styles/global.css`, `src/pages/en/index.astro`
- Modify: `src/pages/index.astro` (volledig vervangen)
- Test: `tests/dist/pages.test.ts`

**Interfaces:**
- Consumes: `profile` (Task 1); `I18nData` (Task 1); `locales`, `defaultLocale`, `localePath`, `type Locale` (Task 2); `getTranslations`, `getCases`, `LocalizedCase`, `localizeCases`, `splitEmail`, `obfuscateEmail` (Task 2)
- Produces (gebruikt door tests en Task 4):
  - `<HomePage lang={Locale} />`
  - HTML-hooks: `#cases` (alleen als er cases zijn), `.case-card h3` (case-titel), `#contact`, `a[data-email-user][data-email-domain]` (mailto-elementen), `a[data-social="github"]`, `a[data-social="linkedin"]`, `.lang-switch a`, `script[type="application/ld+json"]`
  - `<EmailLink label? class? />`: met `label` → knop met die tekst; zonder → toont het (in de browser samengestelde) adres

- [ ] **Step 1: Schrijf de falende dist-tests**

`tests/dist/pages.test.ts`:

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { parse, type HTMLElement } from 'node-html-parser';
import { beforeAll, describe, expect, it } from 'vitest';
import { profile } from '../../src/config';
import { localizeCases, type CaseEntry } from '../../src/lib/cases';
import type { I18nData } from '../../src/lib/schemas';

const pages = { nl: 'dist/index.html', en: 'dist/en/index.html' } as const;

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
    expect(href('link[rel="canonical"]')).toBe(lang === 'nl' ? `${site}/` : `${site}/en/`);
    expect(href('link[rel="alternate"][hreflang="nl"]')).toBe(`${site}/`);
    expect(href('link[rel="alternate"][hreflang="en"]')).toBe(`${site}/en/`);
    expect(href('link[rel="alternate"][hreflang="x-default"]')).toBe(`${site}/`);
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
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/', '/en/']);
    const current = links.find((a) => a.getAttribute('aria-current') === 'page');
    expect(current?.getAttribute('href')).toBe(lang === 'nl' ? '/' : '/en/');
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
});
```

- [ ] **Step 2: Draai de tests en zie ze falen**

Run: `npm run build && npx vitest run tests/dist`
Expected: FAIL — `dist/en/index.html ontbreekt` en NL-asserts (o.a. `lang`, `title`) falen op de tijdelijke pagina.

- [ ] **Step 3: Layout**

`src/layouts/Base.astro`:

```astro
---
import '../styles/global.css';
import { profile } from '../config';
import { defaultLocale, localePath, locales, type Locale } from '../lib/i18n';
import type { I18nData } from '../lib/schemas';

interface Props {
  lang: Locale;
  t: I18nData;
}

const { lang, t } = Astro.props;
const abs = (path: string) => new URL(path, Astro.site).href;
const canonical = abs(localePath(lang));
const ogImage = abs(`${localePath(defaultLocale)}og.png`);
const ogLocale = { nl: 'nl_NL', en: 'en_US' }[lang];

const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  jobTitle: t.hero.title,
  url: abs(localePath(defaultLocale)),
  sameAs: [profile.githubUrl, profile.linkedinUrl],
}).replaceAll('<', '\\u003c');
---
<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{t.meta.title}</title>
    <meta name="description" content={t.meta.description} />
    <link rel="canonical" href={canonical} />
    {locales.map((l) => <link rel="alternate" hreflang={l} href={abs(localePath(l))} />)}
    <link rel="alternate" hreflang="x-default" href={abs(localePath(defaultLocale))} />
    <link rel="icon" href={`${localePath(defaultLocale)}favicon.svg`} type="image/svg+xml" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={t.meta.title} />
    <meta property="og:description" content={t.meta.description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:locale" content={ogLocale} />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json" set:html={jsonLd} />
  </head>
  <body>
    <slot />
    <script is:inline>
      document.querySelectorAll('[data-email-user]').forEach((el) => {
        const address = el.dataset.emailUser + '@' + el.dataset.emailDomain;
        el.href = 'mailto:' + address;
        if (el.hasAttribute('data-email-show')) el.textContent = address;
      });
    </script>
  </body>
</html>
```

- [ ] **Step 4: Kleine bouwstenen**

`src/components/EmailLink.astro`:

```astro
---
import { profile } from '../config';
import { obfuscateEmail, splitEmail } from '../lib/email';

interface Props {
  label?: string;
  class?: string;
}

const { label, class: className } = Astro.props;
const { user, domain } = splitEmail(profile.email);
---
<a
  class={className}
  href="#contact"
  data-email-user={user}
  data-email-domain={domain}
  data-email-show={label ? undefined : ''}
>{label ?? obfuscateEmail(profile.email)}</a>
```

`src/components/SocialLinks.astro`:

```astro
---
import { profile } from '../config';

const links = [
  {
    key: 'github',
    label: 'GitHub',
    href: profile.githubUrl,
    path: 'M12 .3a12 12 0 0 0-3.8 23.38c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .3',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    href: profile.linkedinUrl,
    path: 'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
  },
];
---
<ul class="social">
  {links.map((l) => (
    <li>
      <a href={l.href} data-social={l.key} rel="me noopener" target="_blank">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d={l.path} fill="currentColor" /></svg>
        <span>{l.label}</span>
      </a>
    </li>
  ))}
</ul>
```

- [ ] **Step 5: Secties**

`src/components/Header.astro`:

```astro
---
import { profile } from '../config';
import { localePath, locales, type Locale } from '../lib/i18n';
import type { I18nData } from '../lib/schemas';

interface Props {
  lang: Locale;
  t: I18nData;
}

const { lang, t } = Astro.props;
---
<header class="site-header container">
  <a class="logo" href={localePath(lang)}>{profile.name}</a>
  <nav aria-label={t.nav.switchLabel}>
    <ul class="lang-switch">
      {locales.map((l) => (
        <li>
          <a href={localePath(l)} hreflang={l} lang={l} aria-current={l === lang ? 'page' : undefined}>
            {l.toUpperCase()}
          </a>
        </li>
      ))}
    </ul>
  </nav>
</header>
```

`src/components/Hero.astro`:

```astro
---
import { profile } from '../config';
import type { I18nData } from '../lib/schemas';
import EmailLink from './EmailLink.astro';
import SocialLinks from './SocialLinks.astro';

interface Props {
  t: I18nData;
}

const { t } = Astro.props;
---
<section class="hero container">
  <h1>{profile.name}</h1>
  <p class="hero-title">{t.hero.title}</p>
  <p class="hero-pitch">{t.hero.pitch}</p>
  <div class="hero-actions">
    <EmailLink class="button" label={t.hero.cta} />
    <SocialLinks />
  </div>
</section>
```

`src/components/About.astro`:

```astro
---
import type { I18nData } from '../lib/schemas';

interface Props {
  t: I18nData;
}

const { t } = Astro.props;
---
<section class="about container" aria-labelledby="about-heading">
  <h2 id="about-heading">{t.about.heading}</h2>
  <p>{t.about.text}</p>
  <ul class="tags">
    {t.about.skills.map((skill) => <li>{skill}</li>)}
  </ul>
</section>
```

`src/components/CaseCard.astro`:

```astro
---
import type { LocalizedCase } from '../lib/cases';
import type { I18nData } from '../lib/schemas';

interface Props {
  item: LocalizedCase;
  t: I18nData;
}

const { item, t } = Astro.props;
---
<article class="case-card">
  <h3>{item.title}</h3>
  <p class="case-meta">
    {item.client}{item.year && <> · {item.year}</>}
  </p>
  <p class="case-role"><span>{t.cases.roleLabel}:</span> {item.role}</p>
  <p>{item.summary}</p>
  <ul class="tags">
    {item.stack.map((tech) => <li>{tech}</li>)}
  </ul>
  {item.link && <a class="case-link" href={item.link} rel="noopener" target="_blank">{t.cases.linkLabel} →</a>}
</article>
```

`src/components/Cases.astro`:

```astro
---
import type { LocalizedCase } from '../lib/cases';
import type { I18nData } from '../lib/schemas';
import CaseCard from './CaseCard.astro';

interface Props {
  cases: LocalizedCase[];
  t: I18nData;
}

const { cases, t } = Astro.props;
---
<section id="cases" class="cases container" aria-labelledby="cases-heading">
  <h2 id="cases-heading">{t.cases.heading}</h2>
  <div class="case-grid">
    {cases.map((item) => <CaseCard item={item} t={t} />)}
  </div>
</section>
```

`src/components/Contact.astro`:

```astro
---
import type { I18nData } from '../lib/schemas';
import EmailLink from './EmailLink.astro';
import SocialLinks from './SocialLinks.astro';

interface Props {
  t: I18nData;
}

const { t } = Astro.props;
---
<section id="contact" class="contact container" aria-labelledby="contact-heading">
  <h2 id="contact-heading">{t.contact.heading}</h2>
  <p>{t.contact.text}</p>
  <p class="contact-address"><EmailLink /></p>
  <div class="hero-actions">
    <EmailLink class="button" label={t.contact.cta} />
    <SocialLinks />
  </div>
</section>
```

`src/components/Footer.astro`:

```astro
---
import { profile } from '../config';
import type { I18nData } from '../lib/schemas';

interface Props {
  t: I18nData;
}

const { t } = Astro.props;
const year = new Date().getFullYear();
---
<footer class="site-footer container">
  <p>
    © {year} {profile.name}
    {profile.kvk && <> · {t.footer.kvkLabel} {profile.kvk}</>}
  </p>
</footer>
```

`src/components/HomePage.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import { getCases, getTranslations } from '../lib/content';
import type { Locale } from '../lib/i18n';
import About from './About.astro';
import Cases from './Cases.astro';
import Contact from './Contact.astro';
import Footer from './Footer.astro';
import Header from './Header.astro';
import Hero from './Hero.astro';

interface Props {
  lang: Locale;
}

const { lang } = Astro.props;
const t = await getTranslations(lang);
const cases = await getCases(lang);
---
<Base lang={lang} t={t}>
  <Header lang={lang} t={t} />
  <main>
    <Hero t={t} />
    <About t={t} />
    {cases.length > 0 && <Cases cases={cases} t={t} />}
    <Contact t={t} />
  </main>
  <Footer t={t} />
</Base>
```

- [ ] **Step 6: Pagina's**

`src/pages/index.astro` (vervangt de tijdelijke versie):

```astro
---
import HomePage from '../components/HomePage.astro';
---
<HomePage lang="nl" />
```

`src/pages/en/index.astro`:

```astro
---
import HomePage from '../../components/HomePage.astro';
---
<HomePage lang="en" />
```

- [ ] **Step 7: Styling**

`src/styles/global.css`:

```css
:root {
  --bg: #fbfbfa;
  --surface: #ffffff;
  --text: #1c1c1e;
  --muted: #5f6368;
  --border: #e4e4e7;
  --accent: #2557d6;
  --accent-text: #ffffff;
  --radius: 12px;
  --max-width: 52rem;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111214;
    --surface: #1a1c1f;
    --text: #ececef;
    --muted: #a1a1aa;
    --border: #2c2e33;
    --accent: #7aa2ff;
    --accent-text: #0b0d12;
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

a {
  color: var(--accent);
}

a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}

.container {
  max-width: var(--max-width);
  margin-inline: auto;
  padding-inline: 1.25rem;
}

h1,
h2,
h3 {
  line-height: 1.2;
  margin: 0 0 0.5rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

section {
  padding-block: 3rem;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Header */
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block: 1.25rem;
}

.logo {
  color: var(--text);
  font-weight: 700;
  text-decoration: none;
}

.lang-switch {
  display: flex;
  gap: 0.25rem;
}

.lang-switch a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.lang-switch a[aria-current='page'] {
  color: var(--text);
  background: var(--border);
}

/* Hero */
.hero {
  padding-block: 4rem 3rem;
}

.hero h1 {
  font-size: clamp(2.25rem, 6vw, 3.5rem);
  letter-spacing: -0.02em;
}

.hero-title {
  color: var(--accent);
  font-weight: 600;
  font-size: 1.25rem;
  margin: 0 0 1rem;
}

.hero-pitch {
  color: var(--muted);
  font-size: 1.2rem;
  max-width: 38rem;
  margin: 0 0 2rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.5rem;
}

.button {
  display: inline-block;
  background: var(--accent);
  color: var(--accent-text);
  font-weight: 600;
  text-decoration: none;
  padding: 0.75rem 1.4rem;
  border-radius: 999px;
}

.button:hover {
  filter: brightness(1.1);
}

.social {
  display: flex;
  gap: 1.25rem;
}

.social a {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text);
  text-decoration: none;
  font-weight: 500;
}

.social a:hover {
  color: var(--accent);
}

/* Tags */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tags li {
  font-size: 0.8125rem;
  padding: 0.2rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--muted);
}

/* Cases */
.case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: 1.25rem;
}

.case-card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.case-card h3 {
  font-size: 1.15rem;
}

.case-card p {
  margin: 0 0 0.75rem;
}

.case-meta,
.case-role {
  color: var(--muted);
  font-size: 0.9rem;
}

.case-role span {
  font-weight: 600;
}

.case-card .tags {
  margin-top: auto;
  padding-top: 0.5rem;
}

.case-link {
  margin-top: 1rem;
  font-weight: 600;
  text-decoration: none;
}

/* Contact */
.contact {
  border-top: 1px solid var(--border);
}

.contact-address {
  font-weight: 600;
}

/* Footer */
.site-footer {
  color: var(--muted);
  font-size: 0.875rem;
  padding-block: 2rem;
}
```

- [ ] **Step 8: Build en draai alle tests**

Run: `npm run check`
Expected: build slaagt; alle tests in `tests/unit` en `tests/dist` PASS.

Run: `npm run dev` en open `http://localhost:4321/` en `http://localhost:4321/en/` in de browser.
Expected (handmatig): beide talen tonen hero, over mij, case-kaartje en contact; taalwissel werkt; "Neem contact op" opent het mailprogramma met het adres uit `config.ts`; in de contactsectie staat het leesbare adres; licht/donkermodus volgt het systeem; op 375px breed geen horizontale scroll. Stop de dev-server daarna.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: build bilingual one-page portfolio"
```

---

### Task 4: Favicon en OG-afbeelding

**Files:**
- Create: `public/favicon.svg`, `public/og.svg`, `scripts/og.mjs`, `public/og.png` (gegenereerd)
- Modify: `tests/dist/pages.test.ts` (tests toevoegen aan `describe('dist algemeen')`)

**Interfaces:**
- Consumes: `og:image`-meta en favicon-link uit `Base.astro` (Task 3) die naar `/og.png` en `/favicon.svg` wijzen
- Produces: `npm run og` → schrijft `public/og.png` uit `public/og.svg`

- [ ] **Step 1: Schrijf de falende tests**

Voeg toe binnen `describe('dist algemeen', () => { ... })` in `tests/dist/pages.test.ts`:

```ts
  it('heeft een favicon', () => {
    expect(existsSync('dist/favicon.svg')).toBe(true);
  });

  it('heeft een OG-afbeelding van 1200×630', () => {
    const png = readFileSync('dist/og.png');
    expect(png.subarray(1, 4).toString()).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
```

- [ ] **Step 2: Draai de tests en zie ze falen**

Run: `npm run build && npx vitest run tests/dist`
Expected: FAIL — `dist/favicon.svg` bestaat niet; `ENOENT ... dist/og.png`.

- [ ] **Step 3: Assets en script**

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#2557d6"/>
  <text x="16" y="22" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">&lt;/&gt;</text>
</svg>
```

`public/og.svg` (naam gelijk houden aan `profile.name` in `src/config.ts`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#111214"/>
  <rect x="80" y="250" width="12" height="130" rx="6" fill="#7aa2ff"/>
  <text x="120" y="310" font-family="Helvetica, Arial, sans-serif" font-size="72" font-weight="700" fill="#ececef">Jouw Naam</text>
  <text x="120" y="372" font-family="Helvetica, Arial, sans-serif" font-size="40" fill="#7aa2ff">Senior Software Developer</text>
</svg>
```

`scripts/og.mjs`:

```js
// Zet public/og.svg om naar public/og.png (1200×630). Draai na het aanpassen van og.svg: npm run og
import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const svg = readFileSync('public/og.svg', 'utf8');
const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: true },
}).render().asPng();

writeFileSync('public/og.png', png);
console.log('public/og.png geschreven');
```

- [ ] **Step 4: Genereer de PNG en controleer**

Run: `npm run og`
Expected: `public/og.png geschreven`. Bekijk `public/og.png` en controleer dat naam en titel zichtbaar zijn (tekst niet weggevallen door ontbrekend font).

- [ ] **Step 5: Draai alle tests**

Run: `npm run check`
Expected: alle tests PASS.

- [ ] **Step 6: Commit**

```bash
git add public scripts tests/dist/pages.test.ts
git commit -m "feat: add favicon and Open Graph image"
```

---

### Task 5: CI/deploy-workflow en README

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

**Interfaces:**
- Consumes: `npm run check` (Task 1 scripts), output-map `dist/`

- [ ] **Step 1: Workflow**

`.github/workflows/deploy.yml`:

```yaml
name: Build and deploy

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run check
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  deploy:
    if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: README**

`README.md`:

````markdown
# Portfolio

Tweetalige (NL/EN) one-page portfolio, gebouwd met [Astro](https://astro.build).

- Nederlands: `/`
- Engels: `/en/`

## Lokaal draaien

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # build + alle tests
```

Vereist Node 22.12 of hoger.

## Gegevens invullen

Persoonlijke gegevens staan in **`src/config.ts`**: naam, e-mailadres, GitHub, LinkedIn, KvK-nummer (leeg = niet tonen) en de productie-URL (`siteUrl`).

Het e-mailadres staat niet letterlijk in de HTML; het wordt in de browser samengesteld.

## Teksten aanpassen

Alle teksten staan in:

- `src/content/i18n/nl.yml`
- `src/content/i18n/en.yml`

Beide bestanden moeten **dezelfde sleutels** hebben. Ontbreekt er een sleutel of zit er een typfout in, dan faalt `npm run build` met een melding welk veld het is.

## Case toevoegen

1. Kopieer `src/content/cases/_template.yml` naar bijv. `src/content/cases/mijn-case.yml` (zonder `_` vooraan).
2. Vul `order`, `stack` en beide taalblokken (`nl` en `en`) in. `year` en `link` zijn optioneel.
3. `npm run check`, committen en pushen.

Cases worden gesorteerd op `order` (laag eerst). Verwijder `voorbeeld-case.yml` vóór livegang. Zonder cases verdwijnt de sectie vanzelf.

## Deelafbeelding (Open Graph)

`public/og.png` wordt gemaakt uit `public/og.svg`. Pas na het wijzigen van je naam ook `og.svg` aan en draai:

```bash
npm run og
```

## Deployen

### GitHub Pages (standaard)

1. Push naar GitHub.
2. Zet in de repo onder **Settings → Pages → Source** de optie op **GitHub Actions**.
3. Elke push naar `main` draait build en tests en deployt daarna.

**Eigen domein:** stel het domein in onder **Settings → Pages → Custom domain**, maak bij je DNS-provider een `CNAME` naar `<gebruikersnaam>.github.io` en zet `siteUrl` in `src/config.ts` op dat domein.

**Zonder eigen domein** (project page op `https://<gebruiker>.github.io/<repo>/`): zet `siteUrl` op `https://<gebruiker>.github.io` en voeg in `astro.config.mjs` `base: '/<repo>'` toe.

### Netlify of Cloudflare Pages

Koppel de repo met build command `npm run build` en output directory `dist`.
````

- [ ] **Step 3: Controleer de base-path-instructie uit de README**

Run: `npx astro build --base /simple-portfolio && grep -o 'href="/simple-portfolio/en/"' dist/index.html | head -1`
Expected: `href="/simple-portfolio/en/"` — taalwissel neemt de base path mee.

Run daarna: `npm run check`
Expected: alle tests PASS (gewone build zonder base path).

- [ ] **Step 4: Commit**

```bash
git add .github README.md
git commit -m "ci: add GitHub Pages workflow and README"
```
