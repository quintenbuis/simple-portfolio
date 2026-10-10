import * as simpleIcons from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';

const bySlug = new Map<string, SimpleIcon>(
  Object.values(simpleIcons)
    .filter((icon): icon is SimpleIcon => typeof icon === 'object' && 'slug' in icon)
    .map((icon) => [icon.slug, icon]),
);

export function getTechIcon(slug: string): { path: string; hex: string } {
  const icon = bySlug.get(slug);
  if (!icon) {
    throw new Error(`Onbekend icoon "${slug}" in src/config.ts — zoek de juiste slug op via https://simpleicons.org`);
  }
  return { path: icon.path, hex: icon.hex };
}

// Merkkleuren die op een donkere achtergrond onzichtbaar worden (bijv. zwart van Next.js).
export function isDarkColor(hex: string): boolean {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.05;
}

// Generiek server-icoon voor technologieën zonder merkicoon (bijv. VPS).
export const genericTechIcon = {
  path: 'M4 2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 11h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zm2.5 2.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0-11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
  fillRule: 'evenodd' as const,
};
