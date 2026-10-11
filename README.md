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

## Docker

De site draait ook als container: een multi-stage build (Node bouwt en test, nginx serveert de statische bestanden, zonder root-rechten op poort 8080).

```bash
docker compose up -d --build   # http://localhost:8080
```

Is poort 8080 al bezet? Kies een andere poort op je machine:

```bash
PORT=8081 docker compose up -d --build   # http://localhost:8081
```

Of zonder compose:

```bash
docker build -t simple-portfolio .
docker run -d -p 8080:8080 simple-portfolio
```

De image bouwt alleen als `npm run check` (build + tests) slaagt. De nginx-configuratie staat in `docker/nginx.conf`.

## Gegevens invullen

Persoonlijke gegevens staan in **`src/config.ts`**: naam, e-mailadres, GitHub, LinkedIn, handelsnaam, KvK- en btw-nummer (leeg = niet tonen), de productie-URL (`siteUrl`) en de technologieën.

Het e-mailadres staat niet letterlijk in de zichtbare HTML; het wordt in de browser samengesteld. Alleen de gestructureerde data voor zoekmachines (JSON-LD) bevat het adres.

## Analytics

De site gebruikt een eigen, cookieloze Plausible-instantie. Het script staat in `analyticsScriptUrl` in `src/config.ts`; leeg laten schakelt analytics uit.

## Teksten aanpassen

Alle teksten staan in:

- `src/content/i18n/nl.yml`
- `src/content/i18n/en.yml`

In `about.text` kun je `{years}` gebruiken: dat wordt bij de build vervangen door het aantal jaren sinds `careerStartYear` in `src/config.ts`.

Beide bestanden moeten **dezelfde sleutels** hebben. Ontbreekt er een sleutel of zit er een typfout in, dan faalt `npm run build` met een melding welk veld het is.

## Diensten

De diensten staan onder `services.items` in `src/content/i18n/nl.yml` en `en.yml` (titel en tekst per dienst, in beide talen dezelfde volgorde).

## Testimonials

1. Kopieer `src/content/testimonials/_template.yml` naar bijv. `src/content/testimonials/jan-jansen.yml`.
2. Vul `order`, `name` en beide taalblokken (`role`, `quote`) in. `company` en `link` zijn optioneel.
3. Vraag altijd toestemming om naam en quote te publiceren.

Zonder testimonials verdwijnt de sectie vanzelf.

## Technologieën

De lijst met technologie-iconen staat in `technologies` in `src/config.ts`. Het `icon`-veld is de slug van [Simple Icons](https://simpleicons.org) (te vinden in de URL van een icoon, bijv. `vuedotjs`). Bij een onbekende slug faalt de build. Laat `icon` weg voor een generiek server-icoon (bijv. VPS).

## Case toevoegen

1. Kopieer `src/content/cases/_template.yml` naar bijv. `src/content/cases/mijn-case.yml` (zonder `_` vooraan).
2. Vul `order`, `stack` en beide taalblokken (`nl` en `en`) in. `year`, `link` en `logo` zijn optioneel.
   Voor een klantlogo zet je een SVG of PNG naast het case-bestand en verwijs je ernaar met `logo: ./mijn-case.svg`. Bestaat het bestand niet, dan faalt de build.
3. `npm run check`, committen en pushen.

Cases worden gesorteerd op `order` (laag eerst). Verwijder `voorbeeld-case.yml` vóór livegang. Zonder cases verdwijnt de sectie vanzelf.

## Afbeeldingen (deelafbeelding en iconen)

De PNG's in `public/` worden gemaakt uit de SVG-bronnen:

- `og.png` (deelafbeelding, 1200×630) uit `og.svg`
- `favicon-96.png` en `apple-touch-icon.png` uit `favicon.svg`

Pas na een wijziging in een SVG (of van je naam/rol in `og.svg`) de bron aan en draai:

```bash
npm run images
```

## Deployen

### Google Cloud Run (huidige setup)

De site draait als container op Cloud Run (service `simple-portfolio-git`, regio `europe-west4`), gebouwd met de `Dockerfile` via Cloud Build vanuit deze GitHub-repo.

- Een push naar `main` start de Cloud Build-trigger, die de image bouwt (inclusief `npm run check`) en uitrolt.
- GitHub Actions (`.github/workflows/ci.yml`) draait daarnaast build en tests op elke push en pull request, maar deployt niets.
- **Domein:** `quintenbuis.nl` via een Cloud Run domain mapping. DNS staat bij Cloudflare: de A/AAAA-records die Cloud Run opgeeft (`216.239.3x.21` / `2001:4860:4802:3x::15`), met de proxy **uit** (grijze wolk), anders kan Google geen certificaat uitgeven.

### Alternatieven

De output is een statische map (`dist/`), dus de site werkt ook op GitHub Pages, Netlify of Cloudflare Pages (build command `npm run build`, output directory `dist`). Draai je onder een subpad (bijv. `https://<gebruiker>.github.io/<repo>/`), voeg dan in `astro.config.mjs` `base: '/<repo>'` toe.
