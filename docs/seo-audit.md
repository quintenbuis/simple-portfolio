# SEO-scan — quintenbuis.nl

Uitgevoerd op 2026-10-10 op de lokale build (`dist/`), vóór livegang. Er is nog niets van deze lijst doorgevoerd.

**Conclusie:** niets blokkeert indexering. Er is geen `noindex`, en canonical, hreflang (nl/en/x-default) en `html lang` kloppen op beide pagina's. De grootste zwaktes zijn dunne content, een titel en description die niet op "freelance" mikken, en ontbrekende metadata.

## Hoog

### 1. Weinig tekst op de pagina
- **Probleem:** ongeveer 110 zichtbare woorden per taal. Er zijn geen cases, dus die sectie wordt niet getoond.
- **Aanpak:**
  - Breid `about.text` in `src/content/i18n/nl.yml` en `en.yml` uit naar 150–300 woorden per taal.
  - Noem daarin jaren ervaring, soorten projecten en sectoren, en je werkwijze: remote of op locatie, en regio.
  - Gebruik de termen "freelance senior software developer" en "freelance PHP/Laravel developer".
  - Noem vaardigheden die geen technologie zijn in de tekst zelf, zoals API-koppelingen, code reviews en legacy-modernisering.
  - Eén of twee (geanonimiseerde) cases voegen veel indexeerbare tekst toe.

### 2. Titel bevat geen "freelance" en is in beide talen gelijk
Nu: `Quinten Buis — Senior Software Developer`. Pas `meta.title` aan en houd elke titel onder ±60 tekens:
- NL: `Quinten Buis — Freelance Senior Software Developer (PHP/Laravel)`
- EN: `Quinten Buis — Freelance Senior Software Developer | PHP & Laravel`

### 3. Meta description kort en generiek
Nu 74 tekens, zonder naam, en hij belooft werk dat er (nog) niet staat ("Bekijk mijn werk"). Mik op 140–160 tekens, bijvoorbeeld:
- NL: `Quinten Buis is freelance senior software developer (PHP, Laravel, TypeScript, Vue). Betrouwbare, onderhoudbare webapplicaties en koppelingen. Neem contact op.`
- Maak de EN-versie op dezelfde manier.

### 4. `robots.txt` ontbreekt
Voeg `public/robots.txt` toe:

```
User-agent: *
Allow: /
Sitemap: https://quintenbuis.nl/sitemap-index.xml
```

## Middel

### 5. JSON-LD is minimaal
`src/layouts/Base.astro` geeft nu alleen `name`, `jobTitle`, `url` en `sameAs`.
- Breid de `Person` uit met:
  - `"@id": "https://quintenbuis.nl/#person"`
  - `knowsAbout` (uit `profile.technologies`)
  - `description` (`t.meta.description`)
  - `image` (`og.png`)
  - `address: { "@type": "PostalAddress", "addressCountry": "NL" }`
- Voeg een `WebSite`-node toe (`name`, `url`, `inLanguage`, `publisher` → `#person`) via `@graph`.
- E-mail toevoegen kan, maar dan staat het adres wél letterlijk in de HTML. Dat botst met de obfuscatie, dus maak eerst die keuze.
- `ProfessionalService` (met `areaServed` en het KvK-nummer als `identifier`) is optioneel. Het helpt alleen voor lokale of zakelijke resultaten.

### 6. Open Graph / Twitter onvolledig
Voeg toe in `Base.astro`:

```astro
<meta property="og:site_name" content={profile.name} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content={`${profile.name} — ${t.hero.title}`} />
<meta property="og:locale:alternate" content={lang === 'nl' ? 'en_US' : 'nl_NL'} />
```

Optioneel: zet "Freelance" ook in `public/og.svg` en draai `npm run og`.

### 7. Favicon-fallback, apple-touch-icon en theme-color ontbreken
Er is alleen een SVG-favicon. Google toont in zoekresultaten bij voorkeur een favicon van minimaal 48px, en sommige crawlers negeren SVG.
- Voeg `public/favicon.ico` (of een PNG van 48/96px) toe.
- Voeg `public/apple-touch-icon.png` (180px) toe.
- Zet in de head:

```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#2557d6">
```

Gebruik `localePath(defaultLocale)` als prefix, zodat ook een base path werkt.

### 8. Taalcodes in de sitemap wijken af van de HTML
De sitemap gebruikt `nl-NL`/`en-US` zonder x-default, de HTML gebruikt `nl`/`en`. Bovendien beperkt `en-US` de Engelse pagina tot de VS. Pas in `astro.config.mjs` aan naar `locales: { nl: 'nl', en: 'en' }`.

## Laag

9. **H1 is alleen je naam.** De rol staat in een `<p>` (`src/components/Hero.astro`). Neem de rol op in de H1, bijvoorbeeld `<h1>Quinten Buis <span class="hero-title">Freelance Senior Software Developer</span></h1>`.
10. **Pitch.** Het zinnetje "freelance naast mijn vaste werk" verzwakt de positionering als freelancer. Dat is een zakelijke keuze.
11. **E-mailknoppen.** Crawlers zien links naar `#contact` en geen `mailto`. Dat is bewust (obfuscatie) en onschadelijk voor SEO.
12. **Footer-jaartal.** Dat wordt bij de build gezet, dus bouw minstens één keer per jaar opnieuw.

## Wat al goed is

- Canonical per taal, wederzijdse hreflang inclusief x-default, en een correcte `html lang` en `og:locale`.
- Sitemap met taal-alternates.
- Zeer lichte pagina: ±6 KB HTML gzipped en 1,5 KB CSS, zonder webfonts of externe scripts.
- Schone semantiek: één H1, H2/H3 in volgorde, landmarks, en een taalwissel met `hreflang` en `aria-current`.
- Profiel-links met `rel="me"` die overeenkomen met `sameAs` in de JSON-LD.
- `og.png` heeft het juiste formaat (1200×630).

## Status

| # | Punt | Status |
|---|------|--------|
| 1 | Meer tekst | open, inhoud van Quinten nodig |
| 2 | Titel | open |
| 3 | Meta description | open |
| 4 | robots.txt | open |
| 5 | JSON-LD | open |
| 6 | Open Graph | open |
| 7 | Iconen / theme-color | open |
| 8 | Taalcodes sitemap | open |
| 9 | Rol in H1 | open |
