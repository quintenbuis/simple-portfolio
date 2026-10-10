# Actieplan zichtbaarheid (buiten de site)

Afvinkbare stappen op basis van [zichtbaarheid.md](zichtbaarheid.md). Opgesteld op 2026-10-10. De volgorde is van grootste winst voor de minste tijd naar langetermijnwerk.

## 0. Voorwerk (eenmalig)

- [ ] Arbeidscontract checken op nevenwerkzaamheden en een relatie- of concurrentiebeding. Meld het freelancewerk eventueel bij je werkgever.
- [ ] Site live zetten: GitHub-repo, Pages via GitHub Actions, domein `quintenbuis.nl` met A-records (zie README).

## 1. Google Search Console (week 1, ±30 min)

- [ ] Property `quintenbuis.nl` toevoegen als domeinproperty en verifiëren via een DNS TXT-record. Daar is geen code op de site voor nodig.
- [ ] Sitemap indienen: `https://quintenbuis.nl/sitemap-index.xml`.
- [ ] Na 1–2 weken controleren of `/` en `/en/` geïndexeerd zijn (URL-inspectie). Zoek je naam op in Google.

## 2. LinkedIn op orde (week 1, ±1–2 uur)

- [ ] Kop: bijvoorbeeld "Freelance Senior Full-stack Developer | PHP · Laravel · Go · TypeScript".
- [ ] Over-sectie: het aanbod uit de diensten op de site (webapps en SaaS, koppelingen en API's, cloud en DevOps) plus een link naar quintenbuis.nl.
- [ ] "Open to" → "Providing services" aanzetten met de juiste diensten.
- [ ] Featured: link naar quintenbuis.nl.
- [ ] Contactinfo: `contact@quinnovate.nl` en de website.
- [ ] Twee of drie oud-collega's of opdrachtgevers om een aanbeveling vragen. Met toestemming kun je die als testimonial op de site zetten (`src/content/testimonials/`).

## 3. Warm netwerk benaderen (week 2, ±2 uur)

- [ ] Lijst maken van 15–20 mensen: oud-collega's, oud-klanten, bureaus en studiegenoten in de IT.
- [ ] Een persoonlijk bericht sturen, geen massamail: wat je doet, voor wie, en de vraag "ken je iemand die dit zoekt?". Link naar de site.
- [ ] Na ±2 weken een kort vervolgbericht sturen naar wie niet reageerde.

## 4. GitHub-profiel (week 2–3, ±1 uur)

- [ ] Profiel-README aanmaken (repo `quintenbuis/quintenbuis`): een korte intro, je stack en een link naar quintenbuis.nl.
- [ ] Twee tot vier goede repo's pinnen. Ruim lege of verouderde repo's op of archiveer ze.
- [ ] Optioneel: één klein, nuttig open-source package (bijvoorbeeld voor Laravel) als blijvend visitekaartje.

## 5. Merk (week 3, ±30 min)

- [ ] `quinnovate.nl` met een 301 laten doorverwijzen naar `quintenbuis.nl`.
- [ ] Facturen, KvK en e-mail consequent onder "Quinnovate". De site noemt Quinnovate al in de gestructureerde data.

## 6. Freelanceplatforms (week 3–4, ±1 uur, optioneel)

- [ ] Profiel op Freelance.nl en/of Hoofdkraan, met dezelfde teksten als op LinkedIn.
- [ ] Optioneel: Malt (check de actuele commissie en voorwaarden).
- [ ] Alleen selectief reageren op opdrachten die passen bij beperkte uren per week.

## 7. Community en content (doorlopend)

- [ ] Eén meetup per kwartaal: Dutch Laravel Foundation of een PHP-usergroup (bijvoorbeeld AmsterdamPHP).
- [ ] Na een paar bezoeken een lightning talk aanbieden.
- [ ] Eén LinkedIn-post per maand over iets wat je hebt opgelost of geleerd. Dat kan later een blog op de site worden.

## 8. Op de site, zodra er inhoud is

- [ ] Eén tot drie cases toevoegen (`src/content/cases/`, desnoods geanonimiseerd).
- [ ] Testimonials toevoegen (`src/content/testimonials/`).
- [ ] Elk kwartaal de teksten, technologieën en beschikbaarheid nalopen.
