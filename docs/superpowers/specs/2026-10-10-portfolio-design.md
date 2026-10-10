# Portfolio / visitekaartje — design

Datum: 2026-10-10

## Doel

Een simpele one-page website die dient als digitaal visitekaartje voor een senior software developer die freelance opdrachten zoekt. Bezoekers (potentiële opdrachtgevers die de naam opzoeken) moeten snel zien wie het is, wat diegene doet, aan welke projecten gewerkt is, en contact kunnen opnemen.

**Succescriteria**

- Laadt snel, werkt goed op mobiel, goed vindbaar in Google en netjes te delen (LinkedIn-preview).
- Tekst aanpassen of een case toevoegen kost 1–2 minuten: één bestand bewerken en pushen, zonder HTML/CSS aan te raken.
- Volledig beschikbaar in Nederlands en Engels.

## Buiten scope

- Foto.
- Contactformulier of backend.
- Detailpagina's per case.
- CMS / beheer-UI.
- Automatische taaldetectie / redirect.
- Vermelding van beschikbaarheid.
- Analytics, trackers, cookiebanner.

## Pagina-indeling

Eén pagina per taal, van boven naar beneden:

1. **Header** — naam als tekstlogo links, taalwissel `NL | EN` rechts.
2. **Hero** — naam, "Senior Software Developer", pitch van 1–2 zinnen, primaire knop "Neem contact op" (mailto), icoonlinks naar GitHub en LinkedIn.
3. **Over mij** — korte alinea en een rij skill-tags.
4. **Cases** — grid met kaartjes (2 kolommen op desktop, 1 op mobiel). Per kaartje: titel, klant/sector, rol, omschrijving, tech stack als tags; optioneel jaar en link.
5. **Contact** — afsluitende call-to-action met mailto-knop en GitHub/LinkedIn-links.
6. **Footer** — naam, jaar, optioneel KvK-nummer.

**Stijl:** rustig, professioneel, typografisch. Eén accentkleur, automatische licht/donkermodus via `prefers-color-scheme`. Systeemfonts, geen externe resources.

**Contact:** mailto-link. Het e-mailadres staat in de config en wordt in de HTML in delen weggezet (bijv. `data-user` / `data-domain`); een klein inline script zet de `href` en zichtbare tekst in de browser in elkaar. Zonder JavaScript toont de knop een nette fallback-tekst (adres met `[at]`-notatie).

## Content en vertaling

```
src/
  config.ts                  # naam, e-mail, githubUrl, linkedinUrl, kvk? — taalonafhankelijk
  content/
    i18n/
      nl.yml                 # alle UI-teksten NL
      en.yml                 # zelfde sleutels EN
    cases/
      _template.yml          # template, wordt niet getoond
      <slug>.yml             # één bestand per case
```

**UI-teksten (`i18n/*.yml`)** — identieke sleutelstructuur in beide talen, o.a.:
`meta.title`, `meta.description`, `hero.title`, `hero.pitch`, `hero.cta`, `about.heading`, `about.text`, `about.skills` (lijst), `cases.heading`, `contact.heading`, `contact.text`, `contact.cta`, `footer.kvkLabel`.
Gevalideerd met een Zod-schema via Astro content collections; ontbrekende of extra sleutels laten de build falen.

**Case-bestand:**

```yaml
order: 1            # sorteervolgorde (oplopend)
year: 2024          # optioneel
stack: [Laravel, Vue, PostgreSQL]
link: https://...   # optioneel, moet geldige URL zijn
nl:
  title: ...
  client: ...       # klant of sector, mag geanonimiseerd
  role: ...
  summary: ...      # 2–3 zinnen: probleem, aanpak, resultaat
en:
  title: ...
  client: ...
  role: ...
  summary: ...
```

Alle velden behalve `year` en `link` zijn verplicht, inclusief beide taalblokken. Bestanden waarvan de naam met `_` begint worden genegeerd.

**Routes:** `/` = Nederlands, `/en/` = Engels. Beide gebouwd uit dezelfde pagina-component met een `lang`-parameter. `<html lang>`, `hreflang`-alternates (incl. `x-default` → `/`) en de taalwissel verwijzen naar elkaar.

## Techniek

- **Astro** (laatste stabiele versie), TypeScript, statische output (`dist/`).
- Plain CSS in één globaal bestand met CSS-variabelen; geen CSS-framework of UI-library.
- Geen client-side JavaScript behalve het mailto-script.
- **SEO:** per taal `<title>`, meta description, Open Graph/Twitter-tags, canonical, `hreflang`, `sitemap.xml` (`@astrojs/sitemap`), JSON-LD `Person` met `sameAs` naar GitHub en LinkedIn.
- **OG-afbeelding:** één statische PNG (1200×630) met naam en titel in `public/og.png`, gemaakt vanuit een meegeleverde SVG-bron (`public/og.svg`); geen generatie tijdens de build.
- `site` (productie-URL) staat in `astro.config.mjs` / `config.ts`.

## Hosting en deploy

- GitHub Actions-workflow: install → build → test → deploy naar GitHub Pages.
- Statische output werkt ook direct op Netlify of Cloudflare Pages (repo koppelen, build command `npm run build`, output `dist`).

## Testen

- `npm run build` faalt bij ongeldige content (schema-validatie) — primaire vangnet.
- Kleine testsuite (Vitest) op de gebouwde HTML van `/` en `/en/`:
  - juiste `lang`-attribuut en vertaalde kernteksten aanwezig;
  - alle niet-template cases gerenderd, in `order`-volgorde;
  - GitHub-, LinkedIn- en mailto-elementen aanwezig;
  - `hreflang`-links wijzen wederzijds naar elkaar.
- CI draait build en tests vóór deploy.

## Documentatie

`README.md` met: lokaal draaien, tekst aanpassen, case toevoegen (via `_template.yml`), deployen en eigen domein koppelen.
