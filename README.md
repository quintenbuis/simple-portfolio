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
