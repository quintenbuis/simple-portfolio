// Aantal kalenderjaren sinds een startjaar; wordt bij elke build opnieuw berekend.
export function yearsSince(startYear: number, now: Date = new Date()): number {
  return now.getFullYear() - startYear;
}

// Vult plaatshouders als {years} in. Een onbekende plaatshouder (bijv. een typfout) laat de build falen.
export function interpolate(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => {
    if (!(key in values)) throw new Error(`Onbekende plaatshouder {${key}} in tekst: "${text.slice(0, 60)}…"`);
    return String(values[key]);
  });
}
